"use client";

/**
 * VIEW: Donasi Pengembangan (SOP DUKUNGAN WARGA V26.000)
 * SOP: Penegakan arsitektur Full-Flush & Square Edition.
 * FIX: Menjamin tampilan donasi bertahta kaku tanpa radius melengkung.
 */

import { FlexibleFrame } from "@/components/dashboard/flexible-frame";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, Copy, CheckCircle2, Wallet, 
  Smartphone, Globe, ShieldCheck, Banknote, 
  ArrowRight, Info, Coffee
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function DonationView() {
  const { toast } = useToast();

  const handleCopyRekening = () => {
    navigator.clipboard.writeText("389970974");
    toast({
      title: "Nomor Disalin",
      description: "Rekening BNI telah bertahta di clipboard Anda.",
    });
  };

  return (
    <FlexibleFrame
      title="Dukung Siau"
      subtitle="Donasi Pemeliharaan & Integrasi Sistem"
      icon={Heart}
      variant="member"
      square={true}
    >
      <div className="space-y-0 pb-48 w-full bg-white animate-in fade-in duration-700">
        
        {/* HERO SECTION: FLUSH & SQUARE */}
        <div className="relative w-full bg-slate-900 p-8 sm:p-16 text-white overflow-hidden border-b-4 border-primary/10">
           <div className="absolute top-0 right-0 h-full w-1/2 bg-primary/5 skew-x-12 translate-x-20 pointer-events-none" />
           <div className="relative z-10 space-y-6 max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1 rounded-none border border-white/20 shadow-xl mx-auto">
                 <ShieldCheck className="h-4 w-4 text-accent animate-pulse" />
                 <span className="text-[9px] font-black uppercase tracking-[0.3em]">Kedaulatan Ekonomi Digital</span>
              </div>
              <h1 className="text-3xl sm:text-7xl font-black uppercase tracking-tighter leading-[0.85] drop-shadow-2xl">
                 Dukung Masa Depan <br />
                 <span className="text-accent italic">Logistik Siau.</span>
              </h1>
              <p className="text-[11px] sm:text-[14px] font-medium text-white/70 uppercase leading-relaxed max-w-2xl mx-auto">
                 Kontribusi Anda sangat berharga untuk menjamin pangkalan data Jastip Siau tetap aktif dan mempercepat langkah kami menuju Google PlayStore.
              </p>
           </div>
        </div>

        {/* BANK TERMINAL: RIGID SQUARE */}
        <div className="max-w-4xl mx-auto p-5 sm:p-10 space-y-10">
           
           <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-none shadow-2xl rounded-none bg-white ring-1 ring-primary/5 overflow-hidden">
                 <CardHeader className="bg-primary p-6 text-white">
                    <div className="flex items-center justify-between">
                       <CardTitle className="text-xl font-black uppercase tracking-tighter">Bank BNI</CardTitle>
                       <Banknote className="h-6 w-6 opacity-30" />
                    </div>
                 </CardHeader>
                 <CardContent className="p-6 sm:p-8 space-y-8">
                    <div className="space-y-2">
                       <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Nomor Rekening:</span>
                       <div className="flex items-center justify-between p-4 bg-muted/20 border-2 border-dashed border-primary/10 group">
                          <span className="text-2xl font-black text-primary tracking-widest tabular-nums">389970974</span>
                          <button 
                            onClick={handleCopyRekening}
                            className="h-10 w-10 bg-primary text-white flex items-center justify-center active:scale-75 transition-all shadow-lg"
                          >
                             <Copy className="h-5 w-5" />
                          </button>
                       </div>
                    </div>
                    <div className="space-y-1">
                       <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Atas Nama:</span>
                       <p className="text-[16px] font-black uppercase text-primary">Datros Sumendong</p>
                    </div>
                 </CardContent>
                 <CardFooter className="bg-primary/5 p-4 border-t flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-[8px] font-bold text-primary uppercase">Rekening Terverifikasi</span>
                 </CardFooter>
              </Card>

              <div className="space-y-6">
                 <div className="flex items-center gap-3 px-2">
                    <h3 className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Misi Strategis</h3>
                    <div className="h-px bg-primary/10 flex-1" />
                 </div>
                 
                 <div className="space-y-2">
                    <MissionItem icon={Globe} title="Maintenance Server" desc="Menjamin pangkalan data real-time siaga 24 jam bagi warga." />
                    <MissionItem icon={Smartphone} title="PlayStore APK" desc="Biaya pendaftaran dan pengembangan agar APK bisa diunduh resmi." />
                    <MissionItem icon={Coffee} title="Support Dev" desc="Dukungan operasional tim teknis dalam menyempurnakan fitur." />
                 </div>
              </div>
           </div>

           <div className="p-6 bg-blue-50 border-x-4 border-primary/20">
              <div className="space-y-3">
                 <h4 className="text-[10px] font-black uppercase text-primary flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> Integritas Donasi
                 </h4>
                 <p className="text-[11px] font-medium text-primary/70 leading-relaxed uppercase italic">
                    "Setiap kontribusi yang masuk akan bertahta di pangkalan dana pengembangan sistem Jastip Siau secara akuntabel."
                 </p>
              </div>
           </div>

        </div>

        <footer className="w-full py-10 border-t flex flex-col items-center gap-2 bg-slate-50 opacity-40">
           <Heart className="h-4 w-4 text-primary fill-current" />
           <span className="text-[8px] font-black uppercase tracking-widest text-primary">Siau Berdaulat • 2024</span>
        </footer>
      </div>
    </FlexibleFrame>
  );
}

function MissionItem({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-4 bg-white border border-primary/5 flex items-start gap-4 shadow-sm rounded-none">
       <div className="h-9 w-9 rounded-none bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10">
          <Icon className="h-4 w-4" />
       </div>
       <div className="min-w-0">
          <h4 className="text-[10px] font-black uppercase text-primary leading-none mb-1">{title}</h4>
          <p className="text-[8px] font-medium text-muted-foreground uppercase leading-tight italic">{desc}</p>
       </div>
    </div>
  );
}
