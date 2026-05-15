"use client";

/**
 * VIEW: Pengaturan Profil (SOVEREIGN PRIVACY & SECURITY REFINED)
 * SOP: Menangani sinkronisasi identitas dan kendali privasi granular.
 * REVISI: Menghapus fitur Verifikasi 2 Langkah & Menambahkan Radar Kedaulatan Akun (Saran Password).
 */

import { useProfileController } from '@/hooks/controllers/use-profile-controller';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Loader2, Save, User, Camera, Navigation, AtSign, Globe, 
  ShieldCheck, MapPin, Phone, Users, LockKeyhole,
  MessageSquare, Clock, Mail, AlertTriangle, KeyRound
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { cn } from "@/lib/utils";

const LocationPicker = dynamic(() => import('@/components/location-picker'), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-muted animate-pulse rounded-2xl flex items-center justify-center font-bold text-[10px] uppercase">Peta...</div>
});

export default function EditProfileView() {
  const c = useProfileController();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // LOGIKA KEDAULATAN: Deteksi apakah akun memiliki penyedia password (untuk login langsung)
  const hasPasswordProvider = c.user?.providerData?.some((p: any) => p.providerId === 'password');

  if (c.profileLoading) return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
    </div>
  );

  return (
    <FlexibleFrame 
      title="Pengaturan Akun" 
      subtitle="Otoritas Identitas Warga Siau" 
      icon={User} 
      variant="member"
      scrollable={false}
    >
      <div className="flex flex-col h-full bg-white rounded-[2rem] shadow-xl overflow-hidden border border-primary/5 animate-in zoom-in-95 duration-500">
        
        <CardHeader className="p-4 bg-gradient-to-br from-primary to-blue-900 text-white text-center shrink-0">
          <div className="flex flex-col items-center gap-2">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="h-20 w-20 border-[4px] border-white/20 shadow-2xl rounded-full">
                <AvatarImage src={c.formData.imageUrl} className="object-cover rounded-full" />
                <AvatarFallback className="bg-white/10 text-white text-xl font-black rounded-full">{(c.formData.fullName || "U").charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-lg shadow-xl text-primary border border-primary/5">
                 {c.isCompressing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if(f) c.handleImageChange(f); }} />
            </div>
            <div className="space-y-0.5">
              <CardTitle className="text-base font-black uppercase tracking-tighter">{c.formData.fullName || 'Warga Siau'}</CardTitle>
              <Badge className="bg-white/20 text-white border-none text-[7px] font-black uppercase px-2 py-0.5 rounded-full">{c.profile?.role}</Badge>
            </div>
          </div>
        </CardHeader>

        <ScrollArea className="flex-1">
          <CardContent className="p-5 space-y-6 pt-6 pb-20">
            
            {/* SOVEREIGN ACCOUNT RADAR: SARAN PASSWORD */}
            {!hasPasswordProvider && (
              <div className="p-5 rounded-2xl bg-amber-50 border-2 border-dashed border-amber-200 space-y-3 shadow-inner animate-in slide-in-from-top-2 duration-700">
                 <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg"><KeyRound className="h-5 w-5" /></div>
                    <div>
                       <p className="text-[11px] font-black uppercase text-amber-900 tracking-widest leading-none">Kedaulatan Akun Rendah</p>
                       <p className="text-[7px] font-bold text-amber-700 uppercase mt-1">Login via Google Terdeteksi</p>
                    </div>
                 </div>
                 <p className="text-[9px] font-medium uppercase leading-relaxed text-amber-800 italic">
                   SOP: Anda belum memiliki kata sandi mandiri di Jastip Siau. Disarankan untuk menambahkan password agar tetap bisa masuk jika pangkalan Google sedang gangguan.
                 </p>
                 <Button variant="outline" size="sm" className="h-8 w-full bg-white border-amber-200 text-amber-700 font-black uppercase text-[8px] rounded-lg shadow-sm">Atur Password Mandiri</Button>
              </div>
            )}

            {/* BEAUTIFUL URL */}
            <div className="p-4 bg-primary/[0.03] rounded-2xl border-2 border-dashed border-primary/10 space-y-3">
               <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-primary text-white flex items-center justify-center shadow-md"><AtSign className="h-3.5 w-3.5" /></div>
                  <Label className="text-[9px] font-black uppercase text-primary tracking-widest">Username Profil</Label>
               </div>
               <div className="flex items-center gap-2 bg-white p-2 rounded-xl border shadow-inner">
                  <span className="text-[10px] font-black text-primary/40">jastipsiau.com/</span>
                  <Input 
                    placeholder="username" 
                    className="h-8 border-none bg-transparent font-black text-primary text-xs px-0" 
                    value={c.formData.username} 
                    onChange={(e) => c.setFormData({...c.formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})} 
                  />
                  <Globe className="h-3 w-3 text-primary/20" />
               </div>
            </div>

            {/* PRIVACY SECTOR */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-dashed pb-2">
                 <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                 <h3 className="text-[9px] font-black uppercase text-primary tracking-widest">Kedaulatan Privasi</h3>
              </div>
              <div className="grid gap-2.5">
                 <PrivacyToggle icon={Mail} label="Email Publik" checked={c.formData.showEmail} onChange={(v: any) => c.setFormData({...c.formData, showEmail: v})} desc="Warga lain bisa melihat email Anda." />
                 <PrivacyToggle icon={Phone} label="WhatsApp Publik" checked={c.formData.showWhatsapp} onChange={(v: any) => c.setFormData({...c.formData, showWhatsapp: v})} desc="Warga lain bisa melihat nomor WA Anda." />
                 <PrivacyToggle icon={MapPin} label="Alamat Publik" checked={c.formData.showAddress} onChange={(v: any) => c.setFormData({...c.formData, showAddress: v})} desc="Warga lain bisa melihat domisili Anda." />
                 <PrivacyToggle icon={MessageSquare} label="Chat Privat Eksklusif" checked={c.formData.privateChat} onChange={(v: any) => c.setFormData({...c.formData, privateChat: v})} desc="Hanya Admin yang bisa chat pribadi (Order/Toko tetap aktif)." color="purple" />
                 <div className="grid grid-cols-2 gap-2">
                    <PrivacyToggle icon={Users} label="Kelamin" checked={c.formData.showGender} onChange={(v: any) => c.setFormData({...c.formData, showGender: v})} hideDesc />
                    <PrivacyToggle icon={Clock} label="Usia" checked={c.formData.showAge} onChange={(v: any) => c.setFormData({...c.formData, showAge: v})} hideDesc />
                 </div>
              </div>
            </div>

            <div className="grid gap-4 pt-4 border-t border-dashed">
              <div className="space-y-1">
                 <Label className="text-[8px] font-black uppercase text-primary ml-1">Nama Lengkap KTP</Label>
                 <Input className="h-11 bg-muted/20 border-none rounded-xl font-black text-xs px-4" value={c.formData.fullName} onChange={(e) => c.setFormData({...c.formData, fullName: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[8px] font-black uppercase text-primary ml-1">WhatsApp Aktif</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-primary/40">+62</div>
                    <Input className="h-11 bg-muted/20 border-none rounded-xl font-black text-xs pl-10" value={c.formData.whatsapp.startsWith('62') ? c.formData.whatsapp.slice(2) : c.formData.whatsapp} onChange={(e) => c.setFormData({...c.formData, whatsapp: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[8px] font-black uppercase text-primary ml-1">Bio / Slogan</Label>
                  <Input className="h-11 bg-muted/20 border-none rounded-xl font-black text-xs px-4" value={c.formData.bio} onChange={(e) => c.setFormData({...c.formData, bio: e.target.value})} />
                </div>
              </div>
              
              <div className="pt-2 border-t border-dashed space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-[9px] font-black uppercase text-primary flex items-center gap-1.5"><Navigation className="h-3 w-3" /> GPS Rumah</Label>
                  <button type="button" onClick={c.handleGetGPS} disabled={c.locating} className="text-[8px] font-black uppercase text-primary underline">
                    {c.locating ? "Peta Aktif..." : "Ambil GPS"}
                  </button>
                </div>
                <div className="rounded-2xl overflow-hidden border shadow-inner">
                  <LocationPicker initialLat={c.formData.latitude} initialLng={c.formData.longitude} onLocationSelect={(lat, lng) => c.setFormData({...c.formData, latitude: lat, longitude: lng})} height="180px" />
                </div>
                <Input placeholder="Alamat Tertulis..." className="h-11 bg-muted/20 border-none rounded-xl font-black text-xs px-4" value={c.formData.address} onChange={(e) => c.setFormData({...c.formData, address: e.target.value})} />
              </div>
            </div>
          </CardContent>
        </ScrollArea>

        <div className="p-4 bg-white border-t shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-20 shrink-0">
          <Button 
            className="w-full h-14 bg-primary rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all gap-2" 
            onClick={c.handleSave} 
            disabled={c.loading || c.isCompressing}
          >
            {c.loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} 
            Simpan Perubahan
          </Button>
        </div>
      </div>
    </FlexibleFrame>
  );
}

function PrivacyToggle({ icon: Icon, label, checked, onChange, desc, hideDesc, color = 'green' }: any) {
  const activeColor = color === 'purple' ? "bg-purple-50 border-purple-200" : "bg-green-50 border-green-200";
  const iconColor = color === 'purple' ? "bg-purple-600" : "bg-green-600";
  
  return (
    <div className={cn(
      "p-3 rounded-2xl border transition-all flex flex-col gap-2",
      checked ? activeColor : "bg-slate-50 border-slate-200 opacity-80"
    )}>
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className={cn("p-2 rounded-lg flex items-center justify-center shadow-sm text-white", checked ? iconColor : "bg-slate-400")}>
               <Icon className="h-4 w-4" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase leading-none">{label}</p>
                <p className="text-[7px] font-bold text-muted-foreground uppercase mt-1">{checked ? "PUBLIK" : "PRIVAT"}</p>
             </div>
          </div>
          <Switch checked={checked} onCheckedChange={onChange} className="scale-75" />
       </div>
       {!hideDesc && desc && (
          <p className="text-[8px] font-bold text-muted-foreground uppercase leading-relaxed italic border-t pt-1.5 opacity-60">
            {desc}
          </p>
       )}
    </div>
  );
}
