"use client";

/**
 * @fileOverview CONTROLLER: Pasar UMKM Browser (MVC Logic)
 * SOP: Integrasi handleChatToko (Find or Create) untuk kedaulatan komunikasi.
 * FIX: Navigasi diarahkan mutlak ke 'chat_view' (Form Chat Baru).
 */

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser, useDoc } from '@/firebase';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useView } from '@/context/view-context';
import { useToast } from '@/hooks/use-toast';

export function useUMKMShopController() {
  const db = useFirestore();
  const { user } = useUser();
  const { setView, forceUnlockUI } = useView();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  const userRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: profile } = useDoc(userRef, true);

  const shopsQuery = useMemo(() => 
    db ? query(collection(db, 'users'), where('role', '==', 'umkm')) : null, 
  [db]);
  
  const { data: rawShops, loading } = useCollection(shopsQuery, true);

  const filteredShops = useMemo(() => {
    if (!rawShops) return [];
    const s = search.toLowerCase().trim();
    return rawShops
      .map((shop: any) => ({
        ...shop,
        displayName: shop.storeName || shop.fullName || "Toko Lokal",
        isOpen: shop.isStoreOpen !== undefined ? shop.isStoreOpen : true
      }))
      .filter((shop: any) => 
        !s || shop.displayName.toLowerCase().includes(s) || (shop.address || "").toLowerCase().includes(s)
      );
  }, [rawShops, search]);

  /**
   * ACTION: handleChatToko (SOP FIND OR CREATE)
   * Navigasi ke Form Chat Baru (chat_view).
   */
  const handleChatToko = async (shop: any) => {
    if (!user || !db || isNavigating) return;
    const storeUid = shop.uid || shop.id;
    if (user.uid === storeUid) return;

    setIsNavigating(true);
    forceUnlockUI();

    try {
      const q = query(
        collection(db, 'chats'),
        where('type', '==', 'cht_toko'),
        where('participants', 'array-contains', user.uid)
      );
      
      const snap = await getDocs(q);
      const existingChat = snap.docs.find(d => d.data().participants?.includes(storeUid));

      if (existingChat) {
        setView('chat_view', { id: existingChat.id });
      } else {
        const newChatRef = doc(collection(db, 'chats'));
        const chatId = newChatRef.id;
        
        await setDoc(newChatRef, {
          id: chatId,
          type: 'cht_toko',
          participants: [user.uid, storeUid].sort(),
          participantNames: {
            [user.uid]: profile?.fullName || "Member",
            [storeUid]: shop.storeName || shop.fullName || "Toko"
          },
          participantPhotos: {
            [user.uid]: profile?.imageUrl || "",
            [storeUid]: shop.storeImageUrl || shop.imageUrl || ""
          },
          lastMessage: "Memulai percakapan dengan toko...",
          lastMessageSenderId: user.uid,
          lastMessageStatus: 'read',
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });
        
        setView('chat_view', { id: chatId });
      }
    } catch (e) {
      console.error("Chat Discovery Error:", e);
      toast({ variant: "destructive", title: "Gagal Menghubungkan Chat" });
    } finally {
      setIsNavigating(false);
      setTimeout(forceUnlockUI, 150);
    }
  };

  return { 
    shops: filteredShops, 
    search, 
    setSearch, 
    loading, 
    isNavigating,
    handleChatToko,
    setView,
    user 
  };
}
