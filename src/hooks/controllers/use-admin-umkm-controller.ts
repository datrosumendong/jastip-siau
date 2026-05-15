"use client";

import { useState, useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

/**
 * CONTROLLER: UMKM Monitoring Logic
 */
export function useAdminUMKMController() {
  const db = useFirestore();
  const [search, setSearch] = useState("");

  // DATA ACCESS (MODEL)
  const umkmQuery = useMemo(() => (db ? query(collection(db, 'users'), where('role', '==', 'umkm')) : null), [db]);
  const { data: rawShops, loading } = useCollection(umkmQuery);

  const filteredShops = useMemo(() => {
    if (!rawShops) return [];
    const processed = rawShops.map((shop: any) => ({
      ...shop,
      displayName: shop.storeName || "Toko Jastip",
      isOpen: shop.isStoreOpen !== undefined ? shop.isStoreOpen : true
    }));
    const s = search.toLowerCase().trim();
    const sorted = processed.sort((a, b) => a.displayName.localeCompare(b.displayName));
    if (!s) return sorted;
    return sorted.filter((shop: any) => 
      shop.displayName.toLowerCase().includes(s) || (shop.fullName || "").toLowerCase().includes(s)
    );
  }, [rawShops, search]);

  return {
    shops: filteredShops,
    loading,
    search,
    setSearch
  };
}
