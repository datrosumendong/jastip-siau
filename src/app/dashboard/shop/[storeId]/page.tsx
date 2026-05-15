
"use client";

import { useMemo, useState, useEffect } from 'react';
import { useCollection, useFirestore, useDoc, useUser } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Loader2, 
  CheckCircle2,
  Package,
  Info,
  ArrowRight,
  MessageSquare,
  Power,
  ShieldCheck,
  Store,
  Gavel,
  ShieldAlert
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { useView } from '@/context/view-context';

export default function StoreProductsPage() {
  const { setView, viewData } = useView();
  const storeId = viewData?.storeId;
  
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [cart, setCart] = useState<{[key: string]: number}>({});

  const shopRef = useMemo(() => (db && storeId ? doc(db, 'users', storeId as string) : null), [db, storeId]);
  const { data: shop } = useDoc(shopRef);

  const myProfileRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: myProfile } = useDoc(myProfileRef);

  const isBlocked = myProfile?.hasActiveDebt === true;

  const productsQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(collection(db, 'products'), where('umkmId', '==', storeId));
  }, [db, storeId]);

  const { data: products, loading } = useCollection(productsQuery);

  const isMyShop = user?.uid === storeId;
  const isStoreOpen = shop?.isStoreOpen !== undefined ? shop.isStoreOpen : true;
  const isRestrictedRole = myProfile?.role === 'courier' || myProfile?.role === 'owner';

  const handleUpdateCart = (productId: string, delta: number) => {
    if (isBlocked) {
      toast({ title: "Fitur Terkunci", description: "SOP: Selesaikan tunggakan Anda untuk belanja.", variant: "destructive" });
      return;
    }
    if (isMyShop || isRestrictedRole || !isStoreOpen) return;
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

  const cartItemsCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = products?.reduce((acc, p) => acc + (p.price * (cart[p.id] || 0)), 0) || 0;

  const handleCheckout = () => {
    if (cartItemsCount === 0 || isBlocked) return;
    const selectedItems = products.filter(p => cart[p.id] > 0).map(p => ({
      id: p.id, name: p.name, price: p.price, quantity: cart[p.id]
    }));
    sessionStorage.setItem('pending_umkm_order', JSON.stringify({
      umkmId: storeId, umkmName: shop?.storeName || "Toko UMKM",
      umkmAddress: shop?.address || "Siau", umkmWhatsapp: shop?.whatsapp || "",
      items: selectedItems, totalAmount: cartTotal
    }));
    // SOP: Melanjutkan ke halaman pilih kurir
    setView('couriers');
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] space-y-4 max-w-full overflow-hidden px-1">
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-primary/10 shadow-sm shrink-0">
        <Button onClick={() => setView('shop')} variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black text-primary uppercase leading-tight truncate">{shop?.storeName || shop?.fullName}</h1>
            <Badge className={`${isStoreOpen ? 'bg-green-50' : 'bg-slate-500'} text-[6px] h-3.5 px-1 font-black uppercase`}>{isStoreOpen ? 'BUKA' : 'TUTUP'}</Badge>
          </div>
          <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest truncate">Marketplace Jastip Siau</p>
        </div>
        {!isMyShop && <Button variant="outline" className="h-8 border-primary/20 text-primary text-[9px] font-black uppercase rounded-lg" onClick={() => setView('messages', { with: storeId })}><MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Chat</Button>}
      </div>

      {isBlocked && (
        <div className="p-4 bg-red-600 text-white rounded-2xl shadow-xl flex items-start gap-4 mx-2 animate-pulse">
           <ShieldAlert className="h-6 w-6 shrink-0 mt-1" />
           <div>
              <p className="text-[11px] font-black uppercase">Akses Belanja Ditangguhkan</p>
              <p className="text-[9px] font-bold uppercase opacity-80 leading-relaxed mt-1">SOP: Anda wajib melunasi tunggakan sebelumnya untuk dapat memesan produk di toko ini.</p>
           </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="grid grid-cols-2 gap-3 pr-3 pb-32">
          {products.map((p: any) => (
            <Card key={p.id} className="overflow-hidden border-none shadow-md bg-white rounded-2xl">
              <div className="relative aspect-square bg-muted/20">
                 {p.imageUrl && <Image src={p.imageUrl} alt={p.name} fill className="object-cover" unoptimized />}
                 <Badge className="absolute top-2 right-2 bg-white/90 text-primary text-[8px] font-black">Rp{p.price.toLocaleString()}</Badge>
              </div>
              <CardContent className="p-3">
                 <h3 className="text-[11px] font-black uppercase text-primary truncate leading-tight mb-2">{p.name}</h3>
                 <div className="flex items-center justify-between gap-2">
                    {(cart[p.id] && !isMyShop && !isBlocked) ? (
                      <div className="flex items-center gap-2 bg-primary/5 rounded-lg p-1 w-full justify-between border">
                         <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleUpdateCart(p.id, -1)}><Minus className="h-3 w-3" /></Button>
                         <span className="text-[10px] font-black">{cart[p.id]}</span>
                         <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleUpdateCart(p.id, 1)}><Plus className="h-3 w-3" /></Button>
                      </div>
                    ) : (
                      <Button className="w-full h-8 text-[9px] font-black uppercase" onClick={() => handleUpdateCart(p.id, 1)} disabled={isBlocked || isMyShop || !isStoreOpen || isRestrictedRole}>Pesan</Button>
                    )}
                 </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {cartItemsCount > 0 && !isBlocked && (
        <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:w-80 bg-white rounded-[2rem] shadow-2xl border-2 border-primary/20 p-4 animate-in slide-in-from-bottom-10 z-[50]">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex flex-col"><span className="text-[8px] font-black text-muted-foreground uppercase">Total Belanja</span><p className="text-lg font-black text-primary tracking-tighter">Rp{cartTotal.toLocaleString()}</p></div>
            <div className="bg-primary/10 px-3 py-1 rounded-full"><span className="text-[10px] font-black text-primary">{cartItemsCount} Produk</span></div>
          </div>
          <Button className="w-full h-12 bg-primary text-white rounded-xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all" onClick={handleCheckout}>Lanjut: Pilih Kurir <ArrowRight className="h-4 w-4 ml-1" /></Button>
        </div>
      )}
    </div>
  );
}
