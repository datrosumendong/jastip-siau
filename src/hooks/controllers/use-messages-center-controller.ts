"use client";

/**
 * @fileOverview CONTROLLER: Messages Center - Inbox Radar (SIAU MASTER V160)
 * SOP: Murni mengelola Daftar Pesan & Filter Kategori secara real-time.
 * FIX: Perbaikan kedaulatan visual - Admin melihat nama User, User melihat "Pusat Bantuan".
 */

import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { collection, query, where, limit, onSnapshot, doc } from 'firebase/firestore';

export type ChatTypeFilter = 'all' | 'cht_private' | 'cht_toko' | 'cht_order' | 'cht_admin' | 'cht_komplain';

export function useMessagesCenterController() {
  const { user } = useUser();
  const db = useFirestore();

  const [activeCategory, setActiveCategory] = useState<ChatTypeFilter>('all');
  const [search, setSearch] = useState("");
  const [rawChats, setRawChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. DATA MODEL: Profil Saya (Cek Otoritas)
  const { data: myProfile } = useDoc(user && db ? doc(db, 'users', user.uid) : null, true);

  // 2. DATA MODEL: Real-time Inbox Stream (Sync Mutlak)
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

  // 3. LOGIKA KEDAULATAN: Filter Pencarian & Kategori (Klien)
  const chats = useMemo(() => {
    const isMeStaff = myProfile?.role === 'admin' || myProfile?.role === 'owner';

    let list = [...rawChats].map((c: any) => {
      const isAdminChat = c.type === 'cht_admin';
      const otherId = c.participants?.find((p: string) => p !== user?.uid);
      
      /**
       * SOP KEDAULATAN VISUAL V160:
       * 1. Jika saya User dan ini Chat Admin -> Judul: "Pusat Bantuan Jastip"
       * 2. Jika saya Admin dan ini Chat Admin -> Judul: Nama User yang dibantu
       */
      const displayTitle = (isAdminChat && !isMeStaff) 
        ? "Pusat Bantuan Jastip" 
        : (c.participantNames?.[otherId] || "Warga Siau");

      return {
        ...c,
        displayTitle,
        displayPhoto: (isAdminChat && !isMeStaff) ? "" : (c.participantPhotos?.[otherId] || ""),
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

    // Sort by Date (Terbaru di Atas)
    return list.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
  }, [rawChats, activeCategory, search, user?.uid, myProfile]);

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
