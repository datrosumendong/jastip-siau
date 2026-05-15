
"use client";

/**
 * VIEW: Terminal Radar Komando (ULTRA MASTER TERMINAL V6)
 * SOP: Penegakan "Satu Jalur Siaran" dengan arsitektur Full-Flush.
 * FIX: Menjamin pendaratan notifikasi akurat melalui tipe 'broadcast_radar'.
 * REVISI: Visual Terminal yang lebih agresif, kaku, dan berwibawa.
 */

import { useAdminAutoNotifController } from '@/hooks/controllers/use-admin-auto-notif-controller';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Zap, Loader2, Send, ShieldCheck, 
  Smartphone, Globe, Radio, Terminal, Info, 
  Settings2, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminAutoNotifView() {
  const c = useAdminAutoNotifController();

  if (c.loading) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      <p className="text-[10px] font-black uppercase text-primary/40 animate-pulse tracking-widest">Sinkronisasi Radar...</p>
    </div>
  );

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col bg-white">
      <FlexibleFrame
        title="Radar Komando"
        subtitle="Pusat Siaran Informasi Berdaulat"
        icon={Radio}
        variant="admin"
        square={true} 
        scrollable={true}
      >
        <div className="space-y-0 pb-64 w-full bg-white animate-in fade-in duration-700">
          
          {/* 1. MASTER TERMINAL: COMMAND CANVAS (FULL FLUSH) */}
          <section className="p-6 sm:p-12 bg-slate-950 text-white relative overflow-hidden border-b-8 border-primary/20">
             <div className="absolute top-0 right-0 h-full w-1/2 bg-primary/5 skew-x-12 translate-x-20 pointer-events-none" />
             
             <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
                <div className="flex items-center justify-between">
                   <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-none border border-white/20 shadow-xl">
                      <Terminal className="h-4 w-4 text-accent animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-[0.3em]">Master Broadcast Terminal</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[8px] font-black uppercase text-white/40">Radar Signal: Ready</span>
                   </div>
                </div>
                
                <div className="space-y-4">
                   <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-none italic">
                      Siarkan Instruksi <br />
                      <span className="text-accent">Ke Seluruh HP Warga.</span>
                   </h2>
                   <p className="text-[10px] sm:text-[12px] font-medium text-white/50 uppercase leading-relaxed max-w-2xl tracking-wide">
                      SOP: Ketik pesan instruksi di bawah ini. Sekali "Publis", sinyal akan memancar secara kolektif ke ribuan warga Siau dalam hitungan detik.
                   </p>
                </div>

                {/* COMMAND CANVAS: RIGID SQUARE */}
                <div className="relative group">
                   <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-none blur opacity-25 group-focus-within:opacity-100 transition duration-1000"></div>
                   <Textarea 
                    placeholder="TULIS KOMANDO STRATEGIS ANDA DI SINI..."
                    className="relative min-h-[200px] bg-slate-900 border-2 border-white/10 rounded-none p-8 font-black text-xl sm:text-3xl placeholder:opacity-10 focus-visible:ring-0 focus-visible:border-accent transition-all uppercase leading-tight italic tracking-tighter text-accent shadow-2xl"
                    value={c.broadcastMessage}
                    onChange={(e) => c.setBroadcastMessage(e.target.value)}
                   />
                </div>
             </div>
          </section>

          {/* 2. ADVISORY SECTOR: ARSITEKTUR SINYAL */}
          <div className="max-w-4xl mx-auto p-6 sm:p-12 space-y-12">
             
             <div className="grid md:grid-cols-2 gap-8">
                <Card className="border-none shadow-xl rounded-none bg-white ring-1 ring-primary/5 p-8 space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-primary text-white flex items-center justify-center rounded-none shadow-lg"><Activity className="h-6 w-6" /></div>
                      <div>
                         <h4 className="text-[12px] font-black uppercase tracking-widest text-primary leading-none">Radar Pendaratan</h4>
                         <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1">Direct Path Synchronization</p>
                      </div>
                   </div>
                   <p className="text-[11px] font-medium text-muted-foreground uppercase leading-relaxed italic">
                      FIX: Notifikasi dari terminal ini telah disinkronkan secara atomik agar selalu mendarat tepat di pangkalan utama (Home) warga.
                   </p>
                </Card>

                <Card className="border-none shadow-xl rounded-none bg-white ring-1 ring-primary/5 p-8 space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-primary text-white flex items-center justify-center rounded-none shadow-lg"><Settings2 className="h-6 w-6" /></div>
                      <div>
                         <h4 className="text-[12px] font-black uppercase tracking-widest text-primary leading-none">Manajemen Antrean</h4>
                         <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1">Automatic Batch Clearing</p>
                      </div>
                   </div>
                   <p className="text-[11px] font-medium text-muted-foreground uppercase leading-relaxed italic">
                      SOP: Pimpinan tidak akan menerima banjir pop-up. Sistem hanya memancarkan satu sinyal laporan sukses untuk menjaga kedaulatan pandangan.
                   </p>
                </Card>
             </div>

             <div className="p-8 bg-blue-50 border-x-8 border-primary/20 flex items-start gap-6">
                <ShieldCheck className="h-8 w-8 text-primary shrink-0 mt-1" />
                <div className="space-y-2">
                   <p className="text-[14px] font-black uppercase text-primary leading-none">Konstitusi Siaran Pimpinan</p>
                   <p className="text-[10px] font-medium text-primary/70 uppercase leading-relaxed italic">
                     "Gunakan terminal ini hanya untuk komando strategis, pemeliharaan sistem, atau pengumuman kedaulatan yang bersifat massal bagi warga Siau."
                   </p>
                </div>
             </div>
          </div>
        </div>
      </FlexibleFrame>

      {/* 3. STICKY COMMANDER FOOTER: FULL FLUSH ACTION */}
      <footer className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t shrink-0 shadow-[0_-15px_50px_rgba(0,0,0,0.15)] z-[100] animate-in slide-in-from-bottom-5">
         <div className="max-w-4xl mx-auto">
            <Button 
              className="w-full h-20 bg-primary text-white rounded-none font-black uppercase text-sm shadow-2xl active:scale-95 transition-all gap-4 py-8 shadow-primary/30 group"
              disabled={c.isPublishing || !c.broadcastMessage.trim()}
              onClick={c.handleBroadcastNow}
            >
               {c.isPublishing ? (
                 <Loader2 className="h-8 w-8 animate-spin" />
               ) : (
                 <Send className="h-8 w-8 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
               )}
               PUBLIS KOMANDO KE SELURUH WARGA SIAU
            </Button>
            <div className="flex items-center justify-center gap-6 mt-4 opacity-30">
               <span className="text-[7px] font-black uppercase tracking-[0.5em]">V38.000 • MASTER TERMINAL</span>
               <div className="h-1 w-1 rounded-full bg-primary" />
               <span className="text-[7px] font-black uppercase tracking-[0.5em]">SIAU RADAR SYSTEM</span>
            </div>
         </div>
      </footer>
    </div>
  );
}
