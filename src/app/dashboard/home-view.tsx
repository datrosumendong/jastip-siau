
"use client";

/**
 * VIEW: Beranda Utama (MAHAKARYA DASHBOARD REFINED)
 * Fitur: Greeting Dinamis, Hero Premium, Kategori Cepat, Marquee Produk, Insta-Style Couriers, & Testimoni Warga.
 * SOP: Navigasi Radar Aktivitas diarahkan secara cerdas (Shop Detail vs Courier Profile).
 * REVISI: Mengunci kedaulatan navigasi Radar sesuai instruksi Boss.
 */

import { useHomeController } from '@/hooks/controllers/use-home-controller';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShoppingBag, Truck, Zap, Plus, ShieldCheck, 
  Store, Utensils, Coffee, Syringe, ShoppingBasket, 
  ChevronRight, Star, Quote, MessageSquareHeart, Clock
} from 'lucide-react';
import { useView } from '@/context/view-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import Image from 'next/image';
import { SupportFAB } from '@/components/dashboard/support-fab';

export default function HomeView() {
  const { setView } = useView();
  const c = useHomeController();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 19) return "Selamat Sore";
    return "Selamat Malam";
  };

  const marqueeItems = [...(c.products || []), ...(c.products || [])];

  return (
    <div className={cn(
      "h-full w-full overflow-y-auto custom-scrollbar transition-all duration-700 bg-[#F8FAFC]", 
      c.loading ? "opacity-50 pointer-events-none" : "opacity-100"
    )}>
      <div className="max-w-6xl mx-auto space-y-12 py-6 px-4 pb-48 relative">
        
        {/* 1. GREETING HEADER */}
        <section className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-primary/50 tracking-[0.2em]">{getGreeting()}, Warga Siau!</p>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-primary">
              {c.profile?.fullName?.split(' ')[0] || 'User'} <span className="text-accent italic">@Jastip_siau</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-primary/5">
             <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse ml-2" />
             <span className="text-[8px] font-black uppercase text-primary pr-3">Sistem Aktif</span>
          </div>
        </section>

        {/* 2. HERO SECTION */}
        <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-primary via-blue-800 to-indigo-900 p-8 md:p-16 text-white shadow-2xl border-4 border-white/10 group">
          <div className="absolute top-0 right-0 h-full w-1/2 bg-white/5 skew-x-12 translate-x-20 pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-8 text-center">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-2xl px-6 py-2.5 rounded-full border border-white/20 shadow-xl mx-auto">
              <ShieldCheck className="h-4 w-4 text-accent animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Logistik Siau Terpercaya</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] drop-shadow-2xl">
              Titip Barang <br />
              <span className="text-accent italic">Aman & Terpercaya.</span>
            </h1>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 max-w-lg mx-auto">
              <button 
                onClick={() => setView('shop')} 
                className="bg-white text-primary h-16 px-10 rounded-2xl font-black uppercase text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <ShoppingBag className="h-5 w-5" /> Mulai Belanja
              </button>
              <button 
                onClick={() => setView('couriers')} 
                className="bg-primary/20 backdrop-blur-md border-2 border-white/30 text-white h-16 px-10 rounded-2xl font-black uppercase text-xs hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Truck className="h-5 w-5" /> Pilih Kurir
              </button>
            </div>
          </div>
        </section>

        {/* 3. KATEGORI CEPAT */}
        <section className="grid grid-cols-4 gap-4 animate-in zoom-in-95 duration-1000 delay-200">
           <CategoryBtn icon={Utensils} label="Kuliner" color="bg-orange-500" onClick={() => setView('couriers')} />
           <CategoryBtn icon={ShoppingBasket} label="Pasar" color="bg-green-600" onClick={() => setView('couriers')} />
           <CategoryBtn icon={Coffee} label="Snack" color="bg-amber-700" onClick={() => setView('couriers')} />
           <CategoryBtn icon={Syringe} label="Medis" color="bg-blue-600" onClick={() => setView('couriers')} />
        </section>

        {/* 4. PRODUK UNGGULAN */}
        <section className="space-y-6">
           <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black uppercase text-primary flex items-center gap-3">
                 <Store className="h-6 w-6 text-orange-600" /> Produk Unggulan
              </h2>
              <button onClick={() => setView('shop')} className="text-[10px] font-black uppercase text-primary hover:underline flex items-center gap-1">Lihat Semua <ChevronRight className="h-3 w-3" /></button>
           </div>
           
           <div className="relative w-full overflow-hidden py-4">
              <div className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused] gap-4">
                 {marqueeItems.length === 0 ? (
                    <div className="flex gap-4">
                       {[1,2,3,4].map(i => <div key={i} className="h-48 w-40 bg-muted rounded-2xl animate-pulse" />)}
                    </div>
                 ) : (
                    marqueeItems.map((p: any, i: number) => (
                       <Card 
                        key={`${p.id || i}-${i}`} 
                        className="w-44 shrink-0 overflow-hidden border-none shadow-md bg-white rounded-2xl group cursor-pointer hover:shadow-xl transition-all"
                        onClick={() => setView('shop_detail', { storeId: p.umkmId })}
                       >
                          <div className="relative aspect-square bg-muted/20 overflow-hidden">
                             {p.imageUrl && <Image src={p.imageUrl} alt={p.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" unoptimized />}
                             <Badge className="absolute top-2 right-2 bg-white/95 text-primary border-none shadow-sm text-[8px] font-black px-2 py-0.5 rounded-lg">Rp{p.price?.toLocaleString()}</Badge>
                          </div>
                          <div className="p-3 space-y-1">
                             <h4 className="text-[11px] font-black uppercase text-primary truncate">{p.name}</h4>
                             <p className="text-[8px] font-bold text-muted-foreground uppercase truncate italic opacity-60">Tersedia</p>
                          </div>
                       </Card>
                    ))
                 )}
              </div>
           </div>
        </section>

        {/* 5. MITRA SIAGA */}
        <section className="space-y-6">
           <h2 className="text-xl font-black uppercase text-primary flex items-center gap-3 px-2">
              <Truck className="h-6 w-6 text-blue-600" /> Mitra Siaga
           </h2>
           <div className="flex gap-6 overflow-x-auto pb-6 px-2 no-scrollbar">
              {c.couriers.map((kr: any) => (
                <button 
                  key={kr.id} 
                  onClick={() => setView('profile_user', { id: kr.uid })}
                  className="flex flex-col items-center gap-3 shrink-0 group active:scale-95 transition-all"
                >
                  <div className={cn(
                    "p-1 rounded-full bg-gradient-to-tr transition-all duration-500",
                    kr.isOnline ? "from-yellow-400 via-pink-500 to-purple-600 p-[3px] rotate-0" : "bg-muted p-[1px]"
                  )}>
                    <div className="p-1 bg-white rounded-full">
                       <Avatar className="h-20 w-20 border-2 border-white shadow-inner">
                         <AvatarImage src={kr.imageUrl} className="object-cover" />
                         <AvatarFallback className="font-black bg-primary/5 text-primary text-xl">{(kr.fullName || "K").charAt(0)}</AvatarFallback>
                       </Avatar>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase text-primary truncate max-w-[80px] leading-none">
                       {kr.fullName?.split(' ')[0]}
                    </span>
                    {kr.isOnline && (
                      <div className="flex items-center gap-1 mt-1">
                         <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                         <span className="text-[7px] font-black text-green-600 uppercase">Siaga</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
              <button onClick={() => setView('couriers')} className="flex flex-col items-center gap-3 shrink-0 group">
                <div className="h-[92px] w-[92px] rounded-full border-2 border-dashed border-primary/20 bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-all">
                   <Plus className="h-8 w-8 text-primary/40 group-hover:rotate-90 transition-transform duration-500" />
                </div>
                <span className="text-[10px] font-black uppercase text-primary/40">Lainnya</span>
              </button>
           </div>
        </section>

        {/* 6. SUARA WARGA */}
        <section className="space-y-6">
           <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black uppercase text-primary flex items-center gap-3">
                 <MessageSquareHeart className="h-6 w-6 text-pink-600" /> Suara Warga
              </h2>
              <button onClick={() => setView('testimonials')} className="text-[10px] font-black uppercase text-primary hover:underline">Selengkapnya</button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {c.testimonials.slice(0, 2).map((testi: any) => (
                <Card key={testi.id} className="border-none shadow-md bg-white rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all">
                  <div className="flex flex-row">
                     <div className="w-[100px] bg-primary/[0.03] p-4 flex flex-col items-center justify-center border-r border-primary/5 shrink-0 text-center">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-md mb-2">
                           <AvatarImage src={testi.courierPhoto} className="object-cover" />
                           <AvatarFallback className="bg-primary/10 text-primary text-xs font-black">K</AvatarFallback>
                        </Avatar>
                        <span className="text-[8px] font-black text-primary uppercase truncate w-full">{testi.courierName?.split(' ')[0]}</span>
                        <div className="flex gap-0.5 mt-1">
                           {[1,2,3,4,5].map(s => <Star key={s} className="h-2 w-2 text-yellow-500 fill-current" />)}
                        </div>
                     </div>
                     <div className="flex-1 p-5 flex flex-col justify-between relative">
                        <Quote className="h-8 w-8 text-primary/5 absolute top-2 right-4 rotate-12" />
                        <p className="text-[11px] font-bold text-primary/70 italic leading-relaxed uppercase tracking-tight relative z-10">"{testi.message}"</p>
                        <div className="mt-3 flex items-center gap-2 pt-2 border-t border-dashed border-primary/5">
                           <Avatar className="h-6 w-6 border shadow-sm"><AvatarImage src={testi.userPhoto} /><AvatarFallback>U</AvatarFallback></Avatar>
                           <span className="text-[8px] font-black uppercase text-primary/50">{testi.userName}</span>
                        </div>
                     </div>
                  </div>
                </Card>
              ))}
           </div>
        </section>

        {/* 7. RADAR SIAU (SOP CONTEXT-AWARE NAVIGATION) */}
        <section className="grid lg:grid-cols-12 gap-10">
           <div className="lg:col-span-4 space-y-6">
              <h2 className="text-lg font-black uppercase text-primary flex items-center gap-3 px-2"><Zap className="h-5 w-5 text-orange-500 animate-pulse" /> Radar Siau</h2>
              <div className="space-y-4">
                {c.recentActivity.map((o: any) => (
                  <Card 
                    key={o.id} 
                    className="border-none shadow-md rounded-2xl p-4 bg-white hover:shadow-xl transition-all border border-transparent group cursor-pointer" 
                    onClick={() => {
                      /**
                       * SOP KEDAULATAN NAVIGASI:
                       * 1. Jika belanja UMKM -> Buka Detail Toko
                       * 2. Jika belanja langsung -> Buka Profil Kurir
                       */
                      if (o.umkmId) {
                        setView('shop_detail', { storeId: o.umkmId });
                      } else {
                        setView('profile_user', { id: o.courierId });
                      }
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                        {o.umkmId ? <Store className="h-6 w-6" /> : <Truck className="h-6 w-6" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-black text-primary truncate uppercase">
                          {o.umkmId ? o.umkmName : o.courierName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[7px] font-bold text-muted-foreground uppercase opacity-60 flex items-center gap-1">
                             <Clock className="h-2.5 w-2.5" /> 
                             {o.updatedAt?.seconds ? formatDistanceToNow(new Date(o.updatedAt.seconds * 1000), { addSuffix: true, locale: id }) : 'Baru'}
                           </span>
                           <Badge className="bg-green-50 text-green-700 text-[6px] font-black border-none px-1 h-3">{o.status?.toUpperCase()}</Badge>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-primary/20 group-hover:text-primary transition-colors" />
                    </div>
                  </Card>
                ))}
              </div>
           </div>
           <div className="lg:col-span-8 space-y-6">
              <div className="p-8 rounded-[3rem] bg-white border-2 border-dashed border-primary/10 flex flex-col items-center justify-center text-center space-y-6">
                 <div className="h-20 w-20 rounded-[2rem] bg-primary/5 flex items-center justify-center shadow-inner"><ShoppingBag className="h-10 w-10 text-primary opacity-20" /></div>
                 <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase tracking-tighter text-primary">Dukung UMKM Siau</h3>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase max-w-[300px] leading-relaxed">Setiap pesanan Anda membantu memutar roda ekonomi pedagang lokal di Bumi Karangetang.</p>
                 </div>
                 <Button onClick={() => setView('shop')} className="h-14 px-10 bg-primary text-white rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all">Buka Marketplace <ChevronRight className="ml-2 h-4 w-4" /></Button>
              </div>
           </div>
        </section>

        {/* MODULAR FLOATING SUPPORT BUTTON */}
        <SupportFAB />
      </div>
    </div>
  );
}

function CategoryBtn({ icon: Icon, label, color, onClick }: any) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-3 group active:scale-95 transition-all">
       <div className={cn("h-16 w-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg transition-transform group-hover:-translate-y-1", color)}><Icon className="h-7 w-7" /></div>
       <span className="text-[10px] font-black uppercase text-primary tracking-tighter opacity-80">{label}</span>
    </button>
  );
}
