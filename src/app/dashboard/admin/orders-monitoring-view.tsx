
"use client";

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
  ArrowUpDown, Clock, Phone, Package, AlertCircle
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { openWhatsAppChat } from "@/lib/whatsapp";
import { formatIDR } from "@/lib/currency";

/**
 * VIEW (MVC): Monitoring Order Admin View (RECURSIVE DELETE)
 * SOP: Transparansi penuh alasan penolakan/pembatalan dan pemusnahan berantai.
 */
export default function AdminOrdersMonitoringView() {
  const {
    orders, loading, search, setSearch, sortOrder, setSortOrder,
    selectedIds, toggleSelect, selectAll, selectedOrderForSanction,
    setSelectedOrderForSanction, isDeleting, showBulkDeleteConfirm,
    setShowBulkDeleteConfirm, executeBulkDelete, applySanction
  } = useAdminOrderController();

  const handleWhatsAppMonitor = (o: any) => {
    const itemsList = o.items?.map((it: string) => `• ${it}`).join('\n') || '-';
    const waMsg = `📢 *MONITORING JASTIP SIAU* 🏝️\n\nHalo Kurir *${o.courierName}* 👋,\nAdmin sedang memantau pesanan aktif berikut untuk memastikan kelancaran amanah:\n\n👤 *PEMESAN*: ${o.userName}\n📦 *ISI TITIPAN*:\n${itemsList}\n💰 *TOTAL TAGIHAN*: *${formatIDR(o.totalAmount || 0)}*\n\n━━━━━━━━━━━━━━━━\n📍 *STATUS SAAT INI*: _${o.status.toUpperCase()}_\n━━━━━━━━━━━━━━━━\n\nSOP: Mohon tuntaskan amanah ini dengan jujur dan tepat waktu. 🙏✨`;
    
    openWhatsAppChat(o.courierWhatsapp, waMsg);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
      <Loader2 className="animate-spin text-primary opacity-20" />
    </div>
  );

  return (
    <FlexibleFrame
      title="Monitoring Order"
      subtitle={`Total ${orders.length} Transaksi Terdeteksi`}
      icon={Truck}
      variant="admin"
      controls={
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className={cn("h-2 w-2 rounded-full", selectedIds.length > 0 ? "bg-red-500 animate-pulse" : "bg-primary/20")} />
               <span className="text-[10px] font-black uppercase text-primary tracking-widest">{selectedIds.length} Pesanan Terpilih</span>
            </div>
            {selectedIds.length > 0 && (
              <Button onClick={() => setShowBulkDeleteConfirm(true)} variant="destructive" size="sm" className="h-8 text-[9px] font-black uppercase shadow-lg rounded-xl gap-2"><Trash2 className="h-3.5 w-3.5" /> Hapus Berantai</Button>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <div className="relative group"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="Cari Nama Pelanggan atau ID Ref..." className="pl-10 h-10 text-[11px] font-bold bg-muted/20 border-none rounded-xl" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <div className="flex items-center gap-2">
              <Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
                <SelectTrigger className="h-10 flex-1 text-[9px] font-black uppercase bg-white border-primary/10 rounded-xl"><div className="flex items-center gap-2"><ArrowUpDown className="h-3.5 w-3.5 text-primary" /><SelectValue /></div></SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-2xl"><SelectItem value="newest" className="text-[9px] font-black uppercase">Urutan Terbaru</SelectItem><SelectItem value="oldest" className="text-[9px] font-black uppercase">Urutan Terlama</SelectItem></SelectContent>
              </Select>
              <div className="flex items-center gap-2 bg-primary/5 px-4 h-10 rounded-xl border border-primary/10"><Checkbox id="all-orders" checked={orders.length > 0 && selectedIds.length === orders.length} onCheckedChange={selectAll} className="h-5 w-5 border-primary/20 rounded-md" /><label htmlFor="all-orders" className="text-[9px] font-black uppercase text-primary cursor-pointer select-none">Pilih Semua</label></div>
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-4 pb-48">
        {orders.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-[2.5rem] border-dashed border-2 opacity-30 flex flex-col items-center justify-center space-y-4"><Package className="h-12 w-12" /><p className="text-[11px] font-black uppercase tracking-widest">Tidak ada pesanan aktif</p></div>
        ) : (
          orders.map((o) => (
            <Card key={o.id} className={cn(
              "overflow-hidden border-none shadow-md bg-white rounded-[1.8rem] group", 
              selectedIds.includes(o.id) && "ring-2 ring-primary", 
              o.status === 'cancelled' && "border-l-4 border-destructive",
              o.isReportedUnpaid && "ring-2 ring-red-500"
            )}>
              <div className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Checkbox checked={selectedIds.includes(o.id)} onCheckedChange={() => toggleSelect(o.id)} className="h-6 w-6 rounded-lg border-primary/10 shadow-inner" />
                    <div className="min-w-0">
                       <h3 className="text-[14px] font-black uppercase text-primary truncate leading-tight">{o.userName}</h3>
                       <div className="flex items-center gap-2 mt-1 opacity-60"><span className="text-[8px] font-mono font-black uppercase bg-muted px-1.5 py-0.5 rounded">#{o.id.slice(-6)}</span><div className="flex items-center gap-1 text-[7px] font-bold uppercase tracking-widest"><Clock className="h-2.5 w-2.5" />{o.createdAt?.seconds ? format(new Date(o.createdAt.seconds * 1000), 'dd MMM • HH:mm', { locale: id }) : '-'}</div></div>
                    </div>
                  </div>
                  <Badge className={cn(
                    "text-[8px] px-2.5 h-6 font-black uppercase border-none text-white", 
                    o.status === 'completed' ? 'bg-green-600' : 
                    o.status === 'pending' ? 'bg-amber-500' : 
                    o.status === 'cancelled' ? 'bg-destructive' : 'bg-blue-500'
                  )}>{o.status}</Badge>
                </div>

                {/* SOP LOG PEMBATALAN: Transparansi Alasan */}
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

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-dashed border-primary/5">
                  <div className="bg-muted/30 p-2.5 rounded-2xl border border-white flex items-center gap-3"><Truck className="h-4 w-4 text-primary shrink-0" /><div className="min-w-0 flex-1"><p className="text-[7px] font-black text-muted-foreground uppercase leading-none mb-0.5">Kurir:</p><p className="text-[10px] font-black text-primary truncate uppercase">{o.courierName || "MENCARI..."}</p></div></div>
                  <div className="bg-primary/5 p-2.5 rounded-2xl border border-primary/5 flex items-center gap-3 justify-end text-right"><div className="min-w-0 flex-1"><p className="text-[7px] font-black text-primary/60 uppercase leading-none mb-0.5">Tagihan:</p><p className="text-[11px] font-black text-primary">{formatIDR(o.totalAmount || 0)}</p></div><Package className="h-4 w-4 text-primary shrink-0" /></div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5">{o.isReportedUnpaid && <Badge className="bg-red-600 text-white text-[7px] font-black uppercase border-none animate-pulse">Pasal 378</Badge>}<Badge variant="outline" className="text-[7px] font-black uppercase border-primary/10 text-muted-foreground bg-white">Verifikasi Aman</Badge></div>
                  <div className="flex items-center gap-2">
                    <Popover><PopoverTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 text-primary rounded-xl border border-primary/5 bg-white"><Info className="h-4 w-4" /></Button></PopoverTrigger><PopoverContent className="w-64 p-5 rounded-[2rem] shadow-2xl border-none"><div className="space-y-4"><div className="flex items-center gap-2 border-b border-dashed pb-2"><Package className="h-4 w-4 text-primary" /><span className="font-black uppercase text-[10px] text-primary">Rincian Titipan</span></div><div className="space-y-1.5">{o.items?.map((it: string, i: number) => (<div key={i} className="flex justify-between text-[10px] font-bold uppercase italic text-muted-foreground bg-muted/20 p-2 rounded-lg"><span>• {it}</span><span>{o.itemPrices?.[i] ? formatIDR(o.itemPrices[i]) : '-'}</span></div>))}</div><div className="pt-3 border-t border-dashed flex justify-between font-black text-[11px] text-primary"><span>TOTAL AKHIR:</span><span>{formatIDR(o.totalAmount || 0)}</span></div></div></PopoverContent></Popover>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground rounded-xl border border-muted/20 bg-white"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl shadow-2xl border-none p-1.5 w-52">
                        <DropdownMenuItem className="text-green-600 font-black uppercase text-[9px] p-3 cursor-pointer rounded-xl hover:bg-green-50 gap-2" onClick={() => handleWhatsAppMonitor(o)} disabled={!o.courierWhatsapp}><Phone className="h-3.5 w-3.5" /> Chat WA (Monitor)</DropdownMenuItem>
                        <DropdownMenuItem className="text-purple-600 font-black uppercase text-[9px] p-3 cursor-pointer rounded-xl hover:bg-purple-50 gap-2" onClick={() => setSelectedOrderForSanction(o)}><ShieldAlert className="h-3.5 w-3.5" /> Investigasi</DropdownMenuItem>
                        <div className="h-px bg-muted my-1" />
                        <DropdownMenuItem className="text-destructive font-black uppercase text-[9px] p-3 cursor-pointer rounded-xl hover:bg-destructive/5 gap-2" onClick={() => { toggleSelect(o.id); setShowBulkDeleteConfirm(true); }}><Trash2 className="h-3.5 w-3.5" /> Hapus Berantai</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <AlertDialogContent className="w-[92vw] rounded-[2.5rem] p-8 border-none shadow-2xl animate-in zoom-in-95"><AlertDialogHeader><div className="mx-auto h-20 w-20 rounded-[2rem] bg-destructive/10 flex items-center justify-center mb-6"><Trash2 className="h-10 w-10 text-destructive" /></div><AlertDialogTitle className="text-2xl font-black uppercase text-center text-primary italic">Hapus Berantai?</AlertDialogTitle><AlertDialogDescription className="text-center text-[11px] font-bold uppercase text-muted-foreground mt-4 px-2 leading-relaxed">DANGER: Seluruh data pesanan, chat, dan riwayat pesan terkait akan dimusnahkan secara fisik dari database.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-8"><AlertDialogCancel className="h-14 rounded-2xl font-black uppercase text-[10px]">Batal</AlertDialogCancel><AlertDialogAction className="h-14 rounded-2xl font-black uppercase text-[10px] bg-destructive text-white shadow-xl active:scale-95 transition-all gap-2" onClick={executeBulkDelete} disabled={isDeleting}>{isDeleting ? <Loader2 className="animate-spin h-5 w-5" /> : "Ya, Musnahkan"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!selectedOrderForSanction} onOpenChange={(v) => !v && setSelectedOrderForSanction(null)}>
        <AlertDialogContent className="w-[92vw] rounded-[2.5rem] p-8 border-none shadow-2xl animate-in zoom-in-95"><AlertDialogHeader><div className="mx-auto h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center mb-6"><ShieldAlert className="h-10 w-10 text-purple-600" /></div><AlertDialogTitle className="text-2xl font-black uppercase text-center text-primary leading-none">Proses Investigasi?</AlertDialogTitle><AlertDialogDescription className="text-[10px] font-bold text-muted-foreground text-center uppercase mt-6">Kurir <b>{selectedOrderForSanction?.courierName}</b> akan masuk tahap audit admin otomatis.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-8"><AlertDialogCancel className="h-14 rounded-2xl font-black uppercase text-[10px]">Batal</AlertDialogCancel><AlertDialogAction className="h-14 rounded-2xl font-black uppercase text-[10px] bg-purple-600 text-white shadow-lg active:scale-95 transition-all" onClick={applySanction}>Terapkan Sanksi</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </FlexibleFrame>
  );
}
