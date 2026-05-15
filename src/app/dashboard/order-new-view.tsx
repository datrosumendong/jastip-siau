"use client";

/**
 * VIEW (MVC): Buat Order Baru (SOP V12.500 - KETERANGAN RESTORED)
 * SOP: Memulihkan kolom input Keterangan (Notes) untuk kejelasan pesanan warga.
 * FIX: Integrasi Textarea Keterangan sebelum tombol konfirmasi.
 */

import { useNewOrderController } from '@/hooks/controllers/use-new-order-controller';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, Plus, Trash2, ArrowLeft, Loader2, 
  MapPin, MapPinned, Phone, Gavel, Store, PlusCircle, Info, ClipboardList
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { cn } from '@/lib/utils';

const LocationPicker = dynamic(() => import('@/components/location-picker'), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-muted animate-pulse rounded-2xl flex items-center justify-center font-bold text-[10px] uppercase">Memuat Peta...</div>
});

export default function OrderNewView() {
  const c = useNewOrderController();

  if (c.loadingCourier) return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <Loader2 className="animate-spin text-primary h-10 w-10 opacity-20" />
    </div>
  );

  return (
    <FlexibleFrame
      title="Buat Order"
      subtitle="Otoritas Pemesanan Amanah"
      icon={ShoppingBag}
      variant="member"
      controls={
        <Button variant="ghost" size="sm" onClick={() => c.setView('couriers')} className="h-8 text-[9px] font-black uppercase text-primary hover:bg-primary/5">
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Kembali
        </Button>
      }
    >
      <div className="space-y-4 pb-32">
        <Card className="border-none shadow-md rounded-2xl overflow-hidden bg-white animate-in slide-in-from-top-2">
          <CardContent className="p-4 flex items-center gap-4">
             <Avatar className="h-12 w-12 border-2 border-primary/10 shadow-sm">
                <AvatarImage src={c.courierProfile?.imageUrl} className="object-cover" />
                <AvatarFallback className="bg-primary/5 text-primary text-xs">{(c.courierProfile?.fullName || "K").charAt(0)}</AvatarFallback>
             </Avatar>
             <div className="flex-1 min-w-0">
                <p className="text-[7px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Kurir Pilihan:</p>
                <h3 className="text-[14px] font-black text-primary uppercase truncate">{c.courierProfile?.fullName}</h3>
                <Badge className="mt-1 bg-green-50 text-green-700 border-none text-[7px] font-black px-2 py-0.5 uppercase">Radar Aktif</Badge>
             </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="border-none shadow-md rounded-2xl bg-white overflow-hidden">
            <CardHeader className="bg-primary/[0.02] border-b p-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-inner"><ShoppingBag className="h-4 w-4" /></div>
                     <CardTitle className="text-[11px] font-black uppercase text-primary tracking-widest">Daftar Titipan</CardTitle>
                  </div>
                  {c.catalogItemsCount > 0 && <Badge className="bg-blue-600 text-white text-[7px] font-black border-none px-2 h-4">{c.catalogItemsCount} Katalog</Badge>}
               </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-3">
                {c.items.map((item, index) => {
                  const isCatalogItem = index < c.catalogItemsCount;
                  return (
                    <div key={index} className="flex gap-2 animate-in slide-in-from-right-1 duration-300">
                      <div className="relative flex-1">
                        <Input 
                          placeholder={isCatalogItem ? "" : "Tulis barang tambahan..."} 
                          className={cn(
                            "h-11 border-none rounded-xl font-bold text-xs px-4 shadow-inner transition-all",
                            isCatalogItem ? "bg-primary/[0.03] text-primary/70 font-black cursor-not-allowed border-l-4 border-primary" : "bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary/20"
                          )}
                          value={item}
                          onChange={(e) => c.handleItemChange(index, e.target.value)}
                          disabled={isCatalogItem}
                        />
                        {isCatalogItem && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Store className="h-3 w-3 text-primary/20" /></div>}
                      </div>
                      
                      {!isCatalogItem && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => c.handleRemoveItem(index)} 
                          className="h-11 w-11 text-destructive hover:bg-destructive/5 rounded-xl shrink-0 border border-destructive/5"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <Button 
                variant="outline" 
                onClick={c.handleAddItem} 
                className="w-full h-11 border-2 border-dashed border-primary/20 text-primary font-black uppercase text-[9px] rounded-xl hover:bg-primary/5 active:scale-95 transition-all gap-2"
              >
                <PlusCircle className="h-4 w-4" /> Tambah Pesanan Luar Katalog
              </Button>

              <div className="pt-4 space-y-2 border-t border-dashed">
                 <Label className="text-[10px] font-black uppercase text-primary ml-1 flex items-center gap-2">
                    <ClipboardList className="h-3.5 w-3.5" /> Keterangan Khusus (SOP)
                 </Label>
                 <Textarea 
                   placeholder="Contoh: Titip belikan es batu 2 bungkus, atau titip ambil paket di J&T..."
                   className="min-h-[100px] bg-muted/20 border-none rounded-2xl p-4 font-bold text-xs shadow-inner leading-relaxed focus-visible:ring-1 focus-visible:ring-primary/20"
                   value={c.notes}
                   onChange={(e) => c.setNotes(e.target.value)}
                 />
              </div>

              {c.catalogItemsCount > 0 && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                   <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                   <p className="text-[8px] font-black text-blue-900 uppercase leading-relaxed">
                     SOP Jastip Siau: Item biru berasal dari katalog Mitra. Anda tetap bisa menambah pesanan tambahan dan catatan keterangan bagi kurir.
                   </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-md rounded-2xl bg-white overflow-hidden">
            <CardHeader className="p-4 bg-primary/[0.02] border-b flex flex-row items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner"><MapPinned className="h-4 w-4" /></div>
                  <CardTitle className="text-[11px] font-black uppercase text-primary tracking-widest">Titik Antar</CardTitle>
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black uppercase text-muted-foreground">Khusus?</span>
                  <Switch checked={c.useCustomAddress} onCheckedChange={c.setUseCustomAddress} className="scale-75" />
               </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {!c.useCustomAddress ? (
                <div className="space-y-3">
                   <div className="p-4 rounded-xl bg-muted/20 border border-primary/5 flex items-start gap-3 shadow-inner">
                      <MapPin className="h-5 w-5 text-primary shrink-0" />
                      <div className="min-w-0 flex-1">
                         <p className="text-[10px] font-black text-primary uppercase">Alamat Default</p>
                         <p className="text-[9px] font-medium text-muted-foreground uppercase mt-1 leading-relaxed line-clamp-2">{c.userProfile?.address || "Gunakan Alamat Profil"}</p>
                      </div>
                   </div>
                   <div className="rounded-xl overflow-hidden border shadow-sm ring-1 ring-primary/5">
                      <LocationPicker initialLat={c.userProfile?.latitude} initialLng={c.userProfile?.longitude} onLocationSelect={() => {}} height="180px" />
                   </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase text-primary ml-1">Detail Alamat</Label>
                    <Textarea className="min-h-[80px] bg-muted/20 border-none rounded-xl p-4 font-bold text-xs shadow-inner" value={c.customAddress} onChange={(e) => c.setCustomAddress(e.target.value)} placeholder="Contoh: Belakang Kantor Camat..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase text-primary ml-1">Pin GPS Pengantaran</Label>
                    <div className="rounded-xl overflow-hidden border shadow-sm">
                      <LocationPicker initialLat={c.userProfile?.latitude} initialLng={c.userProfile?.longitude} onLocationSelect={(la, ln) => { c.setCustomLat(la); c.setCustomLng(ln); }} height="200px" />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="pt-2 px-1">
          <Button 
            className="w-full h-16 font-black uppercase text-[11px] shadow-xl rounded-2xl gap-3 bg-primary text-white active:scale-95 transition-all" 
            onClick={c.handleOrder} 
            disabled={c.isSubmitting}
          >
            {c.isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Phone className="h-6 w-6" />} 
            Konfirmasi Pesanan Gabungan
          </Button>
          <div className="mt-4 flex items-start gap-2 opacity-40 justify-center">
             <Gavel className="h-3 w-3 mt-0.5" />
             <p className="text-[7px] font-black uppercase text-center max-w-[240px] leading-tight">SOP JASTIP SIAU: Dilarang membatalkan pesanan sepihak. Segala bentuk penipuan/gagal bayar diproses secara hukum Pasal 378 KUHP.</p>
          </div>
        </div>
      </div>
    </FlexibleFrame>
  );
}
