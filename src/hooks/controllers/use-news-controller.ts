
"use client";

/**
 * CONTROLLER: Developer News (Public View Logic)
 * SOP: Menangani sinkronisasi berita dari pangkalan /news secara real-time.
 */

import { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';

export function useNewsController() {
  const db = useFirestore();

  const newsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(50));
  }, [db]);

  const { data: news = [], loading } = useCollection(newsQuery, true);

  return {
    news,
    loading
  };
}
