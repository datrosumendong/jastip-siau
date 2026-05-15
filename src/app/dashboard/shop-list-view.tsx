"use client";

/**
 * VIEW: Daftar Toko UMKM (ULTRA PREMIUM MVC)
 * SOP: Integrasi handleChatToko dari Controller untuk kedaulatan navigasi.
 * FIX: Menyembunyikan tombol CHAT secara absolut jika user adalah pemilik toko tersebut.
 */

import { useUMKMShopController } from '@/hooks/controllers/use-umkm-shop-controller';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Store, Search, MapPin, Loader2, ShoppingBag, ShieldCheck, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function ShopListView() {
  const c = useUMKMShopController();

  if (c.loading) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px]">
      <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
    </div>
  );

  return (
    <FlexibleFrame
      title="Pasar Digital"
      subtitle="Pedagang Lokal Terpercaya Siau"
      icon={Store}
      variant="umkm"
      controls={
        <div className="space-y-4">
          <div className="flex gap-2">
             <Button variant="default" size="sm" className="flex-1 h-8 text-[9px] font-black uppercase rounded-lg shadow-md">Daftar Toko</Button>
             <Button variant="outline" size="sm" className="flex-1 h-8 text-[9px] font-black uppercase rounded-lg border-primary/10" onClick={() => c.setView('marketplace_catalog')}>Semua Produk</Button>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Cari toko atau warung..." 
              className="pl-11 h-12 bg-muted/20 border-none rounded-xl font-black text-xs shadow-inner focus-visible:ring-primary/20"
              value={c.search}
              onChange={(e) => c.setSearch(e.target.value)}
            />
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-40">
        {c.shops.length === 0 ? (
          <div className="col-span-full py-24 text-center opacity-30 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl bg-white">
            <Store className="h-16 w-16 mb-4 text-primary" />
            <p className="text-sm font-black uppercase tracking-widest text-primary">Belum Ada Toko Terdaftar</p>
          </div>
        ) : (
          c.shops.map((shop: any) => {
            const isMyShop = shop.uid === c.user?.uid || shop.id === c.user?.uid;
            
            return (
              <Card key={shop.id} className="overflow-hidden border border-primary/5 shadow-md bg-white rounded-2xl group transition-all duration-300 hover:shadow-xl">
                 <div className="relative h-36 w-full overflow-hidden bg-muted/30">
                    {(shop.storeImageUrl || shop.imageUrl) ? (
                      <Image 
                        src={shop.storeImageUrl || shop.imageUrl} 
                        alt={shop.displayName} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                         <ImageIcon className="h-10 w-10 text-primary/20" />
                      </div>
                    )}
                    
                    <div className="absolute top-3 right-3 z-10">
                       <Badge className={cn(
                         "text-[8px] font-black uppercase border-none px-3 py-1 shadow-lg backdrop-blur-md",
                         shop.isOpen ? "bg-green-600/90 text-white" : "bg-slate-700/90 text-white"
                       )}>
                          {shop.isOpen ? '● BUKA' : 'ISTIRAHAT'}
                       </Badge>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent" />
                 </div>

                 <CardHeader className="p-4 pb-0 relative">
                    <div className="flex items-start gap-4">
                       <div className="relative -mt-10 shrink-0">
                          <Avatar className="h-16 w-16 border-[4px] border-white shadow-xl">
                             <AvatarImage src={shop.storeImageUrl || shop.imageUrl} className="object-cover" />
                             <AvatarFallback className="font-black bg-white text-primary text-xl uppercase">{shop.displayName?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {shop.isOpen && (
                            <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 border-2 border-white rounded-full shadow-lg animate-pulse" />
                          )}
                       </div>
                       <div className="flex-1 min-w-0 pt-1">
                          <div className="flex items-center gap-1.5">
                             <CardTitle className="text-[16px] font-black uppercase text-primary truncate tracking-tight leading-none">
                               {shop.displayName}
                             </CardTitle>
                             <ShieldCheck className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground mt-1.5">
                             <MapPin className="h-3 w-3 text-primary/50" />
                             <span className="text-[8px] font-black uppercase truncate">{shop.address || "Kepulauan Siau"}</span>
                          </div>
                       </div>
                    </div>
                 </CardHeader>

                 <CardContent className="p-4 pt-3 space-y-3">
                    <div className="p-3.5 rounded-xl bg-primary/[0.02] border border-primary/5 min-h-[50px] flex items-center shadow-inner">
                       <p className="text-[10px] font-bold text-primary/70 uppercase leading-relaxed line-clamp-2 italic">
                         "{shop.bio || "Menyediakan produk pilihan terbaik bagi seluruh warga Siau."}"
                       </p>
                    </div>
                 </CardContent>

                 <CardFooter className="p-3 pt-0 flex gap-2">
                    {/* SOP: SEMBUNYIKAN CHAT JIKA INI TOKO SAYA */}
                    {!isMyShop && (
                      <Button 
                        variant="outline" 
                        className="flex-1 h-11 text-[9px] font-black uppercase rounded-xl border-primary/10 bg-white text-primary shadow-sm active:scale-95 transition-all gap-2" 
                        onClick={() => c.handleChatToko(shop)}
                        disabled={c.isNavigating}
                      >
                        {c.isNavigating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />} CHAT
                      </Button>
                    )}
                    <Button 
                      className={cn(
                        "h-11 bg-primary text-white rounded-xl font-black uppercase text-[9px] gap-2 shadow-lg active:scale-95 transition-all hover:bg-blue-800",
                        isMyShop ? "w-full" : "flex-[1.2]"
                      )} 
                      onClick={() => c.setView('shop_detail', { storeId: shop.uid || shop.id })}
                    >
                       <ShoppingBag className="h-4 w-4" /> {isMyShop ? "KELOLA ETALASE ANDA" : "BUKA TOKO"}
                    </Button>
                 </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </FlexibleFrame>
  );
}
