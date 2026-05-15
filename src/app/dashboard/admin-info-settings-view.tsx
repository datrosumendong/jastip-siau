
"use client";

/**
 * VIEW: Admin Info Settings (Mahakarya MVC)
 * Digunakan Admin untuk mengatur tampilan kontak dan peta GPS kantor resmi.
 */

import { useAdminSettingsController } from '@/hooks/controllers/use-admin-settings-controller';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings2, ArrowLeft, Save, Loader2, Navigation, 
  MapPin, Phone, Mail, Info 
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useView } from '@/context/view-context';

const LocationPicker = dynamic(() => import('@/components/location-picker'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-2xl flex items-center justify-center font-bold text-[10px] uppercase">Memuat Peta...</div>
});

export default function AdminInfoSettingsView() {
  const { goBack } = useView();
  const c = useAdminSettingsController();

  if (c.contactLoading) return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
    </div>
  );

  return (
    <FlexibleFrame
      title="Manajemen Web Info"
      subtitle="Atur Kontak & Titik Peta Kantor"
      icon={Settings2}
      variant="admin"
      controls={
        <Button onClick={goBack} variant="ghost" size="sm" className="h-8 text-[9px] font-black uppercase text-primary">
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Kembali
        </Button>
      }
    >
      <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white animate-in zoom-in-95 duration-500">
        <CardHeader className="p-8 bg-primary text-white">
           <CardTitle className="text-xl font-black uppercase tracking-tight">Data Kontak Resmi</CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
           <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-primary ml-1">WhatsApp Admin</Label>
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground">+62</div>
                   <Input 
                    className="h-12 bg-muted/20 border-none rounded-xl font-black text-xs pl-12" 
                    value={c.formData.whatsapp} 
                    onChange={(e) => c.setFormData({...c.formData, whatsapp: e.target.value})} 
                   />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-primary ml-1">Email Support</Label>
                <Input 
                  className="h-12 bg-muted/20 border-none rounded-xl font-black text-xs px-4" 
                  value={c.formData.email} 
                  onChange={(e) => c.setFormData({...c.formData, email: e.target.value})} 
                />
              </div>
           </div>

           <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-primary ml-1">Alamat Tertulis Lengkap</Label>
              <Textarea 
                className="min-h-[100px] bg-muted/20 border-none rounded-2xl p-4 font-bold text-xs" 
                value={c.formData.address} 
                onChange={(e) => c.setFormData({...c.formData, address: e.target.value})} 
              />
           </div>

           <div className="space-y-6 pt-4 border-t border-dashed">
              <div className="flex items-center justify-between">
                 <Label className="text-[11px] font-black uppercase text-primary flex items-center gap-2">
                    <Navigation className="h-4 w-4" /> Titik GPS Kantor
                 </Label>
                 <Button variant="outline" size="sm" onClick={c.handleGetGPS} disabled={c.locating} className="h-9 px-6 text-[10px] font-black uppercase rounded-xl">
                    {c.locating ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Navigation className="h-3 w-3 mr-1.5" />} Update GPS
                 </Button>
              </div>
              <div className="p-1 rounded-[2.5rem] bg-muted/20 border-2 border-dashed border-primary/10 overflow-hidden shadow-inner">
                 <LocationPicker 
                   initialLat={c.formData.latitude} 
                   initialLng={c.formData.longitude} 
                   onLocationSelect={(lat, lng) => c.setFormData({...c.formData, latitude: lat, longitude: lng})} 
                   height="300px" 
                 />
              </div>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                 <Info className="h-5 w-5 text-blue-600 shrink-0" />
                 <p className="text-[9px] font-bold text-blue-800 uppercase italic">Klik pada peta di atas untuk mengatur posisi kantor pusat yang akan ditampilkan di halaman Info SOP.</p>
              </div>
           </div>
        </CardContent>
        <CardFooter className="p-8 bg-muted/5 border-t">
           <Button className="w-full h-16 bg-primary rounded-2xl font-black uppercase text-xs shadow-2xl gap-3" onClick={c.handleSave} disabled={c.loading}>
              {c.loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />} Simpan Konfigurasi Web
           </Button>
        </CardFooter>
      </Card>
    </FlexibleFrame>
  );
}
