"use client";

/**
 * VIEW (MVC): Monitoring Order Admin (SOP ALL-ACCESS V16.300)
 * SOP: Penegakan kedaulatan audit dengan tampilan SELURUH database secara default.
 * FIX: Menghadirkan kembali AlertDialog Investigasi yang hilang untuk aktivasi sanksi Kurir.
 * FIX: Menggunakan onSelect pada menu untuk menjamin responsivitas tap di smartphone.
 */

import { useAdminOrderController } from "@/hooks/controllers/use-admin-order-controller";
import { FlexibleFrame } from "@/components/dashboard/flexible-frame";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  Loader2, Search, Truck, Info, ShieldAlert, Trash2, MoreVertical, 
  ArrowUpDown, Clock, Phone, Package, ShoppingBag, MessageSquare, Filter, AlertCircle
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { openWhatsAppChat } from "@/lib/whatsapp";
import { formatIDR } from "@/lib/currency";
import { useView } from "@/context/view-context";

export default function AdminOrdersView() {
  const { forceUnlockUI, setView } = useView();
  const c = useAdminOrderController();

  const handleWhatsAppMonitor = (o: any) => {
    const itemsList = o.items?.map((it: string) => `• ${it}`).join('\n') || '-';
    const waMsg = `📢 *MONITORING JASTIP SIAU* 🏝️\n\nHalo Kurir *${o.courierName}* 👋,\nAdmin sedang memantau pesanan aktif berikut:\n\n👤 *PEMESAN*: ${o.userName}\n📦 *ISI*: ${itemsList}\n💰 *TOTAL*: *${formatIDR(o.totalAmount || 0)}*\n\nSOP: Mohon tuntaskan amanah ini dengan jujur. 🙏✨`;
    openWhatsAppChat(o.courierWhatsapp, waMsg);
  };

  const handleGoToChat = (chatId: string) => {
    if (!chatId) return;
    forceUnlockUI();
    setView('chat_view', { id: chatId });
    setTimeout(forceUnlockUI, 150);
  };

  if (c.loading && c.orders.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
      <Loader2 className="animate-spin text-primary opacity-20 h-10 w-10" />
      <p className="text-[10px] font-black uppercase text-primary/40 animate-pulse">Menghubungkan Radar Monitoring...</p>
    </div>
  );

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col">
      <FlexibleFrame
        title="Monitoring Order"
        subtitle={`Terdeteksi ${c.orders.length} Transaksi di Database`}
        icon={Truck}
        variant="admin"
        controls={
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 bg-muted/20 p-2 rounded-xl border border-primary/5 shadow-inner">
               <div className="space-y-1">
                  <span className="text-[7px] font-black text-primary/40 uppercase ml-1">Tahun</span>
                  <Select value={c.selectedYear} onValueChange={c.setSelectedYear}>
                     <SelectTrigger className="h-8 text-[9px] font-black uppercase bg-white border-primary/10 rounded-lg shadow-sm">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="rounded-xl border-none shadow-2xl">
                        <SelectItem value="0" className="text-[10px] font-black uppercase text-blue-600">SEMUA TAHUN</SelectItem>
                        {c.years.map(y => <SelectItem key={y} value={y} className="text-[10px] font-black uppercase">{y}</SelectItem>)}
                     </SelectContent>
                  </Select>
               </div>

               <div className="space-y-1">
                  <span className="text-[7px] font-black text-primary/40 uppercase ml-1">Bulan</span>
                  <Select value={c.selectedMonth} onValueChange={c.setSelectedMonth}>
                     <SelectTrigger className="h-8 text-[9px] font-black uppercase bg-white border-primary/10 rounded-lg shadow-sm">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="rounded-xl border-none shadow-2xl">
                        <SelectItem value="0" className="text-[10px] font-black uppercase text-blue-600">SEMUA BULAN</SelectItem>
                        {c.months.map(m => <SelectItem key={m.id} value={m.id} className="text-[10px] font-black uppercase">{m.name}</SelectItem>)}
                     </SelectContent>
                  </Select>
               </div>

               <div className="space-y-1">
                  <span className="text-[7px] font-black text-primary/40 uppercase ml-1">Tanggal</span>
                  <Select value={c.selectedDay} onValueChange={c.setSelectedDay}>
                     <SelectTrigger className="h-8 text-[9px] font-black uppercase bg-white border-primary/10 rounded-lg shadow-sm">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="rounded-xl border-none shadow-2xl">
                        <SelectItem value="0" className="text-[10px] font-black uppercase text-blue-600">SEMUA HARI</SelectItem>
                        {c.days.map(d => <SelectItem key={d} value={d} className="text-[10px] font-black uppercase">{d}</SelectItem>)}
                     </SelectContent>
                  </Select>
               </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className={cn("h-2 w-2 rounded-full", c.selectedIds.length > 0 ? "bg-red-500 animate-pulse" : "bg-primary/20")} />
                 <span className="text-[9px] font-black uppercase text-primary tracking-widest">{c.selectedIds.length} Baris Terpilih</span>
              </div>
              {c.selectedIds.length > 0 && (
                <Button onClick={() => { forceUnlockUI(); c.setShowBulkDeleteConfirm(true); }} variant="destructive" size="sm" className="h-8 text-[9px] font-black uppercase shadow-lg rounded-xl gap-2 active:scale-95 transition-all"><Trash2 className="h-3.5 w-3.5" /> Musnahkan Data</Button>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="relative group"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="Cari Pelanggan, Kurir, UMKM atau ID..." className="pl-10 h-10 text-[11px] font-bold bg-muted/20 border-none rounded-xl shadow-inner focus-visible:ring-1 focus-visible:ring-primary/20" value={c.search} onChange={(e) => c.setSearch(e.target.value)} /></div>
              <div className="flex items-center gap-2">
                <Select value={c.sortOrder} onValueChange={(v: any) => c.setSortOrder(v)}>
                  <SelectTrigger className="h-10 flex-1 text-[9px] font-black uppercase bg-white border-primary/10 rounded-xl shadow-sm"><div className="flex items-center gap-2"><ArrowUpDown className="h-3.5 w-3.5 text-primary" /><SelectValue /></div></SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl"><SelectItem value="newest" className="text-[9px] font-black uppercase">Terbaru</SelectItem><SelectItem value="oldest" className="text-[9px] font-black uppercase">Terlama</SelectItem></SelectContent>
                </Select>
                <div className="flex items-center gap-2 bg-primary/5 px-4 h-10 rounded-xl border border-primary/10 shadow-inner"><Checkbox id="all-orders" checked={c.orders.length > 0 && c.selectedIds.length === c.orders.length} onCheckedChange={c.selectAll} className="h-5 w-5 border-primary/20 rounded-md" /><label htmlFor="all-orders" className="text-[9px] font-black uppercase text-primary cursor-pointer select-none">Pilih Semua</label></div>
              </div>
            </div>
          </div>
        }
      >
        <div className="space-y-4 pb-48">
          {c.orders.length === 0 ? (
            <div className="py-32 text-center bg-white rounded-[2.5rem] border-dashed border-2 opacity-30 flex flex-col items-center justify-center space-y-4">
               <Filter className="h-12 w-12 text-primary opacity-20" />
               <p className="text-[10px] font-black uppercase tracking-widest px-10 leading-relaxed text-center">
                 Database kosong atau tidak ada data pada periode ini.
               </p>
            </div>
          ) : (
            c.orders.map((o) => (
              <Card key={o.id} className={cn(
                "overflow-hidden border-none shadow-md bg-white rounded-[1.8rem] group transition-all", 
                c.selectedIds.includes(o.id) && "ring-2 ring-primary bg-primary/[0.01]", 
                o.status === 'cancelled' && "border-l-4 border-destructive",
                o.isReportedUnpaid && "ring-2 ring-red-500 shadow-red-100"
              )}>
                <div className="p-4 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Checkbox checked={c.selectedIds.includes(o.id)} onCheckedChange={() => c.toggleSelect(o.id)} className="h-6 w-6 rounded-lg border-primary/10 shadow-inner" />
                      <div className="min-w-0">
                         <h3 className="text-[14px] font-black uppercase text-primary truncate leading-tight">{o.userName}</h3>
                         <div className="flex items-center gap-2 mt-1 opacity-60"><span className="text-[8px] font-mono font-black uppercase bg-muted px-1.5 py-0.5 rounded shadow-sm">#{o.id.slice(-6)}</span><div className="flex items-center gap-1 text-[7px] font-bold uppercase tracking-widest"><Clock className="h-2.5 w-2.5" />{o.createdAt?.seconds ? format(new Date(o.createdAt.seconds * 1000), 'dd MMM yy • HH:mm', { locale: id }) : '-'}</div></div>
                      </div>
                    </div>
                    <Badge className={cn(
                      "text-[8px] px-2.5 h-6 flex items-center font-black uppercase border-none text-white shadow-sm", 
                      o.status === 'completed' ? 'bg-green-600' : 
                      o.status === 'pending' ? 'bg-amber-500' : 
                      o.status === 'cancelled' ? 'bg-destructive' : 'bg-primary'
                    )}>{o.status}</Badge>
                  </div>

                  {o.status === 'cancelled' && o.cancelReason && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-2xl italic animate-in fade-in zoom-in-95">
                       <div className="flex items-start gap-2">
                          <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                          <p className="text-[9px] font-bold text-destructive uppercase leading-relaxed">
                             Log Pembatalan: {o.cancelReason}
                          </p>
                       </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-dashed border-primary/10">
                    <div className="bg-muted/30 p-2.5 rounded-2xl border border-white flex flex-col gap-1 shadow-inner">
                       <span className="text-[7px] font-black text-muted-foreground uppercase leading-none">Kurir:</span>
                       <p className="text-[10px] font-black text-primary truncate uppercase">{o.courierName || "MENCARI..."}</p>
                    </div>
                    <div className="bg-orange-50/50 p-2.5 rounded-2xl border border-orange-100 flex flex-col gap-1 shadow-inner">
                       <span className="text-[7px] font-black text-orange-800 uppercase leading-none">UMKM:</span>
                       <p className="text-[10px] font-black text-orange-900 truncate uppercase">{o.umkmName || "BEBAS"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5">{o.isReportedUnpaid && <Badge className="bg-red-600 text-white text-[7px] font-black uppercase border-none animate-pulse shadow-lg">Pasal 378</Badge>}<div className="flex flex-col"><span className="text-[7px] font-black text-muted-foreground uppercase">Tagihan:</span><span className="text-[11px] font-black text-primary tabular-nums">{formatIDR(o.totalAmount || 0)}</span></div></div>
                    <div className="flex items-center gap-2">
                      <Popover><PopoverTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 text-primary rounded-xl border border-primary/5 bg-white shadow-sm active:scale-90"><Info className="h-4 w-4" /></Button></PopoverTrigger><PopoverContent className="w-64 p-5 rounded-[1.8rem] shadow-2xl border-none animate-in zoom-in-95"><div className="space-y-4"><div className="flex items-center gap-2 border-b border-dashed border-primary/10 pb-3"><Package className="h-4 w-4 text-primary" /><span className="font-black uppercase text-[10px] text-primary tracking-widest">Detail Produk</span></div><div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">{o.items?.map((it: string, i: number) => (<div key={i} className="flex justify-between text-[10px] font-bold uppercase italic text-muted-foreground bg-muted/20 p-2.5 rounded-xl border border-white"><span>• {it}</span><span>{o.itemPrices?.[i] ? formatIDR(o.itemPrices[i]) : '-'}</span></div>))}</div><div className="pt-3 border-t border-dashed border-primary/10 flex justify-between font-black text-[12px] text-primary"><span>TOTAL AKHIR:</span><span>{formatIDR(o.totalAmount || 0)}</span></div></div></PopoverContent></Popover>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><button className="h-10 w-10 flex items-center justify-center rounded-xl border border-muted/20 bg-white shadow-sm active:scale-90 transition-all"><MoreVertical className="h-5 w-5 text-muted-foreground" /></button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl shadow-2xl border-none p-1.5 w-56 z-[160]" onInteractOutside={() => forceUnlockUI()}>
                          <DropdownMenuItem className="text-green-600 font-black uppercase text-[9px] p-3.5 cursor-pointer rounded-xl hover:bg-green-50 gap-2.5" onSelect={() => { forceUnlockUI(); handleWhatsAppMonitor(o); }} disabled={!o.courierWhatsapp}><Phone className="h-4 w-4" /> Hubungi WA (Monitor)</DropdownMenuItem>
                          <DropdownMenuItem className="text-primary font-black uppercase text-[9px] p-3.5 cursor-pointer rounded-xl hover:bg-primary/5 gap-2.5" onSelect={() => handleGoToChat(o.chatId)}><MessageSquare className="h-4 w-4" /> Masuk Chat Order</DropdownMenuItem>
                          <DropdownMenuItem className="text-purple-600 font-black uppercase text-[9px] p-3.5 cursor-pointer rounded-xl hover:bg-purple-50 gap-2.5" onSelect={(e) => { e.preventDefault(); forceUnlockUI(); c.setSelectedOrderForSanction(o); }}><ShieldAlert className="h-4 w-4" /> Investigasi & Sanksi</DropdownMenuItem>
                          <div className="h-px bg-muted my-1.5" />
                          <DropdownMenuItem className="text-destructive font-black uppercase text-[9px] p-3.5 cursor-pointer rounded-xl hover:bg-destructive/5 gap-2.5" onSelect={(e) => { e.preventDefault(); forceUnlockUI(); if (!c.selectedIds.includes(o.id)) c.toggleSelect(o.id); c.setShowBulkDeleteConfirm(true); }}><Trash2 className="h-4 w-4" /> Hapus Berantai</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </FlexibleFrame>

      {/* DIALOG: INVESTIGASI & SANKSI (V16.300) */}
      <AlertDialog open={!!c.selectedOrderForSanction} onOpenChange={(v) => { if(!v) { c.setSelectedOrderForSanction(null); forceUnlockUI(); } }}>
        <AlertDialogContent className="w-[92vw] rounded-[2.5rem] p-8 border-none shadow-2xl animate-in zoom-in-95 z-[200]">
          <AlertDialogHeader>
            <div className="mx-auto h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center mb-6">
              <ShieldAlert className="h-10 w-10 text-purple-600" />
            </div>
            <AlertDialogTitle className="text-2xl font-black uppercase text-center text-primary leading-none italic">Luncurkan Investigasi?</AlertDialogTitle>
            <AlertDialogDescription className="text-[10px] font-bold text-muted-foreground text-center uppercase mt-6 leading-relaxed">
              SOP V16.200: Kurir <b>{c.selectedOrderForSanction?.courierName}</b> akan masuk tahap lockdown. Seluruh hak penerimaan order baru akan dicabut sementara sampai Admin menutup tiket moderasi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-10">
            <AlertDialogCancel className="h-14 rounded-2xl font-black uppercase text-[10px] border-primary/10 bg-muted/20" onClick={() => { c.setSelectedOrderForSanction(null); forceUnlockUI(); }}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              className="h-14 rounded-2xl font-black uppercase text-[10px] bg-purple-600 text-white shadow-lg active:scale-95 transition-all" 
              onClick={c.applySanction}
              disabled={c.isDeleting}
            >
              {c.isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Terapkan Sanksi"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DIALOG: BULK DELETE */}
      <AlertDialog open={c.showBulkDeleteConfirm} onOpenChange={(v) => { if(!v) { c.setShowBulkDeleteConfirm(false); forceUnlockUI(); } }}>
        <AlertDialogContent className="w-[92vw] rounded-[2.5rem] p-8 border-none shadow-2xl animate-in zoom-in-95 z-[200]"><AlertDialogHeader><div className="mx-auto h-20 w-20 rounded-[2rem] bg-destructive/10 flex items-center justify-center mb-6"><Trash2 className="h-10 w-10 text-destructive" /></div><AlertDialogTitle className="text-2xl font-black uppercase text-center text-primary tracking-tighter italic">MUSNAHKAN BERANTAI?</AlertDialogTitle><AlertDialogDescription className="text-center text-[11px] font-bold uppercase text-muted-foreground mt-4 px-2 leading-relaxed">DANGER: Seluruh data pesanan dan riwayat pesan akan dimusnahkan secara fisik dari database Jastip Siau.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-10"><AlertDialogCancel className="h-14 rounded-2xl font-black uppercase text-[10px] border-primary/10 bg-muted/20" onClick={() => { c.setShowBulkDeleteConfirm(false); forceUnlockUI(); }}>Batal</AlertDialogCancel><AlertDialogAction className="h-14 rounded-2xl font-black uppercase text-[10px] bg-destructive text-white shadow-xl active:scale-95 transition-all gap-2" onClick={c.executeBulkDelete} disabled={c.isDeleting}>{c.isDeleting ? <Loader2 className="animate-spin h-5 w-5" /> : <Trash2 className="h-5 w-5" />} Ya, Musnahkan Sekarang</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
