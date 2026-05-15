
"use client";

/**
 * VIEW: Panel Kurir (SOP V16.200 - INVESTIGASI LOCK)
 * SOP: Penegakan kedaulatan investigasi - Kurir dilarang terima order baru.
 * FIX: Perbaikan ReferenceError handleStatusUpdate dengan sinkronisasi controller kaku.
 */

import { useCourierController } from "@/hooks/controllers/use-courier-controller";
import { FlexibleFrame } from "@/components/dashboard/flexible-frame";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ShoppingCart, Loader2, Package, MapPin, Store, CheckCircle2, 
  MessageSquare, Clock, Map as MapIcon, ShoppingBag, XCircle, Zap, ShieldAlert, Gavel,
  ClipboardList
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useView } from "@/context/view-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CourierDashboardView() {
  const c = useCourierController();
  const { setView, forceUnlockUI } = useView();

  const isSuspended = c.profile?.isUnderInvestigation === true;

  const getStatusGuide = (order: any) => {
    if (order.isReportedUnpaid) return "SOP SANKSI: Member menolak bayar. Segera lakukan penagihan atau tunggu konfirmasi lunas.";
    if (isSuspended && (order.status === 'pending' || order.status === 'shop_accepted')) return "LOCKDOWN: Selesaikan investigasi untuk menerima amanah ini.";
    
    const isPureUmkm = order.isPureUmkm === true;
    switch (order.status) {
      case 'pending': return isPureUmkm ? "Menunggu Toko konfirmasi stok barang." : "Silakan terima amanah jika Anda bersedia.";
      case 'shop_accepted': return "Toko sudah SETUJU. Anda bisa terima amanah sekarang.";
      case 'confirmed': return isPureUmkm ? "Toko sedang menyiapkan produk. Tunggu sinyal Siap." : "Segera berangkat ke lokasi belanja warga.";
      case 'shopping': return "Proses belanja aktif. Silakan input nota jika sudah selesai.";
      case 'ready_for_pickup': return "Produk SUDAH SIAP di Toko. Silakan jemput sekarang.";
      case 'delivering': return "Sedang pengantaran. Pastikan HP standby di Map.";
      case 'delivered': return "Sudah sampai. Tunggu Member bayar tunai di lokasi.";
      default: return "Proses amanah berjalan.";
    }
  };

  if (c.loading) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
      <Loader2 className="animate-spin text-primary opacity-20 h-10 w-10" />
      <p className="text-[10px] font-black uppercase text-primary/40 mt-4 animate-pulse">Menghubungkan Pangkalan...</p>
    </div>
  );

  return (
    <FlexibleFrame
      title="Panel Kurir"
      subtitle="Antrean Amanah Aktif Siau"
      icon={ShoppingCart}
      variant="courier"
      controls={
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/10 shadow-sm">
              <AvatarImage src={c.profile?.imageUrl} className="object-cover" />
              <AvatarFallback className="bg-primary/5 text-primary text-xs">{(c.profile?.fullName || "K").charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 text-left">
               <div className="flex items-center gap-1.5">
                  <p className="text-[10px] font-black uppercase text-primary leading-none truncate max-w-[120px]">{c.profile?.fullName}</p>
                  {isSuspended && <ShieldAlert className="h-3 w-3 text-red-600 animate-pulse" />}
               </div>
               <div className="flex items-center gap-1.5 mt-1">
                  <div className={cn("h-1.5 w-1.5 rounded-full", c.isOnline ? "bg-green-500 animate-pulse" : "bg-slate-300")} />
                  <span className="text-[7px] font-black text-muted-foreground uppercase">{isSuspended ? "LOCKDOWN" : c.isOnline ? "SIAGA" : "OFFLINE"}</span>
               </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-muted/20 px-3 py-1.5 rounded-xl border border-primary/5 shadow-inner">
            <span className="text-[8px] font-black uppercase">{c.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            <Switch checked={c.isOnline} onCheckedChange={c.toggleOnline} className="scale-90" />
          </div>
        </div>
      }
    >
      <div className="space-y-4 pb-32">
        {isSuspended && (
           <div className="bg-red-600 text-white p-4 rounded-2xl shadow-xl border-4 border-white animate-in slide-in-from-top-4">
              <div className="flex items-start gap-4">
                 <ShieldAlert className="h-10 w-10 shrink-0 animate-bounce" />
                 <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-tight leading-none">STATUS: INVESTIGASI ADMIN</h3>
                    <p className="text-[10px] font-bold uppercase opacity-80 leading-relaxed italic">
                       SOP V16.200: Operasional Anda dibatasi sementara. Anda dilarang menerima amanah baru namun wajib menuntaskan amanah yang sedang berjalan.
                    </p>
                    <Button onClick={() => setView('member_complaints')} size="sm" className="h-7 mt-2 bg-white text-red-600 font-black uppercase text-[8px] rounded-lg">Masuk Jalur Moderasi</Button>
                 </div>
              </div>
           </div>
        )}

        {c.activeOrders.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-[2.5rem] border-dashed border-2 opacity-30 flex flex-col items-center justify-center space-y-4">
             <Package className="h-12 w-12" />
             <p className="text-[11px] font-black uppercase tracking-widest px-10">Belum ada amanah aktif.</p>
          </div>
        ) : (
          c.activeOrders.map((order: any) => {
            const isPureUmkm = order.isPureUmkm === true;
            const canAccept = (!isPureUmkm && order.status === 'pending') || (order.status === 'shop_accepted');
            const canStartShopping = (order.status === 'confirmed' && !isPureUmkm) || (order.status === 'ready_for_pickup' && isPureUmkm);

            return (
              <Card key={order.id} className={cn(
                "overflow-hidden border-none shadow-lg rounded-[2.2rem] bg-white group transition-all",
                order.status === 'shopping' && "ring-2 ring-primary",
                order.isReportedUnpaid && "ring-2 ring-red-500 shadow-red-100"
              )}>
                  <div className="p-5 space-y-5">
                    <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                             <h3 className="text-[15px] font-black uppercase text-primary truncate leading-tight">{order.userName}</h3>
                             {order.isReportedUnpaid && <Badge className="bg-red-600 text-white text-[7px] font-black border-none px-2 animate-pulse">SANKSI</Badge>}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                             {order.umkmId && order.umkmId !== 'MULTI' ? (
                               <Badge className="bg-orange-50 text-orange-700 text-[7px] font-black uppercase border-none px-2 py-0.5"><Store className="h-2 w-2 mr-1" /> {order.umkmName}</Badge>
                             ) : (
                               <Badge variant="secondary" className="text-[7px] font-black uppercase px-2 py-0.5"><MapPin className="h-2 w-2 mr-1" /> Belanja Bebas</Badge>
                             )}
                          </div>
                        </div>
                        <Badge className="text-[9px] px-2.5 h-6 flex items-center font-black uppercase border-none text-white bg-primary">{order.status?.toUpperCase()}</Badge>
                    </div>

                    <div className={cn(
                       "p-3 rounded-r-xl border-l-4 flex items-center gap-3",
                       order.isReportedUnpaid || (isSuspended && canAccept) ? "bg-red-50 border-red-600" : "bg-primary/[0.03] border-primary"
                    )}>
                       {order.isReportedUnpaid ? <ShieldAlert className="h-4 w-4 text-red-600 animate-bounce" /> : <Clock className="h-3.5 w-3.5 text-primary opacity-40" />}
                       <div className="space-y-0.5">
                          <p className={cn("text-[8px] font-black uppercase tracking-widest", order.isReportedUnpaid ? "text-red-900" : "text-primary/40")}>Panduan Progres:</p>
                          <p className={cn("text-[10px] font-bold uppercase italic leading-tight", order.isReportedUnpaid || (isSuspended && canAccept) ? "text-red-800" : "text-primary/80")}>
                            {getStatusGuide(order)}
                          </p>
                       </div>
                    </div>

                    <div className="p-3 bg-muted/20 rounded-2xl border border-white space-y-1 shadow-inner">
                       <p className="text-[7px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Daftar Titipan:</p>
                       {order.items?.map((it: string, i: number) => (
                         <p key={i} className="text-[11px] font-bold text-primary/70 uppercase leading-none truncate">• {it}</p>
                       ))}
                    </div>

                    <div className="grid gap-3 pt-2">
                        {canAccept && (
                          <div className="flex gap-2">
                            <Button 
                              className="flex-[1.5] h-12 bg-primary text-white rounded-2xl font-black uppercase text-[11px] shadow-xl active:scale-95 disabled:opacity-40" 
                              onClick={() => c.handleStatusUpdate(order, 'confirmed')} 
                              disabled={!!c.updatingId || isSuspended}
                            >
                               {isSuspended ? "Terblokir" : "Terima Amanah"}
                            </Button>
                            <Button variant="outline" className="flex-1 h-12 border-destructive/20 text-destructive rounded-2xl font-black uppercase text-[11px] bg-white" onClick={() => c.handleCourierReject(order)} disabled={!!c.updatingId}>Tolak</Button>
                          </div>
                        )}

                        {canStartShopping && (
                          <Button 
                            className="w-full h-12 bg-primary text-white rounded-2xl font-black uppercase text-[11px] shadow-xl gap-2 active:scale-95 transition-all" 
                            onClick={() => c.handleStartShopping(order)} 
                            disabled={!!c.updatingId}
                          >
                             <ShoppingBag className="h-4 w-4" /> Mulai Belanja Sekarang
                          </Button>
                        )}

                        {order.status === 'shopping' && (
                          <Button 
                            className="w-full h-12 bg-green-600 text-white rounded-2xl font-black uppercase text-[11px] shadow-xl gap-2 active:scale-95 transition-all" 
                            onClick={() => { forceUnlockUI(); setView('courier_price_input', { id: order.id }); }} 
                            disabled={!!c.updatingId}
                          >
                             <CheckCircle2 className="h-4 w-4" /> Input Harga Nota
                          </Button>
                        )}

                        {order.status === 'delivering' && (
                          <Button className="w-full h-12 bg-green-600 text-white rounded-2xl font-black uppercase text-[11px] shadow-xl gap-2 active:scale-95 transition-all" onClick={() => c.handleStatusUpdate(order, 'delivered')} disabled={!!c.updatingId}>
                             <CheckCircle2 className="h-4 w-4" /> Sudah Sampai Lokasi
                          </Button>
                        )}
                        
                        {(order.status === 'delivered' || order.isReportedUnpaid) && (
                          <div className="space-y-3">
                             <div className="p-4 rounded-2xl text-center space-y-1 shadow-inner border bg-green-50 border-green-100">
                                <p className="text-[9px] font-black uppercase text-green-700">Tagihan Member:</p>
                                <p className="text-2xl font-black tracking-tighter text-primary">Rp{order.totalAmount?.toLocaleString()}</p>
                             </div>
                             <Button className="w-full h-14 bg-green-600 text-white rounded-xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all gap-2" onClick={() => c.handleStatusUpdate(order, 'completed')} disabled={!!c.updatingId}>
                                <CheckCircle2 className="h-5 w-5" /> Konfirmasi Pelunasan
                             </Button>
                             
                             {!order.isReportedUnpaid && (
                               <Button 
                                  variant="outline" 
                                  className="w-full h-12 border-2 border-destructive text-destructive rounded-2xl font-black uppercase text-[10px] bg-white active:scale-95 transition-all gap-2" 
                                  onClick={() => c.setOrderToBlacklist(order)} 
                                  disabled={!!c.updatingId}
                               >
                                  <Gavel className="h-4 w-4" /> Member Menolak Bayar!
                               </Button>
                             )}
                          </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <Button variant="outline" className="h-11 rounded-xl font-black uppercase text-[10px] border-primary/10 bg-white shadow-sm" onClick={() => setView('chat_view', { id: order.chatId || `order_${order.id}` })}><MessageSquare className="h-4 w-4 mr-2 text-primary" /> Chat App</Button>
                        <Button variant="outline" className="h-11 rounded-xl font-black uppercase text-[9px] border-primary/10 bg-white shadow-sm" onClick={() => { forceUnlockUI(); setView('order_detail', { id: order.id }); }}><MapIcon className="h-4 w-4 mr-2 text-primary" /> Navigasi</Button>
                    </div>
                  </div>
              </Card>
            );
          })
        )}
      </div>

      <AlertDialog open={!!c.rejectingOrder} onOpenChange={(v) => !v && c.setRejectingOrder(null)}>
        <AlertDialogContent className="w-[92vw] rounded-[2rem] p-8 border-none shadow-2xl animate-in zoom-in-95 z-[1500]">
           <AlertDialogHeader className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                 <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl font-black uppercase text-primary tracking-tighter">Tolak Amanah?</AlertDialogTitle>
           </AlertDialogHeader>
           <div className="py-4 space-y-2">
              {['Lagi di Jalan Antar', 'Kendaraan Bermasalah', 'Jarak Terlalu Jauh', 'Cuaca Buruk', 'Urusan Mendadak'].map(reason => (
                <Button 
                  key={reason} 
                  variant={c.rejectReason === reason ? "default" : "outline"} 
                  className={cn(
                    "w-full h-11 rounded-xl text-[10px] font-black uppercase shadow-sm transition-all",
                    c.rejectReason === reason ? "bg-primary text-white border-primary" : "border-primary/10 text-primary bg-white"
                  )}
                  onClick={() => c.setRejectReason(reason)}
                >
                  {reason}
                </Button>
              ))}
           </div>
           <AlertDialogFooter className="flex flex-col sm:flex-row gap-3">
              <AlertDialogCancel className="h-12 rounded-xl font-black uppercase text-[10px] border-primary/10 bg-muted/20">Batal</AlertDialogCancel>
              <AlertDialogAction 
                className="h-12 rounded-xl bg-destructive text-white font-black uppercase text-[10px] shadow-lg active:scale-95 disabled:opacity-30" 
                onClick={c.submitCourierReject} 
                disabled={!c.rejectReason || c.updatingId === c.rejectingOrder?.id}
              >
                Konfirmasi Tolak
              </AlertDialogAction>
           </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!c.orderToBlacklist} onOpenChange={(v) => !v && c.setOrderToBlacklist(null)}>
        <AlertDialogContent className="w-[92vw] rounded-[2rem] p-8 border-none shadow-2xl text-center animate-in zoom-in-95 z-[1500]">
          <AlertDialogHeader>
            <div className="mx-auto h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6"><ShieldAlert className="h-10 w-10 text-destructive" /></div>
            <AlertDialogTitle className="text-2xl font-black uppercase text-primary leading-none italic">Blokir Member?</AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] font-bold text-muted-foreground uppercase mt-6 leading-relaxed text-center px-2">
              SOP: Member ini akan otomatis diblokir akses pemesanannya karena menolak membayar. Tagihan tetap bertahta di tugas Anda sampai lunas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-10">
            <AlertDialogCancel className="h-14 rounded-2xl font-black uppercase text-[11px] border-primary/10 bg-muted/20">Batalkan</AlertDialogCancel>
            <AlertDialogAction className="h-14 rounded-2xl font-black uppercase text-[11px] bg-destructive text-white shadow-xl active:scale-95 transition-all gap-2" onClick={c.handleReportUnpaid}>
               <Gavel className="h-4 w-4" /> Ya, Blokir & Laporkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FlexibleFrame>
  );
}
