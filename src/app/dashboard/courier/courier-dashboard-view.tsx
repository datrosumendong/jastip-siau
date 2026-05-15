
"use client";

/**
 * VIEW: Panel Kurir (Pure Presentation)
 * Menggunakan useCourierController sebagai hander data (cURL style).
 */

import { useCourierController } from "@/hooks/controllers/use-courier-controller";
import { FlexibleFrame } from "@/components/dashboard/flexible-frame";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ShoppingCart, Loader2, Package, MapPin, 
  ShieldAlert, Store, CheckCircle2, MessageSquare, Clock, Zap, Map as MapIcon, ShoppingBag
} from 'lucide-react';
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export default function CourierDashboardView() {
  const c = useCourierController();

  if (c.loading) return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <Loader2 className="animate-spin text-primary" />
      <p className="text-[10px] font-black uppercase text-muted-foreground">Memuat Tugas...</p>
    </div>
  );

  return (
    <FlexibleFrame
      title="Panel Kurir"
      subtitle="Antrean Tugas Aktif"
      icon={ShoppingCart}
      variant="courier"
      controls={
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/10">
              <AvatarImage src={c.profile?.imageUrl} className="object-cover" />
              <AvatarFallback className="font-black">{(c.profile?.fullName || "K").charAt(0)}</AvatarFallback>
            </Avatar>
            <div><p className="text-[10px] font-black uppercase text-primary leading-none">{c.profile?.fullName}</p><p className="text-[7px] font-bold text-muted-foreground uppercase mt-1">Mitra Jastip</p></div>
          </div>
          <div className="flex items-center gap-2 bg-muted/20 px-3 py-1.5 rounded-xl border">
            <span className="text-[9px] font-black uppercase">{c.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            <Switch checked={c.isOnline} onCheckedChange={c.toggleOnline} />
          </div>
        </div>
      }
    >
      {c.activeOrders.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[2.5rem] border-dashed border-2 opacity-30 flex flex-col items-center">
           <Package className="h-12 w-12 mb-4" /><p className="text-[11px] font-black uppercase tracking-widest">Tidak ada tugas aktif</p>
        </div>
      ) : (
        <div className="space-y-5 pb-20">
          {c.activeOrders.map((order: any) => (
            <Card key={order.id} className={cn("overflow-hidden border-none shadow-lg rounded-[2rem] bg-white animate-in slide-in-from-bottom-2", order.status === 'shopping' && "ring-2 ring-primary")}>
                <div className="p-5 space-y-4">
                   <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[14px] font-black uppercase text-primary truncate">{order.userName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                           {order.umkmId ? <Badge className="bg-orange-50 text-orange-700 text-[7px] font-black uppercase border-none px-2"><Store className="h-2 w-2 mr-1" /> {order.umkmName}</Badge> : <Badge variant="secondary" className="text-[7px] font-black uppercase px-2"><MapPin className="h-2 w-2 mr-1" /> Belanja Bebas</Badge>}
                           <span className="text-[8px] font-black text-muted-foreground uppercase opacity-40">Ref: {order.id.slice(-8)}</span>
                        </div>
                      </div>
                      <Badge className={cn("text-[9px] px-2 font-black uppercase", order.status === 'pending' ? 'bg-amber-500' : 'bg-primary')}>{order.status}</Badge>
                   </div>

                   <div className="grid gap-3 pt-2">
                      {order.status === 'pending' && <Button className="w-full h-12 bg-primary rounded-xl font-black uppercase text-[10px]" onClick={() => c.handleStatusUpdate(order, 'confirmed')} disabled={!!c.updatingId}>Terima Tugas</Button>}
                      {order.status === 'confirmed' && !order.umkmId && <Button className="w-full h-12 bg-primary rounded-xl font-black uppercase text-[10px]" onClick={() => c.handleStatusUpdate(order, 'shopping')} disabled={!!c.updatingId}>Mulai Belanja</Button>}
                      {(order.status === 'shopping' || order.status === 'ready_for_pickup') && <Button className="w-full h-12 bg-green-600 text-white rounded-xl font-black uppercase text-[10px]" onClick={() => c.handleStatusUpdate(order, 'delivering')} disabled={!!c.updatingId}>Selesai: Input Harga</Button>}
                      {order.status === 'delivering' && <Button className="w-full h-12 bg-green-600 text-white rounded-xl font-black uppercase text-[10px]" onClick={() => c.handleStatusUpdate(order, 'delivered')} disabled={!!c.updatingId}>Sudah Sampai Tujuan</Button>}
                      {order.status === 'delivered' && (
                        <div className="space-y-3">
                           <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-center"><p className="text-[9px] font-black text-green-700 uppercase">Tagihan Member:</p><p className="text-2xl font-black text-green-700">Rp{order.totalAmount?.toLocaleString()}</p></div>
                           <Button className="w-full h-12 bg-green-600 text-white rounded-xl font-black uppercase text-[10px]" onClick={() => c.handleStatusUpdate(order, 'completed')} disabled={!!c.updatingId}>Konfirmasi Lunas</Button>
                           <Button variant="ghost" className="w-full text-red-600 font-black uppercase text-[8px]" onClick={() => c.setOrderToBlacklist(order)}>Member Tidak Bayar!</Button>
                        </div>
                      )}
                   </div>

                   <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button asChild variant="outline" className="h-10 rounded-xl font-black uppercase text-[9px] border-primary/10"><Link href={`/dashboard/chat/${order.id}`}><MessageSquare className="h-4 w-4 mr-2" /> Chat App</Link></Button>
                      <Button asChild variant="outline" className="h-10 rounded-xl font-black uppercase text-[9px] border-primary/10"><Link href={`/dashboard/order/${order.id}`}><MapIcon className="h-4 w-4 mr-2" /> Navigasi</Link></Button>
                   </div>
                </div>
            </Card>
          ))}
        </div>
      )}

      {/* ALERT DIALOG SANKSI */}
      <AlertDialog open={!!c.orderToBlacklist} onOpenChange={(v) => !v && c.setOrderToBlacklist(null)}>
        <AlertDialogContent className="w-[92vw] rounded-[2rem] border-none shadow-2xl p-8 text-center">
          <AlertDialogHeader>
            <div className="mx-auto h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4"><ShieldAlert className="h-10 w-10 text-destructive" /></div>
            <AlertDialogTitle className="text-2xl font-black uppercase text-primary leading-none">Blokir Member?</AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] font-bold uppercase text-muted-foreground mt-4">SOP: Member akan diblokir otomatis sesuai Pasal 378 KUHP (Penipuan) karena menolak membayar pesanan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 mt-8">
            <AlertDialogCancel className="h-12 rounded-xl font-black uppercase text-[10px]">Batal</AlertDialogCancel>
            <AlertDialogAction className="h-12 rounded-xl font-black uppercase text-[10px] bg-destructive text-white" onClick={c.handleReportUnpaid}>Ya, Blokir & Laporkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FlexibleFrame>
  );
}
