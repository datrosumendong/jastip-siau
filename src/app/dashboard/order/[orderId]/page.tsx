"use client";

import { useMemo, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc, getDoc, query, collection, where, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Package, MapPin, ShieldAlert, MessageSquare, Truck, Copy, Phone, ShoppingCart, Store, ShoppingBag, Heart, Award, XCircle, ShieldCheck, Gavel, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { useToast } from '@/hooks/use-toast';
import { formatIDR } from '@/lib/currency';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { useView } from '@/context/view-context';
import { cn } from '@/lib/utils';

const OrderMap = dynamic(() => import('@/components/order-map'), {
  ssr: false,
  loading: () => <div className="h-[250px] w-full bg-muted animate-pulse rounded-xl flex items-center justify-center font-bold text-[10px] uppercase">Menyiapkan Navigasi...</div>
});

/**
 * VIEW: Detail Pesanan (Standardized Physical Route)
 * SOP: Integrasi Status Guide & Peringatan Pasal 378 sesuai kedaulatan.
 */
export default function OrderDetailPage() {
  const { setView, forceUnlockUI } = useView();
  const params = useParams();
  const orderId = params?.orderId as string;
  
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const orderRef = useMemo(() => (db && orderId ? doc(db, 'orders', orderId) : null), [db, orderId]);
  const { data: order, loading } = useDoc(orderRef, true);

  const myRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: myProfile } = useDoc(myRef, true);

  useEffect(() => {
    if (loading || !user || !order || !db) return;
    
    const checkAuth = async () => {
      try {
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        if (!userSnap.exists()) {
          setIsAuthorized(false);
          return;
        }
        
        const role = userSnap.data()?.role;
        const isRelated = order.userId === user.uid || order.courierId === user.uid || order.umkmId === user.uid;

        if (role === 'admin' || role === 'owner' || isRelated) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (err) {
        setIsAuthorized(false);
      }
    };
    checkAuth();
  }, [user, order, loading, db]);

  const handleChatWithShop = async () => {
    if (!user || !db || !order?.umkmId || isNavigating) return;
    const storeUid = order.umkmId;
    setIsNavigating(true);

    try {
      const q = query(
        collection(db, 'chats'),
        where('type', '==', 'cht_toko'),
        where('participants', 'array-contains', user.uid)
      );
      
      const snap = await getDocs(q);
      const existingChat = snap.docs.find(d => d.data().participants?.includes(storeUid));

      if (existingChat) {
        setView('messages', { id: existingChat.id });
      } else {
        const newChatRef = doc(collection(db, 'chats'));
        const chatId = newChatRef.id;
        
        await setDoc(newChatRef, {
          id: chatId,
          type: 'cht_toko',
          participants: [user.uid, storeUid].sort(),
          participantNames: {
            [user.uid]: myProfile?.fullName || "Member",
            [storeUid]: order.umkmName || "Toko UMKM"
          },
          participantPhotos: {
            [user.uid]: myProfile?.imageUrl || "",
            [storeUid]: order.umkmPhoto || ""
          },
          lastMessage: "Halo Toko, saya sedang melihat detail pesanan saya.",
          lastMessageSenderId: user.uid,
          lastMessageStatus: 'read',
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });
        
        setView('messages', { id: chatId });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal Menghubungkan Chat" });
    } finally {
      setIsNavigating(false);
    }
  };

  /**
   * ACTION: handleGoToChat (SOP DIRECT STRIKE)
   * Membuka form chat pesanan dengan protokol pembebasan layar.
   */
  const handleGoToChat = () => {
    if (!order) return;
    forceUnlockUI();
    setView('order_chat', { id: order.id });
    setTimeout(forceUnlockUI, 100);
  };

  const getStatusGuide = () => {
    if (order?.status === 'pending') return "SOP: Menunggu konfirmasi ketersediaan barang oleh Mitra.";
    if (order?.status === 'shop_accepted') return "SOP: Toko sudah setuju. Sekarang Kurir sedang berkoordinasi.";
    if (order?.status === 'confirmed') return "SOP: Pesanan dikunci. Barang sedang dipersiapkan.";
    if (order?.status === 'shopping') return "SOP: Kurir sedang di lokasi belanja. Harga akan segera diperbarui.";
    if (order?.status === 'ready_for_pickup') return "SOP: Produk sudah SIAP. Kurir dalam proses penjemputan.";
    if (order?.status === 'delivering') return "SOP: Kurir dalam perjalanan. Mohon siapkan uang tunai!";
    if (order?.status === 'delivered') return "SOP: Kurir sudah sampai. Segera temui mitra kami.";
    return null;
  };

  if (loading || (user && isAuthorized === null)) return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <Loader2 className="animate-spin text-primary h-10 w-10 opacity-20" />
      <p className="text-[10px] font-black uppercase text-muted-foreground animate-pulse">Menghubungkan Sinyal...</p>
    </div>
  );

  if (!order || isAuthorized === false) return (
    <div className="flex flex-col items-center justify-center h-full p-12 text-center space-y-6">
      <div className="p-6 rounded-2xl bg-destructive/10">
        <ShieldAlert className="h-12 w-12 text-destructive" />
      </div>
      <h2 className="text-xl font-black uppercase text-primary">Akses Dibatasi</h2>
      <p className="text-[10px] font-bold text-muted-foreground uppercase max-w-[280px]">Maaf, Anda tidak memiliki izin untuk rincian ini.</p>
      <Button onClick={() => setView('home')} className="h-12 rounded-xl px-10 font-black uppercase text-[10px]">Kembali</Button>
    </div>
  );

  const isCourier = user?.uid === order.courierId;
  const isMember = user?.uid === order.userId;
  const isFinished = order.status === 'completed' || order.status === 'cancelled';
  const isSuccess = order.status === 'completed';
  const isCancelled = order.status === 'cancelled';

  return (
    <FlexibleFrame
      title="Rincian Order"
      subtitle={`Ref: #${order.id.slice(-8)}`}
      icon={Package}
      variant={isCourier ? 'courier' : 'member'}
      controls={
        <div className="flex items-center justify-between">
           <Badge className={cn("text-white text-[8px] font-black uppercase px-2.5 py-0.5 shadow-sm rounded-lg border-none", order.status === 'cancelled' ? 'bg-destructive' : 'bg-primary')}>{order.status}</Badge>
           <button onClick={() => { navigator.clipboard.writeText(order.id); toast({title: "ID Disalin"}); }} className="text-[7px] font-black text-muted-foreground uppercase opacity-40 hover:text-primary transition-colors">ID: {order.id.slice(0, 10)}... <Copy className="h-2 w-2" /></button>
        </div>
      }
    >
      <Card className="border-none shadow-lg rounded-2xl overflow-hidden bg-white animate-in zoom-in-95 duration-500">
        <CardContent className="p-0">
           <div className="h-[240px] w-full relative z-0">
              <OrderMap 
                destLat={order.destLat} destLng={order.destLng} 
                courierLat={order.courierLat} courierLng={order.courierLng} 
                isDelivering={order.status === 'delivering' || order.status === 'shopping'} 
              />
           </div>

           <div className="p-5 space-y-6">
              
              {!isFinished && (
                <div className="p-4 bg-primary/[0.03] border-2 border-dashed border-primary/10 rounded-2xl">
                   <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shrink-0"><Info className="h-4 w-4" /></div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-primary uppercase">Status Proses:</p>
                         <p className="text-[11px] font-bold text-primary/80 uppercase italic leading-tight">{getStatusGuide()}</p>
                      </div>
                   </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 shadow-inner">
                   <Truck className="h-6 w-6 text-primary" />
                 </div>
                 <div className="min-w-0 flex-1">
                    <p className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">{isMember ? "Kurir:" : "Pemesan:"}</p>
                    <h3 className="text-[15px] font-black text-primary uppercase truncate leading-none mt-1">{isMember ? (order.courierName || "Mencari...") : order.userName}</h3>
                 </div>
              </div>

              {isMember && isFinished && (
                <div className="animate-in zoom-in-95 duration-500">
                   {isSuccess ? (
                      <div className="p-4 bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl space-y-3 shadow-inner">
                         <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg"><Heart className="h-4 w-4" /></div>
                            <p className="text-[10px] font-black text-blue-900 uppercase">Selesai Amanah</p>
                         </div>
                         <p className="text-[11px] font-bold text-blue-800 leading-relaxed uppercase italic">
                            "Terima kasih atas kepercayaan Anda di Jastip Siau!"
                         </p>
                      </div>
                   ) : (
                      <div className="p-4 bg-red-50 border-2 border-dashed border-red-200 rounded-2xl space-y-3 shadow-inner">
                         <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg"><XCircle className="h-4 w-4" /></div>
                            <p className="text-[10px] font-black text-red-900 uppercase">Info Penolakan</p>
                         </div>
                         <p className="text-[11px] font-bold text-red-700 leading-relaxed uppercase italic">
                            Alasan: {order.cancelReason || "Pesanan tidak dapat diproses."}
                         </p>
                      </div>
                   )}
                </div>
              )}

              {isMember && !!order.umkmId && !isFinished && (
                <div className="p-4 bg-orange-50 rounded-2xl border-2 border-dashed border-orange-200 space-y-3">
                   <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-orange-600" />
                      <span className="text-[9px] font-black uppercase text-orange-900">Hubungi Toko:</span>
                   </div>
                   <Button onClick={handleChatWithShop} disabled={isNavigating} className="w-full h-11 bg-white text-orange-700 border-orange-200 rounded-xl font-black uppercase text-[10px] shadow-sm gap-2">
                     <MessageSquare className="h-4 w-4" /> Buka Chat Toko
                   </Button>
                </div>
              )}

              <div className="space-y-2">
                 <p className="text-[8px] font-black text-muted-foreground uppercase border-b border-dashed pb-1 tracking-widest">Rincian Belanja:</p>
                 <div className="space-y-1.5">
                    {order.items?.map((it: string, i: number) => (
                      <div key={i} className="flex justify-between items-center text-[10px] font-bold uppercase italic text-muted-foreground bg-muted/20 px-3 py-2.5 rounded-xl border border-white">
                        <span className="truncate pr-4">• {it}</span>
                        <span className="font-black text-primary shrink-0">{order.itemPrices?.[i] ? formatIDR(order.itemPrices[i]) : '-'}</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="p-4 rounded-2xl bg-primary/[0.02] border-2 border-dashed border-primary/5 flex justify-between items-end shadow-inner">
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black text-primary uppercase tracking-widest">TOTAL TAGIHAN:</span>
                    <p className="text-[7px] font-bold text-muted-foreground uppercase mt-0.5">Bayar Tunai di Lokasi.</p>
                 </div>
                 <span className="text-2xl font-black text-primary tracking-tighter tabular-nums">
                   {order.totalAmount ? formatIDR(order.totalAmount) : '...'}
                 </span>
              </div>

              {!isFinished && (
                <div className="p-4 bg-red-600 text-white rounded-2xl shadow-xl flex items-start gap-4 relative overflow-hidden">
                   <Gavel className="absolute -bottom-2 -right-2 h-16 w-16 opacity-10" />
                   <ShieldCheck className="h-6 w-6 shrink-0 mt-0.5 animate-pulse" />
                   <div className="space-y-1 relative z-10">
                      <p className="text-[11px] font-black uppercase leading-none">Peringatan SOP</p>
                      <p className="text-[9px] font-bold uppercase opacity-90 italic leading-relaxed">
                        Member yang menolak membayar pesanan akan diproses hukum (Pasal 378 KUHP).
                      </p>
                   </div>
                </div>
              )}
           </div>
        </CardContent>

        <CardFooter className="p-3 bg-muted/5 border-t">
           {!isFinished ? (
             <div className="grid grid-cols-2 gap-2 w-full">
               <Button variant="outline" className="h-11 border-primary/10 text-primary rounded-xl font-black uppercase text-[9px] bg-white shadow-sm" onClick={handleGoToChat}>
                 <MessageSquare className="h-4 w-4 mr-1.5" /> CHAT APP
               </Button>
               <Button className="h-11 bg-green-600 text-white rounded-xl font-black uppercase text-[9px] shadow-md" onClick={() => window.open(`https://wa.me/${isMember ? (order.courierWhatsapp || order.umkmWhatsapp) : order.userWhatsapp}`, '_blank')}>
                 <Phone className="h-4 w-4 mr-1.5" /> HUBUNGI WA
               </Button>
             </div>
           ) : (
             <div className="w-full py-2 text-center flex flex-col items-center gap-2 opacity-50">
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest italic">Interaksi Selesai (Arsip)</p>
             </div>
           )}
        </CardFooter>
      </Card>
    </FlexibleFrame>
  );
}
