
"use client";

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Gavel, ShieldAlert, Wallet2, ArrowLeft, CheckCircle2, MessageSquare, Phone } from 'lucide-react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where, doc, serverTimestamp, getDocs, limit, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useView } from '@/context/view-context';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { openWhatsAppChat } from '@/lib/whatsapp';

/**
 * VIEW: Penagihan Kurir (MVC View)
 * SOP: Mengelola sengketa pembayaran member yang dilaporkan kurir.
 */
export default function CourierUnpaidView() {
  const { user } = useUser();
  const db = useFirestore();
  const { setView, goBack } = useView();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const unpaidOrdersQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'orders'), 
      where('courierId', '==', user.uid),
      where('isReportedUnpaid', '==', true)
    );
  }, [db, user]);

  const { data: rawUnpaid, loading } = useCollection(unpaidOrdersQuery, true);

  const unpaidOrders = useMemo(() => {
    if (!rawUnpaid) return [];
    return rawUnpaid.filter(o => !['completed', 'cancelled'].includes(o.status));
  }, [rawUnpaid]);

  const handleResolve = async (order: any) => {
    if (!db || !user || updatingId) return;
    setUpdatingId(order.id);
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'orders', order.id), { status: 'completed', isReportedUnpaid: false, updatedAt: serverTimestamp() });
      
      const debtsQ = query(collection(db, 'debts'), where('orderId', '==', order.id), where('status', '==', 'unpaid'), limit(1));
      const debtSnap = await getDocs(debtsQ);
      if (!debtSnap.empty) {
        batch.update(doc(db, 'debts', debtSnap.docs[0].id), { status: 'paid', updatedAt: serverTimestamp() });
      }

      await batch.commit();
      toast({ title: "Pembayaran Lunas", description: "Blokir akun member segera dicabut oleh sistem." });
    } finally { 
      setUpdatingId(null); 
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <Loader2 className="animate-spin text-primary" />
    </div>
  );

  return (
    <FlexibleFrame
      title="Penagihan Sanksi"
      subtitle="Member Tertangguh (Pasal 378)"
      icon={Gavel}
      variant="courier"
      controls={
        <Button variant="ghost" size="sm" className="h-8 text-[9px] font-black uppercase text-primary" onClick={goBack}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Kembali
        </Button>
      }
    >
      {unpaidOrders.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[2.5rem] border-dashed border-2 opacity-40 mx-2 flex flex-col items-center justify-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
          <p className="text-[11px] font-black uppercase tracking-widest">Semua Tagihan Lunas.</p>
        </div>
      ) : (
        <div className="space-y-4 pb-32">
           {unpaidOrders.map((order: any) => (
             <Card key={order.id} className="overflow-hidden shadow-xl rounded-[2rem] bg-white border-2 border-red-500 animate-in slide-in-from-bottom-2">
                <div className="p-5 space-y-5">
                   <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[14px] font-black text-primary uppercase truncate leading-none">{order.userName}</h3>
                        <p className="text-[8px] font-black uppercase text-muted-foreground mt-2 tracking-widest">Ref: {order.id.slice(-8)}</p>
                      </div>
                      <Badge className="bg-red-600 text-white text-[8px] font-black uppercase border-none animate-pulse">Menunggak</Badge>
                   </div>
                   
                   <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex flex-col items-center justify-center text-center space-y-1 shadow-inner">
                      <p className="text-[9px] font-black uppercase text-red-800 tracking-tighter">Total Hutang Jasa</p>
                      <h4 className="text-3xl font-black text-red-600 tracking-tighter">Rp{order.totalAmount?.toLocaleString()}</h4>
                   </div>

                   <div className="grid grid-cols-1 gap-2.5">
                      <Button className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-black uppercase text-[11px] rounded-2xl shadow-lg gap-2 active:scale-95" onClick={() => handleResolve(order)} disabled={updatingId === order.id}>
                        {updatingId === order.id ? <Loader2 className="animate-spin h-4 w-4" /> : <Wallet2 className="h-4 w-4" />} Konfirmasi Pelunasan
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="h-11 text-[9px] font-black uppercase rounded-xl border-green-200 text-green-600 bg-white" onClick={() => openWhatsAppChat(order.userWhatsapp, "Halo, mohon selesaikan tagihan Jastip Anda.")}>
                          <Phone className="h-3.5 w-3.5 mr-1.5" /> WA Member
                        </Button>
                        <Button variant="outline" className="h-11 text-[9px] font-black uppercase rounded-xl border-primary/10 text-primary bg-white" onClick={() => setView('order_chat', { orderId: order.id })}>
                          <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Chat App
                        </Button>
                      </div>
                   </div>
                </div>
             </Card>
           ))}
        </div>
      )}
    </FlexibleFrame>
  );
}
