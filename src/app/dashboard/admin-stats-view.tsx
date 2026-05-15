"use client";

/**
 * VIEW: Markas Komando Statistik (PILAR KEMITRAAN REFINED)
 * SOP: Pemisahan Mutlak Radar Logistik (Kurir) vs Radar Ekonomi (UMKM).
 * FIX: Menambah daftar Top UMKM berdampingan dengan Top Kurir.
 * FIX: Navigasi Detail UMKM mengarah ke shop_detail untuk peninjauan etalase.
 * REVISI: Navigasi Top Kurir diarahkan ke Monitoring Order (admin_orders) sesuai instruksi pimpinan.
 */

import { useAdminDashboardController } from "@/hooks/controllers/use-admin-dashboard-controller";
import { FlexibleFrame } from "@/components/dashboard/flexible-frame";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Truck, ShoppingCart, TrendingUp, Wallet, ListChecks, 
  LayoutDashboard, Crown, Users, ArrowRight, Sparkles, 
  Loader2, Zap, ShieldAlert, Activity, BarChart3, Store,
  Package, ShoppingBag, Globe, Building2, CheckCircle2, ChevronRight
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useView } from "@/context/view-context";
import { 
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis, 
  Tooltip as RechartsTooltip, Cell, Legend
} from 'recharts';

