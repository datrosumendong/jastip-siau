
"use client";

/**
 * CONTROLLER: Detail Toko UMKM (MVC Logic V2)
 * SOP: Menangani sinkronisasi produk, manajemen keranjang, Chat Toko, dan Share Produk.
 * FIX: Menjamin umkmId tertanam pada item checkout untuk penegakan Fixed Price (SOP V12.750).
 */

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useDoc, useUser } from '@/firebase';
import { collection, query, where, doc, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useView } from '@/context/view-context';
import { shareToWhatsApp } from '@/lib/whatsapp';
import { formatIDR } from '@/lib/currency';

export function useShopDetailController() {
  const { setView, viewData, goBack, forceUnlockUI } = useView();
  const storeId = viewData?.storeId || viewData?.id;
  
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [showMap, setShowMap] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const shopRef = useMemo(() => (db && storeId ? doc(db, 'users', storeId) : null), [db, storeId]);
  const { data: shop, loading: shopLoading } = useDoc(shopRef, true);

  const myRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: myProfile } = useDoc(myRef, true);

  const productsQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(collection(db, 'products'), where('umkmId', '==', storeId));
  }, [db, storeId]);

  const { data: products, loading: productsLoading } = useCollection(productsQuery, true);

  const isBlocked = myProfile?.hasActiveDebt === true;
  const isStoreOpen = shop?.isStoreOpen !== false;
  const isMyShop = user?.uid === storeId;

  const handleChatToko = async () => {
    if (!user || !db || !shop || isNavigating || isMyShop) return;
    const storeUid = shop.uid || shop.id;

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
            [user.uid]: myProfile?.fullName || "Member",
            [storeUid]: shop.storeName || shop.fullName || "Toko"
          },
          participantPhotos: {
            [user.uid]: myProfile?.imageUrl || "",
            [storeUid]: shop.storeImageUrl || shop.imageUrl || ""
          },
          lastMessage: "Halo, saya sedang melihat toko Anda.",
          lastMessageSenderId: user.uid,
          lastMessageStatus: 'read',
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });
        setView('chat_view', { id: chatId });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal Membuka Chat" });
    } finally {
      setIsNavigating(false);
      setTimeout(forceUnlockUI, 150);
    }
  };

  const handleUpdateCart = (productId: string, delta: number) => {
    if (isBlocked) {
      toast({ title: "Fitur Terkunci", variant: "destructive" });
      return;
    }
    
    if (isMyShop) {
      toast({ title: "SOP Jastip Siau", description: "Anda tidak boleh memesan di toko sendiri.", variant: "destructive" });
      return;
    }

    setCart(prev => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: next };
    });
  };

  const handleShareProduct = (product: any) => {
    const shopName = shop?.storeName || shop?.fullName || "Toko UMKM";
    const username = shop?.username || storeId;
    const price = formatIDR(product.price);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://jastipsiau.com';
    const link = `${origin}/${username}`;
    
    const message = `🛍️ *JASTIP SIAU - REKOMENDASI PRODUK* 🏝️\n\nCek produk unggulan dari *${shopName}*:\n👉 *${product.name}*\n💰 Harga: *${price}*\n\nLihat etalase lengkap kami di sini:\n🔗 ${link}\n\nMari belanja aman dan terpercaya di Jastip Siau! 🙏✨`;
    
    shareToWhatsApp(message);
  };

  const cartItemsCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = products?.reduce((acc, p) => acc + (p.price * (cart[p.id] || 0)), 0) || 0;

  const handleCheckout = () => {
    if (cartItemsCount === 0 || isBlocked || isMyShop) return;
    const selectedItems = (products || []).filter(p => cart[p.id] > 0).map(p => ({
      id: p.id, 
      name: p.name, 
      price: p.price, 
      quantity: cart[p.id],
      umkmId: storeId // KUNCI IDENTITAS: Wajib ada untuk penegakan SOP harga di sisi kurir
    }));
    
    sessionStorage.setItem('pending_umkm_order', JSON.stringify({
      umkmId: storeId, 
      umkmName: shop?.storeName || shop?.fullName || "Toko UMKM",
      umkmWhatsapp: shop?.whatsapp || "",
      shopLat: shop?.latitude || 0,
      shopLng: shop?.longitude || 0,
      items: selectedItems, 
      totalAmount: cartTotal
    }));
    setView('couriers');
  };

  return {
    shop, products, cart, cartTotal, cartItemsCount,
    loading: shopLoading || productsLoading,
    isBlocked, isStoreOpen, isMyShop, isNavigating,
    showMap, setShowMap,
    handleChatToko, handleUpdateCart, handleCheckout, handleShareProduct, goBack, setView
  };
}
