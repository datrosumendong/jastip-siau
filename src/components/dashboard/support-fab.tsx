
"use client";

/**
 * VIEW: Support FAB (EXCLUSIVE ADMIN TARGET)
 * SOP: Tombol hanya muncul untuk non-admin. Target bantuan hanya Admin (Pemilik).
 * Logika: IF role !== 'admin' THEN SHOW.
 */

import { Headset } from 'lucide-react';
import { useSupportFabController } from '@/hooks/controllers/use-support-fab-controller';

export function SupportFAB() {
  const { isVisible, handleContactAdmin } = useSupportFabController();

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in fade-in slide-in-from-bottom-10 duration-500">
       <div className="relative group">
          <button 
            onClick={handleContactAdmin}
            className="h-16 w-16 bg-primary text-white rounded-[1.8rem] shadow-[0_20px_50px_rgba(3,105,161,0.4)] flex items-center justify-center hover:scale-110 active:scale-90 transition-all relative overflow-hidden group/btn"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            <Headset className="h-7 w-7 relative z-10 animate-pulse" />
          </button>
          
          <div className="absolute bottom-full right-0 mb-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
             <div className="bg-primary text-white text-[8px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-2xl border border-white/20">
               Kontak Admin
             </div>
          </div>
       </div>
    </div>
  );
}