export default function AdminStatsView() {
  const { setView, forceUnlockUI } = useView();
  const c = useAdminDashboardController();

  if (c.loading) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
      <p className="text-[10px] font-black uppercase text-primary/40 animate-pulse tracking-[0.3em]">Membedah Arsitektur Data...</p>
    </div>
  );

  const handleNav = (view: any, data?: any) => {
    forceUnlockUI();
    setView(view, data);
    setTimeout(forceUnlockUI, 150);
  };

  return (
    <FlexibleFrame
      title="Statistik Jastip Siau"
      subtitle={`Kesimpulan Kemitraan • ${format(new Date(), 'EEEE, dd MMMM yyyy', { locale: id })}`}
      icon={LayoutDashboard}
      variant="admin"
      controls={
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Button 
            onClick={c.handleGenerateInsights} 
            disabled={c.loadingInsights} 
            className="flex-1 h-10 text-[10px] uppercase font-black bg-primary text-white shadow-xl hover:bg-blue-800 transition-all gap-2"
          >
            {c.loadingInsights ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-accent animate-pulse" />} 
            Analisis Performa AI
          </Button>
          <div className="flex gap-2 shrink-0">
             {c.isOwner && (
               <Badge className="bg-amber-100 text-amber-700 border-amber-200 h-10 px-4 rounded-xl font-black text-[9px] uppercase shadow-sm gap-2">
                 <Crown className="h-4 w-4" /> Sovereign
               </Badge>
             )}
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <Card className={cn(
           "border-none shadow-md flex items-center justify-between p-5 rounded-[2rem] transition-all", 
           c.recruitment?.isOpen ? 'bg-green-50/50' : 'bg-slate-100/50'
         )}>
            <div className="flex items-center gap-4">
               <div className={cn(
                 "h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform", 
                 c.recruitment?.isOpen ? 'bg-green-600 text-white' : 'bg-slate-500 text-white'
               )}>
                  <Zap className="h-6 w-6" />
               </div>
               <div>
                  <p className="text-[12px] font-black uppercase text-primary leading-none">Rekrutmen Mitra</p>
                  <p className={cn("text-[9px] font-bold uppercase mt-1.5", c.recruitment?.isOpen ? "text-green-700" : "text-slate-500")}>
                    {c.recruitment?.isOpen ? '● TERBUKA' : '○ DITUTUP'}
                  </p>
               </div>
            </div>
            <Switch checked={!!c.recruitment?.isOpen} onCheckedChange={c.handleToggleRecruitment} className="scale-110" />
         </Card>

         <Card 
          className="border-none shadow-md flex items-center justify-between p-5 rounded-[2rem] bg-white group cursor-pointer hover:shadow-xl transition-all"
          onClick={() => handleNav('admin_apps')}
         >
            <div className="flex items-center gap-4 w-full text-left">
              <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner relative">
                  <Users className="h-6 w-6" />
                  {c.pendingAppsCount > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 min-w-5 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce px-1">
                      {c.pendingAppsCount}
                    </span>
                  )}
              </div>
              <div className="flex-1">
                  <p className="text-[12px] font-black uppercase text-primary leading-none">Antrean Pelamar</p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1.5">
                    {c.pendingAppsCount} Berkas Verifikasi
                  </p>
              </div>
              <ArrowRight className="h-4 w-4 text-primary opacity-20" />
            </div>
         </Card>
      </div>

      {/* PILAR 1: RADAR LOGISTIK KURIR */}
      <section className="space-y-4">
         <div className="flex items-center gap-3 px-2">
            <h2 className="text-[11px] font-black uppercase text-blue-600 tracking-[0.2em] flex items-center gap-2"><Truck className="h-4 w-4" /> Kemitraan Logistik (Kurir)</h2>
            <div className="h-px bg-blue-100 flex-1" />
         </div>
         <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
            <StatsCard title="Gaji Jasa Jastip" value={c.stats.totalGajiJasa} sub="Laba Logistik" icon={TrendingUp} color="blue" onClick={() => handleNav('admin_orders')} />
            <StatsCard title="Kurir Siaga" value={c.stats.onlineCourierCount} sub={`Total: ${c.stats.courierCount}`} icon={Truck} color="blue" onClick={() => handleNav('admin_users')} />
            <StatsCard title="Amanah Selesai" value={c.stats.count} sub="Hari Ini" icon={CheckCircle2} color="green" onClick={() => handleNav('admin_orders')} />
         </div>
      </section>

      {/* PILAR 2: RADAR EKONOMI UMKM */}
      <section className="space-y-4">
         <div className="flex items-center gap-3 px-2">
            <h2 className="text-[11px] font-black uppercase text-orange-600 tracking-[0.2em] flex items-center gap-2"><Store className="h-4 w-4" /> Kemitraan Ekonomi (UMKM)</h2>
            <div className="h-px bg-orange-100 flex-1" />
         </div>
         <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
            <StatsCard title="Omzet Belanja" value={c.stats.totalOmzetBelanja} sub="Modal Masuk UMKM" icon={Wallet} color="orange" onClick={() => handleNav('admin_orders')} />
            <StatsCard title="Toko Terdaftar" value={c.stats.umkmCount} sub="Partner Produksi" icon={Building2} color="orange" onClick={() => handleNav('shop')} />
            <StatsCard title="Katalog Produk" value={c.stats.totalKatalog} sub="Menu Warga Siau" icon={Package} color="orange" onClick={() => handleNav('marketplace_catalog')} />
         </div>
      </section>
      
      {/* AREA ANALISIS STRATEGIS */}
      {c.insights && (
        <Card className="border-none shadow-2xl bg-slate-950 text-white rounded-[2.5rem] overflow-hidden animate-in zoom-in-95 duration-700">
           <CardHeader className="p-8 pb-4 relative z-10">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center border border-white/10">
                    <Sparkles className="h-6 w-6 text-accent animate-pulse" />
                 </div>
                 <div>
                    <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-accent">Strategic Conclusion</CardTitle>
                    <p className="text-[8px] font-bold uppercase opacity-50 tracking-widest mt-1">Siau Intelligence Radar</p>
                 </div>
              </div>
           </CardHeader>
           <CardContent className="p-8 pt-0 space-y-6 relative z-10">
              <div className="p-6 bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 italic">
                 <p className="text-[13px] font-bold leading-relaxed text-white/90">"{c.insights.summary}"</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-accent">Observasi Pertumbuhan:</p>
                    {c.insights.insights.map((ins, i) => (
                      <div key={i} className="flex gap-3 text-[11px] font-medium uppercase leading-snug p-2 rounded-xl bg-white/5 border border-white/5">
                         <div className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />{ins}
                      </div>
                    ))}
                 </div>
                 <div className="space-y-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-green-400">Rekomendasi Strategis:</p>
                    {c.insights.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-3 text-[11px] font-medium uppercase leading-snug p-2 rounded-xl bg-white/5 border border-white/5">
                         <div className="h-1.5 w-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />{rec}
                      </div>
                    ))}
                 </div>
              </div>
           </CardContent>
        </Card>
      )}

      {/* GRAFIK PERBANDINGAN PILAR */}
      <div className="grid gap-6 lg:grid-cols-1">
        <Card className="border-none shadow-md rounded-[2.2rem] overflow-hidden bg-white">
          <CardHeader className="p-6 border-b flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="h-9 w-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary"><BarChart3 className="h-5 w-5" /></div>
               <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary">Tren Performa Kemitraan (Gaji vs Omzet)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={c.weeklyData}>
                <XAxis dataKey="name" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} />
                <YAxis fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} tickFormatter={(v) => `Rp${v/1000}k`} />
                <RechartsTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 rounded-xl shadow-2xl border border-primary/5">
                          <p className="text-[11px] font-black uppercase text-primary mb-2">{payload[0].payload.name}</p>
                          <div className="space-y-1">
                             <p className="text-[9px] font-bold text-blue-600 uppercase">Gaji Jasa: Rp{payload[0].value?.toLocaleString()}</p>
                             <p className="text-[9px] font-bold text-orange-600 uppercase">Omzet UMKM: Rp{payload[1].value?.toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'black', textTransform: 'uppercase', paddingTop: '10px' }} />
                <Bar dataKey="laba" name="Laba Logistik" radius={[4, 4, 0, 0]} fill="#1768B3" />
                <Bar dataKey="omzet" name="Omzet UMKM" radius={[4, 4, 0, 0]} fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* TOP PARTNERS RADAR: DUAL PILLAR */}
      <div className="grid gap-6 lg:grid-cols-2 pb-40">
        {/* COLUMN 1: TOP KURIR */}
        <Card className="border-none shadow-md rounded-[2.2rem] overflow-hidden bg-white">
          <CardHeader className="p-5 border-b flex flex-row items-center justify-between bg-blue-50/30">
            <div className="flex items-center gap-3">
               <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm"><ListChecks className="h-5 w-5" /></div>
               <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary">Top Kurir Logistik</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {c.couriers.slice(0, 5).map((kr, i) => (
              <div 
                key={i} 
                className="flex items-center gap-4 p-3 hover:bg-blue-50/50 rounded-2xl transition-all group cursor-pointer"
                onClick={() => handleNav('admin_orders')}
              >
                <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                  <AvatarImage src={kr.imageUrl} className="object-cover" />
                  <AvatarFallback className="bg-blue-50 text-blue-600 font-black text-xs">{(kr.fullName || "K").charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black truncate uppercase text-primary leading-none">{kr.fullName}</p>
                  <p className="text-[9px] text-green-600 font-black uppercase mt-1.5">Laba: Rp{kr.dailyRevenue.toLocaleString()}</p>
                </div>
                <Badge variant="outline" className="text-[8px] font-black h-5 px-2 border-primary/10">{kr.dailyCount} Antaran</Badge>
                <ChevronRight className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* COLUMN 2: TOP UMKM */}
        <Card className="border-none shadow-md rounded-[2.2rem] overflow-hidden bg-white">
          <CardHeader className="p-5 border-b flex flex-row items-center justify-between bg-orange-50/30">
            <div className="flex items-center gap-3">
               <div className="h-9 w-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm"><Store className="h-5 w-5" /></div>
               <CardTitle className="text-[10px] font-black uppercase tracking-widest text-orange-900">Top Mitra UMKM</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {c.umkms.slice(0, 5).map((umkm, i) => (
              <div 
                key={i} 
                className="flex items-center gap-4 p-3 hover:bg-orange-50/50 rounded-2xl transition-all group cursor-pointer"
                onClick={() => handleNav('shop_detail', { storeId: umkm.uid || umkm.id })}
              >
                <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                  <AvatarImage src={umkm.storeImageUrl || umkm.imageUrl} className="object-cover" />
                  <AvatarFallback className="bg-orange-50 text-orange-600 font-black text-xs">{(umkm.storeName || "T").charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black truncate uppercase text-orange-900 leading-none">{umkm.storeName || umkm.fullName}</p>
                  <p className="text-[9px] text-orange-600 font-black uppercase mt-1.5">Omzet: Rp{umkm.dailyRevenue.toLocaleString()}</p>
                </div>
                <Badge variant="outline" className="text-[8px] font-black h-5 px-2 border-orange-200">{umkm.dailyCount} Terjual</Badge>
                <ChevronRight className="h-3.5 w-3.5 text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </FlexibleFrame>
  );
}

function StatsCard({ title, value, sub, icon: Icon, color = "blue", onClick }: any) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
    green: "bg-green-50 text-green-700 border-green-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100"
  };
  
  return (
    <Card 
      className={cn(
        "border-none shadow-md bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-95 group",
        "ring-1 ring-primary/5"
      )}
      onClick={onClick}
    >
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">{title}</CardTitle>
        <div className={cn("p-2 rounded-xl shadow-inner transition-colors", colors[color as keyof typeof colors])}>
           <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-[16px] font-black text-primary tracking-tighter tabular-nums truncate">
          {typeof value === 'number' && (title.toLowerCase().includes('laba') || title.toLowerCase().includes('omzet')) ? `Rp${value.toLocaleString()}` : value}
        </div>
        <p className="text-[7.5px] text-muted-foreground font-bold uppercase tracking-widest mt-1 opacity-60">{sub}</p>
      </CardContent>
    </Card>
  );
}
