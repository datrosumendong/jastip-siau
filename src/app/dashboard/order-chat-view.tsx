
'use client';

/**
 * VIEW: Chat Pesanan (MAHAKARYA RESTORED)
 * SOP: Memulihkan tata letak presisi sesuai instruksi visual pimpinan.
 * FIX: Header Nama, Status, Badge, dan Context Card sesuai gambar.
 */

import { useMemo, useEffect, useState } from 'react';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { OrderChat } from '@/components/chat/order-chat';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Package, ChevronDown, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useView } from '@/context/view-context';
import { cn } from '@/lib/utils';

export default function OrderChatView() {
  const { viewData, setView, forceUnlockUI } = useView();
  const db = useFirestore();
  const { user } = useUser();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const orderId = useMemo(() => viewData?.orderId || viewData?.id || '', [viewData]);
  const orderRef = useMemo(() => (db && orderId ? doc(db, 'orders', orderId) : null), [db, orderId]);
  const { data: order, loading } = useDoc(orderRef, true);

  useEffect(() => {
    if (loading || !user || !db) return;
    if (!order) { setIsAuthorized(false); return; }

    const checkAuth = async () => {
      try {
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        const role = userSnap.data()?.role;
        const isRelated = order.userId === user.uid || order.courierId === user.uid || order.umkmId === user.uid;
        if (role === 'admin' || role === 'owner' || isRelated) setIsAuthorized(true);
        else setIsAuthorized(false);
      } catch (err) { setIsAuthorized(false); }
    };
    checkAuth();
  }, [user, order, loading, db]);

  const handleBack = () => {
    forceUnlockUI();
    if (orderId) setView('order_detail', { id: orderId });
    else setView('orders');
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
      <Loader2 className="animate-spin text-primary opacity-20 h-10 w-10" />
    </div>
  );

  if (!order || isAuthorized === false) return (
    <div className="flex flex-col items-center justify-center h-full p-10 text-center animate-in fade-in duration-500">
       <h2 className="text-xl font-black uppercase text-primary">Akses Dibatasi</h2>
       <Button onClick={handleBack} variant="outline" className="mt-8">Kembali</Button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      {/* HEADER: SESUAI GAMBAR PIMPINAN */}
      <header className="px-4 py-3 border-b bg-white flex flex-col shrink-0 z-[40]">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-6 min-w-0">
            <button onClick={handleBack} className="text-primary active:scale-90 transition-transform">
              <ArrowLeft className="h-6 w-6 stroke-[2.5px]" />
            </button>
            <div className="min-w-0">
              <h2 className="text-[14px] font-black uppercase text-primary leading-tight">
                {user?.uid === order.userId ? (order.courierName || "Kurir Jastip") : order.userName}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                 <div className="h-2 w-2 rounded-full bg-green-500" />
                 <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Live Chat Order</span>
              </div>
            </div>
          </div>
          <Badge className="bg-primary/5 text-primary border-none text-[8px] font-black uppercase px-3 py-1 rounded-full shadow-sm">
            {order.status?.toUpperCase()}
          </Badge>
        </div>

        {/* CONTEXT CARD: SESUAI GAMBAR PIMPINAN */}
        <div className="mt-4 flex items-center justify-between gap-4 p-4 bg-primary/[0.03] rounded-[1.5rem] border border-primary/5 shadow-sm">
           <div className="flex items-center gap-4 min-w-0">
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm shrink-0 border border-primary/5">
                 <Package className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                 <p className="text-[11px] font-black text-primary uppercase truncate leading-none">REF: #{order.id.slice(-8)}</p>
                 <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1.5 truncate">{order.items?.join(', ')}</p>
              </div>
           </div>
           <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 px-4 text-[9px] font-black uppercase bg-white border border-primary/5 rounded-2xl shadow-sm shrink-0 gap-1 active:scale-95"
            onClick={() => setView('order_detail', { id: order.id })}
           >
              Detail <ChevronDown className="h-3 w-3" />
           </Button>
        </div>
      </header>

      <div className="flex-1 min-h-0 relative overflow-hidden bg-[#F8FAFC]">
        <OrderChat orderId={orderId} orderName={user?.uid === order.userId ? order.courierName : order.userName} />
      </div>
    </div>
  );
}
