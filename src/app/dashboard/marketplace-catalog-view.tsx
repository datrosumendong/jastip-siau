"use client";

/**
 * VIEW: Marketplace Global Catalog (MAHAKARYA MVC V10.010)
 * SOP: Penegakan Sticky Bottom Bar untuk kemudahan penyelesaian belanja.
 * FIX: Menjamin tombol checkout bertahta lekat di bawah layar smartphone.
 */

import { useMarketplaceCatalogController } from '@/hooks/controllers/use-marketplace-catalog-controller';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ShoppingBag, Search, Plus, Minus, Loader2, 
  Store, ArrowRight, Package, Store as StoreIcon, Share2, ShieldAlert
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useView } from '@/context/view-context';

export default function MarketplaceCatalogView() {
  const { setView } = useView();
  const c = useMarketplaceCatalogController();

  if (c.loading && c.products.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px]">
      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      <p className="text-[10px] font-black uppercase text-primary/40 mt-4 animate-pulse">Memuat Katalog Siau...</p>
    </div>
  );

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col">
      <FlexibleFrame
        title="Katalog Produk"
        subtitle="Belanja Menu Unggulan Siau"
        icon={ShoppingBag}
        variant="umkm"
        controls={
          <div className="space-y-3">
            <div className="flex gap-2">
               <Button variant="outline" size="sm" className="flex-1 h-8 text-[9px] font-black uppercase rounded-lg border-primary/10" onClick={() => setView('shop')}>Daftar Toko</Button>
               <Button variant="default" size="sm" className="flex-1 h-8 text-[9px] font-black uppercase rounded-lg shadow-md">Semua Produk</Button>
            </div>
            <div className="relative group">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Cari makanan, snack, atau barang..." 
                className="pl-10 h-10 bg-muted/20 border-none rounded-xl font-bold text-xs shadow-inner"
                value={c.search}
                onChange={(e) => c.setSearch(e.target.value)}
              />
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-4 pb-64 px-1">
          {c.products.length === 0 ? (
            <div className="col-span-full py-24 text-center opacity-30 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl bg-white">
              <Package className="h-16 w-16 mb-4 text-primary" />
              <p className="text-sm font-black uppercase tracking-widest text-primary">Barang Tidak Ditemukan</p>
            </div>
          ) : (
            c.products.map((p: any) => {
              const inCart = c.cart[p.id];
              const isMyShopProduct = p.umkmId === c.userUid;
              
              return (
                <Card key={p.id} className={cn(
                  "overflow-hidden border border-transparent shadow-md bg-white rounded-2xl group transition-all duration-300",
                  inCart ? "ring-2 ring-primary" : "hover:shadow-xl"
                )}>
                   <div className="relative aspect-square bg-muted/20 overflow-hidden">
                      {p.imageUrl ? (
                        <Image src={p.imageUrl} alt={p.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-10"><Package className="h-10 w-10" /></div>
                      )}
                      <Badge className="absolute top-2 right-2 bg-white/95 text-primary border-none shadow-lg font-black text-[9px] px-2 py-0.5 rounded-lg">
                        Rp{p.price?.toLocaleString()}
                      </Badge>
                      {!p.isOpen && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                          <Badge className="bg-red-600 text-white font-black text-[8px] uppercase">TOKO TUTUP</Badge>
                        </div>
                      )}

                      <button 
                        onClick={() => c.handleShareProduct(p)}
                        className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all active:scale-75 z-10"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                   </div>
                   
                   <CardContent className="p-3 space-y-2">
                      <div className="min-w-0">
                         <h3 className="text-[11px] font-black uppercase text-primary truncate leading-tight group-hover:text-blue-800">{p.name}</h3>
                         <button 
                          onClick={() => setView('shop_detail', { storeId: p.umkmId })}
                          className="text-[7px] font-bold text-muted-foreground uppercase flex items-center gap-1 mt-1 hover:text-orange-600 transition-colors"
                         >
                           <StoreIcon className="h-2 w-2" /> {p.umkmName}
                         </button>
                      </div>

                      <div className="flex items-center justify-center h-10 w-full pt-1">
                         {isMyShopProduct ? (
                           <div className="bg-primary/5 border border-primary/10 rounded-xl w-full h-9 flex items-center justify-center">
                              <span className="text-[8px] font-black uppercase text-primary/40 tracking-widest">Etalase Anda</span>
                           </div>
                         ) : (inCart && p.isOpen && !c.isBlocked) ? (
                           <div className="flex items-center gap-1 bg-primary text-white rounded-xl p-0.5 w-full shadow-lg">
                              <button className="h-8 w-8 rounded-lg hover:bg-white/20 flex items-center justify-center active:scale-75 transition-all" onClick={() => c.handleUpdateCart(p, -1)}><Minus className="h-3 w-3" /></button>
                              <span className="flex-1 text-center text-xs font-black">{inCart.quantity}</span>
                              <button className="h-8 w-8 rounded-lg hover:bg-white/20 flex items-center justify-center active:scale-75 transition-all" onClick={() => c.handleUpdateCart(p, 1)}><Plus className="h-3 w-3" /></button>
                           </div>
                         ) : (
                           <Button 
                             className={cn(
                               "w-full h-10 text-[9px] font-black uppercase rounded-xl transition-all active:scale-95",
                               p.isOpen && !c.isBlocked ? "bg-primary text-white shadow-md" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                             )}
                             onClick={() => p.isOpen && !c.isBlocked && c.handleUpdateCart(p, 1)}
                             disabled={!p.isOpen || c.isBlocked}
                           >
                              {c.isBlocked ? "BLOKIR" : p.isOpen ? "PESAN" : "TUTUP"}
                           </Button>
                         )}
                      </div>
                   </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </FlexibleFrame>

      {/* SOP STICKY BOTTOM BAR (V10.010) */}
      {c.cartItemsCount > 0 && !c.isBlocked && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-primary/10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-[100] md:left-auto md:right-4 md:w-96 md:bottom-4 md:rounded-[2.5rem] md:border-2 md:shadow-2xl animate-in slide-in-from-bottom-10">
          <div className="max-w-4xl mx-auto space-y-4">
             <div className="flex items-center justify-between px-2">
                <div className="flex flex-col">
                   <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Belanja</span>
                   <p className="text-2xl font-black text-primary tracking-tighter leading-none">Rp{c.cartTotal.toLocaleString()}</p>
                </div>
                <div className="bg-primary/10 text-primary border border-primary/10 px-4 py-1.5 rounded-full shadow-inner flex items-center gap-2">
                   <Package className="h-3 w-3" />
                   <span className="text-[10px] font-black uppercase">{c.cartItemsCount} Barang</span>
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
    </div>
  );
}
