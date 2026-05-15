"use client";

/**
 * VIEW: Detail Toko & Produk UMKM (ULTRA PREMIUM MVC V10.010)
 * SOP: Penegakan Sticky Bottom Bar untuk kedaulatan proses order.
 * FIX: Menjamin tombol checkout lekat di bawah layar.
 */

import { useShopDetailController } from '@/hooks/controllers/use-shop-detail-controller';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Plus, Minus, Loader2, MessageSquare, 
  MapPin, Store, ArrowRight, ShoppingBag, Map as MapIcon, 
  Quote, ShieldAlert, Share2, Package
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const LocationPicker = dynamic(() => import('@/components/location-picker'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-2xl flex items-center justify-center font-bold text-[10px] uppercase">Menyiapkan Peta...</div>
});

export default function ShopDetailView() {
  const c = useShopDetailController();

  if (c.loading) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] space-y-4">
      <Loader2 className="animate-spin text-primary opacity-20 h-10 w-10" />
      <p className="text-[10px] font-black uppercase text-primary/40 animate-pulse">Menghubungkan Etalase...</p>
    </div>
  );

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col bg-[#F8FAFC]">
      <header className="flex items-center gap-3 bg-white p-3 rounded-xl border border-primary/10 shadow-sm shrink-0 z-30">
        <Button onClick={c.goBack} variant="ghost" size="icon" className="h-9 w-9 text-primary rounded-xl hover:bg-primary/5 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[14px] font-black text-primary uppercase leading-none truncate tracking-tight">
            {c.shop?.storeName || c.shop?.fullName}
          </h1>
          <div className="flex items-center gap-1.5 mt-1.5">
             <Badge className={cn(
               "text-[7px] font-black uppercase border-none px-2 h-4 flex items-center shadow-inner",
               c.isStoreOpen ? "bg-green-600 text-white" : "bg-slate-500 text-white"
             )}>
                {c.isStoreOpen ? "● BUKA" : "ISTIRAHAT"}
             </Badge>
          </div>
        </div>
        
        {!c.isMyShop && (
          <Button 
            variant="outline" 
            className="h-10 w-10 border-primary/10 text-primary rounded-xl bg-white shadow-sm hover:bg-primary/5" 
            onClick={c.handleChatToko}
            disabled={c.isNavigating}
          >
            {c.isNavigating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-5 w-5" />}
          </Button>
        )}
      </header>

      <ScrollArea className="flex-1">
        <div className="px-1 py-4 space-y-5 pb-64">
          {c.isBlocked && (
            <div className="p-4 bg-black rounded-2xl text-white space-y-2 border-l-8 border-red-600 animate-pulse shadow-xl">
               <div className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-red-600" /><p className="text-[11px] font-black uppercase">Pemesanan Terkunci!</p></div>
               <p className="text-[9px] font-bold uppercase opacity-80 leading-relaxed italic">SOP: Lunasi tunggakan Anda untuk belanja kembali.</p>
            </div>
          )}

          <Card className="border-none shadow-md bg-white rounded-2xl overflow-hidden animate-in slide-in-from-top-2 duration-700">
             <div className="p-5 space-y-4">
                {c.shop?.bio && (
                   <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0 shadow-inner"><Quote className="h-5 w-5 opacity-40" /></div>
                      <p className="text-[12px] font-bold text-primary/80 uppercase italic leading-relaxed tracking-tight mt-1">"{c.shop.bio}"</p>
                   </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-dashed border-primary/10">
                   <div className="flex items-start gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shrink-0"><MapPin className="h-4 w-4" /></div>
                      <div className="min-w-0"><span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">Lokasi:</span><p className="text-[10px] font-black text-primary uppercase truncate mt-0.5">{c.shop?.address || "Siau"}</p></div>
                   </div>
                   <Button onClick={() => c.setShowMap(true)} variant="outline" size="sm" className="h-10 px-6 rounded-xl border-primary/10 text-primary font-black uppercase text-[9px] shadow-sm bg-white gap-2"><MapIcon className="h-4 w-4" /> Peta</Button>
                </div>
             </div>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
               <h2 className="text-[11px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> Menu Etalase</h2>
               <div className="h-px bg-primary/10 flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {c.products?.length === 0 ? (
                <div className="col-span-full py-20 text-center opacity-30 flex flex-col items-center gap-3"><Store className="h-12 w-12 text-primary" /><p className="text-[10px] font-black uppercase tracking-widest">Belum ada produk.</p></div>
              ) : (
                c.products?.map((p: any) => {
                  const inCart = c.cart[p.id];
                  
                  return (
                    <Card key={p.id} className={cn("overflow-hidden border border-transparent shadow-md bg-white rounded-2xl transition-all duration-300", inCart ? "ring-2 ring-primary" : "hover:shadow-xl")}>
                      <div className="relative aspect-square bg-muted/20 overflow-hidden">
                         {p.imageUrl ? <Image src={p.imageUrl} alt={p.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" unoptimized /> : <div className="w-full h-full flex items-center justify-center opacity-10"><Package className="h-10 w-10" /></div>}
                         <Badge className="absolute top-2 right-2 bg-white/95 text-primary border-none shadow-lg font-black text-[9px] px-2 py-0.5 rounded-lg">Rp{p.price?.toLocaleString()}</Badge>
                         
                         <button 
                          onClick={() => c.handleShareProduct(p)}
                          className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all active:scale-75 z-10"
                         >
                           <Share2 className="h-4 w-4" />
                         </button>
                      </div>
                      <CardContent className="p-4 space-y-3">
                         <h3 className="text-[12px] font-black uppercase text-primary truncate leading-tight transition-colors">{p.name}</h3>
                         <div className="flex items-center justify-center h-10 w-full">
                            {c.isMyShop ? (
                               <div className="bg-primary/5 border border-primary/10 rounded-xl w-full h-9 flex items-center justify-center">
                                  <span className="text-[8px] font-black uppercase text-primary/30 tracking-[0.2em]">Menu Anda</span>
                               </div>
                            ) : (inCart && c.isStoreOpen && !c.isBlocked) ? (
                              <div className="flex items-center gap-1 bg-primary text-white rounded-xl p-0.5 w-full shadow-lg">
                                 <button className="h-9 w-9 rounded-lg hover:bg-white/20 flex items-center justify-center active:scale-75 transition-all shrink-0" onClick={() => c.handleUpdateCart(p.id, -1)}><Minus className="h-4 w-4" /></button>
                                 <div className="flex-1 text-center"><span className="text-xs font-black">{c.cart[p.id]}</span></div>
                                 <button className="h-9 w-9 rounded-lg hover:bg-white/20 flex items-center justify-center active:scale-75 transition-all shrink-0" onClick={() => c.handleUpdateCart(p.id, 1)}><Plus className="h-4 w-4" /></button>
                              </div>
                            ) : (
                              <Button className={cn("w-full h-10 text-[10px] font-black uppercase shadow-sm rounded-xl transition-all active:scale-95", c.isStoreOpen && !c.isBlocked ? "bg-primary text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed")} onClick={() => c.isStoreOpen && !c.isBlocked && c.handleUpdateCart(p.id, 1)} disabled={!c.isStoreOpen || c.isBlocked}>{c.isBlocked ? "BLOKIR" : c.isStoreOpen ? "PESAN" : "TUTUP"}</Button>
                            )}
                         </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* SOP STICKY BOTTOM BAR (V10.010) */}
      {c.cartItemsCount > 0 && c.isStoreOpen && !c.isBlocked && !c.isMyShop && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-primary/10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-[100] md:left-auto md:right-4 md:w-96 md:bottom-4 md:rounded-[2.5rem] md:border-2 md:shadow-2xl animate-in slide-in-from-bottom-10">
          <div className="max-w-4xl mx-auto space-y-4">
             <div className="flex items-center justify-between px-2">
                <div className="flex flex-col">
                   <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Belanja</span>
                   <p className="text-2xl font-black text-primary tracking-tighter leading-none">Rp{c.cartTotal.toLocaleString()}</p>
                </div>
                <div className="bg-primary/10 text-primary border border-primary/10 px-4 py-1.5 rounded-full shadow-inner flex items-center gap-2">
                   <Package className="h-3 w-3" />
                   <span className="text-[11px] font-black uppercase">{c.cartItemsCount} Barang</span>
                </div>
             </div>
             <Button 
               className="w-full h-14 bg-primary text-white rounded-[1.2rem] font-black uppercase text-xs shadow-xl active:scale-95 transition-all gap-3" 
               onClick={c.handleCheckout}
             >
               Lanjut: Pilih Kurir <ArrowRight className="h-4 w-4" />
             </Button>
          </div>
        </div>
      )}

      <Dialog open={c.showMap} onOpenChange={c.setShowMap}>
        <DialogContent className="w-[94vw] sm:max-w-2xl p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl bg-white">
           <DialogHeader className="p-6 bg-primary text-white shrink-0">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center"><MapIcon className="h-5 w-5" /></div>
                 <div><DialogTitle className="text-lg font-black uppercase tracking-tighter leading-none">Posisi GPS Toko</DialogTitle><p className="text-[9px] font-bold text-white/70 uppercase tracking-widest mt-1">Titik Jemput Kurir</p></div>
              </div>
           </DialogHeader>
           <div className="relative">
              <LocationPicker initialLat={c.shop?.latitude || -2.5489} initialLng={c.shop?.longitude || 118.0149} onLocationSelect={() => {}} height="350px" />
           </div>
           <div className="p-5 bg-muted/5 flex justify-center"><Button onClick={() => c.setShowMap(false)} className="h-12 px-12 rounded-xl font-black uppercase text-[10px] bg-primary active:scale-95 transition-all">Tutup</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
