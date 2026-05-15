
"use client";

import { useState, useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, writeBatch, getDocs, query, where, limit, setDoc, serverTimestamp, addDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { getYear, getMonth, getDate } from 'date-fns';

/**
 * CONTROLLER: Monitoring Order Logic (SOP INVESTIGASI V16.200)
 * SOP: Penegakan lockdown kurir saat investigasi dimulai.
 */
export function useAdminOrderController() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const [selectedYear, setSelectedYear] = useState<string>("0");
  const [selectedMonth, setSelectedMonth] = useState<string>("0");
  const [selectedDay, setSelectedDay] = useState<string>("0");

  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedOrderForSanction, setSelectedOrderForSanction] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const ordersQuery = useMemo(() => (db ? collection(db, "orders") : null), [db]);
  const { data: rawOrders, loading } = useCollection(ordersQuery, true);

  const filteredOrders = useMemo(() => {
    if (!rawOrders) return [];
    
    const periodFiltered = rawOrders.filter(o => {
      const orderDate = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : null;
      if (!orderDate) return selectedYear === "0" && selectedMonth === "0" && selectedDay === "0";
      
      const matchYear = selectedYear === "0" || getYear(orderDate).toString() === selectedYear;
      const matchMonth = selectedMonth === "0" || (getMonth(orderDate) + 1).toString() === selectedMonth;
      const matchDay = selectedDay === "0" || getDate(orderDate).toString() === selectedDay;
      
      return matchYear && matchMonth && matchDay;
    });

    const sorted = [...periodFiltered].sort((a: any, b: any) => {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    const s = search.toLowerCase().trim();
    if (!s) return sorted;
    
    return sorted.filter(o => 
      (o.userName || "").toLowerCase().includes(s) || 
      (o.id || "").toLowerCase().includes(s) ||
      (o.courierName || "").toLowerCase().includes(s) ||
      (o.umkmName || "").toLowerCase().includes(s)
    );
  }, [rawOrders, sortOrder, search, selectedYear, selectedMonth, selectedDay]);

  const toggleSelect = (id: string) => 
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const selectAll = (checked: boolean) => 
    setSelectedIds(checked ? filteredOrders.map(o => o.id) : []);

  const executeBulkDelete = async () => {
    if (!db || selectedIds.length === 0 || isDeleting) return;
    setIsDeleting(true);

    try {
      for (const orderId of selectedIds) {
        const batch = writeBatch(db);
        batch.delete(doc(db, 'orders', orderId));
        const chatQuery = query(collection(db, 'chats'), where('orderId', '==', orderId), limit(5));
        const chatSnap = await getDocs(chatQuery);
        for (const chatDoc of chatSnap.docs) {
          const chatId = chatDoc.id;
          const messagesRef = collection(db, 'chats', chatId, 'messages');
          const msgsSnap = await getDocs(messagesRef);
          msgsSnap.forEach(m => batch.delete(m.ref));
          batch.delete(chatDoc.ref);
        }
        await batch.commit();
      }
      toast({ title: "Radar Bersih", description: `${selectedIds.length} data dimusnahkan.` });
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Gagal Eksekusi" });
    } finally { 
      setIsDeleting(false); 
    }
  };

  /**
   * ACTION: applySanction (SOP V16.200)
   * Admin meluncurkan Investigasi 3 Arah dan ME-LOCKDOWN operasional kurir.
   */
  const applySanction = async () => {
    if (!db || !selectedOrderForSanction) return;
    setIsDeleting(true);

    try {
      const complaintRef = doc(collection(db, 'complaints'));
      const complaintId = complaintRef.id;
      const courierId = selectedOrderForSanction.courierId;

      const complaintData = {
        id: complaintId,
        orderId: selectedOrderForSanction.id,
        userId: selectedOrderForSanction.userId, 
        userName: selectedOrderForSanction.userName,
        userWhatsapp: selectedOrderForSanction.userWhatsapp || "",
        courierId: courierId,
        courierName: selectedOrderForSanction.courierName,
        courierWhatsapp: selectedOrderForSanction.courierWhatsapp || "",
        reason: "Audit Investigasi Admin: Kurir masuk tahap moderasi kedaulatan warga.",
        status: 'investigating',
        type: 'admin_sanction',
        isEscalated: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        participants: [selectedOrderForSanction.userId, courierId].filter(id => !!id)
      };

      await setDoc(complaintRef, complaintData);

      // LOCKDOWN KURIR: SOP V16.200 (Mencegah penerimaan order baru)
      if (courierId) {
        await updateDoc(doc(db, 'users', courierId), {
          isUnderInvestigation: true,
          updatedAt: serverTimestamp()
        });
      }

      // RADAR NOTIFIKASI
      await addDoc(collection(db, 'notifications'), {
        userId: selectedOrderForSanction.userId,
        title: "🚨 Investigasi Dimulai",
        message: "Admin sedang memoderasi pesanan Anda. Silakan cek menu Bantuan.",
        type: 'complaint',
        targetId: complaintId,
        createdAt: serverTimestamp()
      });

      if (courierId) {
        await addDoc(collection(db, 'notifications'), {
          userId: courierId,
          title: "🚨 Akun Ditangguhkan",
          message: "Anda masuk tahap investigasi. Dilarang menerima order baru hingga proses tuntas.",
          type: 'complaint',
          targetId: complaintId,
          createdAt: serverTimestamp()
        });
      }

      toast({ title: "Investigasi Aktif", description: "Kurir resmi di-lockdown dari order baru." });
      setSelectedOrderForSanction(null);
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal Eksekusi" });
    } finally {
      setIsDeleting(false);
    }
  };

  const years = ["2024", "2025", "2026"];
  const months = [
    { id: "1", name: "Januari" }, { id: "2", name: "Februari" }, { id: "3", name: "Maret" },
    { id: "4", name: "April" }, { id: "5", name: "Mei" }, { id: "6", name: "Juni" },
    { id: "7", name: "Juli" }, { id: "8", name: "Agustus" }, { id: "9", name: "September" },
    { id: "10", name: "Oktober" }, { id: "11", name: "November" }, { id: "12", name: "Desember" }
  ];
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

  return {
    orders: filteredOrders, loading, search, setSearch, sortOrder, setSortOrder,
    selectedIds, setSelectedIds, toggleSelect, selectAll,
    selectedOrderForSanction, setSelectedOrderForSanction,
    isDeleting, showBulkDeleteConfirm, setShowBulkDeleteConfirm,
    executeBulkDelete, applySanction,
    selectedYear, setSelectedYear, selectedMonth, setSelectedMonth,
    selectedDay, setSelectedDay, years, months, days
  };
}
