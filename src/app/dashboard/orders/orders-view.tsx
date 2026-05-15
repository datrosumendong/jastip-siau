
"use client";

import { useMemberOrderController } from "@/hooks/controllers/use-member-order-controller";
import { FlexibleFrame } from "@/components/dashboard/flexible-frame";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Package, ShoppingCart, MessageSquare, Trash2, Star, Loader2, ChevronRight, Copy } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { formatIDR } from "@/lib/currency";
import { useView } from "@/context/view-context";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

/**
 * VIEW (MVC): Halaman Pesanan Member
 * Menyajikan data transaksi dengan interaksi lengkap.
 */
export default function OrdersView() {
  const c = useMemberOrderController();
  const { setView } = useView();
  const { toast } = useToast();

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({ title: "ID Ref Disalin" });
  };

  if (c.loading) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
      <Loader2 className="animate-spin text-primary" />
    </div>
  );

  return (
    <FlexibleFrame
      title="Pesanan Saya"
      subtitle="Riwayat Transaksi Jastip Siau"
      icon={ShoppingCart}
      variant="member"
      controls={
        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/20 rounded-xl border border-primary/5">
            <Checkbox 
              id="all" 
              checked={c.orders.length > 0 && c.selectedIds.length === c.orders.length} 
              onCheckedChange={c.selectAll} 
              className="h-5 w-5" 
            />
            <label htmlFor="all" className="text-[10px] font-black uppercase text-primary cursor-pointer select-none">Pilih Semua</label>
          </div>
          {c.selectedIds.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              className="h-9 px-4 text-[9px] font-black uppercase shadow-lg animate-in zoom-in-95" 
              onClick={() => c.setShowDeleteConfirm(true)} 
              disabled={c.isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-1.5" /> Hapus ({c.selectedIds.length})
            </Button>
          )}
        </div>
      }
    >
      {c.orders.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[2.5rem] border-dashed border-2 opacity-30 flex flex-col items-center justify-center space-y-4">
           <Package className="h-10 w-10 text-muted-foreground" />
           <p className="text-[11px] font-black uppercase tracking-widest px-10 leading-relaxed text-center">Belum ada riwayat pesanan.</p>
           <Button onClick={() => setView('shop')} variant="outline" className="h-9 text-[9px] font-black uppercase rounded-xl border-primary/20">Mulai Belanja</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 pb-20">
          {c.orders.map((o: any) => (
            <Card key={o.id} className={cn("overflow-hidden border-none shadow-md rounded-[2rem] bg-white group", o.isReportedUnpaid && "border-2 border-red-500")}>
               <CardHeader className="p-4 bg-primary/[0.02] border-b flex flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Checkbox checked={c.selectedIds.includes(o.id)} onCheckedChange={() => c.toggleSelect(o.id)} />
                    <div className="min-w-0">
                      <h3 className="text-[13px] font-black uppercase text-primary truncate leading-none">{o.courierName || "Mencari Kurir..."}</h3>
                      <button onClick={() => handleCopyId(o.id)} className="flex items-center gap-1 mt-1.5 text-[8px] font-black text-muted-foreground uppercase opacity-60 hover:text-primary transition-colors">
                        Ref: {o.id.slice(-8)} <Copy className="h-2 w-2" />
                      </button>
                    </div>
                  </div>
                  <Badge className={cn(
                    "text-[8px] font-black uppercase border-none px-3 py-1 text-white",
                    o.status === 'completed' ? 'bg-green-600' : o.status === 'pending' ? 'bg-amber-500' : 'bg-primary'
                  )}>
                    {o.isReportedUnpaid ? 'GAGAL BAYAR' : o.status.toUpperCase()}
                  </Badge>
               </CardHeader>
               <CardContent className="p-5 space-y-5">
                  <div className="space-y-1">
                     {o.items?.map((it: string, i: number) => (
                       <div key={i} className="flex justify-between items-center text-[10px] font-bold uppercase italic text-muted-foreground leading-relaxed">
                          <span>• {it}</span>
                          <span>{o.itemPrices?.[i] ? formatIDR(o.itemPrices[i]) : '-'}</span>
                       </div>
                     ))}
                  </div>
                  <div className="pt-4 border-t border-dashed border-primary/10 flex justify-between items-end">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Total Bayar:</span>
                        <p className="text-xl font-black text-primary tracking-tighter">
                          {o.totalAmount ? formatIDR(o.totalAmount) : 'MENUNGGU KURIR'}
                        </p>
                     </div>
                     <div className="flex gap-2">
                        {o.status === 'completed' && !o.hasTestimonial && (
                          <Button size="sm" className="h-10 px-6 bg-yellow-500 hover:bg-yellow-600 text-white text-[10px] font-black uppercase rounded-2xl shadow-lg animate-bounce" onClick={() => { c.setSelectedOrder(o); c.setIsDialogOpen(true); }}>
                            <Star className="h-4 w-4 mr-1.5 fill-current" /> Ulas
                          </Button>
                        )}
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-2xl border-primary/10" onClick={() => setView('order_chat', { orderId: o.id })}>
                          <MessageSquare className="h-5 w-5 text-primary" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-10 px-5 border-primary/10 rounded-2xl font-black uppercase text-[10px]" onClick={() => setView('order_detail', { orderId: o.id })}>
                          Detail <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                     </div>
                  </div>
               </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL ULASAN */}
      <Dialog open={c.isDialogOpen} onOpenChange={c.setIsDialogOpen}>
        <DialogContent className="w-[94vw] sm:max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-black uppercase text-primary tracking-tighter">Ulasan Kurir</DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Bantu warga Siau mengenali kurir terpercaya.</DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => c.setTestiRating(s)} className="p-1 transition-transform active:scale-90">
                    <Star className={cn("h-8 w-8 transition-colors", s <= c.testiRating ? "text-yellow-500 fill-current" : "text-muted/30")} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase text-primary ml-1">Pesan Anda</Label>
               <Textarea placeholder="Kurirnya jujur & sampai tepat waktu!" className="h-32 bg-muted/20 border-none rounded-2xl p-4 font-bold text-xs" value={c.testiMessage} onChange={(e) => c.setTestiMessage(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
             <Button className="w-full h-14 bg-primary rounded-2xl font-black uppercase text-xs shadow-xl" onClick={c.handleSendTestimonial} disabled={c.isSubmitting || !c.testiMessage.trim()}>
                Kirim Ulasan
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG KONFIRMASI HAPUS */}
      <AlertDialog open={c.showDeleteConfirm} onOpenChange={c.setShowDeleteConfirm}>
        <AlertDialogContent className="w-[92vw] rounded-[2.5rem] border-none shadow-2xl p-8">
           <AlertDialogHeader className="text-center">
              <div className="mx-auto h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6"><Trash2 className="h-10 w-10 text-destructive" /></div>
              <AlertDialogTitle className="text-2xl font-black uppercase text-primary">Hapus Riwayat?</AlertDialogTitle>
              <AlertDialogDescription className="text-[11px] font-bold text-muted-foreground uppercase mt-4 px-4 leading-relaxed text-center">Tindakan ini hanya menghapus dari daftar Anda, data permanen tetap tersimpan untuk bukti hukum.</AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-10">
              <AlertDialogCancel className="h-14 rounded-2xl font-black uppercase text-[10px]">Batal</AlertDialogCancel>
              <AlertDialogAction className="h-14 rounded-2xl font-black uppercase text-[10px] bg-destructive text-white shadow-xl" onClick={c.executeDelete} disabled={c.isDeleting}>Ya, Hapus Sekarang</AlertDialogAction>
           </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FlexibleFrame>
  );
}
