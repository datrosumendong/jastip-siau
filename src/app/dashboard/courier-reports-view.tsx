
"use client";

/**
 * VIEW: Laporan Keuangan Kurir (PREMIUM AUDIT EDITION)
 * SOP: Dukungan Filter Tanggal, Bulan, dan Tahun secara real-time.
 * FIX: Membasmi RangeError Invalid Date dengan Safety Check pada Timestamp.
 */

import { useCourierReportsController } from '@/hooks/controllers/use-courier-reports-controller';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, Wallet, Clock, Receipt, 
  Loader2, CalendarDays, Filter, ChevronDown 
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { formatIDR } from '@/lib/currency';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function CourierReportsView() {
  const c = useCourierReportsController();

  if (c.loading && c.filteredOrders.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
      <Loader2 className="animate-spin text-primary opacity-20 h-10 w-10" />
      <p className="text-[10px] font-black uppercase text-primary/40 mt-4 animate-pulse">Menghubungkan Radar Laporan...</p>
    </div>
  );

  return (
    <FlexibleFrame
      title="Laporan Keuangan"
      subtitle="Audit Perputaran Modal & Laba Jasa"
      icon={TrendingUp}
      variant="courier"
      controls={
        <div className="space-y-3">
           {/* FILTER CONTROLS BAR */}
           <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                 <span className="text-[7px] font-black text-muted-foreground uppercase ml-1">Tahun</span>
                 <Select value={c.selectedYear} onValueChange={c.setSelectedYear}>
                    <SelectTrigger className="h-9 text-[10px] font-black uppercase bg-white border-primary/10 rounded-xl shadow-sm">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-2xl">
                       {c.years.map(y => <SelectItem key={y} value={y} className="text-[10px] font-black uppercase">{y}</SelectItem>)}
                    </SelectContent>
                 </Select>
              </div>

              <div className="space-y-1">
                 <span className="text-[7px] font-black text-muted-foreground uppercase ml-1">Bulan</span>
                 <Select value={c.selectedMonth} onValueChange={c.setSelectedMonth}>
                    <SelectTrigger className="h-9 text-[10px] font-black uppercase bg-white border-primary/10 rounded-xl shadow-sm">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-2xl">
                       {c.months.map(m => <SelectItem key={m.id} value={m.id} className="text-[10px] font-black uppercase">{m.name}</SelectItem>)}
                    </SelectContent>
                 </Select>
              </div>

              <div className="space-y-1">
                 <span className="text-[7px] font-black text-muted-foreground uppercase ml-1">Tanggal</span>
                 <Select value={c.selectedDay} onValueChange={c.setSelectedDay}>
                    <SelectTrigger className="h-9 text-[10px] font-black uppercase bg-white border-primary/10 rounded-xl shadow-sm">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-2xl">
                       <SelectItem value="0" className="text-[10px] font-black uppercase text-blue-600">SEMUA HARI</SelectItem>
                       {c.days.map(d => <SelectItem key={d} value={d} className="text-[10px] font-black uppercase">{d}</SelectItem>)}
                    </SelectContent>
                 </Select>
              </div>
           </div>
           
           <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-1.5 opacity-40">
                 <Filter className="h-3 w-3" />
                 <span className="text-[8px] font-black uppercase tracking-widest">Gunakan filter untuk audit historis</span>
              </div>
              <Badge variant="outline" className="text-[8px] font-black uppercase border-primary/10 bg-white">Sync Live</Badge>
           </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CARD: LABA JASA */}
        <Card className="border-none shadow-xl bg-gradient-to-br from-green-600 to-green-500 text-white overflow-hidden rounded-[2.2rem] p-6 relative group transition-all">
           <TrendingUp className="absolute -top-4 -right-4 h-32 w-32 opacity-10 rotate-12 transition-transform group-hover:scale-110" />
           <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2 opacity-80">
                 <div className="h-6 w-6 rounded-lg bg-white/20 flex items-center justify-center"><TrendingUp className="h-3.5 w-3.5" /></div>
                 <span className="text-[10px] font-black uppercase tracking-widest">Pendapatan Jasa</span>
              </div>
              <div>
                 <h2 className="text-3xl font-black tracking-tighter tabular-nums">{formatIDR(c.income)}</h2>
                 <p className="text-[9px] font-bold uppercase opacity-70 mt-1">{c.count} Amanah Ditemukan</p>
              </div>
           </div>
        </Card>

        {/* CARD: MODAL TALANGAN */}
        <Card className="border-none shadow-xl bg-gradient-to-br from-blue-700 to-indigo-600 text-white overflow-hidden rounded-[2.2rem] p-6 relative group transition-all">
           <Wallet className="absolute -top-4 -right-4 h-32 w-32 opacity-10 rotate-12 transition-transform group-hover:scale-110" />
           <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2 opacity-80">
                 <div className="h-6 w-6 rounded-lg bg-white/20 flex items-center justify-center"><Wallet className="h-3.5 w-3.5" /></div>
                 <span className="text-[10px] font-black uppercase tracking-widest">Total Modal Terputar</span>
              </div>
              <div>
                 <h2 className="text-3xl font-black tracking-tighter tabular-nums">{formatIDR(c.capital)}</h2>
                 <p className="text-[9px] font-bold uppercase opacity-70 mt-1">Siklus uang periode terpilih.</p>
              </div>
           </div>
        </Card>
      </div>

      {/* RINCIAN TRANSAKSI */}
      <Card className="border-none shadow-md rounded-[2.5rem] bg-white overflow-hidden mt-2">
        <CardHeader className="p-6 bg-muted/5 border-b flex flex-row items-center justify-between">
           <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
              <CardTitle className="text-[10px] font-black uppercase text-primary tracking-widest">Log Transaksi Periode</CardTitle>
           </div>
           <Badge className="bg-primary/5 text-primary border-none text-[8px] font-black uppercase px-2 h-4">{c.count} Data</Badge>
        </CardHeader>
        <div className="divide-y divide-primary/5">
           {c.filteredOrders.length === 0 ? (
             <div className="py-24 text-center opacity-30 flex flex-col items-center gap-3">
                <div className="p-6 rounded-full bg-muted/50"><Receipt className="h-12 w-12 text-muted-foreground/30" /></div>
                <p className="text-[11px] font-black uppercase tracking-widest px-10 leading-relaxed">
                  Tidak ada catatan transaksi pada filter yang dipilih.
                </p>
             </div>
           ) : (
             c.filteredOrders.map((order: any) => {
               // FIX: Safety Guard untuk Timestamp guna membasmi RangeError Invalid Date
               const timestamp = order.updatedAt?.seconds || order.createdAt?.seconds;
               const timeLabel = timestamp ? format(new Date(timestamp * 1000), 'dd/MM/yy • HH:mm') : 'Waktu Tidak Terdata';

               return (
                 <div key={order.id} className="p-5 flex items-center gap-4 hover:bg-primary/[0.01] transition-colors group">
                    <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-start">
                          <h4 className="text-[13px] font-black text-primary uppercase truncate pr-4 leading-none">{order.userName}</h4>
                          <span className="text-[11px] font-black text-green-600">+{formatIDR(order.serviceFee || 0)}</span>
                       </div>
                       <div className="flex justify-between items-center mt-2 text-[8px] font-black text-muted-foreground uppercase opacity-60">
                          <span className="flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" /> 
                            {timeLabel}
                          </span>
                          <span className="italic bg-muted px-1.5 py-0.5 rounded shadow-sm">Modal: {formatIDR(order.itemPrice || 0)}</span>
                       </div>
                    </div>
                 </div>
               );
             })
           )}
        </div>
      </Card>

      <div className="p-6 bg-blue-50 border border-blue-100 rounded-[1.8rem] flex items-start gap-4 mx-2">
         <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm shrink-0 mt-0.5"><Clock className="h-4 w-4" /></div>
         <div className="space-y-1">
            <p className="text-[11px] font-black uppercase text-blue-900 leading-tight">Integritas Audit Jastip</p>
            <p className="text-[9px] font-bold text-blue-800 uppercase italic leading-relaxed opacity-70">
              Laporan ini disinkronkan secara mutlak dengan database pusat. Gunakan data ini sebagai bukti sah untuk penyelesaian sengketa atau pelaporan pajak mitra.
            </p>
         </div>
      </div>
    </FlexibleFrame>
  );
}
