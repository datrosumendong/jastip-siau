"use client";

/**
 * PAGE: Courier History (SILENT SYNC)
 * SOP: Menyamakan logika dengan View untuk menjamin kedaulatan arsip statis.
 */

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CalendarDays, Route, ChevronRight, History, ArrowLeft, CheckCircle2, Info, XCircle, AlertTriangle } from 'lucide-react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatIDR } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { useView } from '@/context/view-context';

export default function CourierHistoryPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { setView } = useView();

  const ordersQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'orders'), 
      where('courierId', '==', user.uid), 
      where('status', 'in', ['completed', 'delivered', 'cancelled']),
      limit(200)
    );
  }, [db, user]);

  const { data: rawOrders, loading } = useCollection(ordersQuery, true);

  const orders = useMemo(() => {
    if (!rawOrders) return [];
    return [...rawOrders].sort((a: any, b: any) => {
      const tA = a.updatedAt?.seconds || a.createdAt?.seconds || 0;
      const tB = b.updatedAt?.seconds || b.createdAt?.seconds || 0;
      return tB - tA;
    });
  }, [rawOrders]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4 pb-20 px-2 animate-in fade-in duration-500">
      <header className="flex items-center gap-3 bg-white p-4 rounded-xl border border-primary/10 shadow-sm sticky top-0 z-10">
        <Button onClick={() => router.back()} variant="ghost" size="icon" className="h-8 w-8 text-primary rounded-xl"><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-black text-primary uppercase leading-tight flex items-center gap-2"><History className="h-4 w-4" /> Riwayat Amanah</h1>
          <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest truncate">Log statis tanpa akses komunikasi.</p>
        </div>
      </header>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-2xl border-dashed border-2 opacity-30 flex flex-col items-center justify-center space-y-3">
            <History className="h-10 w-10" />
            <p className="text-[10px] font-black uppercase">Belum ada riwayat.</p>
          </div>
        ) : (
          orders.map((order: any) => {
            const isCancelled = order.status === 'cancelled';
            return (
              <Card key={order.id} className={cn("overflow-hidden border-none shadow-md rounded-2xl bg-white", isCancelled && "opacity-80")}>
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                       <div className="flex items-center gap-2">
                          <h3 className="text-[13px] font-black text-primary uppercase truncate">{order.userName}</h3>
                          {!isCancelled ? <CheckCircle2 className="h-3 w-3 text-green-600" /> : <XCircle className="h-3 w-3 text-destructive" />}
                       </div>
                       <div className="flex items-center gap-3 mt-1.5 text-[9px] text-muted-foreground font-bold uppercase">
                          <div className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{order.updatedAt?.seconds ? format(new Date(order.updatedAt.seconds * 1000), 'dd MMM yy', { locale: id }) : '-'}</div>
                          {!isCancelled && <div className="flex items-center gap-1 text-primary"><Route className="h-3 w-3" />{order.distance || 0} KM</div>}
                       </div>
                    </div>
                    <Badge className={cn("text-[7px] font-black uppercase", isCancelled ? "bg-destructive" : "bg-green-600")}>{order.status}</Badge>
                  </div>

                  {isCancelled && order.cancelReason && (
                    <div className="p-2.5 bg-red-50 rounded-lg border border-red-100 italic">
                       <p className="text-[9px] font-bold text-destructive uppercase leading-tight">Alasan: {order.cancelReason}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-dashed gap-3">
                     <div className="flex flex-col">
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Laba Jasa</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <h4 className={cn("text-[13px] font-black", isCancelled ? "text-muted-foreground" : "text-green-600")}>{formatIDR(order.serviceFee || 0)}</h4>
                          <Popover>
                            <PopoverTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5"><Info className="h-3 w-3" /></Button></PopoverTrigger>
                            <PopoverContent className="w-56 p-3 text-[10px] font-bold uppercase space-y-1">
                              <div className="flex justify-between"><span>Belanja:</span><span>{formatIDR(order.itemPrice || 0)}</span></div>
                              <div className="flex justify-between text-green-600"><span>Jasa:</span><span>+ {formatIDR(order.serviceFee || 0)}</span></div>
                              <div className="pt-1 border-t border-dashed flex justify-between font-black text-primary"><span>Total:</span><span>{formatIDR(order.totalAmount || 0)}</span></div>
                            </PopoverContent>
                          </Popover>
                        </div>
                     </div>
                     <Button onClick={() => setView('order_detail', { orderId: order.id })} size="sm" variant="outline" className="h-9 px-4 text-[10px] font-black uppercase rounded-xl">Rincian <ChevronRight className="ml-1 h-3 w-3" /></Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
