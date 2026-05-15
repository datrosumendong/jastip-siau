
"use client";

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, where, doc, limit } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useView } from '@/context/view-context';
import { shareToWhatsApp } from '@/lib/whatsapp';
import { formatIDR } from '@/lib/currency';

/**
 * CONTROLLER: Marketplace Catalog Logic (MULTI-STORE EDITION)
 * SOP: Melepas kunci satu toko agar member bisa belanja lintas pangkalan.
 */
export function useMarketplaceCatalogController() {
  const db = useFirestore();
  const { user } = useUser();
  const { setView } = useView();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<{[key: string]: any}>({});

  const myRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: myProfile } = useDoc(myRef, true);
  const isBlocked = myProfile?.hasActiveDebt === true;

  const productsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('updatedAt', 'desc'), limit(150));
  }, [db]);

  const { data: products = [], loading } = useCollection(productsQuery, true);

  const shopsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'users'), where('role', '==', 'umkm'));
  }, [db]);
  const { data: shops = [] } = useCollection(shopsQuery, true);

  const filteredProducts = useMemo(() => {
    const s = search.toLowerCase().trim();
    const list = products.map((p: any) => {
      const shop = shops.find((sh: any) => sh.uid === p.umkmId || sh.id === p.umkmId);
      return {
        ...p,
        umkmName: shop?.storeName || shop?.fullName || "Toko Jastip",
        umkmUsername: shop?.username || shop?.uid || shop?.id,
        isOpen: shop?.isStoreOpen !== false,
        umkmWhatsapp: shop?.whatsapp || "",
        shopLat: shop?.latitude || 0,
        shopLng: shop?.longitude || 0
      };
    });

    if (!s) return list;
    return list.filter(p => 
      p.name.toLowerCase().includes(s) || 
      p.umkmName.toLowerCase().includes(s)
    );
  }, [products, shops, search]);

  const handleUpdateCart = (product: any, delta: number) => {
    if (isBlocked) {
      toast({ title: "Akses Terkunci", variant: "destructive" });
      return;
    }

    if (product.umkmId === user?.uid) {
      toast({ title: "SOP Jastip Siau", description: "Dilarang pesan di toko sendiri.", variant: "destructive" });
      return;
    }
    
    setCart(prev => {
      const current = prev[product.id];
      const nextQty = (current?.quantity || 0) + delta;

      if (nextQty <= 0) {
        const { [product.id]: _, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [product.id]: {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: nextQty,
          umkmId: product.umkmId,
          umkmName: product.umkmName,
          umkmWhatsapp: product.umkmWhatsapp,
          shopLat: product.shopLat,
          shopLng: product.shopLng
        }
      };
    });
  };

  const handleShareProduct = (product: any) => {
    const shopName = product.umkmName || "Toko UMKM";
    const price = formatIDR(product.price);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://jastipsiau.app';
    const message = `🛍️ *JASTIP SIAU - KATALOG PASAR* 🏝️\n\nProduk dari *${shopName}*:\n👉 *${product.name}*\n💰 Harga: *${price}*\n\n🔗 *CEK DI APP*: ${origin}\n🙏✨`;
    shareToWhatsApp(message);
  };

  const cartTotal = Object.values(cart).reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const cartItemsCount = Object.values(cart).reduce((acc, curr) => acc + curr.quantity, 0);

  const handleCheckout = () => {
    if (cartItemsCount === 0 || isBlocked) return;
    
    const selectedItems = Object.values(cart).map(it => ({
      id: it.id,
      name: it.name,
      price: it.price,
      quantity: it.quantity,
      umkmId: it.umkmId,
      umkmName: it.umkmName
    }));
    
    const uniqueShops = Array.from(new Set(selectedItems.map(it => it.umkmId)));
    const isMultiStore = uniqueShops.length > 1;

    sessionStorage.setItem('pending_umkm_order', JSON.stringify({
      isMultiStore,
      items: selectedItems,
      totalAmount: cartTotal,
      targetShops: Object.values(cart).map(it => ({ 
        id: it.umkmId, name: it.umkmName, lat: it.shopLat, lng: it.shopLng 
      }))
    }));
    
    setView('couriers');
  };

  return {
    products: filteredProducts,
    loading,
    search,
    setSearch,
    cart,
    cartTotal,
    cartItemsCount,
    isBlocked,
    userUid: user?.uid,
    handleUpdateCart,
    handleCheckout,
    handleShareProduct
  };
}
