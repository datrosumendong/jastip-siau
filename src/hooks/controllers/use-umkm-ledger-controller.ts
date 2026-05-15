
"use client";

/**
 * @fileOverview CONTROLLER: UMKM Ledger & POS Engine (UNIFIED INDEPENDENT VAULT)
 * SOP: Laporan Keuangan bertahta murni di atas koleksi 'ledger' (Independen).
 * FIX: Menghapus dependensi kueri 'orders' eksternal untuk menjamin kedaulatan arsip toko.
 */

import { useState, useMemo, useCallback } from 'react';
import { useUser, useDoc, useFirestore, useCollection } from '@/firebase';
import { 
  collection, query, where, addDoc, serverTimestamp, 
  doc, deleteDoc, limit 
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { calculateProductPrice, PricingOutput, PricingInput } from '@/ai/flows/umkm-pricing-calculator';
import { startOfDay, startOfMonth, startOfYear, isAfter, format, getMonth } from 'date-fns';
import { id } from 'date-fns/locale';

export interface LedgerItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface MaterialItem {
  id: string;
  name: string;
  packPrice: string;
  qtyPerPack: string;
  usagePerPorsi: string;
}

export type ReportPeriod = 'daily' | 'monthly' | 'yearly';

export function useUMKMLedgerController() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('daily');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalType, setTerminalType] = useState<'income' | 'expense'>('income');
  const [isAICalculatorOpen, setIsAICalculatorOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [terminalItems, setTerminalItems] = useState<LedgerItem[]>([]);
  const [currentItem, setCurrentItem] = useState({ name: '', quantity: 1, price: '' });
  const [showReceipt, setShowReceipt] = useState(false);

  const [aiResult, setAIResult] = useState<PricingOutput | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiForm, setAiForm] = useState({
    productName: '',
    productionCost: '0',
    targetProfitPercent: '20',
    materials: [] as MaterialItem[]
  });
  const [currentMaterial, setCurrentMaterial] = useState<Omit<MaterialItem, 'id'>>({
    name: '',
    packPrice: '',
    qtyPerPack: '1',
    usagePerPorsi: '1'
  });

  /**
   * DATA MODEL: THE INDEPENDENT LEDGER (CORE VAULT)
   * SOP: Seluruh data (Manual POS & Auto-Sync Web Orders) berkumpul di sini secara permanen.
   */
  const ledgerQuery = useMemo(() => 
    (db && user) ? query(
      collection(db, 'users', user.uid, 'ledger'), 
      limit(1000)
    ) : null, 
  [db, user]);
  
  const { data: rawLedger = [], loading: ledgerLoading } = useCollection(ledgerQuery, true);

  const ledgerEntries = useMemo(() => {
    return [...rawLedger].sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [rawLedger]);

  /**
   * LOGIKA KEDAULATAN: Multi-Period Stats Engine
   * Filter dilakukan secara mandiri di sisi klien.
   */
  const stats = useMemo(() => {
    const now = new Date();
    const dayStart = startOfDay(now);
    const monthStart = startOfMonth(now);
    const yearStart = startOfYear(now);

    const filterByDate = (date: Date) => {
      if (reportPeriod === 'daily') return isAfter(date, dayStart);
      if (reportPeriod === 'monthly') return isAfter(date, monthStart);
      return isAfter(date, yearStart);
    };

    const filteredLedger = ledgerEntries.filter((e: any) => {
      const date = e.createdAt?.seconds ? new Date(e.createdAt.seconds * 1000) : new Date();
      return filterByDate(date);
    });

    const webOmzet = filteredLedger
      .filter(e => e.type === 'web_order' && e.category === 'income')
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const manualOmzet = filteredLedger
      .filter(e => e.type === 'manual' && e.category === 'income')
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const totalExpenses = filteredLedger
      .filter(e => e.category === 'expense')
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
      const monthIdx = i;
      const monthlyEntries = ledgerEntries.filter((e: any) => {
        const d = e.createdAt?.seconds ? new Date(e.createdAt.seconds * 1000) : null;
        return d && getMonth(d) === monthIdx && isAfter(d, yearStart);
      });

      const mIncome = monthlyEntries.filter(e => e.category === 'income').reduce((acc, curr) => acc + (curr.amount || 0), 0);
      const mExpense = monthlyEntries.filter(e => e.category === 'expense').reduce((acc, curr) => acc + (curr.amount || 0), 0);

      return {
        monthName: format(new Date(2024, monthIdx, 1), 'MMMM', { locale: id }),
        totalOmzet: mIncome,
        totalExpense: mExpense,
        netProfit: mIncome - mExpense
      };
    }).filter(m => m.totalOmzet > 0 || m.totalExpense > 0);

    return {
      webOmzet,
      manualOmzet,
      totalIncome: webOmzet + manualOmzet,
      totalExpenses,
      netProfit: (webOmzet + manualOmzet) - totalExpenses,
      monthlyBreakdown
    };
  }, [ledgerEntries, reportPeriod]);

  const openTerminal = (type: 'income' | 'expense') => {
    setTerminalType(type);
    setTerminalItems([]);
    setCurrentItem({ name: '', quantity: 1, price: '' });
    setIsTerminalOpen(true);
  };

  const handleAddLineItem = () => {
    if (!currentItem.name || !currentItem.price) return;
    const newItem: LedgerItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: currentItem.name,
      quantity: currentItem.quantity,
      price: parseFloat(currentItem.price)
    };
    setTerminalItems([...terminalItems, newItem]);
    setCurrentItem({ name: '', quantity: 1, price: '' });
  };

  const handleRemoveLineItem = (id: string) => {
    setTerminalItems(terminalItems.filter(item => item.id !== id));
  };

  const terminalTotal = useMemo(() => {
    return terminalItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  }, [terminalItems]);

  const handleSaveTransaction = async () => {
    if (!db || !user || terminalItems.length === 0 || submitting) return;
    setSubmitting(true);
    
    const itemsDescription = terminalItems.map(it => `${it.name} (${it.quantity}x)`).join(', ');
    const transactionData = {
      amount: terminalTotal,
      description: itemsDescription,
      category: terminalType,
      userId: user.uid,
      type: 'manual',
      items: terminalItems, 
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'users', user.uid, 'ledger'), transactionData);
      toast({ title: "Berhasil Disimpan" });
      setTerminalItems([]);
      setIsTerminalOpen(false);
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!db || !user || submitting) return;
    setSubmitting(true);
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'ledger', id));
      toast({ title: "Arsip Dihapus" });
    } finally { setSubmitting(false); }
  };

  // AI CALCULATOR ACTIONS
  const handleAddMaterial = () => {
    if (!currentMaterial.name || !currentMaterial.packPrice) return;
    const newItem: MaterialItem = { ...currentMaterial, id: Math.random().toString(36).substr(2, 9) };
    setAiForm(prev => ({ ...prev, materials: [...prev.materials, newItem] }));
    setCurrentMaterial({ name: '', packPrice: '', qtyPerPack: '1', usagePerPorsi: '1' });
  };

  const handleRemoveMaterial = (id: string) => {
    setAiForm(prev => ({ ...prev, materials: prev.materials.filter(m => m.id !== id) }));
  };

  const handleRunAICalculator = async () => {
    if (loadingAI || !aiForm.productName || aiForm.materials.length === 0) return;
    setLoadingAI(true);
    setAIResult(null);

    const input: PricingInput = {
      productName: aiForm.productName,
      productionCost: parseFloat(aiForm.productionCost) || 0,
      targetProfitPercent: parseFloat(aiForm.targetProfitPercent) || 0,
      materials: aiForm.materials.map(m => ({
        name: m.name, packPrice: parseFloat(m.packPrice), qtyPerPack: parseFloat(m.qtyPerPack), usagePerPorsi: parseFloat(m.usagePerPorsi)
      }))
    };

    try {
      const result = await calculateProductPrice(input);
      setAIResult(result);
      toast({ title: "Analisis AI Selesai" });
    } finally { setLoadingAI(false); }
  };

  return {
    ledgerEntries, webOrders: [], stats, reportPeriod, setReportPeriod,
    loading: ledgerLoading,
    isTerminalOpen, setIsTerminalOpen,
    terminalType, setTerminalType,
    isAICalculatorOpen, setIsAICalculatorOpen,
    submitting, aiResult, setAIResult, loadingAI,
    terminalItems, currentItem, setCurrentItem, terminalTotal,
    handleAddLineItem, handleRemoveLineItem, handleSaveTransaction,
    showReceipt, setShowReceipt, handleDeleteEntry, openTerminal,
    aiForm, setAiForm, currentMaterial, setCurrentMaterial,
    handleAddMaterial, handleRemoveMaterial, handleRunAICalculator
  };
}
