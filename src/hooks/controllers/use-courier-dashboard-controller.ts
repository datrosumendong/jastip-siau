
"use client";

/**
 * CONTROLLER: Courier Operations (cURL Style)
 * Menangani alur tugas kurir sesuai SOP talangan dan pelaporan member.
 */

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, where, updateDoc, doc, serverTimestamp, addDoc, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function useCourierDashboardController() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const userRef = useMemo(() => (user && db ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: profile } = useDoc(userRef, true);
  
  const ordersQuery = useMemo(() => (db && user ? query(collection(db, 'orders'), where('courierId', '==', user.uid)) : null), [db, user]);
  const { data: rawOrders, loading } = useCollection(ordersQuery);

  const activeOrders = useMemo(() => {
    if (!rawOrders) return [];
    return rawOrders.filter(o => !['completed', 'cancelled'].includes(o.status))
      .sort((a: any, b: any) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
  }, [rawOrders]);

  const toggleOnline = async (checked: boolean) => {
    if (!userRef) return;
    await updateDoc(userRef, { isOnline: checked, updatedAt: serverTimestamp() });
    toast({ title: checked ? "ONLINE" : "OFFLINE" });
  };

  const handleReportUnpaid = async (order: any) => {
    if (!db) return;
    setUpdatingId(order.id);
    try {
      const batch = writeBatch(db);
      // Mapping kolom hasActiveDebt sesuai backend.json
      batch.update(doc(db, 'orders', order.id), { isReportedUnpaid: true, status: 'unpaid', updatedAt: serverTimestamp() });
      batch.update(doc(db, 'users', order.userId), { hasActiveDebt: true, updatedAt: serverTimestamp() });
      
      const debtRef = doc(collection(db, 'debts'));
      batch.set(debtRef, { orderId: order.id, userId: order.userId, courierId: user!.uid, amount: order.totalAmount, status: 'unpaid', createdAt: serverTimestamp() });
      
      await batch.commit();
      toast({ title: "Member Diblokir", description: "Laporan diteruskan ke Admin." });
    } finally { setUpdatingId(null); }
  };

  return { activeOrders, profile, loading, updatingId, toggleOnline, handleReportUnpaid };
}
