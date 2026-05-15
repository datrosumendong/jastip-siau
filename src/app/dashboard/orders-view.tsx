"use client";

/**
 * VIEW (MVC): Halaman Pesanan Member (REFINED V275)
 * SOP: Penegakan Transparansi Alasan Penolakan dan Keterangan Pesanan (Notes).
 * FIX: Memulihkan kolom keterangan yang wajib bertahta di daftar pesanan.
 */

import { useMemberOrderController } from "@/hooks/controllers/use-member-order-controller";
import { FlexibleFrame } from "@/components/dashboard/flexible-frame";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Package, ShoppingCart, MessageSquare, Star, Loader2, ChevronRight, Copy, Info, Phone, Store, Clock, AlertCircle, ClipboardList } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { formatIDR } from "@/lib/currency";
import { useView } from "@/context/view-context";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { openWhatsAppChat } from "@/lib/whatsapp";

export default function OrdersView() {
  const c = useMemberOrderController();
  const { setView, forceUnlockUI } = useView();
  const { toast } = useToast();

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({ title: "ID Ref Disalin" });
  };

  const handleGoToUnifiedChat = (chatId: string) => {
    if (!chatId) {
      toast({ title: "Sinkronisasi...", description: "Mohon tunggu sejenak." });
      return;
    }
    forceUnlockUI();
    setView('chat_view', { id: chatId });
    setTimeout(forceUnlockUI, 150);
  };

  const getStatusGuide = (status: string) => {
    switch (status) {
      case 'pending': return "Sedang dicarikan Mitra untuk Anda.";
      case 'shop_accepted': return "Toko sudah setuju. Menunggu kurir konfirmasi.";
      case 'confirmed': return "Amanah diterima. Kurir segera memproses.";
      case 'shopping': return "Kurir sedang di lokasi belanja saat ini.";
      case 'ready_for_pickup': return "Barang siap! Kurir sedang menjemput di Toko.";
      case 'delivering': return "Kurir meluncur ke lokasi Anda! Siapkan tunai.";
      case 'delivered': return "Kurir sudah tiba. Segera temui mitra kami.";
      case 'completed': return "Amanah tuntas. Berikan ulasan Anda.";
      case 'cancelled': return "Pesanan dibatalkan. Cek alasan di bawah.";
      default: return "Sinkronisasi radar...";
    }
  };

  if (c.loading) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
      <Loader2 className="animate-spin text-primary opacity-20 h-10 w-10" />
      <p className="text-[10px] font-black uppercase text-primary/40 mt-4 animate-pulse">Menghubungkan Radar Belanja...</p>
    </div>
  );

  return (
    <FlexibleFrame
      title="Pesanan Saya"
      subtitle="Log Transaksi Jastip Siau"
      icon={ShoppingCart}
      variant="member"
      controls={
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 shadow-inner">
           <Info className="h-4 w-4 text-blue-600" />
           <p className="text-[8px] font-black text-blue-900 uppercase leading-none italic">SOP: Data amanah tersimpan sebagai bukti sah transaksi warga.</p>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 pb-40">
        {c.orders.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-2xl border-dashed border-2 opacity-30 flex flex-col items-center justify-center space-y-4">
             <div className="p-6 rounded-full bg-muted/20"><Package className="h-10 w-10 text-muted-foreground/50" /></div>
             <p className="text-[10px] font-black uppercase tracking-widest px-10 leading-relaxed text-center">Belum ada riwayat pesanan.</p>
             <Button onClick={() => setView('shop')} variant="outline" className="h-9 text-[9px] font-black uppercase rounded-xl border-primary/20">Mulai Belanja</Button>
          </div>
        ) : (
          c.orders.map((o: any) => (
            <Card key={o.id} className={cn(
              "overflow-hidden border-none shadow-md bg-white group transition-all rounded-2xl", 
              o.isReportedUnpaid && "ring-2 ring-red-500 shadow-red-100",
              o.status === 'cancelled' && "opacity-85 border-l-4 border-destructive"
            )}>
               <CardHeader className="p-4 bg-primary/[0.02] border-b flex flex-row items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[13px] font-black uppercase text-primary truncate leading-none">{o.courierName || "Mencari Kurir..."}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                       <button onClick={() => handleCopyId(o.id)} className="flex items-center gap-1 text-[8px] font-black text-muted-foreground uppercase opacity-60 hover:text-primary transition-colors">
                         Ref: #{o.id.slice(-8)} <Copy className="h-2 w-2" />
                       </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {o.status === 'completed' && !o.hasTestimonial && (
                      <Button 
                        size="sm" 
                        className="h-8 px-3 bg-yellow-500 hover:bg-yellow-600 text-white text-[9px] font-black uppercase rounded-xl shadow-md animate-bounce" 
                        onClick={() => { c.setSelectedOrder(o); c.setIsDialogOpen(true); }}
                      >
                        <Star className="h-3 w-3 mr-1 fill-current" /> Ulas
                      </Button>
                    )}
                    <Badge className={cn(
                      "text-[8px] font-black uppercase border-none px-3 py-1 text-white shadow-sm rounded-lg",
                      o.status === 'completed' ? 'bg-green-600' : 
                      o.status === 'pending' ? 'bg-amber-500' : 
                      o.status === 'cancelled' ? 'bg-destructive' : 'bg-primary'
                    )}>
                      {o.isReportedUnpaid ? 'PASAL 378' : o.status.toUpperCase()}
                    </Badge>
                  </div>
               </CardHeader>
               <CardContent className="p-5 space-y-4">
                  
                  {/* SOP RADAR PROGRES: MANDATORY */}
                  <div className="p-3 bg-primary/[0.03] border-l-4 border-primary rounded-r-xl flex items-center gap-3">
                     <Clock className="h-3.5 w-3.5 text-primary opacity-40" />
                     <div className="space-y-0.5">
                        <p className="text-[8px] font-black text-primary/40 uppercase tracking-widest">Radar Progres:</p>
                        <p className="text-[10px] font-bold text-primary/80 uppercase italic leading-tight">
                          {getStatusGuide(o.status)}
                        </p>
                     </div>
                  </div>

                  {/* SOP TRANSPARANSI: ALASAN PENOLAKAN */}
                  {o.status === 'cancelled' && o.cancelReason && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 shadow-inner">
                       <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-red-900 uppercase">Info Pembatalan:</p>
                          <p className="text-[10px] font-bold text-red-700 uppercase italic leading-relaxed">
                            {o.cancelReason}
                          </p>
                       </div>
                    </div>
                  )}

                  {/* SOP: DAFTAR TITIPAN */}
                  <div className="space-y-1.5">
                     {o.items?.map((it: string, i: number) => (
                       <div key={i} className="flex justify-between items-center text-[10px] font-bold uppercase italic text-muted-foreground leading-relaxed bg-muted/10 p-2 rounded-lg border border-white/50">
                          <span className="truncate pr-4">• {it}</span>
                          <span className="shrink-0 font-black text-primary/60">{o.itemPrices?.[i] ? formatIDR(o.itemPrices[i]) : '-'}</span>
                       </div>
                     ))}
                  </div>

                  {/* SOP: KETERANGAN (NOTES) */}
                  {o.notes && (
                    <div className="p-3 bg-orange-50/50 border border-orange-100 rounded-xl flex items-start gap-3 shadow-inner">
                       <ClipboardList className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                       <div className="space-y-1">
                          <p className="text-[8px] font-black text-orange-800 uppercase">Keterangan Warga:</p>
                          <p className="text-[10px] font-bold text-primary uppercase italic leading-relaxed">
                            "{o.notes}"
                          </p>
                       </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-dashed border-primary/10 flex justify-between items-end">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Tagihan Tunai:</span>
                        <p className="text-xl font-black text-primary tracking-tighter tabular-nums">
                          {o.totalAmount ? formatIDR(o.totalAmount) : 'PROSES...'}
                        </p>
                     </div>
                     <div className="flex gap-2">
                        {o.status !== 'completed' && o.status !== 'cancelled' && (
                          <>
                             {o.courierWhatsapp && (
                               <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-10 w-10 rounded-xl border-green-200 bg-green-50 text-green-600 shadow-sm active:scale-90"
                                onClick={() => openWhatsAppChat(o.courierWhatsapp, "Halo Kurir, saya pemesan di Jastip Siau.")}
                                title="WhatsApp Kurir"
                               >
                                  <Phone className="h-4.5 w-4.5" />
                               </Button>
                             )}
                             <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-10 w-10 rounded-xl border-primary/10 bg-white shadow-sm active:scale-90 transition-all hover:bg-primary/5" 
                                onClick={() => handleGoToUnifiedChat(o.chatId)}
                                title="Chat App"
                              >
                                <MessageSquare className="h-5 w-5 text-primary" />
                              </Button>
                          </>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-10 px-5 border-primary/10 rounded-xl font-black uppercase text-[10px] bg-white shadow-sm active:scale-95 transition-all" 
                          onClick={() => { forceUnlockUI(); setView('order_detail', { id: o.id }); }}
                        >
                          Detail <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                     </div>
                  </div>
               </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={c.isDialogOpen} onOpenChange={c.setIsDialogOpen}>
        <DialogContent className="w-[94vw] sm:max-w-md rounded-2xl p-8 border-none shadow-2xl animate-in zoom-in-95">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-black uppercase text-primary tracking-tighter">Apresiasi Warga</DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Suara Anda membangun kepercayaan di Jastip Siau.</DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => c.setTestiRating(s)} className="p-1 transition-transform active:scale-90">
                  <Star className={cn("h-8 w-8 transition-colors", s <= c.testiRating ? "text-yellow-500 fill-current" : "text-muted/30")} />
                </button>
              ))}
            </div>
            <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase text-primary ml-1">Pesan Anda</Label>
               <Textarea placeholder="Kurirnya sangat amanah dan jujur!" className="h-32 bg-muted/20 border-none rounded-2xl p-4 font-bold text-xs" value={c.testiMessage} onChange={(e) => c.setTestiMessage(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
             <Button className="w-full h-14 bg-primary rounded-xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all" onClick={c.handleSendTestimonial} disabled={c.isSubmitting || !c.testiMessage.trim()}>
                Kirim Ulasan
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FlexibleFrame>
  );
}
