"use client";

/**
 * CONTROLLER: Courier History Management (SOP V510 REFINED)
 * SOP: Riwayat HANYA menampilkan pesanan yang sudah FINAL (Lunas atau Batal).
 * Pesanan yang sedang ditagih (delivered / isReportedUnpaid) dilarang masuk sini.
 */

import { useMemo } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';

export function useCourierHistoryController() {
  const { user } = useUser();
  const db = useFirestore();

  const ordersQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'orders'), 
      where('courierId', '==', user.uid), 
      // SOP: Hanya pesanan yang sudah diselesaikan pembayarannya atau dibatalkan.
      where('status', 'in', ['completed', 'cancelled']),
      limit(200)
    );
  }, [db, user]);

  const { data: rawOrders = [], loading } = useCollection(ordersQuery, true);

  const orders = useMemo(() => {
    return [...rawOrders].sort((a: any, b: any) => {
      const tA = a.updatedAt?.seconds || a.createdAt?.seconds || 0;
      const tB = b.updatedAt?.seconds || b.createdAt?.seconds || 0;
      return tB - tA;
    });
  }, [rawOrders]);

  return { 
    orders, 
    loading 
  };
}
