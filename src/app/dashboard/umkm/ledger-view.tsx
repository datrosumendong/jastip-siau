"use client";

/**
 * VIEW: UMKM Buku Kasir Digital (MAHAKARYA POS REFINED)
 * SOP: Dashboard Finansial dengan Laporan Harian, Bulanan, Tahunan.
 * FIX: Penggunaan openTerminal untuk pemisahan mutlak Pemasukan & Pengeluaran.
 */

import { useState } from 'react';
import { useUMKMLedgerController } from '@/hooks/controllers/use-umkm-ledger-controller';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Receipt, TrendingUp, Plus, 
  Trash2, Loader2, Sparkles, ShoppingCart, Store, 
  ArrowUpRight, ArrowDownRight, X, ChevronLeft, 
  Printer, Wallet, Save, Layers, Calculator, Target,
  Package, CheckCircle2, CalendarDays, History
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatIDR } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function UMKMLedgerView() {
  const c = useUMKMLedgerController();
  
  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col bg-[#F8FAFC]">
      <FlexibleFrame
        title="Buku Kasir"
        subtitle="Sistem Manajemen Finansial UMKM"
        icon={Receipt}
        variant="umkm"
        controls={
          <div className="flex flex-col gap-3 w-full">
             {/* PERIOD SELECTOR */}
             <Tabs value={c.reportPeriod} onValueChange={(v: any) => c.setReportPeriod(v)} className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-10 bg-white p-1 rounded-xl border border-primary/10 shadow-sm">
                   <TabsTrigger value="daily" className="rounded-lg font-black uppercase text-[8px] data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Harian</TabsTrigger>
                   <TabsTrigger value="monthly" className="rounded-lg font-black uppercase text-[8px] data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Bulanan</TabsTrigger>
                   <TabsTrigger value="yearly" className="rounded-lg font-black uppercase text-[8px] data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Tahunan</TabsTrigger>
                </TabsList>
             </Tabs>

             <div className="flex gap-2">
                <Button 
                  onClick={() => c.openTerminal('income')} 
                  className="flex-1 h-10 bg-primary text-white rounded-xl font-black uppercase text-[9px] shadow-lg gap-2 active:scale-95 transition-all"
                >
                    <ShoppingCart className="h-4 w-4" /> Input Jual
                </Button>
                <Button 
                  onClick={() => c.openTerminal('expense')} 
                  className="flex-1 h-10 bg-red-600 text-white rounded-xl font-black uppercase text-[9px] shadow-lg gap-2 active:scale-95 transition-all"
                >
                    <Wallet className="h-4 w-4" /> Catat Biaya
                </Button>
             </div>
             <Button onClick={() => c.setIsAICalculatorOpen(true)} variant="outline" className="h-9 border-orange-200 text-orange-700 bg-orange-50/50 rounded-xl font-black uppercase text-[8px] shadow-sm gap-2 active:scale-95 transition-all">
                <Sparkles className="h-3.5 w-3.5" /> Konsultasi Harga AI
             </Button>
          </div>
        }
      >
        {/* STATS RADAR */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in duration-500">
           <StatsCard label="Omzet Web" value={c.stats.webOmzet} sub="Sync Otomatis" icon={ShoppingCart} color="blue" />
           <StatsCard label="Omzet Toko" value={c.stats.manualOmzet} sub="Input POS" icon={Store} color="orange" />
           <StatsCard label="Biaya Keluar" value={c.stats.totalExpenses} sub="Pengeluaran" icon={ArrowDownRight} color="red" />
           <StatsCard label="Laba Bersih" value={c.stats.netProfit} sub="Profit Murni" icon={TrendingUp} color="green" />
        </div>

        {/* REKAP BULANAN (YEARLY VIEW ONLY) */}
        {c.reportPeriod === 'yearly' && c.stats.monthlyBreakdown.length > 0 && (
          <Card className="border-none shadow-xl rounded-[1.8rem] bg-gradient-to-br from-primary to-indigo-900 text-white overflow-hidden mt-2 animate-in zoom-in-95">
             <CardHeader className="p-5 border-b border-white/10 flex flex-row items-center gap-3">
                <CalendarDays className="h-5 w-5 text-accent animate-pulse" />
                <CardTitle className="text-[10px] font-black uppercase tracking-widest">Rincian Performa Tiap Bulan</CardTitle>
             </CardHeader>
             <div className="divide-y divide-white/5">
                {c.stats.monthlyBreakdown.map((m, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                     <div className="min-w-0">
                        <p className="text-[12px] font-black uppercase tracking-tighter">{m.monthName}</p>
                        <div className="flex items-center gap-2 mt-1 opacity-60">
                           <span className="text-[7px] font-bold uppercase tracking-widest">Biaya: {formatIDR(m.totalExpense)}</span>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[14px] font-black text-accent">{formatIDR(m.totalOmzet)}</p>
                        <p className="text-[8px] font-black text-green-400 uppercase mt-0.5">Laba: {formatIDR(m.netProfit)}</p>
                     </div>
                  </div>
                ))}
             </div>
          </Card>
        )}

        {/* LOG TRANSAKSI */}
        <Card className="border-none shadow-md rounded-[1.8rem] bg-white overflow-hidden mt-2">
          <CardHeader className="p-5 bg-muted/5 border-b flex flex-row items-center justify-between">
             <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                <CardTitle className="text-[10px] font-black uppercase text-primary tracking-widest">
                  Log Transaksi: {c.reportPeriod === 'daily' ? 'Hari Ini' : c.reportPeriod === 'monthly' ? 'Bulan Ini' : 'Tahun Ini'}
                </CardTitle>
             </div>
             <Badge variant="outline" className="text-[8px] font-black uppercase border-primary/10 bg-white shadow-sm">Sync Live</Badge>
          </CardHeader>
          
          <div className="divide-y divide-primary/5">
             {c.loading ? (
               <div className="py-20 text-center opacity-30">
                  <Loader2 className="h-10 w-10 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-[9px] font-black uppercase">Sinkronisasi Laporan...</p>
               </div>
             ) : (c.ledgerEntries.length === 0 && c.webOrders.length === 0) ? (
               <div className="py-24 text-center opacity-20 flex flex-col items-center">
                  <History className="h-12 w-12 text-primary mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Belum Ada Data</p>
               </div>
             ) : (
               <>
                 {c.webOrders.map((o: any) => (
                   <div key={o.id} className="p-5 flex items-center justify-between hover:bg-primary/[0.01] transition-colors group">
                      <div className="flex items-center gap-4 min-w-0">
                         <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 shadow-inner border border-blue-100">
                            <ShoppingCart className="h-5 w-5" />
                         </div>
                         <div className="min-w-0">
                            <p className="text-[12px] font-black uppercase text-primary truncate leading-none">Order Web: {o.userName}</p>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1.5 opacity-60">
                               {o.updatedAt?.seconds ? format(new Date(o.updatedAt.seconds * 1000), 'dd MMM yyyy', { locale: id }) : '-'}
                            </p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[14px] font-black text-green-600">+{formatIDR(o.itemPrice || 0)}</p>
                         <p className="text-[7px] font-black text-muted-foreground uppercase mt-0.5 opacity-40 italic">#Online</p>
                      </div>
                   </div>
                 ))}

                 {c.ledgerEntries.map((e: any) => (
                   <div key={e.id} className="p-5 flex items-center justify-between group hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-4 min-w-0">
                         <div className={cn(
                           "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner border", 
                           e.category === 'income' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                         )}>
                            {e.category === 'income' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                         </div>
                         <div className="min-w-0">
                            <p className="text-[12px] font-black uppercase text-primary truncate leading-none">{e.description}</p>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1.5 opacity-60">
                               {e.createdAt?.seconds ? format(new Date(e.createdAt.seconds * 1000), 'dd MMM yyyy • HH:mm', { locale: id }) : '-'}
                            </p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="text-right">
                            <p className={cn("text-[14px] font-black", e.category === 'income' ? 'text-green-600' : 'text-red-600')}>
                               {e.category === 'income' ? '+' : '-'}{formatIDR(e.amount)}
                            </p>
                            <p className="text-[7px] font-bold text-muted-foreground uppercase mt-0.5">{e.category === 'income' ? 'Manual POS' : 'Biaya Toko'}</p>
                         </div>
                         <button onClick={() => c.handleDeleteEntry(e.id)} className="opacity-0 group-hover:opacity-100 p-2.5 text-destructive hover:bg-destructive/5 rounded-full transition-all active:scale-75"><Trash2 className="h-4 w-4" /></button>
                      </div>
                   </div>
                 ))}
               </>
             )}
          </div>
        </Card>
      </FlexibleFrame>

      {/* FULL-PAGE TRANSACTION TERMINAL */}
      {c.isTerminalOpen && (
        <div className="absolute inset-0 z-[150] bg-[#F8FAFC] flex flex-col animate-in slide-in-from-bottom duration-500">
           <header className={cn(
             "p-4 sm:p-6 text-white shrink-0 flex items-center justify-between shadow-xl z-20",
             c.terminalType === 'income' ? 'bg-primary' : 'bg-red-700'
           )}>
              <div className="flex items-center gap-4 min-w-0">
                 <button onClick={() => c.setIsTerminalOpen(false)} className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all active:scale-90">
                    <ChevronLeft className="h-6 w-6 text-white" />
                 </button>
                 <div className="min-w-0">
                    <h2 className="text-xl font-black uppercase tracking-tight leading-none truncate">
                       {c.terminalType === 'income' ? 'Terminal Pemasukan' : 'Terminal Pengeluaran'}
                    </h2>
                    <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest mt-1">SOP Manajemen Finansial</p>
                 </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-lg shrink-0">
                 {c.terminalType === 'income' ? <ShoppingCart className="h-6 w-6 text-white" /> : <Wallet className="h-6 w-6 text-white" />}
              </div>
           </header>

           <ScrollArea className="flex-1">
              <div className="p-4 sm:p-8 space-y-8 max-w-4xl mx-auto pb-48">
                 <Card className="border-none shadow-sm rounded-2xl bg-white p-5 space-y-5 ring-1 ring-primary/5">
                    <div className="flex items-center gap-2 border-b border-dashed border-primary/10 pb-3">
                       <Plus className={cn("h-4 w-4", c.terminalType === 'income' ? 'text-primary' : 'text-red-600')} />
                       <span className={cn("text-[10px] font-black uppercase tracking-widest", c.terminalType === 'income' ? 'text-primary' : 'text-red-600')}>
                          Tambah Rincian Item
                       </span>
                    </div>
                    <div className="space-y-4">
                       <div className="space-y-1.5">
                          <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Nama Barang / Deskripsi</Label>
                          <Input 
                            placeholder={c.terminalType === 'income' ? "Contoh: Paket Ayam Geprek" : "Contoh: Bahan Baku Beras 20kg"} 
                            className="h-12 border-none bg-muted/30 rounded-xl font-black text-sm px-4 focus-visible:ring-1" 
                            value={c.currentItem.name} 
                            onChange={(e) => c.setCurrentItem({...c.currentItem, name: e.target.value})} 
                          />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                             <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Jumlah (Qty)</Label>
                             <div className="flex items-center bg-muted/30 rounded-xl overflow-hidden shadow-inner border border-primary/5">
                                <button onClick={() => c.setCurrentItem({...c.currentItem, quantity: Math.max(1, c.currentItem.quantity - 1)})} className="h-12 w-12 flex items-center justify-center text-primary font-black hover:bg-primary/5 transition-all">-</button>
                                <span className="flex-1 text-center font-black text-sm">{c.currentItem.quantity}</span>
                                <button onClick={() => c.setCurrentItem({...c.currentItem, quantity: c.currentItem.quantity + 1})} className="h-12 w-12 flex items-center justify-center text-primary font-black hover:bg-primary/5 transition-all">+</button>
                             </div>
                          </div>
                          <div className="space-y-1.5">
                             <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Harga Satuan (Rp)</Label>
                             <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground">Rp</div>
                                <Input type="number" placeholder="0" className="h-12 border-none bg-muted/30 rounded-xl font-black text-sm pl-9 shadow-inner" value={c.currentItem.price} onChange={(e) => c.setCurrentItem({...c.currentItem, price: e.target.value})} />
                             </div>
                          </div>
                       </div>
                       <Button 
                         onClick={c.handleAddLineItem} 
                         disabled={!c.currentItem.name || !c.currentItem.price} 
                         className={cn(
                           "w-full h-12 rounded-xl font-black uppercase text-[10px] shadow-sm transition-all gap-2",
                           c.terminalType === 'income' ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white" : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-600 hover:text-white"
                         )}
                       >
                          <Plus className="h-4 w-4" /> Masukkan ke Daftar
                       </Button>
                    </div>
                 </Card>

                 <div className="space-y-4">
                    <h3 className="text-[11px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2 px-2">
                       <Layers className="h-4 w-4" /> Rincian Transaksi Terminal
                    </h3>
                    <div className="space-y-3">
                       {c.terminalItems.length === 0 ? (
                         <div className="py-12 text-center bg-white rounded-2xl border-2 border-dashed border-primary/10 opacity-30 flex flex-col items-center">
                            <Receipt className="h-10 w-10 mb-2" />
                            <p className="text-[10px] font-black uppercase">Belum Ada Item Terdata</p>
                         </div>
                       ) : (
                         c.terminalItems.map((item) => (
                           <Card key={item.id} className="border-none shadow-sm rounded-xl bg-white p-4 flex items-center justify-between group animate-in slide-in-from-right-2 duration-300">
                              <div className="flex items-center gap-4 min-w-0">
                                 <div className={cn(
                                   "h-10 w-10 rounded-lg flex items-center justify-center font-black text-xs shrink-0 shadow-sm",
                                   c.terminalType === 'income' ? 'bg-primary/5 text-primary' : 'bg-red-50 text-red-700'
                                 )}>
                                    {item.quantity}x
                                 </div>
                                 <div className="min-w-0">
                                    <p className="text-[12px] font-black uppercase text-primary truncate leading-none">{item.name}</p>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1 opacity-60">@{formatIDR(item.price)}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3">
                                 <p className={cn("text-[13px] font-black", c.terminalType === 'income' ? 'text-primary' : 'text-red-600')}>
                                    {formatIDR(item.price * item.quantity)}
                                 </p>
                                 <button onClick={() => c.handleRemoveLineItem(item.id)} className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"><X className="h-3.5 w-3.5" /></button>
                              </div>
                           </Card>
                         ))
                       )}
                    </div>
                 </div>

                 <Card className={cn(
                   "border-none shadow-xl rounded-[2rem] p-8 space-y-2 overflow-hidden relative",
                   c.terminalType === 'income' ? "bg-gradient-to-br from-primary to-blue-900" : "bg-gradient-to-br from-red-700 to-rose-950"
                 )}>
                    <div className="absolute top-0 right-0 h-full w-1/2 bg-white/5 skew-x-12 translate-x-20 pointer-events-none" />
                    <div className="relative z-10 flex flex-col items-center text-center">
                       <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-70 text-white">
                          {c.terminalType === 'income' ? 'Total Pemasukan' : 'Total Pengeluaran'}
                       </p>
                       <h2 className="text-4xl sm:text-5xl font-black tracking-tighter tabular-nums text-white">{formatIDR(c.terminalTotal)}</h2>
                    </div>
                 </Card>
              </div>
           </ScrollArea>

           <footer className="p-4 sm:p-6 border-t bg-white shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-[160] flex flex-col sm:flex-row gap-3">
              {c.terminalType === 'income' && (
                <Button variant="outline" className="flex-1 h-16 border-2 border-primary/10 rounded-xl font-black uppercase text-xs shadow-sm active:scale-95 transition-all gap-3 text-primary bg-white" onClick={() => c.setShowReceipt(true)} disabled={c.terminalItems.length === 0}><Printer className="h-6 w-6" /> Struk Mini</Button>
              )}
              <Button 
                className={cn(
                  "flex-[1.5] h-16 text-white rounded-xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all gap-3",
                  c.terminalType === 'income' ? "bg-primary shadow-primary/20" : "bg-red-700 shadow-red-200"
                )} 
                disabled={c.submitting || c.terminalItems.length === 0} 
                onClick={c.handleSaveTransaction}
              >
                 {c.submitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />} 
                 Simpan & Selesaikan
              </Button>
           </footer>
        </div>
      )}

      {/* AI CALCULATOR TERMINAL */}
      {c.isAICalculatorOpen && (
        <div className="absolute inset-0 z-[150] bg-[#F8FAFC] flex flex-col animate-in slide-in-from-bottom duration-500">
           <header className="p-4 sm:p-6 bg-gradient-to-r from-orange-600 to-amber-500 text-white shrink-0 flex items-center justify-between shadow-xl z-20">
              <div className="flex items-center gap-4 min-w-0">
                 <button onClick={() => c.setIsAICalculatorOpen(false)} className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all active:scale-90">
                    <ChevronLeft className="h-6 w-6 text-white" />
                 </button>
                 <div className="min-w-0">
                    <h2 className="text-xl font-black uppercase tracking-tight leading-none truncate">Kalkulator HPP AI</h2>
                    <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest mt-1">Strategi Anti-Rugi Siau</p>
                 </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-lg shrink-0">
                 <Sparkles className="h-6 w-6 text-white animate-pulse" />
              </div>
           </header>

           <ScrollArea className="flex-1">
              <div className="p-6 md:p-10 space-y-10 max-w-4xl mx-auto pb-48">
                 <section className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                       <h3 className="text-[11px] font-black uppercase text-orange-600 tracking-[0.2em] flex items-center gap-2">
                          <Package className="h-4 w-4" /> Informasi Produk
                       </h3>
                       <div className="h-px bg-orange-100 flex-1" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Nama Menu</Label>
                          <Input 
                            placeholder="Nasi Goreng Siau" 
                            className="h-14 border-none bg-white rounded-2xl font-black text-sm px-6 shadow-sm" 
                            value={c.aiForm.productName}
                            onChange={(e) => c.setAiForm({...c.aiForm, productName: e.target.value})}
                          />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Target Untung (%)</Label>
                          <div className="relative">
                             <div className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-black text-orange-400">%</div>
                             <Input 
                               type="number" 
                               className="h-14 border-none bg-white rounded-2xl font-black text-xl px-14 shadow-sm text-orange-600" 
                               value={c.aiForm.targetProfitPercent}
                               onChange={(e) => c.setAiForm({...c.aiForm, targetProfitPercent: e.target.value})}
                             />
                          </div>
                       </div>
                    </div>
                 </section>

                 <section className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                       <h3 className="text-[11px] font-black uppercase text-orange-600 tracking-[0.2em] flex items-center gap-2">
                          <Layers className="h-4 w-4" /> Rincian Modal Bahan
                       </h3>
                       <div className="h-px bg-orange-100 flex-1" />
                    </div>
                    <Card className="border-none shadow-sm rounded-[2rem] bg-white p-6 space-y-6 ring-1 ring-orange-100">
                       <div className="space-y-4">
                          <div className="space-y-1.5">
                             <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Nama Bahan (Grosir)</Label>
                             <Input 
                               placeholder="Beras 10kg" 
                               className="h-12 border-none bg-orange-50/50 rounded-xl font-bold text-xs px-4" 
                               value={c.currentMaterial.name}
                               onChange={(e) => c.setCurrentMaterial({...c.currentMaterial, name: e.target.value})}
                             />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                             <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Harga Beli</Label>
                                <Input type="number" className="h-12 border-none bg-orange-50/50 rounded-xl font-bold text-[10px]" value={c.currentMaterial.packPrice} onChange={(e) => c.setCurrentMaterial({...c.currentMaterial, packPrice: e.target.value})} />
                             </div>
                             <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Isi/Pak</Label>
                                <Input type="number" className="h-12 border-none bg-orange-50/50 rounded-xl font-bold text-[10px]" value={c.currentMaterial.qtyPerPack} onChange={(e) => c.setCurrentMaterial({...c.currentMaterial, qtyPerPack: e.target.value})} />
                             </div>
                             <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Pakai/Porsi</Label>
                                <Input type="number" className="h-12 border-none bg-orange-50/50 rounded-xl font-bold text-[10px]" value={c.currentMaterial.usagePerPorsi} onChange={(e) => c.setCurrentMaterial({...c.currentMaterial, usagePerPorsi: e.target.value})} />
                             </div>
                          </div>
                          <Button onClick={c.handleAddMaterial} disabled={!c.currentMaterial.name || !c.currentMaterial.packPrice} className="w-full h-11 bg-orange-600 text-white rounded-xl font-black uppercase text-[9px] shadow-lg gap-2"><Plus className="h-4 w-4" /> Tambah Bahan</Button>
                       </div>
                    </Card>
                    <div className="space-y-3">
                       {c.aiForm.materials.map((m) => (
                         <div key={m.id} className="p-4 bg-white rounded-2xl border border-orange-50 shadow-sm flex items-center justify-between group animate-in slide-in-from-right-2">
                            <div className="min-w-0">
                               <p className="text-[11px] font-black uppercase text-primary truncate">{m.name}</p>
                               <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1">Beli: {formatIDR(m.packPrice)} / Isi: {m.qtyPerPack} • Pakai: {m.usagePerPorsi}</p>
                            </div>
                            <button onClick={() => c.handleRemoveMaterial(m.id)} className="h-8 w-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"><X className="h-3.5 w-3.5" /></button>
                         </div>
                       ))}
                    </div>
                 </section>

                 {c.aiResult && (
                   <section className="space-y-6 animate-in zoom-in-95 duration-700">
                      <div className="flex items-center gap-3 px-2">
                         <h3 className="text-[11px] font-black uppercase text-green-600 tracking-[0.2em] flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" /> Analisis Strategis
                         </h3>
                         <div className="h-px bg-green-100 flex-1" />
                      </div>
                      <div className="grid sm:grid-cols-3 gap-4">
                         <ResultCard label="Modal (HPP)" value={c.aiResult.cogs} color="red" />
                         <ResultCard label="Saran Harga" value={c.aiResult.suggestedPrice} color="blue" />
                         <ResultCard label="Profit Bersih" value={c.aiResult.profitAmount} color="green" />
                      </div>
                      <Card className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
                         <CardHeader className="bg-green-600 text-white p-6"><div className="flex items-center gap-2"><Calculator className="h-5 w-5" /><CardTitle className="text-xs font-black uppercase tracking-widest">Rincian Kalkulasi</CardTitle></div></CardHeader>
                         <CardContent className="p-8 space-y-6">
                            <div className="p-5 bg-muted/20 rounded-2xl border-2 border-dashed border-primary/10"><p className="text-[12px] font-bold text-primary leading-relaxed uppercase italic">"{c.aiResult.breakdown}"</p></div>
                            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 space-y-3">
                               <div className="flex items-center gap-2 text-amber-700"><Target className="h-5 w-5" /><span className="text-[10px] font-black uppercase">Tips Strategi:</span></div>
                               <p className="text-[11px] font-medium text-amber-900 leading-relaxed uppercase">{c.aiResult.tips}</p>
                            </div>
                         </CardContent>
                      </Card>
                   </section>
                 )}
              </div>
           </ScrollArea>
           <footer className="p-4 sm:p-6 bg-white border-t shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-30">
              <Button className="w-full h-18 bg-orange-600 text-white rounded-[1.5rem] font-black uppercase text-xs shadow-2xl active:scale-95 transition-all gap-4 py-8" disabled={c.loadingAI || !c.aiForm.productName || c.aiForm.materials.length === 0} onClick={c.handleRunAICalculator}>
                 {c.loadingAI ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6" />} Analisis Strategi AI
              </Button>
           </footer>
        </div>
      )}

      {/* RECEIPT MODAL */}
      <Dialog open={c.showReceipt} onOpenChange={c.setShowReceipt}>
        <DialogContent className="w-[94vw] sm:max-w-md rounded-2xl p-0 border-none shadow-2xl overflow-hidden bg-white">
           <DialogHeader className="p-6 bg-slate-900 text-white text-center shrink-0">
              <DialogTitle className="text-xl font-black uppercase tracking-tighter">Nota Transaksi Toko</DialogTitle>
           </DialogHeader>
           <div className="p-8 bg-[#F0F0F0] flex justify-center">
              <div id="thermal-receipt-area" className="w-full max-w-[280px] bg-white shadow-xl p-6 font-mono text-[11px] leading-tight text-slate-800 space-y-4 ring-1 ring-slate-200">
                 <div className="text-center space-y-1">
                    <h4 className="font-black text-sm uppercase">JASTIP SIAU UMKM</h4>
                    <p className="text-[9px] uppercase">{format(new Date(), 'dd MMMM yyyy HH:mm', { locale: id })}</p>
                    <p className="border-b border-dashed border-slate-300 pt-2"></p>
                 </div>
                 <div className="space-y-2">
                    {c.terminalItems.map((it) => (
                      <div key={it.id} className="space-y-0.5">
                         <p className="font-black uppercase">{it.name}</p>
                         <div className="flex justify-between pl-2">
                            <span>{it.quantity} x {formatIDR(it.price)}</span>
                            <span>{formatIDR(it.price * it.quantity)}</span>
                         </div>
                      </div>
                    ))}
                 </div>
                 <div className="border-t border-dashed border-slate-300 pt-4 space-y-1">
                    <div className="flex justify-between font-black">
                       <span>SUBTOTAL</span>
                       <span>{formatIDR(c.terminalTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black border-t border-slate-900 pt-2 mt-2">
                       <span>TOTAL AKHIR</span>
                       <span>{formatIDR(c.terminalTotal)}</span>
                    </div>
                 </div>
              </div>
           </div>
           <div className="p-6 bg-white border-t space-y-3 no-print">
              <Button onClick={() => window.print()} className="w-full h-14 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] gap-3 active:scale-95 transition-all"><Printer className="h-5 w-5" /> Cetak Struk</Button>
              <Button onClick={() => c.setShowReceipt(false)} variant="ghost" className="w-full h-10 font-black uppercase text-[9px] text-muted-foreground">Tutup</Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatsCard({ label, value, sub, icon: Icon, color }: any) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    red: "bg-red-50 text-red-600 border-red-100",
    green: "bg-green-50 text-green-700 border-green-100"
  };
  return (
    <Card className={cn("border-none shadow-sm rounded-2xl p-4 space-y-4 bg-white ring-1 ring-primary/5 hover:shadow-md transition-all", colors[color as keyof typeof colors])}>
       <div className="flex items-center justify-between">
          <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">{label}</span>
          <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center shadow-sm", colors[color as keyof typeof colors])}>
             <Icon className="h-3.5 w-3.5" />
          </div>
       </div>
       <div>
          <h3 className={cn("text-[15px] font-black tracking-tighter tabular-nums", color === 'red' ? 'text-red-600' : 'text-primary')}>{formatIDR(value)}</h3>
          <p className="text-[7px] font-bold text-muted-foreground uppercase mt-1 opacity-60 truncate">{sub}</p>
       </div>
    </Card>
  );
}

function ResultCard({ label, value, color }: any) {
  const colors = {
    red: "bg-red-50 border-red-100 text-red-700",
    blue: "bg-blue-50 border-blue-100 text-blue-700",
    green: "bg-green-50 border-green-100 text-green-700"
  };
  return (
    <Card className={cn("border-none shadow-sm rounded-2xl p-4 text-center ring-1", colors[color as keyof typeof colors])}>
       <p className="text-[7px] font-black uppercase tracking-widest mb-1 opacity-60">{label}</p>
       <h4 className="text-[14px] font-black tracking-tight">{formatIDR(value || 0)}</h4>
    </Card>
  );
}
