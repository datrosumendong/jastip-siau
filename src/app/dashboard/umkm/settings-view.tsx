"use client";

/**
 * VIEW: Pangkalan Bisnis UMKM (ULTRA COMPACT SOVEREIGN V33.000)
 * SOP: Penegakan arsitektur Full-Flush & Square Edition.
 * FIX: Menghilangkan spasi lebay (Anti-Enter) & Tombol Simpan Sticky.
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, Save, Store, Camera, Navigation, 
  MapPin, Power, Globe, ShieldCheck, Info, X, ChevronLeft
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { compressImage } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

const LocationPicker = dynamic(() => import('@/components/location-picker'), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-muted/20 animate-pulse flex items-center justify-center font-black text-[10px] uppercase">Menyiapkan Radar...</div>
});

export default function UMKMShopSettingsView() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const userDocRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: profile, loading: profileLoading } = useDoc(userDocRef, true);

  const [formData, setFormData] = useState({
    storeName: '',
    bio: '',
    storeImageUrl: '',
    latitude: 0,
    longitude: 0,
    address: '',
    isStoreOpen: true
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        storeName: profile.storeName || '',
        bio: profile.bio || '',
        storeImageUrl: profile.storeImageUrl || profile.imageUrl || '',
        latitude: profile.latitude || -2.7482,
        longitude: profile.longitude || 125.4056,
        address: profile.address || '',
        isStoreOpen: profile.isStoreOpen !== undefined ? profile.isStoreOpen : true
      });
    }
  }, [profile]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressing(true);
    try {
      const base64 = await compressImage(file, 400, 0.5);
      setFormData(prev => ({ ...prev, storeImageUrl: base64 }));
      toast({ title: "Citra Bisnis Dioptimalkan" });
    } catch (err) {
      toast({ title: "Gagal Proses Gambar", variant: "destructive" });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSave = async () => {
    if (!userDocRef) return;
    setLoading(true);
    try {
      await updateDoc(userDocRef, { ...formData, updatedAt: serverTimestamp() });
      toast({ title: "Identitas Bisnis Disinkronkan" });
    } catch (e) {
      toast({ title: "Kegagalan Sistem", variant: "destructive" });
    } finally { setLoading(false); }
  };

  if (profileLoading && !profile) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      <p className="text-[10px] font-black uppercase text-primary/40 animate-pulse">Sinkronisasi Pangkalan...</p>
    </div>
  );

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col bg-white">
      <FlexibleFrame
        title="Pangkalan Bisnis"
        subtitle="Otoritas Operasional UMKM"
        icon={Store}
        variant="umkm"
        square={true} 
        scrollable={false}
      >
        <ScrollArea className="flex-1 bg-white">
          <div className="flex flex-col min-h-full">
            
            {/* HERO IDENTITY: FULL FLUSH */}
            <header className={cn(
              "h-48 w-full transition-all duration-700 relative overflow-hidden flex items-end p-6",
              formData.isStoreOpen ? 'bg-slate-900' : 'bg-slate-500'
            )}>
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rotate-45 transform translate-x-20 -translate-y-20" />
              </div>
              
              <div className="relative z-10 flex items-center gap-6 w-full">
                 <div 
                  className="relative cursor-pointer group" 
                  onClick={() => !isCompressing && fileInputRef.current?.click()}
                 >
                    <div className="h-24 w-24 rounded-none bg-white border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center relative">
                      {formData.storeImageUrl ? (
                        <img src={formData.storeImageUrl} className="w-full h-full object-cover" alt="Logo" />
                      ) : (
                        <Store className="h-8 w-8 text-primary opacity-20" />
                      )}
                      {isCompressing && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                           <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-9 w-9 bg-orange-600 text-white shadow-xl flex items-center justify-center active:scale-75 transition-all border-2 border-white rounded-none">
                       <Camera className="h-4 w-4" />
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} disabled={isCompressing} />
                 </div>
                 
                 <div className="min-w-0 flex-1 space-y-1">
                    <h2 className="text-2xl font-black uppercase text-white truncate leading-none tracking-tighter">
                      {formData.storeName || 'Toko UMKM Siau'}
                    </h2>
                    <div className="flex items-center gap-2">
                       <Badge className={cn(
                         "border-none text-[8px] font-black uppercase px-2 h-5 rounded-none shadow-lg",
                         formData.isStoreOpen ? 'bg-green-600 text-white' : 'bg-white text-slate-900'
                       )}>
                          {formData.isStoreOpen ? '● TOKO BUKA' : '○ TUTUP'}
                       </Badge>
                       <span className="text-[7px] font-black text-white/40 uppercase tracking-widest">Verified Merchant</span>
                    </div>
                 </div>
              </div>
            </header>

            {/* FORM COMMAND CENTER: LEADING-TIGHT */}
            <div className="p-6 sm:p-10 space-y-10 max-w-4xl mx-auto w-full pb-48">
              
              {/* SECTION: STATUS OPERASIONAL */}
              <section className="space-y-4">
                 <div className="flex items-center gap-3 px-2">
                    <div className="h-6 w-6 rounded-none bg-primary/10 flex items-center justify-center text-primary"><Power className="h-4 w-4" /></div>
                    <h3 className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Radar Status</h3>
                 </div>
                 <div className={cn(
                    "p-5 border-2 flex items-center justify-between transition-all rounded-none",
                    formData.isStoreOpen ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200 opacity-60"
                 )}>
                    <div className="space-y-1">
                       <p className={cn("text-[12px] font-black uppercase", formData.isStoreOpen ? "text-green-900" : "text-slate-900")}>Operasional Siau Live</p>
                       <p className="text-[8px] font-bold text-muted-foreground uppercase">Warga melihat toko Anda {formData.isStoreOpen ? 'Aktif' : 'Libur'}.</p>
                    </div>
                    <Switch checked={formData.isStoreOpen} onCheckedChange={(v) => setFormData({...formData, isStoreOpen: v})} className="scale-110" />
                 </div>
              </section>

              {/* SECTION: DATA IDENTITAS */}
              <section className="space-y-6">
                 <div className="flex items-center gap-3 px-2">
                    <div className="h-6 w-6 rounded-none bg-primary/10 flex items-center justify-center text-primary"><Globe className="h-4 w-4" /></div>
                    <h3 className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Informasi Publik</h3>
                 </div>
                 
                 <div className="grid gap-6">
                    <div className="space-y-2">
                       <Label className="text-[9px] font-black uppercase text-primary/60 tracking-widest ml-1">Nama Toko Resmi</Label>
                       <Input 
                        name="storeName" 
                        className="h-14 bg-white border-none rounded-none font-black text-lg px-6 shadow-inner focus-visible:ring-1 focus-visible:ring-primary/20 uppercase" 
                        value={formData.storeName} 
                        onChange={(e) => setFormData({...formData, storeName: e.target.value})} 
                        placeholder="NAMA BISNIS ANDA..." 
                       />
                    </div>

                    <div className="space-y-2">
                       <Label className="text-[9px] font-black uppercase text-primary/60 tracking-widest ml-1">Bio / Slogan Bisnis</Label>
                       <Textarea 
                        name="bio" 
                        className="min-h-[100px] bg-white border-none rounded-none p-6 font-bold text-sm shadow-inner leading-tight uppercase italic" 
                        value={formData.bio} 
                        onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                        placeholder="Contoh: Menyediakan menu kearifan lokal..." 
                       />
                    </div>
                 </div>
              </section>

              {/* SECTION: RADAR GPS */}
              <section className="space-y-6">
                 <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                       <div className="h-6 w-6 rounded-none bg-primary/10 flex items-center justify-center text-primary"><MapPin className="h-4 w-4" /></div>
                       <h3 className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Titik Jemput Kurir</h3>
                    </div>
                    <p className="text-[8px] font-black text-orange-600 uppercase animate-pulse">Radar GPS Aktif</p>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="p-1 bg-white border-2 border-primary/5 rounded-none shadow-2xl overflow-hidden relative z-0">
                       <LocationPicker 
                         initialLat={formData.latitude} 
                         initialLng={formData.longitude} 
                         onLocationSelect={(la, ln) => setFormData({...formData, latitude: la, longitude: ln})} 
                         height="300px" 
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[9px] font-black uppercase text-primary/60 tracking-widest ml-1">Alamat Tertulis (Klarifikasi)</Label>
                       <Input 
                        className="h-12 bg-white border-none rounded-none font-bold text-xs px-6 shadow-inner uppercase" 
                        value={formData.address} 
                        onChange={(e) => setFormData({...formData, address: e.target.value})} 
                        placeholder="Contoh: Kel. Ondong, depan Gereja..." 
                       />
                    </div>
                 </div>
              </section>

              <div className="p-6 bg-blue-50 border-x-4 border-primary/20 flex items-start gap-4">
                 <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-1" />
                 <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase text-primary leading-none">Integritas Data Bisnis</p>
                    <p className="text-[9px] font-medium text-primary/60 uppercase leading-relaxed italic">
                      SOP: Pastikan Titik GPS akurat agar navigasi kurir saat menjemput pesanan warga bertahta secara presisi.
                    </p>
                 </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* TERMINAL FOOTER: STICKY & COMMAND-READY */}
        <footer className="p-4 sm:p-6 bg-white border-t shrink-0 shadow-[0_-15px_50px_rgba(0,0,0,0.1)] z-[100]">
           <div className="max-w-4xl mx-auto">
              <Button 
                onClick={handleSave} 
                disabled={loading || isCompressing || !formData.storeName}
                className="w-full h-18 bg-primary text-white rounded-none font-black uppercase text-xs shadow-2xl active:scale-95 transition-all gap-4 py-8"
              >
                 {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                 Simpan & Sinkronkan Bisnis
              </Button>
              <p className="text-center text-[7px] font-black uppercase text-muted-foreground tracking-[0.5em] mt-4 opacity-30">V33.000 • Siau UMKM Terminal</p>
           </div>
        </footer>
      </FlexibleFrame>
    </div>
  );
}
