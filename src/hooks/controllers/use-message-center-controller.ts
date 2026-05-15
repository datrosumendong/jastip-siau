"use client";

/**
 * @fileOverview CONTROLLER: Message Center - Inbox Radar (SIAU MASTER V130)
 * SOP: Murni mengelola Daftar Pesan & Filter Kategori secara real-time.
 * FIX: Index-Free Client-side filtering untuk performa maksimal.
 */

import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore';

export type ChatCategory = 'all' | 'cht_private' | 'cht_toko' | 'cht_order' | 'cht_admin' | 'cht_komplain';

export function useMessageCenterController() {
  const { user } = useUser();
  const db = useFirestore();

  const [activeCategory, setActiveCategory] = useState<ChatCategory>('all');
  const [search, setSearch] = useState("");
  const [rawChats, setRawChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. DATA MODEL: Real-time Inbox Stream (Sync Mutlak)
  useEffect(() => {
    if (!db || !user) return;
    setLoading(true);
    
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setRawChats(list);
      setLoading(false);
    }, (err) => {
      console.error("Inbox Radar Error:", err);
      setLoading(false);
    });

    return () => unsub();
  }, [db, user]);

  // 2. LOGIKA KEDAULATAN: Filter Pencarian & Kategori (Klien)
  const chats = useMemo(() => {
    let list = [...rawChats].map((c: any) => {
      const otherId = c.participants?.find((p: string) => p !== user?.uid);
      return {
        ...c,
        displayTitle: c.participantNames?.[otherId] || "Warga Siau",
        displayPhoto: c.participantPhotos?.[otherId] || "",
        otherId
      };
    });

    if (activeCategory !== 'all') {
      list = list.filter(c => c.type === activeCategory);
    }

    const s = search.toLowerCase().trim();
    if (s) {
      list = list.filter(c => 
        c.displayTitle.toLowerCase().includes(s) || 
        (c.lastMessage || "").toLowerCase().includes(s)
      );
    }

    return list.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
  }, [rawChats, activeCategory, search, user?.uid]);

  return {
    chats,
    loading,
    search,
    setSearch,
    activeCategory,
    setActiveCategory,
    user
  };
}
