"use client";

/**
 * VIEW: Courier History View (SOP V11.400 - REJECTION SYNC)
 * SOP: Log statis murni tanpa tombol komunikasi (Chat/WA).
 * FIX: Penegakan transparansi alasan penolakan pada arsip logistik.
 */

import { useCourierHistoryController } from '@/hooks/controllers/use-courier-history-controller';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, Loader2, CalendarDays, Route, ChevronRight, CheckCircle2, Info, Package, XCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { formatIDR } from '@/lib/currency';
import { useView } from '@/context/view-context';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export default function CourierHistoryView() {
  const { setView } = useView();
  const c = useCourierHistoryController();

  if (c.loading) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
      <Loader2 className="animate-spin text-primary opacity-20 h-10 w-10" />
      <p className="text-[10px] font-black uppercase text-primary/40 animate-pulse">Menyusun Arsip Amanah...</p>
    </div>
  );

  return (
    <FlexibleFrame
      title="Riwayat Antaran"
      subtitle={`Total ${c.orders.length} catatan tersimpan.`}
      icon={History}
      variant="courier"
    >
      <div className="space-y-4 pb-32 px-1">
        {c.orders.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-[2.5rem] border-dashed border-2 opacity-30 flex flex-col items-center justify-center space-y-4 mx-2">
             <History className="h-12 w-12 text-muted-foreground/50" />
             <p className="text-[11px] font-black uppercase tracking-widest px-10">Belum ada catatan riwayat.</p>
          </div>
        ) : (
          c.orders.map((order: any) => {
            const isCancelled = order.status === 'cancelled';
            const isSuccess = order.status === 'completed' || order.status === 'delivered';

            return (
              <Card key={order.id} className={cn(
                "overflow-hidden border-none shadow-md bg-white rounded-[2rem] transition-all animate-in slide-in-from-bottom-2",
                isCancelled ? "opacity-75 grayscale-[0.3]" : ""
              )}>
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0 flex-1">
                       <div className="flex items-center gap-2">
                          <h3 className={cn(
                            "text-[15px] font-black uppercase truncate leading-none",
                            isCancelled ? "text-muted-foreground" : "text-primary"
                          )}>{order.userName}</h3>
                          {isSuccess ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" /> : <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                       </div>
                       <div className="flex items-center gap-3 mt-2 text-[9px] text-muted-foreground font-bold uppercase">
                          <div className="flex items-center gap-1.5"><CalendarDays className="h-3 w-3 opacity-40" />{order.updatedAt?.seconds ? format(new Date(order.updatedAt.seconds * 1000), 'dd MMM yy', { locale: id }) : '-'}</div>
                          {!isCancelled && <div className="flex items-center gap-1.5 text-primary"><Route className="h-3 w-3" />{order.distance || 0} KM</div>}
                       </div>
                    </div>
                    <Badge className={cn(
                      "text-[7px] font-black uppercase border-none px-3 py-1 shadow-sm",
                      isCancelled ? "bg-destructive text-white" : "bg-green-600 text-white"
                    )}>
                      {order.status?.toUpperCase()}
                    </Badge>
                  </div>

                  {isCancelled && order.cancelReason && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 italic shadow-inner">
                       <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                       <div className="space-y-0.5">
                          <p className="text-[8px] font-black text-red-900 uppercase">Log Pembatalan:</p>
                          <p className="text-[10px] font-bold text-destructive uppercase leading-tight">{order.cancelReason}</p>
                       </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-dashed border-primary/10">
                     <div className="flex flex-col gap-1">
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                          {isCancelled ? "Potensi Laba:" : "Laba Jasa (Net):"}
                        </p>
                        <div className="flex items-center gap-2">
                          <h4 className={cn(
                            "text-[16px] font-black leading-none",
                            isCancelled ? "text-muted-foreground line-through" : "text-green-700"
                          )}>{formatIDR(order.serviceFee || 0)}</h4>
                          <Popover>
                            <PopoverTrigger asChild>
                               <button className="h-6 w-6 rounded-full bg-muted/30 flex items-center justify-center hover:bg-primary/5 transition-colors">
                                 <Info className="h-3.5 w-3.5 text-muted-foreground" />
                               </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-5 rounded-[1.8rem] shadow-2xl border-none">
                               <div className="space-y-4">
                                 <div className="flex items-center gap-2 border-b border-dashed border-primary/10 pb-3">
                                    <Package className="h-4 w-4 text-primary" />
                                    <span className="font-black uppercase text-[10px] text-primary tracking-widest">Rincian Nota Arsip</span>
                                 </div>
                                 <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground"><span>Barang Belanja:</span><span>{formatIDR(order.itemPrice || 0)}</span></div>
                                    <div className="flex justify-between text-[10px] font-black uppercase text-green-600"><span>Ongkos Jasa:</span><span>+ {formatIDR(order.serviceFee || 0)}</span></div>
                                 </div>
                                 <div className="pt-3 border-t border-dashed border-primary/10 flex justify-between font-black text-[12px] text-primary">
                                    <span>TOTAL TRANSAKSI:</span>
                                    <span>{formatIDR(order.totalAmount || 0)}</span>
                                 </div>
                               </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                     </div>
                     <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-10 px-5 text-[10px] font-black uppercase rounded-xl border-primary/10 bg-white hover:bg-primary/5 shadow-sm gap-2"
                      onClick={() => setView('order_detail', { orderId: order.id })}
                     >
                        Tinjau <ChevronRight className="h-3.5 w-3.5" />
                     </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </FlexibleFrame>
  );
}
