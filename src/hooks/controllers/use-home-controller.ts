"use client";

/**
 * THE BRAIN: Home Controller (SOP V520 REFINED)
 * SOP: Memastikan ulasan beranda HANYA mengambil yang sudah disetujui Admin.
 * FIX: Sinkronisasi database testimonals berbasis flag isApproved.
 */

import { useMemo } from 'react';
import { useCollection, useFirestore, useUser, useDoc } from '@/firebase';
import { collection, query, limit, where, doc } from 'firebase/firestore';

export function useHomeController() {
  const db = useFirestore();
  const { user } = useUser();

  const userRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user?.uid]);
  const { data: profile } = useDoc(userRef, true);

  // DATA MODEL: Katalog Produk (Publik)
  const productsQuery = useMemo(() => 
    db ? query(collection(db, 'products'), limit(20)) : null, 
  [db]);
  const { data: rawProducts = [] } = useCollection(productsQuery, true);
  
  const products = useMemo(() => {
    return [...rawProducts].sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 10);
  }, [rawProducts]);

  // DATA MODEL: Radar Aktivitas (SOP SECURE)
  const activityQuery = useMemo(() => {
    if (!db || !user || !profile) return null;
    if (profile.role === 'admin' || profile.role === 'owner') {
      return query(collection(db, 'orders'), limit(15));
    }
    return query(
      collection(db, 'orders'), 
      where('userId', '==', user.uid),
      limit(15)
    );
  }, [db, user?.uid, profile]);

  const { data: rawActivity = [] } = useCollection(activityQuery, true);
  
  const recentActivity = useMemo(() => {
    return [...rawActivity].sort((a: any, b: any) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0)).slice(0, 4);
  }, [rawActivity]);

  // DATA MODEL: Daftar Kurir (Publik)
  const couriersQuery = useMemo(() => 
    db ? query(collection(db, 'users'), where('role', 'in', ['courier', 'owner']), limit(20)) : null, 
  [db]);
  const { data: rawCouriers = [] } = useCollection(couriersQuery, true);

  const couriers = useMemo(() => {
    return [...rawCouriers]
      .sort((a: any, b: any) => {
        const aOn = a.isOnline === true ? 1 : 0;
        const bOn = b.isOnline === true ? 1 : 0;
        return bOn - aOn;
      })
      .slice(0, 12);
  }, [rawCouriers]);

  // SOP V520: Ambil Testimoni TERVERIFIKASI (Approved Only)
  const testiQuery = useMemo(() => 
    db ? query(
      collection(db, 'testimonials'), 
      where('isApproved', '==', true),
      limit(10)
    ) : null, 
  [db]);
  const { data: rawTesti = [] } = useCollection(testiQuery, true);

  const testimonials = useMemo(() => {
    return [...rawTesti].sort((a: any, b: any) => (b.approvedAt?.seconds || b.createdAt?.seconds || 0) - (a.approvedAt?.seconds || a.createdAt?.seconds || 0)).slice(0, 5);
  }, [rawTesti]);

  return { 
    profile, 
    products, 
    recentActivity, 
    couriers,
    testimonials,
    loading: !profile && !!user
  };
}
