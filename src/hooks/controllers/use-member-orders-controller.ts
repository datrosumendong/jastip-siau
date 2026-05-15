
"use client";

/**
 * CONTROLLER: Member Orders (cURL Style)
 * Menampilkan riwayat pesanan member berdasarkan kolom 'userId' di database.
 */

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';

export function useMemberOrdersController() {
  const { user } = useUser();
  const db = useFirestore();

  const ordersQuery = useMemo(() => (db && user ? query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('updatedAt', 'desc')) : null), [db, user]);
  const { data: orders, loading } = useCollection(ordersQuery);

  return { orders, loading };
}
