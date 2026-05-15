"use client";

import { useCourierController } from "@/hooks/controllers/use-courier-controller";
import { FlexibleFrame } from "@/components/dashboard/flexible-frame";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ShoppingCart, Loader2, Package, MapPin, 
  ShieldAlert, Store, CheckCircle2, MessageSquare, Clock, Zap, Map as MapIcon, Phone, Copy, ShoppingBag, XCircle
} from 'lucide-react';
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/**
 * VIEW: Panel Kurir (SOP RESTORED)
 * confirmed -> shopping -> delivering -> delivered -> completed
 */
export default function CourierDashboardPage() {
  const { 
    activeOrders, profile, isOnline, loading, updatingId, 
    orderToBlacklist, setOrderToBlacklist, handleStatusUpdate, 
    handleCourierReject, handleReportUnpaid, toggleOnline 
  } = useCourierController();
  const { toast } = useToast();

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <FlexibleFrame
      title="Panel Kurir"
      subtitle="Antrean Amanah Aktif"
      icon={ShoppingCart}
      variant="courier"
      controls={
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/10">
              <AvatarImage src={profile?.imageUrl} className="object-cover" />
              <AvatarFallback className="font-black">{(profile?.fullName || "K").charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
               <p className="text-[10px] font-black uppercase text-primary leading-none truncate max-w-[120px]">{profile?.fullName}</p>
               <p className="text-[7px] font-bold text-muted-foreground uppercase mt-1">Mitra Jastip</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-muted/20 px-3 py-1.5 rounded-xl border border-primary/5">
            <span className="text-[9px] font-black uppercase">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            <Switch checked={isOnline} onCheckedChange={toggleOnline} />
          </div>
        </div>
      }
    >
      {activeOrders.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[2.5rem] border-dashed border-2 opacity-30 flex flex-col items-center justify-center space-y-4 mx-2">
           <Package className="h-12 w-12 text-muted-foreground/50" />
           <p className="text-[11px] font-black uppercase tracking-widest">Belum ada amanah aktif.</p>
        </div>
      ) : (
        <div className="space-y-5 pb-32">
          {activeOrders.map((order: any) => {
            const isUmkmOrder = !!order.umkmId;
            const waitStore = isUmkmOrder && order.status === 'confirmed';

            return (
              <Card key={order.id} className={cn(
                "overflow-hidden border-none shadow-lg rounded-[2.2rem] bg-white group animate-in slide-in-from-bottom-2",
                order.status === 'shopping' && "ring-2 ring-primary"
              )}>
                <div className="p-5 space-y-5">
                   <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[15px] font-black uppercase text-primary truncate leading-tight">{order.userName}</h3>
                        <div className="flex items-center gap-2 mt-2">
                           {isUmkmOrder ? <Badge className="bg-orange-50 text-orange-700 text-[7px] font-black uppercase border-none px-2 py-0.5"><Store className="h-2 w-2 mr-1" /> {order.umkmName}</Badge> : <Badge variant="secondary" className="text-[7px] font-black uppercase px-2 py-0.5"><MapPin className="h-2 w-2 mr-1" /> Belanja Bebas</Badge>}
                        </div>
                      </div>
                      <Badge className="text-[9px] px-2.5 h-6 flex items-center font-black uppercase border-none text-white bg-primary">{order.status}</Badge>
                   </div>

                   <div className="grid gap-3 pt-2">
                      {order.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button className="flex-1 h-12 bg-primary rounded-2xl font-black uppercase text-[11px] shadow-xl active:scale-95" onClick={() => handleStatusUpdate(order, 'confirmed')} disabled={!!updatingId}>Terima Tugas</Button>
                          <Button variant="outline" className="flex-1 h-12 border-destructive/20 text-destructive rounded-2xl font-black uppercase text-[11px] bg-white" onClick={() => handleCourierReject(order)} disabled={!!updatingId}>Tolak</Button>
                        </div>
                      )}
                      
                      {order.status === 'confirmed' && !isUmkmOrder && (
                        <Button className="w-full h-12 bg-primary rounded-2xl font-black uppercase text-[11px] shadow-xl gap-2 active:scale-95" onClick={() => handleStatusUpdate(order, 'shopping')} disabled={!!updatingId}><ShoppingBag className="h-4 w-4" /> Mulai Belanja</Button>
                      )}

                      {waitStore && (
                        <div className="p-5 bg-orange-50 rounded-[1.8rem] border-2 border-orange-100 flex flex-col items-center gap-4 text-center animate-pulse">
                           <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-orange-600 shadow-md"><Clock className="h-5 w-5" /></div>
                           <p className="text-[10px] font-black uppercase text-orange-900 leading-tight">SOP: Mohon tunggu sampai Toko mengirim kabar "Produk Siap Diambil".</p>
                           <Button variant="outline" size="sm" className="h-9 px-6 text-[9px] font-black uppercase border-orange-200 text-orange-700 bg-white" onClick={() => window.open(`https://wa.me/${order.umkmWhatsapp}`, '_blank')} disabled={!order.umkmWhatsapp}>Chat Toko WA</Button>
                        </div>
                      )}

                      {(order.status === 'shopping' || order.status === 'ready_for_pickup') && (
                        <Button className="w-full h-12 bg-green-600 text-white rounded-2xl font-black uppercase text-[11px] shadow-xl gap-2 active:scale-95" onClick={() => handleStatusUpdate(order, 'delivering')} disabled={!!updatingId}><CheckCircle2 className="h-4 w-4" /> Belanja Selesai: Input Harga</Button>
                      )}

                      {order.status === 'delivering' && (
                        <Button className="w-full h-12 bg-green-600 text-white rounded-2xl font-black uppercase text-[11px] shadow-xl gap-2 active:scale-95" onClick={() => handleStatusUpdate(order, 'delivered')} disabled={!!updatingId}><CheckCircle2 className="h-4 w-4" /> Saya Sudah Sampai</Button>
                      )}

                      {order.status === 'delivered' && (
                        <div className="space-y-4">
                           <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-center"><p className="text-[9px] font-black text-green-700 uppercase">Tagihan Member:</p><p className="text-2xl font-black text-green-700">Rp{order.totalAmount?.toLocaleString()}</p></div>
                           <Button className="w-full h-14 bg-green-600 text-white rounded-2xl font-black uppercase text-xs shadow-2xl active:scale-95" onClick={() => handleStatusUpdate(order, 'completed')} disabled={!!updatingId}>Konfirmasi Lunas</Button>
                           <Button variant="outline" className="w-full h-12 border-2 border-destructive text-destructive rounded-2xl font-black uppercase text-[10px] bg-white" onClick={() => setOrderToBlacklist(order)} disabled={!!updatingId}>Member Menolak Bayar!</Button>
                        </div>
                      )}
                   </div>

                   <div className="grid grid-cols-2 gap-3 pt-2">
                      <Button variant="outline" className="h-11 rounded-xl font-black uppercase text-[10px] border-primary/10 bg-white shadow-sm" asChild><Link href={`/dashboard/chat/${order.id}`}><MessageSquare className="h-4 w-4 mr-2" /> Chat App</Link></Button>
                      <Button variant="outline" className="h-11 rounded-xl font-black uppercase text-[10px] border-primary/10 bg-white shadow-sm" asChild><Link href={`/dashboard/order/${order.id}`}><MapIcon className="h-4 w-4 mr-2" /> Navigasi</Link></Button>
                   </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ALERT DIALOG SANKSI */}
      <AlertDialog open={!!orderToBlacklist} onOpenChange={(v) => !v && setOrderToBlacklist(null)}>
        <AlertDialogContent className="w-[92vw] rounded-[2rem] border-none shadow-2xl p-8 text-center animate-in zoom-in-95">
          <AlertDialogHeader>
            <div className="mx-auto h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6"><ShieldAlert className="h-10 w-10 text-destructive" /></div>
            <AlertDialogTitle className="text-2xl font-black uppercase text-primary leading-none">Blokir Member?</AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] font-bold uppercase text-muted-foreground mt-6 leading-relaxed">SOP: Member ini akan otomatis diblokir sesuai Pasal 378 KUHP karena penipuan/penolakan pembayaran.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-10">
            <AlertDialogCancel className="h-14 rounded-2xl font-black uppercase text-[10px]">Batal</AlertDialogCancel>
            <AlertDialogAction className="h-14 rounded-2xl font-black uppercase text-[10px] bg-destructive text-white shadow-xl" onClick={handleReportUnpaid}>Ya, Blokir & Laporkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FlexibleFrame>
  );
}