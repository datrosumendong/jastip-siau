"use client";

/**
 * VIEW (MVC): Buat Order Baru (Pure UI)
 * Seluruh logika dipindahkan ke useNewOrderController.
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
import { ShoppingBag, Plus, Trash2, ArrowLeft, Loader2, MapPin, MapPinned, Phone, Gavel } from 'lucide-react';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/location-picker'), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-muted animate-pulse rounded-2xl flex items-center justify-center font-bold text-[10px] uppercase">Memuat Peta...</div>
});

export default function NewOrderPage() {
  const c = useNewOrderController();

  if (c.loadingCourier) return <div className="flex items-center justify-center h-screen bg-background"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-40 px-4 w-full animate-in fade-in duration-500">
      <header className="flex items-center gap-4 py-6 border-b">
        <Button variant="ghost" size="icon" onClick={() => c.setView('couriers')} className="h-10 w-10 text-primary rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-primary leading-none">Buat Order</h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Lengkapi rincian pesanan Anda.</p>
        </div>
      </header>

      <Card className="border-none shadow-md rounded-[2rem] overflow-hidden bg-white">
        <CardContent className="p-5 flex items-center gap-4">
           <Avatar className="h-14 w-14 border-2 border-primary/10">
              <AvatarImage src={c.courierProfile?.imageUrl} className="object-cover" />
              <AvatarFallback className="font-black bg-primary/5 text-primary">K</AvatarFallback>
           </Avatar>
           <div className="flex-1 min-w-0">
              <p className="text-[8px] font-black text-muted-foreground uppercase leading-none mb-1">Kurir Pelaksana:</p>
              <h3 className="text-sm font-black text-primary uppercase truncate">{c.courierProfile?.fullName}</h3>
              <Badge className="mt-1 bg-green-50 text-green-700 border-none text-[8px] font-black px-2 uppercase">Siap Melayani</Badge>
           </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="bg-primary/5 border-b p-6 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><ShoppingBag className="h-5 w-5" /></div>
               <CardTitle className="text-sm font-black uppercase text-primary">Rincian Barang</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              {c.items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input 
                    placeholder="Tulis barang..." 
                    className="h-12 bg-muted/20 border-none rounded-xl font-bold text-xs px-4"
                    value={item}
                    onChange={(e) => c.handleItemChange(index, e.target.value)}
                  />
                  {c.items.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => c.handleRemoveItem(index)} className="h-12 w-12 text-destructive rounded-xl">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button variant="outline" onClick={c.handleAddItem} className="w-full h-10 border-dashed border-primary/20 text-primary font-black uppercase text-[10px] rounded-xl">
              <Plus className="h-4 w-4 mr-2" /> Tambah Produk
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-6 border-b flex flex-row items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><MapPinned className="h-5 w-5" /></div>
                <CardTitle className="text-sm font-black uppercase text-primary">Titik Antar (GPS)</CardTitle>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Custom?</span>
                <Switch checked={c.useCustomAddress} onCheckedChange={c.setUseCustomAddress} />
             </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {!c.useCustomAddress ? (
              <div className="space-y-4">
                 <div className="p-5 rounded-3xl bg-muted/20 border-2 border-dashed flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-primary mt-1" />
                    <div className="flex-1 min-w-0">
                       <p className="text-[12px] font-black text-primary uppercase">Alamat Default</p>
                       <p className="text-[10px] font-medium text-muted-foreground uppercase mt-1 leading-relaxed">{c.userProfile?.address || "Belum diatur."}</p>
                    </div>
                 </div>
                 <div className="rounded-3xl overflow-hidden border shadow-inner">
                    <LocationPicker initialLat={c.userProfile?.latitude} initialLng={c.userProfile?.longitude} onLocationSelect={() => {}} height="200px" />
                 </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary ml-1">Detail Alamat Khusus</Label>
                  <Textarea className="min-h-[100px] bg-muted/20 border-none rounded-2xl p-4 font-bold text-xs" value={c.customAddress} onChange={(e) => c.setCustomAddress(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary ml-1">Pin Point Antar</Label>
                  <div className="rounded-[1.8rem] overflow-hidden border shadow-inner">
                    <LocationPicker initialLat={c.userProfile?.latitude} initialLng={c.userProfile?.longitude} onLocationSelect={(lt, ln) => { c.setCustomLat(lt); c.setCustomLng(ln); }} height="250px" />
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
              <Gavel className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-[8px] font-bold text-red-800 uppercase italic leading-relaxed">Dilarang membatalkan pesanan sepihak. Kegagalan bayar diproses hukum sesuai Pasal 378 KUHP.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <CardFooter className="fixed bottom-0 left-0 right-0 p-4 md:relative md:p-0 md:bg-transparent z-40 bg-[#F8FAFC]/80 backdrop-blur-md">
        <Button className="w-full h-16 font-black uppercase text-xs shadow-2xl rounded-[1.5rem] gap-3 bg-primary active:scale-95 transition-all max-w-2xl mx-auto" onClick={c.handleOrder} disabled={c.isSubmitting}>
          {c.isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Phone className="h-6 w-6" />} Pesan & Kirim Notifikasi
        </Button>
      </CardFooter>
    </div>
  );
}
