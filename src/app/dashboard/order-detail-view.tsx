
"use client";

/**
 * VIEW: Detail Pesanan (SOP V16.700 - NAVIGATION SOVEREIGNTY)
 * SOP: Penegakan kedaulatan rute (Kurir -> Toko -> Member) untuk Belanja UMKM.
 * FIX: Sinkronisasi pangkalan data shopLat dan targetShops ke radar peta.
 */

import { useMemo, useEffect, useState } from 'react';
import { useDoc, useFirestore, useUser, useCollection } from '@/firebase';
import { 
  doc, updateDoc, serverTimestamp, addDoc, collection, 
  writeBatch, increment, getDocs, where, query, limit, setDoc
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Loader2, Package, Truck, Phone, MessageSquare, 
  ShieldAlert, Store, Heart, Info, Gavel, ShieldCheck, Navigation, 
  Clock, CheckCircle2, XCircle, ShoppingBag, Map as MapIcon, ChevronLeft, 
  AlertTriangle, Star, ClipboardList, Send, X, RotateCcw, Award, Trophy, History
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import dynamic from 'next/dynamic';
import { formatIDR } from '@/lib/currency';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { useView } from '@/context/view-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { openWhatsAppChat } from '@/lib/whatsapp';

const OrderMap = dynamic(() => import('@/components/order-map'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center font-black text-[10px] uppercase">Menyiapkan Radar...</div>
});

export default function OrderDetailView() {
  const { setView, viewData, goBack, forceUnlockUI } = useView();
  const orderId = viewData?.orderId || viewData?.id;
  
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [showFullMap, setShowFullMap] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showSanctionConfirm, setShowSanctionConfirm] = useState(false);
  const [showTestiDialog, setShowTestiDialog] = useState(false);
  const [testiMessage, setTestiMessage] = useState("");
  const [testiRating, setTestiRating] = useState(5);
  const [isSubmittingTesti, setIsSubmittingTesti] = useState(false);

  const orderRef = useMemo(() => (db && orderId ? doc(db, 'orders', orderId) : null), [db, orderId]);
  const { data: order, loading } = useDoc(orderRef, true);

  const myProfileRef = useMemo(() => (user && db ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: myProfile } = useDoc(myProfileRef, true);

  const isCourier = user?.uid === order?.courierId;
  const isMember = user?.uid === order?.userId;
  const isShop = user?.uid === order?.umkmId;
  const isFinished = order?.status === 'completed' || order?.status === 'cancelled';
  const isPureUmkm = order?.isPureUmkm === true;
  const isCancelled = order?.status === 'cancelled';
  const isSuccess = order?.status === 'completed';

  const isSuspended = myProfile?.isUnderInvestigation === true;

  useEffect(() => {
    if (loading || !user || !order || !db || !myProfile) return;
    const isRelated = order.userId === user.uid || order.courierId === user.uid || order.umkmId === user.uid;
    const isAdmin = myProfile?.role === 'admin' || myProfile?.role === 'owner';
    if (isAdmin || isRelated) setIsAuthorized(true);
    else setIsAuthorized(false);
  }, [user, order, loading, db, myProfile]);

  const handleReportUnpaid = async () => {
    if (!db || !order || !user || isUpdating) return;
    setIsUpdating(true);
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'orders', order.id), { isReportedUnpaid: true, updatedAt: serverTimestamp() });
      batch.update(doc(db, 'users', order.userId), { hasActiveDebt: true, updatedAt: serverTimestamp() });
      
      const complaintRef = doc(collection(db, 'complaints'));
      batch.set(complaintRef, { 
        id: complaintRef.id, orderId: order.id, userId: order.userId, userName: order.userName,
        userWhatsapp: order.userWhatsapp || "", courierId: user.uid, courierName: myProfile?.fullName || "Kurir", 
        courierWhatsapp: myProfile?.whatsapp || "", amount: order.totalAmount, reason: "Gagal bayar belanjaan.",
        status: 'open', type: 'payment_issue', participants: [order.userId, user.uid],
        createdAt: serverTimestamp(), updatedAt: serverTimestamp()
      });
      await batch.commit();
      toast({ title: "Laporan Terkirim" });
      setShowSanctionConfirm(false);
    } catch (e) { toast({ variant: "destructive", title: "Gagal" }); }
    finally { setIsUpdating(false); }
  };

  const handleStatusUpdate = async (nextStatus: string, customCancelReason?: string) => {
    if (!db || !order || isUpdating) return;
    setIsUpdating(true);
    const batch = writeBatch(db);
    const oRef = doc(db, 'orders', order.id);

    try {
      if (nextStatus === 'shop_accepted') {
        batch.update(oRef, { status: 'shop_accepted', updatedAt: serverTimestamp() });
        batch.set(doc(collection(db, 'notifications')), {
          userId: order.courierId, title: "🛒 Stok Tersedia",
          message: `Toko ${order.umkmName} menyetujui pesanan.`,
          type: 'order', targetId: order.id, createdAt: serverTimestamp(), isOpened: false
        });
        toast({ title: "Diterima Toko" });
      } 
      else if (nextStatus === 'confirmed') {
        batch.update(oRef, { status: 'confirmed', updatedAt: serverTimestamp() });
        batch.set(doc(collection(db, 'notifications')), {
          userId: order.userId, title: "✅ Amanah Diterima",
          message: `Kurir ${order.courierName} memproses pesanan.`,
          type: 'order', targetId: order.id, senderPhoto: myProfile?.imageUrl || "", createdAt: serverTimestamp(), isOpened: false
        });
        if (order.userWhatsapp) {
           openWhatsAppChat(order.userWhatsapp, `📢 *KONFIRMASI TERIMA AMANAH - JASTIP SIAU* 🛵\n\nHalo *${order.userName}*, saya memproses pesanan Anda.`);
        }
        toast({ title: "Amanah Diterima" });
      }
      else if (nextStatus === 'completed') {
        batch.update(oRef, { status: 'completed', isReportedUnpaid: false, updatedAt: serverTimestamp() });
        toast({ title: "Selesai" });
      }
      else if (nextStatus === 'cancelled') {
        batch.update(oRef, { status: 'cancelled', cancelReason: customCancelReason || "Dibatalkan.", updatedAt: serverTimestamp() });
        toast({ title: "Dibatalkan" });
      } else {
        batch.update(oRef, { status: nextStatus, updatedAt: serverTimestamp() });
      }
      await batch.commit();
    } catch (e) { toast({ variant: "destructive", title: "Gagal" }); }
    finally { setIsUpdating(false); setShowRejectDialog(false); }
  };

  const handleSendTestimonial = async () => {
    if (!db || !user || !order || !testiMessage.trim()) return;
    setIsSubmittingTesti(true);
    const batch = writeBatch(db);
    
    try {
      const testiRef = doc(db, 'testimonials', order.id);
      batch.set(testiRef, {
        id: order.id, userId: user.uid, userName: myProfile?.fullName || 'Warga',
        userPhoto: myProfile?.imageUrl || '', message: testiMessage.trim(), 
        rating: testiRating, isApproved: false, status: 'pending',
        createdAt: serverTimestamp(), courierId: order.courierId, courierName: order.courierName,
        courierPhoto: order.courierPhoto || ''
      });
      batch.update(doc(db, 'orders', order.id), { hasTestimonial: true });
      const now = new Date();
      const rankId = `member_${user.uid}_${now.getFullYear()}_${now.getMonth() + 1}`;
      batch.set(doc(db, 'monthly_rankings', rankId), {
        userId: user.uid, userName: myProfile?.fullName, userPhoto: myProfile?.imageUrl || "",
        role: 'member', orderCount: increment(1), year: now.getFullYear(), month: now.getMonth() + 1, updatedAt: serverTimestamp()
      }, { merge: true });

      await batch.commit();
      toast({ title: "Ulasan Terkirim", description: "Poin ranking Anda segera bertambah." });
      setShowTestiDialog(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal Mengirim" });
    } finally { setIsSubmittingTesti(false); }
  };

  const getStatusGuide = () => {
    if (order?.isReportedUnpaid) {
      if (isCourier) return "SOP SANKSI: Member menolak bayar. Segera lakukan penagihan atau tunggu konfirmasi lunas.";
      if (isMember) return "SOP SANKSI: Akun tertangguh karena kendala pembayaran. Segera lunasi agar aktif kembali.";
      return "SOP: Pesanan dilaporkan gagal bayar oleh Kurir.";
    }

    if (isSuspended && (order?.status === 'pending' || order?.status === 'shop_accepted')) {
      if (isCourier) return "LOCKDOWN: Anda sedang diinvestigasi. Dilarang menerima amanah baru.";
      if (isMember) return "SOP: Kurir pilihan Anda sedang dalam tahap moderasi Admin.";
      return "SOP: Mitra kurir sedang dalam masa investigasi Admin.";
    }

    const status = order?.status;

    if (isMember) {
      switch (status) {
        case 'pending': return "Pesanan terkirim. Menunggu konfirmasi ketersediaan barang/mitra.";
        case 'shop_accepted': return "Toko sudah setuju. Menunggu kurir mengonfirmasi amanah.";
        case 'confirmed': return "Kurir sudah siaga. Pesanan Anda segera diproses.";
        case 'shopping': return "Kurir sedang di lokasi belanja. Harga akan segera diperbarui.";
        case 'ready_for_pickup': return "Produk sudah SIAP di Toko. Kurir sedang dalam proses penjemputan.";
        case 'delivering': return "Kurir meluncur ke lokasi Anda! Siapkan uang tunai sekarang.";
        case 'delivered': return "Kurir sudah sampai! Segera temui mitra kami untuk serah terima.";
        case 'completed': return "Amanah tuntas. Terima kasih telah belanja jujur di Jastip Siau!";
        case 'cancelled': return `Dibatalkan: ${order?.cancelReason || "Kendala teknis."}`;
        default: return "Sinkronisasi radar belanja...";
      }
    }

    if (isCourier) {
      switch (status) {
        case 'pending': return "Amanah Baru! Silakan terima jika Anda bersedia melayani.";
        case 'shop_accepted': return "Toko sudah SETUJU. Anda bisa menerima amanah ini sekarang.";
        case 'confirmed': return "Amanah diterima. Segera berangkat ke lokasi belanja warga.";
        case 'shopping': return "Proses belanja aktif. Mohon teliti dan input harga nota nanti.";
        case 'ready_for_pickup': return "Produk sudah SIAP! Silakan jemput di Toko sekarang.";
        case 'delivering': return "Sedang mengantar. Pastikan HP standby dan GPS tetap aktif.";
        case 'delivered': return "Sudah sampai lokasi. Tunggu pembayaran tunai dari Member.";
        case 'completed': return "Amanah selesai. Laba jasa & poin ranking telah bertahta di Vault.";
        case 'cancelled': return `Dibatalkan: ${order?.cancelReason}`;
        default: return "Sinyal amanah aktif.";
      }
    }

    if (isShop) {
      switch (status) {
        case 'pending': return "Pesanan Masuk! Mohon periksa stok dan segera konfirmasi.";
        case 'shop_accepted': return "Stok disetujui. Menunggu kurir menerima tugas belanja.";
        case 'confirmed': return "Kurir siaga. Mohon segera siapkan produk pesanan pimpinan.";
        case 'shopping': return "Kurir sedang memproses belanjaan di pangkalan Toko.";
        case 'ready_for_pickup': return "Produk siap ambil. Menunggu kurir datang menjemput.";
        case 'delivering': return "Pesanan sedang dikirim oleh kurir menuju Member.";
        case 'delivered': return "Amanah sudah tiba di tangan Member.";
        case 'completed': return "Amanah selesai. Omzet belanja telah resmi dibukukan.";
        case 'cancelled': return `Pesanan dibatalkan: ${order?.cancelReason}`;
        default: return "Radar Toko Aktif.";
      }
    }

    return "SOP: Proses amanah sedang berjalan.";
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin h-10 w-10 text-primary opacity-20" /></div>;

  if (!order || isAuthorized === false) return (
    <div className="flex flex-col items-center justify-center h-full p-10 text-center space-y-6">
       <ShieldAlert className="h-16 w-16 text-destructive opacity-20" />
       <h2 className="text-xl font-black uppercase text-primary">Akses Dibatasi</h2>
       <Button onClick={goBack} variant="outline">Kembali</Button>
    </div>
  );

  return (
    <>
      <FlexibleFrame
        title={isPureUmkm ? "Belanja UMKM" : "Belanja Kurir"}
        subtitle={`Ref: #${order.id.slice(-8)}`}
        icon={isPureUmkm ? Store : ShoppingBag}
        variant={isCourier ? 'courier' : isShop ? 'umkm' : 'member'}
        scrollable={!showFullMap}
        controls={
          <div className="flex items-center justify-between w-full">
             <div className="flex items-center gap-2">
                <Button onClick={() => setShowFullMap(!showFullMap)} variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase rounded-xl bg-white border-primary/10">
                   <MapIcon className="h-3.5 w-3.5 mr-1" /> Radar
                </Button>
                <Badge className={cn("text-white text-[8px] font-black uppercase px-2.5 h-6 rounded-lg border-none", isCancelled ? 'bg-destructive' : 'bg-primary')}>{order.status?.toUpperCase()}</Badge>
             </div>
             <Button onClick={goBack} variant="ghost" size="sm" className="h-9 px-3 rounded-xl text-primary font-black uppercase text-[10px] gap-1.5">
                <ChevronLeft className="h-4 w-4" /> Kembali
             </Button>
          </div>
        }
      >
        {showFullMap ? (
           <div className="absolute inset-0 z-0 w-full h-full">
              <OrderMap 
                destLat={order.destLat} 
                destLng={order.destLng} 
                courierLat={order.courierLat} 
                courierLng={order.courierLng} 
                shopLat={order.isPureUmkm ? order.shopLat : undefined}
                shopLng={order.isPureUmkm ? order.shopLng : undefined}
                targetShops={order.targetShops}
                isDelivering={!isFinished} 
              />
           </div>
        ) : (
          <div className="space-y-4 pb-64 px-1">
             <Card className="border-none shadow-lg rounded-2xl overflow-hidden bg-white animate-in slide-in-from-bottom-2 duration-500">
                <div className="h-[220px] w-full relative z-0">
                   <OrderMap 
                    destLat={order.destLat} 
                    destLng={order.destLng} 
                    courierLat={order.courierLat} 
                    courierLng={order.courierLng} 
                    shopLat={order.isPureUmkm ? order.shopLat : undefined}
                    shopLng={order.isPureUmkm ? order.shopLng : undefined}
                    targetShops={order.targetShops}
                    isDelivering={!isFinished} 
                   />
                </div>
                
                <CardContent className="p-5 space-y-6">
                   <div className={cn("p-4 border-l-4 rounded-r-2xl shadow-inner", isSuspended && !isFinished ? "bg-red-50 border-red-600" : "bg-primary/[0.03] border-primary")}>
                      <p className="text-[8px] font-black uppercase tracking-widest mb-1">Radar Progres:</p>
                      <p className={cn("text-[10px] font-bold uppercase italic leading-tight", isSuspended && !isFinished ? "text-red-800" : "text-primary/80")}>{getStatusGuide()}</p>
                   </div>

                   <div className="flex items-center gap-4 border-b border-dashed pb-6">
                      <Avatar className="h-14 w-14 border-4 border-white shadow-xl rounded-full">
                         <AvatarImage src={isMember ? order.courierPhoto : order.userPhoto} className="object-cover" />
                         <AvatarFallback className="bg-primary text-white font-black text-lg">{(isMember ? order.courierName : order.userName)?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                         <p className="text-[8px] font-black text-muted-foreground uppercase">{isMember ? "Mitra Kurir:" : "Pemesan Amanah:"}</p>
                         <h3 className="text-[15px] font-black text-primary uppercase truncate leading-none mt-1">{isMember ? (order.courierName || "Mencari...") : order.userName}</h3>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Daftar Titipan:</p>
                      <div className="space-y-2">
                         {order.items?.map((it: string, i: number) => (
                           <div key={i} className="flex justify-between items-center p-3.5 rounded-xl border bg-muted/30 border-white shadow-inner">
                             <p className="text-[11px] font-black uppercase italic truncate pr-4">• {it}</p>
                             <span className="font-black text-primary shrink-0 text-xs tabular-nums">{order.itemPrices?.[i] ? formatIDR(order.itemPrices[i]) : '-'}</span>
                           </div>
                         ))}
                      </div>
                   </div>

                   {order.notes && (
                      <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl flex items-start gap-3 shadow-inner">
                         <ClipboardList className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                         <div className="space-y-1">
                            <p className="text-[8px] font-black text-orange-800 uppercase">Keterangan Khusus:</p>
                            <p className="text-[11px] font-bold text-primary uppercase italic leading-relaxed">"{order.notes}"</p>
                         </div>
                      </div>
                   )}

                   <div className="p-6 rounded-[2rem] bg-primary/[0.02] border-4 border-white flex justify-between items-center shadow-xl">
                      <span className="text-[9px] font-black text-primary/40 uppercase tracking-[0.3em]">Total Bayar</span>
                      <span className="text-3xl font-black text-primary tracking-tighter">{order.totalAmount ? formatIDR(order.totalAmount) : 'PROSES...'}</span>
                   </div>

                   {isMember && isSuccess && !order.hasTestimonial && (
                      <div className="p-5 bg-gradient-to-br from-yellow-50 to-amber-100 rounded-[2rem] border-2 border-dashed border-amber-200 space-y-4 shadow-inner animate-in zoom-in-95">
                         <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-yellow-500 text-white flex items-center justify-center shadow-lg shrink-0"><Trophy className="h-6 w-6" /></div>
                            <div className="space-y-1">
                               <h3 className="text-sm font-black uppercase text-amber-900 leading-tight">Reward Ranking Warga</h3>
                               <p className="text-[9px] font-bold uppercase text-amber-800/70 leading-relaxed italic">
                                 Dapatkan <span className="text-amber-600 font-black">+1 Poin Warga Teladan</span> dengan memberikan ulasan amanah bagi kurir Anda.
                               </p>
                            </div>
                         </div>
                         <Button 
                          onClick={() => setShowTestiDialog(true)}
                          className="w-full h-12 bg-yellow-500 hover:bg-amber-600 text-white rounded-xl font-black uppercase text-[10px] shadow-xl gap-2 active:scale-95 transition-all"
                         >
                            <Award className="h-4 w-4" /> Beri Ulasan & Ambil Poin
                         </Button>
                      </div>
                   )}

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
                </CardContent>

                <CardFooter className="p-3 bg-muted/5 border-t">
                  {!isFinished ? (
                    <div className="flex flex-col gap-2 w-full">
                       {isShop && order.status === 'pending' && (
                         <div className="flex gap-2">
                            <Button className="flex-1 h-14 bg-green-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg" onClick={() => handleStatusUpdate('shop_accepted')} disabled={isUpdating}>Terima Order</Button>
                            <Button variant="outline" className="flex-1 h-14" onClick={() => setShowRejectDialog(true)}>Tolak</Button>
                         </div>
                       )}

                       {isCourier && (
                          <div className="space-y-2 mb-2">
                             {((!isPureUmkm && order.status === 'pending') || order.status === 'shop_accepted') && (
                               <div className="flex gap-2">
                                 <Button 
                                  className="flex-1 h-14 bg-primary text-white rounded-2xl font-black uppercase text-xs shadow-lg disabled:opacity-40" 
                                  onClick={() => handleStatusUpdate('confirmed')} 
                                  disabled={isUpdating || isSuspended}
                                 >
                                   {isSuspended ? "Lockdown" : "Terima Amanah"}
                                 </Button>
                                 <Button variant="outline" className="flex-1 h-14" onClick={() => setShowRejectDialog(true)}>Tolak</Button>
                               </div>
                             )}

                             {((order.status === 'confirmed' && !isPureUmkm) || (order.status === 'ready_for_pickup' && isPureUmkm)) && (
                               <Button className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase text-xs shadow-xl" onClick={() => handleStatusUpdate('shopping')}>Mulai Belanja Sekarang</Button>
                             )}

                             {order.status === 'shopping' && (
                               <Button className="w-full h-14 bg-green-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl" onClick={() => setView('courier_price_input', { id: order.id })}>Input Harga Nota</Button>
                             )}
                             
                             {(order.status === 'delivered' || order.isReportedUnpaid) && (
                               <Button className="w-full h-14 bg-green-600 text-white rounded-xl font-black uppercase text-xs shadow-xl active:scale-95" onClick={() => handleStatusUpdate('completed')}>Konfirmasi Pelunasan</Button>
                             )}
                             
                             {order.status === 'delivered' && !order.isReportedUnpaid && (
                               <Button variant="outline" className="w-full h-10 border-2 border-destructive text-destructive font-black uppercase text-[9px] rounded-xl" onClick={() => setShowSanctionConfirm(true)}>Member Menolak Bayar!</Button>
                             )}
                          </div>
                       )}

                       <Button onClick={() => setView('chat_view', { id: order.chatId || `order_${order.id}` })} className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase text-xs shadow-xl gap-3 active:scale-95"><MessageSquare className="h-5 w-5" /> Chat Aplikasi</Button>
                       <Button onClick={() => openWhatsAppChat(isMember ? (order.courierWhatsapp || order.umkmWhatsapp) : order.userWhatsapp, "Halo, koordinasi Jastip Siau.")} variant="outline" className="w-full h-12 rounded-2xl font-black uppercase text-[10px] gap-2 active:scale-95"><Phone className="h-4 w-4" /> WhatsApp</Button>
                    </div>
                  ) : (
                    <div className="w-full py-4 text-center opacity-50 flex flex-col items-center gap-2">
                       <History className="h-5 w-5 text-muted-foreground" />
                       <p className="text-[10px] font-black uppercase tracking-widest italic">Amanah Selesai (Arsip)</p>
                    </div>
                  )}
                </CardFooter>
             </Card>
          </div>
        )}
      </FlexibleFrame>

      {/* DIALOG: TOLAK AMANAH */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
         <DialogContent className="w-[92vw] sm:max-w-md rounded-[2rem] p-8 border-none shadow-2xl z-[1500]">
            <DialogHeader className="text-center">
               <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4"><XCircle className="h-8 w-8 text-destructive" /></div>
               <DialogTitle className="text-xl font-black uppercase text-primary tracking-tighter">Tolak Amanah?</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-2.5">
               {['Kendaraan Bermasalah', 'Cuaca Buruk', 'Lagi Di Jalan Antar', 'Lokasi Terlalu Jauh', 'Toko Tutup', 'Stok Habis'].map(reason => (
                 <Button 
                   key={reason} 
                   variant={rejectReason === reason ? "default" : "outline"} 
                   className={cn("w-full h-11 rounded-xl text-[10px] font-black uppercase shadow-sm", rejectReason === reason ? "bg-primary text-white border-primary" : "border-primary/10 text-primary bg-white")} 
                   onClick={() => setRejectReason(reason)}
                 >
                   {reason}
                 </Button>
               ))}
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-3">
               <Button variant="ghost" className="flex-1 h-12 border rounded-xl" onClick={() => setShowRejectDialog(false)}>Batal</Button>
               <Button className="flex-[1.5] h-12 bg-destructive text-white font-black uppercase text-[10px] rounded-xl shadow-lg" onClick={() => handleStatusUpdate('cancelled', rejectReason)} disabled={!rejectReason || isUpdating}>Konfirmasi Tolak</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      {/* DIALOG: SANKSI PASAL 378 */}
      <AlertDialog open={showSanctionConfirm} onOpenChange={setShowSanctionConfirm}>
        <AlertDialogContent className="w-[92vw] rounded-[2rem] p-8 border-none shadow-2xl text-center z-[1500]">
           <AlertDialogHeader>
              <div className="mx-auto h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6"><ShieldAlert className="h-10 w-10 text-destructive" /></div>
              <AlertDialogTitle className="text-2xl font-black uppercase text-primary leading-none italic">Blokir Member?</AlertDialogTitle>
              <AlertDialogDescription className="text-[11px] font-bold text-muted-foreground uppercase mt-6 leading-relaxed">
                 SOP: Member ini akan otomatis diblokir akses pemesanannya karena laporan penolakan pembayaran.
              </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-10">
              <AlertDialogCancel className="h-14 rounded-2xl font-black uppercase text-[10px] border-primary/10 bg-muted/20">Batal</AlertDialogCancel>
              <AlertDialogAction className="h-14 rounded-2xl font-black uppercase text-[10px] bg-destructive text-white shadow-xl active:scale-95 transition-all gap-2" onClick={handleReportUnpaid} disabled={isUpdating}>
                 <Gavel className="h-4 w-4" /> Ya, Blokir & Laporkan
              </AlertDialogAction>
           </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DIALOG: TESTIMONI MEMBER (APRESIASI +1 POIN) */}
      <Dialog open={showTestiDialog} onOpenChange={setShowTestiDialog}>
        <DialogContent className="w-[94vw] sm:max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl animate-in zoom-in-95 z-[500]">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-black uppercase text-primary tracking-tighter italic">Apresiasi Warga</DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mt-1">Suara Anda membangun kedaulatan kejujuran di Siau.</DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setTestiRating(s)} className="p-1 transition-all active:scale-75">
                  <Star className={cn("h-10 w-10", s <= testiRating ? "text-yellow-500 fill-current" : "text-muted/30")} />
                </button>
              ))}
            </div>
            <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase text-primary ml-1">Pesan Kesan Anda:</Label>
               <Textarea 
                placeholder="Contoh: Kurirnya sangat amanah, jujur, dan sampai tepat waktu! 🙏✨" 
                className="h-32 bg-muted/20 border-none rounded-2xl p-5 font-bold text-xs shadow-inner leading-relaxed" 
                value={testiMessage} 
                onChange={(e) => setTestiMessage(e.target.value)} 
               />
            </div>
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
               <Award className="h-5 w-5 text-blue-600 shrink-0" />
               <p className="text-[9px] font-black text-blue-900 uppercase">Kirim ulasan untuk klaim +1 Poin Ranking bulan ini!</p>
            </div>
          </div>
          <DialogFooter>
             <Button 
               className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all gap-2" 
               onClick={handleSendTestimonial} 
               disabled={isSubmittingTesti || !testiMessage.trim()}
             >
                {isSubmittingTesti ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />} 
                Kirim Apresiasi & Ambil Poin
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
