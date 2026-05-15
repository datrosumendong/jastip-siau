
"use client";

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Gavel, ShieldAlert, Wallet2, ArrowLeft, CheckCircle2, MessageSquare, Phone } from 'lucide-react';
import { useCollection, useFirestore, useUser, useDoc } from '@/firebase';
import { collection, query, where, doc, serverTimestamp, getDocs, limit, writeBatch } from 'firebase/firestore';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { openWhatsAppChat } from '@/lib/whatsapp';

/**
 * VIEW: Penagihan Kurir (MVC View)
 */
export default function CourierUnpaidView() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
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
      if (!debtSnap.empty) batch.update(doc(db, 'debts', debtSnap.docs[0].id), { status: 'paid', updatedAt: serverTimestamp() });
      await batch.commit();
      toast({ title: "Pembayaran Lunas" });
    } finally { setUpdatingId(null); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 pb-20 px-1 animate-in fade-in duration-500">
      <header className="flex items-center gap-3 bg-white p-4 rounded-xl border border-primary/10 shadow-sm sticky top-0 z-20">
        <Button onClick={() => router.back()} variant="ghost" size="icon" className="h-8 w-8 text-primary"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1"><h1 className="text-sm font-black text-primary uppercase flex items-center gap-2"><Gavel className="h-4 w-4 text-red-600" /> Penagihan Sanksi</h1></div>
      </header>
      {unpaidOrders.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-3xl border-dashed border-2 flex flex-col items-center justify-center opacity-40 mx-2"><CheckCircle2 className="h-12 w-12 text-green-600 mb-4" /><p className="text-[10px] font-black uppercase">Semua Tagihan Lunas.</p></div>
      ) : (
        <div className="space-y-4 px-2">
           {unpaidOrders.map((order: any) => (
             <Card key={order.id} className="overflow-hidden shadow-xl rounded-2xl bg-white border-2 border-red-500">
                <div className="p-4 space-y-4">
                   <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0 flex-1"><h3 className="text-[14px] font-black text-primary uppercase truncate">{order.userName}</h3><p className="text-[8px] font-black uppercase opacity-60 truncate">Ref: {order.id.slice(-8)}</p></div>
                      <Badge className="bg-red-600 text-white text-[8px] font-black uppercase border-none">Pasal 378</Badge>
                   </div>
                   <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex flex-col items-center justify-center"><h4 className="text-2xl font-black text-red-600">Rp{order.totalAmount?.toLocaleString()}</h4></div>
                   <div className="grid grid-cols-1 gap-2">
                      <Button className="w-full h-12 bg-green-600 text-white font-black uppercase text-[11px] rounded-xl shadow-lg gap-2" onClick={() => handleResolve(order)} disabled={updatingId === order.id}>{updatingId === order.id ? <Loader2 className="animate-spin h-4 w-4" /> : <Wallet2 className="h-4 w-4" />} Konfirmasi Lunas</Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="h-10 text-[9px] font-black uppercase rounded-xl" onClick={() => openWhatsAppChat(order.userWhatsapp, "Mohon pelunasan tagihan.")}><Phone className="h-3.5 w-3.5 mr-1.5" /> WA Member</Button>
                        <Button asChild variant="outline" className="h-10 text-[9px] font-black uppercase rounded-xl"><Link href={`/dashboard/chat/${order.id}`}><MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Chat App</Link></Button>
                      </div>
                   </div>
                </div>
             </Card>
           ))}
        </div>
      )}
    </div>
  );
}
