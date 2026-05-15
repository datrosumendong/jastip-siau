
"use client";

/**
 * CONTROLLER: Courier Browser Logic (SOP INVESTIGASI V16.200)
 * SOP: Kurir yang sedang diinvestigasi tidak layak order.
 */

import { useMemo } from 'react';
import { useCollection, useFirestore, useUser, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';

export function useCourierListController() {
  const db = useFirestore();
  const { user } = useUser();

  const profileRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: profile } = useDoc(profileRef, true);

  const couriersQuery = useMemo(() => 
    db ? query(collection(db, 'users'), where('role', 'in', ['courier', 'owner'])) : null, 
  [db]);
  
  const { data: rawCouriers, loading } = useCollection(couriersQuery, true);

  const couriers = useMemo(() => {
    if (!rawCouriers) return [];
    
    const now = Date.now();
    const TEN_MINUTES = 10 * 60 * 1000;

    return rawCouriers
      .filter((c: any) => (c.uid || c.id) !== user?.uid)
      .map((c: any) => {
        const lastSeen = c.lastGpsUpdate?.seconds ? c.lastGpsUpdate.seconds * 1000 : 0;
        const isSignalFresh = (now - lastSeen) < TEN_MINUTES;
        const isUnderInvestigation = c.isUnderInvestigation === true;
        
        return {
          ...c,
          isSignalFresh,
          isUnderInvestigation,
          // SOP V16.200: Kurir layak order jika online, sinyal segar, DAN tidak dalam investigasi
          isOrderWorthy: c.isOnline === true && isSignalFresh && !isUnderInvestigation
        };
      })
      .sort((a: any, b: any) => {
        // Prioritas 1: Layak Order
        const aVal = a.isOrderWorthy ? 1 : 0;
        const bVal = b.isOrderWorthy ? 1 : 0;
        if (aVal !== bVal) return bVal - aVal;
        
        // Prioritas 2: Investigasi (Merapatkan ke bawah)
        if (a.isUnderInvestigation !== b.isUnderInvestigation) return a.isUnderInvestigation ? 1 : -1;

        return (a.fullName || "").localeCompare(b.fullName || "");
      });
  }, [rawCouriers, user?.uid]);

  const isBlocked = profile?.hasActiveDebt === true;

  return { 
    couriers, 
    loading, 
    isBlocked 
  };
}
