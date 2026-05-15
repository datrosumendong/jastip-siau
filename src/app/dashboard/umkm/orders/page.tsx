
"use client";

/**
 * VIEW: UMKM Orders Management (SOP V500 RESTORED)
 * SOP: Penanganan koordinasi kaku antara Toko dan Kurir.
 * FIX: Menjamin tombol "Produk Siap" bertahta tepat waktu.
 */

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Loader2, Package, Truck, CheckCircle2, 
  Trash2, ArrowLeft, Phone, XCircle, MessageSquare, ShieldAlert, Store, Clock
} from 'lucide-react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where, doc, updateDoc, serverTimestamp, addDoc, writeBatch, getDocs } from 'firebase/firestore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { openWhatsAppChat } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

export default function UMKMOrdersPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  const [rejectOrder, setRejectOrder] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");

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

  const handleShopAccept = async (order: any) => {
    if (!db || updatingId) return;
    setUpdatingId(order.id);
    try {
      await updateDoc(doc(db, 'orders', order.id), { status: 'shop_accepted', updatedAt: serverTimestamp() });
      
      // Sinyal WA ke Kurir: "Toko Setuju, Kurir mohon konfirmasi."
      if (order.courierWhatsapp) {
         const waMsg = `🛒 *JASTIP SIAU - KONFIRMASI TOKO* 👋\n\nHallo Kurir *${order.courierName}*,\nToko *${order.umkmName}* telah MENYETUJUI pesanan *${order.userName}*.\n\nMohon konfirmasi Anda di aplikasi agar kami bisa mulai menyiapkan produk. 🙏✨`;
         openWhatsAppChat(order.courierWhatsapp, waMsg);
      }
      toast({ title: "Order Diterima" });
    } finally { setUpdatingId(null); }
  };

  const handleReady = async (order: any) => {
    if (!db || updatingId) return;
    setUpdatingId(order.id);
    try {
      await updateDoc(doc(db, 'orders', order.id), { status: 'ready_for_pickup', updatedAt: serverTimestamp() });
      
      // Sinyal WA ke Kurir: "Produk Siap Ambil."
      if (order.courierWhatsapp) {
        const waMsg = `🛍️ *PRODUK SIAP AMBIL - JASTIP SIAU* 🛵\n\nHalo Kurir *${order.courierName}* 👋,\nPesanan *${order.userName}* sudah selesai kami siapkan dan siap diambil.\n\n📍 *LOKASI*: ${order.umkmName}\n🙏✨`;
        openWhatsAppChat(order.courierWhatsapp, waMsg);
      }
      toast({ title: "Sinyal Jemput Terkirim" });
    } finally { setUpdatingId(null); }
  };

  const handleRejectSubmit = async () => {
    if (!db || !rejectOrder || !rejectReason || updatingId) return;
    setUpdatingId(rejectOrder.id);
    const batch = writeBatch(db);
    const chatId = rejectOrder.chatId || `order_${rejectOrder.id}`;

    try {
      batch.update(doc(db, 'orders', rejectOrder.id), { 
        status: 'cancelled', 
        updatedAt: serverTimestamp(), 
        cancelReason: `Toko Menolak: ${rejectReason}` 
      });

      const msgsSnap = await getDocs(collection(db, 'chats', chatId, 'messages'));
      msgsSnap.forEach(m => batch.delete(m.ref));
      batch.delete(doc(db, 'chats', chatId));

      if (rejectOrder.userWhatsapp) {
        const waMsg = `❌ *BATAL - JASTIP SIAU* 🛍️\n\nMaaf Kak *${rejectOrder.userName}*, Toko *${rejectOrder.umkmName}* tidak dapat memproses pesanan Kakak.\n📝 *ALASAN*: ${rejectReason}\n🙏✨`;
        openWhatsAppChat(rejectOrder.userWhatsapp, waMsg);
      }

      await batch.commit();
      toast({ title: "Dibatalkan & WA Terkirim" });
      setRejectOrder(null);
      setRejectReason("");
    } finally { setUpdatingId(null); }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-primary opacity-20" /></div>;

  return (
    <div className="flex flex-col h-full space-y-4 max-w-full overflow-hidden px-1 bg-[#F8FAFC]">
      <header className="sticky top-0 z-20 flex flex-col gap-1 bg-white p-4 rounded-xl border border-primary/10 shadow-sm shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-black text-primary uppercase leading-tight flex items-center gap-2">
            <Store className="h-5 w-5" /> {showHistory ? "Arsip Pesanan" : "Pesanan Toko"}
          </h1>
          <Button onClick={() => setShowHistory(!showHistory)} variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase rounded-xl">
            {showHistory ? "Antrean" : "Riwayat"}
          </Button>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="space-y-4 pr-3 pb-32">
          {currentList.length === 0 ? (
            <div className="py-24 text-center opacity-30 flex flex-col items-center justify-center space-y-4 mx-2">
              <div className="p-6 rounded-full bg-muted/20"><Package className="h-12 w-12 text-muted-foreground/50" /></div>
              <p className="text-[10px] font-black uppercase tracking-widest">Antrean Kosong</p>
            </div>
          ) : (
            currentList.map((order: any) => (
              <Card key={order.id} className={cn(
                "overflow-hidden border-none shadow-md bg-white rounded-2xl animate-in slide-in-from-bottom-2",
                order.status === 'cancelled' && "opacity-80"
              )}>
                <CardHeader className="p-4 bg-primary/[0.02] border-b flex justify-between items-center">
                  <div className="min-w-0">
                    <span className="text-[11px] font-black uppercase text-primary truncate block">{order.userName}</span>
                    <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">Ref: #{order.id.slice(-6)}</span>
                  </div>
                  <Badge className="text-[8px] font-black uppercase border-none px-2 shadow-sm bg-primary text-white">{order.status}</Badge>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="p-3.5 rounded-xl bg-muted/20 border border-primary/5 space-y-1 shadow-inner">
                    {order.items?.map((it: string, i: number) => (
                      <p key={i} className="text-[10px] font-bold uppercase text-primary/70 italic leading-none">• {it}</p>
                    ))}
                  </div>

                  {order.status === 'shop_accepted' && (
                    <div className="p-4 bg-blue-50 border-2 border-dashed border-blue-100 rounded-xl flex items-center gap-3 animate-pulse shadow-inner">
                       <Clock className="h-4 w-4 text-blue-600" />
                       <p className="text-[9px] font-black text-blue-900 uppercase">SOP: Menunggu Kurir mengonfirmasi tugas belanja...</p>
                    </div>
                  )}

                  {order.status === 'confirmed' && (
                    <div className="p-4 bg-orange-50 border-2 border-dashed border-orange-100 rounded-xl flex items-center gap-3 shadow-inner">
                       <ShieldAlert className="h-4 w-4 text-orange-600" />
                       <p className="text-[9px] font-black text-orange-900 uppercase">SOP: Kurir sudah SIAP. Silakan siapkan produk sekarang.</p>
                    </div>
                  )}

                  <div className="grid gap-2 pt-2">
                    {order.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button className="flex-1 h-11 bg-green-600 text-white font-black uppercase text-[10px] rounded-xl shadow-lg active:scale-95" onClick={() => handleShopAccept(order)} disabled={!!updatingId}>Terima Order</Button>
                        <Button variant="outline" className="flex-1 h-11 border-destructive/20 text-destructive font-black uppercase text-[10px] rounded-xl bg-white" onClick={() => setRejectOrder(order)} disabled={!!updatingId}>Tolak</Button>
                      </div>
                    )}

                    {order.status === 'confirmed' && (
                       <div className="space-y-3">
                          <Button className="w-full h-12 bg-primary text-white rounded-xl font-black uppercase text-[11px] shadow-xl gap-2 active:scale-95" onClick={() => handleReady(order)} disabled={!!updatingId}>
                             <CheckCircle2 className="h-5 w-5" /> Produk Selesai Disiapkan
                          </Button>
                          <p className="text-[8px] font-bold text-center text-muted-foreground uppercase italic opacity-60">SOP: Jangan menekan tombol sebelum produk benar-benar siap diambil.</p>
                       </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      <AlertDialog open={!!rejectOrder} onOpenChange={(v) => !v && setRejectOrder(null)}>
        <AlertDialogContent className="w-[92vw] rounded-[2rem] p-8 border-none shadow-2xl animate-in zoom-in-95">
          <AlertDialogHeader className="text-center">
             <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-destructive" />
             </div>
             <AlertDialogTitle className="text-xl font-black uppercase text-primary tracking-tighter">Tolak Pesanan?</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="py-4 space-y-2.5">
             {['Stok Habis', 'Toko Sedang Padat', 'Menu Tidak Tersedia', 'Toko Segera Tutup'].map(reason => (
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
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="h-12 rounded-xl font-black uppercase text-[10px] border-primary/10 bg-muted/20">Kembali</AlertDialogCancel>
            <AlertDialogAction className="h-12 rounded-xl bg-destructive text-white font-black uppercase text-[10px] shadow-lg active:scale-95" onClick={handleRejectSubmit} disabled={!rejectReason || !!updatingId}>Konfirmasi Tolak</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
