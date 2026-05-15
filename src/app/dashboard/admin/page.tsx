
"use client";

import { useAdminDashboardController } from "@/hooks/controllers/use-admin-dashboard-controller";
import { FlexibleFrame } from "@/components/dashboard/flexible-frame";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Truck, ShoppingCart, DollarSign, Sparkles, Loader2, ArrowRight, TrendingUp, Wallet, ListChecks, LayoutDashboard, Crown } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, Cell } from 'recharts';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

/**
 * VIEW (MVC): Halaman Statistik Admin
 * 100% Real-time Data Mapping.
 */
export default function AdminDashboardPage() {
  const c = useAdminDashboardController();

  if (c.loading) return (
    <div className="flex items-center justify-center h-screen bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <FlexibleFrame
      title="Statistik Siau"
      subtitle={`Laporan: ${format(new Date(), 'dd MMMM yyyy', { locale: id })}`}
      icon={LayoutDashboard}
      variant="admin"
      controls={
        <div className="flex gap-2">
          <Button onClick={() => c.handleGenerateInsights()} disabled={c.loadingInsights} size="sm" className="flex-1 h-9 text-[9px] uppercase font-black bg-primary text-white shadow-md">
            {c.loadingInsights ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1.5 h-3.5 w-3.5" />} Analisis AI
          </Button>
          {c.isOwner && (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 h-9 px-3 rounded-xl font-black text-[8px] uppercase">
              <Crown className="mr-1.5 h-3.5 w-3.5" /> Full Authority
            </Badge>
          )}
        </div>
      }
    >
      {/* QUICK STATUS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <Card className={cn("border-none shadow-sm flex items-center justify-between p-4 rounded-[1.8rem]", c.recruitment?.isOpen ? 'bg-green-50' : 'bg-slate-100')}>
            <div className="flex items-center gap-3">
               <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", c.recruitment?.isOpen ? 'bg-green-600 text-white' : 'bg-slate-400 text-white')}>
                  <Truck className="h-5 w-5" />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase text-primary leading-none">Rekrutmen Mitra</p>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1">{c.recruitment?.isOpen ? 'Buka' : 'Tutup'}</p>
               </div>
            </div>
            <Switch checked={!!c.recruitment?.isOpen} onCheckedChange={c.handleToggleRecruitment} />
         </Card>
         <Card className="border-none shadow-sm flex items-center justify-between p-4 rounded-[1.8rem] bg-white">
            <div className="flex items-center gap-3 w-full text-left">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary relative">
                  <Users className="h-5 w-5" />
                  {c.pendingAppsCount > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce">{c.pendingAppsCount}</span>}
              </div>
              <div className="flex-1">
                  <p className="text-[10px] font-black uppercase text-primary leading-none">Antrean Lamaran</p>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1">{c.pendingAppsCount} Berkas Menunggu</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
         </Card>
      </div>

      {/* STATS GRID */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Laba Jasa" value={c.stats.totalOngkir} sub="Hari Ini" icon={TrendingUp} color="green" />
        <StatsCard title="Modal Talangan" value={c.stats.totalProduk} sub="Putaran Uang" icon={Wallet} color="orange" />
        <StatsCard title="Mitra Aktif" value={c.couriers.length} sub="Online/Busy" icon={Truck} color="blue" />
        <StatsCard title="Order Harian" value={c.stats.count} sub="Sukses" icon={ShoppingCart} color="blue" />
      </div>

      {/* CHARTS & PERFORMANCE */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-md rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="p-5 border-b bg-muted/5">
            <CardTitle className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Tren Pendapatan Jasa
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={c.weeklyData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={8} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={8} tickLine={false} axisLine={false} tickFormatter={(v) => `Rp${v/1000}k`} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} fill="#1768B3" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3 border-none shadow-md rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="p-5 border-b flex flex-row items-center justify-between bg-muted/5">
            <CardTitle className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <ListChecks className="h-4 w-4" /> Top Mitra Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            {c.couriers.slice(0, 6).map((kr, i) => (
              <div key={i} className="flex items-center gap-3 p-2 hover:bg-muted/30 rounded-xl transition-all">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={kr.imageUrl} />
                  <AvatarFallback className="bg-primary/5 text-primary font-black text-[9px]">{(kr.fullName || "K").charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black truncate uppercase text-primary leading-none">{kr.fullName}</p>
                  <p className="text-[8px] text-green-600 font-black mt-1 uppercase">Rp{kr.dailyRevenue.toLocaleString()}</p>
                </div>
                <Badge variant="outline" className="text-[7px] font-black">{kr.dailyCount}x</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </FlexibleFrame>
  );
}

function StatsCard({ title, value, sub, icon: Icon, color = "blue" }: any) {
  const colors = {
    green: "bg-green-50 text-green-700",
    orange: "bg-orange-50 text-orange-700",
    blue: "bg-blue-50 text-blue-700"
  };
  return (
    <Card className="border-none shadow-md bg-white rounded-2xl overflow-hidden">
      <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
        <CardTitle className="text-[8px] font-black uppercase text-muted-foreground">{title}</CardTitle>
        <div className={cn("p-1.5 rounded-lg", colors[color as keyof typeof colors])}><Icon className="h-3 w-3" /></div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="text-[13px] font-black text-primary truncate">
          {typeof value === 'number' && (title.includes('Laba') || title.includes('Modal')) ? `Rp${value.toLocaleString()}` : value}
        </div>
        <p className="text-[7px] text-muted-foreground font-bold uppercase tracking-widest mt-1 opacity-60">{sub}</p>
      </CardContent>
    </Card>
  );
}
