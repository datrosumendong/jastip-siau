"use client";

/**
 * VIEW: UMKM Orders Management (SOP V17.000 - CHAT TOKO REFINED)
 * SOP: Penegakan Jalur Komunikasi 'cht_toko' dan Pembersihan Terminal pada Riwayat Selesai.
 * FIX: Menghapus tombol Chat/WA jika status COMPLETED/CANCELLED.
 */

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Loader2, Package, CheckCircle2, Store, Clock, Phone, XCircle, MessageSquare, ShieldAlert, AlertTriangle, ClipboardList
} from 'lucide-react';
import { useCollection, useFirestore, useUser, useDoc } from '@/firebase';
import { collection, query, where, doc, updateDoc, serverTimestamp, addDoc, writeBatch, getDocs, setDoc } from 'firebase/firestore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { openWhatsAppChat } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { useView } from '@/context/view-context';

export default function UMKMOrdersView() {
  const { user } = useUser();
  const db = useFirestore();
  const { setView, forceUnlockUI } = useView();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  
  const [rejectOrder, setRejectOrder] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: myProfile } = useDoc(user && db ? doc(db, 'users', user.uid) : null, true);

  const getStatusGuide = (status: string) => {
    switch (status) {
      case 'pending': return "Cek stok dan segera konfirmasi ketersediaan barang.";
      case 'shop_accepted': return "Tunggu Kurir menerima amanah tugas ini.";
      case 'confirmed': return "Kurir SUDAH SIAP. Silakan siapkan produk sekarang.";
      case 'ready_for_pickup': return "Produk SUDAH SIAP. Menunggu kurir menjemput.";
      case 'delivering': return "Barang sedang dalam perjalanan ke Member.";
      case 'delivered': return "Barang sudah sampai tujuan.";
      case 'completed': return "Amanah selesai. Uang belanja sudah diterima.";
      case 'cancelled': return "Dibatalkan.";
      default: return "Sinkronisasi radar...";
    }
  };

  const ordersQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'orders'), where('umkmId', '==', user.uid));
  }, [db, user]);

  const { data: rawOrders = [], loading } = useCollection(ordersQuery, true);

  const { currentOrders, historyOrders } = useMemo(() => {
    if (!rawOrders) return { currentOrders: [], historyOrders: [] };
    const sorted = [...rawOrders].sort((a: any, b: any) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
    return {
      currentOrders: sorted.filter(o => !['completed', 'cancelled', 'delivered'].includes(o.status)),
      historyOrders: sorted.filter(o => ['completed', 'cancelled', 'delivered'].includes(o.status))
    };
  }, [rawOrders]);

  const currentList = showHistory ? historyOrders : currentOrders;

  /**
   * ACTION: handleChatWithMember (SOP V17.000 - CHAT TOKO)
   * Membuka atau menciptakan jalur chat tipe 'cht_toko' antara Toko dan Member.
   */
  const handleChatWithMember = async (order: any) => {
    if (!user || !db || isNavigating) return;
    const memberUid = order.userId;
    const shopUid = user.uid;

    setIsNavigating(true);
    forceUnlockUI();

    try {
      const q = query(
        collection(db, 'chats'),
        where('type', '==', 'cht_toko'),
        where('participants', 'array-contains', shopUid)
      );
      
      const snap = await getDocs(q);
      const existing = snap.docs.find(d => d.data().participants?.includes(memberUid));

      if (existing) {
        setView('chat_view', { id: existing.id });
      } else {
        const newChatRef = doc(collection(db, 'chats'));
        const chatId = newChatRef.id;
        
        await setDoc(newChatRef, {
          id: chatId,
          type: 'cht_toko',
          participants: [shopUid, memberUid].sort(),
          participantNames: {
            [shopUid]: myProfile?.storeName || myProfile?.fullName || "Toko",
            [memberUid]: order.userName || "Member"
          },
          participantPhotos: {
            [shopUid]: myProfile?.storeImageUrl || myProfile?.imageUrl || "",
            [memberUid]: order.userPhoto || ""
          },
          lastMessage: "Halo Kak, saya dari Toko terkait pesanan Kakak.",
          lastMessageSenderId: shopUid,
          lastMessageStatus: 'read',
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });
        
        setView('chat_view', { id: chatId });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal Menghubungkan Chat Toko" });
    } finally {
      setIsNavigating(false);
      setTimeout(forceUnlockUI, 150);
    }
  };

  const handleShopAccept = async (order: any) => {
    if (!db || updatingId) return;
    setUpdatingId(order.id);
    const batch = writeBatch(db);
    try {
      batch.update(doc(db, 'orders', order.id), { status: 'shop_accepted', updatedAt: serverTimestamp() });
      
      batch.set(doc(collection(db, 'notifications')), {
        userId: order.courierId, 
        title: "🛒 Stok Tersedia", 
        message: `Toko ${order.umkmName} menyetujui pesanan ${order.userName}.`,
        type: 'order', 
        targetId: order.id, 
        senderPhoto: myProfile?.storeImageUrl || myProfile?.imageUrl || "", 
        createdAt: serverTimestamp(), 
        isOpened: false
      });

      if (order.courierWhatsapp) {
         const waMsg = `🛒 *JASTIP SIAU - KONFIRMASI TOKO* 👋\n\nHallo Kurir *${order.courierName}*,\nToko *${order.umkmName}* telah MENERIMA pesanan *${order.userName}*.\n\nMohon konfirmasi Anda di aplikasi agar kami bisa mulai menyiapkan produk. 🙏✨`;
         openWhatsAppChat(order.courierWhatsapp, waMsg);
      }
      
      await batch.commit();
      toast({ title: "Diterima Toko" });
    } finally { setUpdatingId(null); }
  };

  const handleReady = async (order: any) => {
    if (!db || updatingId) return;
    setUpdatingId(order.id);
    const batch = writeBatch(db);
    try {
      await updateDoc(doc(db, 'orders', order.id), { status: 'ready_for_pickup', updatedAt: serverTimestamp() });
      
      batch.set(doc(collection(db, 'notifications')), {
        userId: order.courierId, 
        title: "🛍️ Produk Siap Ambil", 
        message: `Pesanan ${order.userName} sudah siap di Toko ${order.umkmName}.`,
        type: 'order', 
        targetId: order.id, 
        senderPhoto: myProfile?.storeImageUrl || myProfile?.imageUrl || "", 
        createdAt: serverTimestamp(), 
        isOpened: false
      });

      if (order.courierWhatsapp) {
        const waMsg = `🛍️ *PRODUK SIAP AMBIL - JASTIP SIAU* 🛵\n\nHalo Kurir *${order.courierName}* 👋,\nPesanan *${order.userName}* sudah selesai kami siapkan dan siap diambil.\n\n📍 *LOKASI*: ${order.umkmName}\n🙏✨`;
        openWhatsAppChat(order.courierWhatsapp, waMsg);
      }
      
      await batch.commit();
      toast({ title: "Sinyal Jemput Terkirim" });
    } finally { setUpdatingId(null); }
  };

  const handleRejectSubmit = async () => {
    if (!db || !rejectOrder || !rejectReason || updatingId) return;
    setUpdatingId(rejectOrder.id);
    const batch = writeBatch(db);
    try {
      batch.update(doc(db, 'orders', rejectOrder.id), { status: 'cancelled', updatedAt: serverTimestamp(), cancelReason: `Toko Menolak: ${rejectReason}` });
      
      batch.set(doc(collection(db, 'notifications')), {
        userId: rejectOrder.userId, 
        title: "❌ Toko Membatalkan", 
        message: `Maaf, Toko membatalkan pesanan Anda: ${rejectReason}.`,
        type: 'order', 
        targetId: rejectOrder.id, 
        createdAt: serverTimestamp(), 
        isOpened: false
      });

      if (rejectOrder.userWhatsapp) {
        const waMsg = `❌ *BATAL - JASTIP SIAU* 🛍️\n\nMaaf Kak *${rejectOrder.userName}* 👋,\nToko *${rejectOrder.umkmName}* tidak dapat memproses pesanan Kakak.\n📝 *ALASAN*: ${rejectReason}\n🙏✨`;
        openWhatsAppChat(rejectOrder.userWhatsapp, waMsg);
      }
      await batch.commit();
      toast({ title: "Dibatalkan" });
      setRejectOrder(null);
    } finally { setUpdatingId(null); }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-primary opacity-20" /></div>;

  return (
    <FlexibleFrame
      title="Pesanan Toko"
      subtitle={showHistory ? "Arsip Pesanan" : "Antrean Pesanan Masuk"}
      icon={Store}
      variant="umkm"
      controls={
        <Button onClick={() => setShowHistory(!showHistory)} variant="outline" size="sm" className="h-8 w-full text-[9px] font-black uppercase rounded-xl">
           {showHistory ? "Lihat Antrean" : "Lihat Riwayat"}
        </Button>
      }
    >
      <div className="space-y-4 pb-20 px-1">
          {currentList.length === 0 ? (
            <div className="py-24 text-center opacity-30 flex flex-col items-center justify-center space-y-4 mx-2">
              <Package className="h-12 w-12" />
              <p className="text-[10px] font-black uppercase tracking-widest">Antrean Kosong</p>
            </div>
          ) : (
            currentList.map((order: any) => {
              const isFinished = order.status === 'completed' || order.status === 'cancelled';
              
              return (
                <Card key={order.id} className={cn("overflow-hidden border-none shadow-md bg-white rounded-2xl", isFinished && "opacity-80")}>
                  <CardHeader className="p-4 bg-primary/[0.02] border-b flex justify-between items-center">
                    <div className="min-w-0">
                      <span className="text-[11px] font-black uppercase text-primary truncate block">{order.userName}</span>
                      <span className="text-[7px] font-black text-muted-foreground uppercase">Ref: #{order.id.slice(-6)}</span>
                    </div>
                    <Badge className="text-[8px] font-black uppercase border-none px-2 shadow-sm bg-primary text-white">{order.status}</Badge>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="p-3 bg-primary/[0.03] border-l-4 border-primary rounded-r-xl flex items-center gap-3">
                       <Clock className="h-3.5 w-3.5 text-primary opacity-40" />
                       <div className="space-y-0.5">
                          <p className="text-[8px] font-black text-primary/40 uppercase tracking-widest">Radar Progres:</p>
                          <p className="text-[10px] font-bold uppercase italic leading-tight">{getStatusGuide(order.status)}</p>
                       </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-muted/20 border border-primary/5 space-y-1.5 shadow-inner">
                      <p className="text-[7px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Pesanan Warga:</p>
                      {order.items?.map((it: string, i: number) => (
                        <p key={i} className="text-[10px] font-bold uppercase text-primary/70 italic leading-none">• {it}</p>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="p-3 bg-orange-50/50 border border-orange-100 rounded-xl flex items-start gap-3 shadow-inner">
                         <ClipboardList className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                         <div className="space-y-1">
                            <p className="text-[8px] font-black text-orange-800 uppercase">Catatan Member:</p>
                            <p className="text-[10px] font-bold text-primary uppercase italic leading-relaxed">"{order.notes}"</p>
                         </div>
                      </div>
                    )}

                    <div className="grid gap-2 pt-2">
                      {order.status === 'pending' && !showHistory && (
                        <div className="flex gap-2">
                          <Button className="flex-[1.5] h-11 bg-green-600 text-white rounded-xl font-black uppercase text-[10px] shadow-lg active:scale-95 transition-all" onClick={() => handleShopAccept(order)} disabled={!!updatingId}>Terima Order</Button>
                          <Button variant="outline" className="flex-1 h-11 border-destructive/20 text-destructive rounded-xl font-black uppercase text-[10px] bg-white shadow-sm" onClick={() => setRejectOrder(order)} disabled={!!updatingId}>Tolak</Button>
                        </div>
                      )}
                      {order.status === 'confirmed' && !showHistory && (
                         <Button className="w-full h-12 bg-primary text-white rounded-xl font-black uppercase text-[11px] shadow-xl gap-2 active:scale-95 transition-all" onClick={() => handleReady(order)} disabled={!!updatingId}>
                            <CheckCircle2 className="h-5 w-5" /> Produk Selesai Disiapkan
                         </Button>
                      )}
                      
                      {/* TERMINAL KOMUNIKASI: SOP V17.000 (Hanya untuk order aktif) */}
                      {!isFinished && (
                        <div className="grid grid-cols-2 gap-3 pt-2">
                           <Button 
                            variant="outline" 
                            className="h-11 rounded-xl font-black uppercase text-[9px] border-primary/10 bg-white shadow-sm active:scale-95 transition-all gap-2"
                            onClick={() => handleChatWithMember(order)}
                            disabled={isNavigating}
                           >
                              {isNavigating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4 text-primary" />} Chat Toko
                           </Button>
                           <Button 
                            variant="outline" 
                            className="h-11 rounded-xl font-black uppercase text-[9px] border-green-200 text-green-600 bg-white shadow-sm active:scale-95 transition-all gap-2"
                            onClick={() => openWhatsAppChat(order.userWhatsapp, `Halo Kak ${order.userName} 👋,\nsaya dari Toko ${order.umkmName} terkait pesanan Kakak di Jastip Siau. 🙏✨`)}
                           >
                              <Phone className="h-4 w-4" /> WhatsApp
                           </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
      </div>

      <AlertDialog open={!!rejectOrder} onOpenChange={(v) => !v && setRejectOrder(null)}>
        <AlertDialogContent className="w-[92vw] rounded-[2rem] p-8 border-none shadow-2xl animate-in zoom-in-95">
          <AlertDialogHeader className="text-center">
            <AlertDialogTitle className="text-xl font-black uppercase text-primary">Tolak Pesanan?</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="py-4 space-y-2.5">
             {['Stok Habis', 'Toko Padat', 'Menu Kosong', 'Segera Tutup'].map(reason => (
               <Button key={reason} variant={rejectReason === reason ? "default" : "outline"} className="w-full h-10 rounded-xl text-[9px] font-black uppercase" onClick={() => setRejectReason(reason)}>{reason}</Button>
             ))}
          </div>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="h-12 rounded-xl font-black uppercase text-[10px] border-primary/10 bg-muted/20">Kembali</AlertDialogCancel>
            <AlertDialogAction className="h-12 rounded-xl bg-destructive text-white font-black uppercase text-[10px] shadow-lg active:scale-95" onClick={handleRejectSubmit} disabled={!rejectReason || !!updatingId}>Konfirmasi Tolak</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FlexibleFrame>
  );
}
