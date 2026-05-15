
"use client";

/**
 * VIEW: Pendaftaran Mitra (MAHAKARYA REFINED)
 * SOP: Penambahan kolom Foto Kendaraan untuk verifikasi logistik kurir.
 * FITUR: Kompresi citra otomatis (SOP Ikhlas) untuk efisiensi database.
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserPlus, Truck, Store, Camera, CheckCircle2, Loader2, ArrowLeft, Info, ShieldCheck, IdCard, Bike
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { compressImage } from '@/lib/image-utils';
import { useView } from '@/context/view-context';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { cn } from '@/lib/utils';

export default function JoinPartnerPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { setView, goBack } = useView();
  const { toast } = useToast();
  
  const [submitting, setSubmitting] = useState(false);
  const [activeType, setActiveTab] = useState<'courier' | 'umkm'>('courier');
  const [isCompressing, setIsCompressing] = useState(false);

  const [formData, setFormData] = useState({ 
    ktpName: '', 
    photoKtp: '', 
    photoVehicle: '', 
    photoSim: '', 
    photoStore: '' 
  });

  const handleImageChange = async (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressing(true);
    try {
      const dataUrl = await compressImage(file, 800, 0.6);
      setFormData(prev => ({ ...prev, [field]: dataUrl }));
    } catch (err) {
      toast({ variant: "destructive", title: "Gagal memproses gambar" });
    } finally { setIsCompressing(false); }
  };

  const handleApply = async () => {
    if (!db || !user || !formData.ktpName) return;
    
    // Validasi Kelengkapan (SOP)
    if (activeType === 'courier' && (!formData.photoKtp || !formData.photoSim || !formData.photoVehicle)) {
      toast({ variant: "destructive", title: "Berkas Belum Lengkap", description: "Wajib unggah KTP, SIM, dan Foto Kendaraan." });
      return;
    }
    if (activeType === 'umkm' && (!formData.photoKtp || !formData.photoStore)) {
      toast({ variant: "destructive", title: "Berkas Belum Lengkap", description: "Wajib unggah KTP dan Foto Lokasi Toko." });
      return;
    }

    setSubmitting(true);
    try {
      const applicationData = {
        userId: user.uid, 
        userName: user.displayName || "Warga Siau",
        type: activeType, 
        status: 'pending', 
        ktpName: formData.ktpName,
        photoKtp: formData.photoKtp,
        createdAt: serverTimestamp(),
        // Kirim data foto sesuai tipe pendaftaran
        ...(activeType === 'courier' ? { 
          photoSim: formData.photoSim, 
          photoVehicle: formData.photoVehicle 
        } : { 
          photoStore: formData.photoStore 
        })
      };

      await addDoc(collection(db, 'applications'), applicationData);
      
      toast({ 
        title: "Lamaran Terkirim", 
        description: "Admin akan melakukan audit berkas dalam 1x24 jam." 
      });
      setView('home');
    } catch (e) {
      toast({ variant: "destructive", title: "Kegagalan Sistem" });
    } finally { setSubmitting(false); }
  };

  return (
    <FlexibleFrame 
      title="Gabung Mitra" 
      subtitle="Pendaftaran Kurir & UMKM Siau" 
      icon={UserPlus} 
      variant="member"
      controls={
        <Button variant="ghost" size="sm" onClick={goBack} className="h-8 text-[9px] font-black uppercase text-primary">
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Kembali
        </Button>
      }
    >
       <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white animate-in zoom-in-95 duration-500">
          <CardHeader className="bg-primary/5 p-8 border-b text-center space-y-2">
             <CardTitle className="text-xl font-black uppercase text-primary tracking-tighter">Formulir Kemitraan Resmi</CardTitle>
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Pastikan data sesuai dengan kartu identitas asli.</p>
          </CardHeader>
          <CardContent className="p-6 md:p-10 space-y-8">
             <Tabs value={activeType} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
                <TabsList className="grid grid-cols-2 h-14 bg-muted/30 p-1.5 rounded-2xl border border-primary/5">
                   <TabsTrigger value="courier" className="rounded-xl font-black uppercase text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2">
                      <Truck className="h-4 w-4" /> Kurir Jastip
                   </TabsTrigger>
                   <TabsTrigger value="umkm" className="rounded-xl font-black uppercase text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2">
                      <Store className="h-4 w-4" /> Mitra UMKM
                   </TabsTrigger>
                </TabsList>

                <div className="space-y-6 mt-10">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-primary ml-1 tracking-widest">Nama Lengkap (Sesuai KTP)</Label>
                      <Input 
                        placeholder="Contoh: Nama Sesuai Identitas"
                        className="h-14 bg-muted/20 border-none rounded-2xl font-black text-sm px-6 shadow-inner focus-visible:ring-1 focus-visible:ring-primary/20" 
                        value={formData.ktpName} 
                        onChange={(e) => setFormData({...formData, ktpName: e.target.value})} 
                      />
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <ImageUpload 
                        label="Foto KTP Asli" 
                        image={formData.photoKtp} 
                        onChange={(e: any) => handleImageChange('photoKtp', e)} 
                        isCompressing={isCompressing} 
                        icon={IdCard}
                      />
                      
                      {activeType === 'courier' ? (
                        <>
                          <ImageUpload 
                            label="Foto SIM Aktif" 
                            image={formData.photoSim} 
                            onChange={(e: any) => handleImageChange('photoSim', e)} 
                            isCompressing={isCompressing} 
                            icon={ShieldCheck}
                          />
                          <ImageUpload 
                            label="Foto Kendaraan" 
                            image={formData.photoVehicle} 
                            onChange={(e: any) => handleImageChange('photoVehicle', e)} 
                            isCompressing={isCompressing} 
                            icon={Bike}
                          />
                        </>
                      ) : (
                        <ImageUpload 
                          label="Foto Lokasi Toko" 
                          image={formData.photoStore} 
                          onChange={(e: any) => handleImageChange('photoStore', e)} 
                          isCompressing={isCompressing} 
                          icon={Store}
                        />
                      )}
                   </div>
                </div>
             </Tabs>

             <div className="p-5 bg-blue-50 border border-blue-100 rounded-[1.8rem] flex items-start gap-4 shadow-inner">
                <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[9px] font-bold text-blue-800 uppercase leading-relaxed italic opacity-80">
                  SOP: Berkas yang Anda unggah hanya dapat dilihat oleh Admin untuk keperluan verifikasi. Pastikan foto jelas dan tidak buram.
                </p>
             </div>
          </CardContent>
          <CardFooter className="p-8 border-t bg-muted/5">
             <Button 
               className="w-full h-16 bg-primary text-white rounded-[1.5rem] font-black uppercase text-xs shadow-2xl active:scale-95 transition-all gap-3" 
               disabled={submitting || !formData.ktpName || isCompressing} 
               onClick={handleApply}
             >
                {submitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <UserPlus className="h-6 w-6" />} 
                Daftar Sebagai Mitra {activeType === 'courier' ? 'Kurir' : 'UMKM'}
             </Button>
          </CardFooter>
       </Card>
    </FlexibleFrame>
  );
}

function ImageUpload({ label, image, onChange, isCompressing, icon: Icon }: any) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2.5">
       <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-1.5">
          <Icon className="h-3 w-3" /> {label}
       </Label>
       <div 
         onClick={() => ref.current?.click()} 
         className={cn(
           "h-48 w-full rounded-[1.8rem] transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer shadow-inner relative border-2 border-dashed",
           image ? "bg-white border-primary/10" : "bg-muted/30 border-primary/20 hover:bg-muted/40"
         )}
       >
          {image ? (
            <img src={image} className="w-full h-full object-cover" alt="Preview" />
          ) : isCompressing ? (
            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-30" />
          ) : (
            <div className="flex flex-col items-center gap-2 opacity-20">
               <Camera className="h-10 w-10 text-primary" />
               <span className="text-[7px] font-black uppercase tracking-[0.3em]">Ketuk untuk Ambil</span>
            </div>
          )}
          <input type="file" ref={ref} className="hidden" accept="image/*" onChange={onChange} />
       </div>
    </div>
  );
}
