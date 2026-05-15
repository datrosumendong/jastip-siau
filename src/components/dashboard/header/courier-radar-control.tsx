"use client";

/**
 * COMPONENT: Courier Radar Control (SOVEREIGN SIGNAL MASTER V800)
 * SOP: Pusat kendali radar GPS yang bertahta di Header.
 * FIX: Menjamin persistensi sinyal saat kurir berpindah halaman.
 * ROLE: Hanya terlihat oleh Kurir dan Owner.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Zap, ZapOff, Loader2, Info, Settings, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";

export function CourierRadarControl() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isRadarActive, setIsRadarActive] = useState(false);
  const [radarError, setRadarError] = useState<string | null>(null);
  const [showIzinGuide, setShowIzinGuide] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // 1. DATA MODEL: Monitor Profil Online
  const userRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: profile } = useDoc(userRef, true);

  const isCourierOrOwner = profile?.role === 'courier' || profile?.role === 'owner';
  const isOnline = !!profile?.isOnline;

  const watchIdRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);
  const lastUpdateRef = useRef<number>(0);

  // 2. ACTION: Request Radar Permission
  const startRadar = useCallback(async () => {
    if (!navigator.geolocation) {
      setRadarError("GPS Tidak Didukung");
      return;
    }

    setIsInitializing(true);
    setRadarError(null);

    navigator.geolocation.getCurrentPosition(
      async () => {
        setIsRadarActive(true);
        setIsInitializing(false);
        toast({ title: "Radar Aktif", description: "Sinyal GPS bertahta di Header." });
        
        // Aktifkan Wake Lock jika didukung
        if ('wakeLock' in navigator) {
          try {
            wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          } catch (e) {}
        }
      },
      (err) => {
        setIsInitializing(false);
        setIsRadarActive(false);
        if (err.code === 1) { 
           setRadarError("Izin Lokasi Ditolak");
           setShowIzinGuide(true);
        } else {
           setRadarError("Sinyal GPS Lemah");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [toast]);

  const stopRadar = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
    setIsRadarActive(false);
    toast({ title: "Radar Mati", description: "Pancaran sinyal dihentikan." });
  }, [toast]);

  // 3. RADAR ENGINE: Watcher Loop
  useEffect(() => {
    if (!user || !isOnline || !isRadarActive || !db) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const now = Date.now();
        // SOP: Minimal interval 20 detik untuk efisiensi kedaulatan baterai
        if (now - lastUpdateRef.current < 20000) return; 

        const { latitude, longitude } = position.coords;
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            latitude,
            longitude,
            lastGpsUpdate: serverTimestamp()
          });
          lastUpdateRef.current = now;
          setRadarError(null);
        } catch (e) {}
      },
      (error) => {
        if (error.code === 1) {
          setIsRadarActive(false);
          setRadarError("Izin Diputus");
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [user, isOnline, isRadarActive, db]);

  // Otomatis mati jika kurir offline
  useEffect(() => {
    if (!isOnline && isRadarActive) {
      stopRadar();
    }
  }, [isOnline, isRadarActive, stopRadar]);

  if (!isCourierOrOwner) return null;

  return (
    <div className="flex items-center gap-2">
      {/* RADAR STATUS INDICATOR & TOGGLE */}
      <button 
        onClick={() => isRadarActive ? stopRadar() : startRadar()}
        disabled={!isOnline || isInitializing}
        className={cn(
          "h-10 px-3 rounded-full flex items-center gap-2 transition-all active:scale-90 border-2 shadow-sm",
          !isOnline ? "bg-slate-100 border-slate-200 text-slate-400 opacity-50 grayscale" :
          isRadarActive ? "bg-green-50 border-green-200 text-green-600 ring-4 ring-green-500/10" : 
          "bg-orange-50 border-orange-200 text-orange-600"
        )}
      >
        {isInitializing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isRadarActive ? (
          <Zap className="h-4 w-4 fill-current animate-pulse" />
        ) : (
          <ZapOff className="h-4 w-4" />
        )}
        <div className="flex flex-col items-start leading-none pr-1">
           <span className="text-[7.5px] font-black uppercase tracking-widest">Radar GPS</span>
           <span className="text-[6.5px] font-bold uppercase opacity-70">
              {!isOnline ? "OFFLINE" : isRadarActive ? "ACTIVE" : "READY"}
           </span>
        </div>
      </button>

      {/* ERROR SIGNAL PILL */}
      {radarError && (
        <button 
          onClick={() => setShowIzinGuide(true)}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-200 animate-in shake duration-500 shadow-lg"
        >
          <AlertTriangle className="h-5 w-5" />
        </button>
      )}

      {/* DIALOG PANDUAN IZIN GPS */}
      <Dialog open={showIzinGuide} onOpenChange={setShowIzinGuide}>
         <DialogContent className="w-[92vw] sm:max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl z-[1500] animate-in zoom-in-95">
            <DialogHeader className="text-center">
               <div className="mx-auto h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center mb-4"><Settings className="h-8 w-8 text-orange-600" /></div>
               <DialogTitle className="text-xl font-black uppercase text-primary tracking-tighter italic">Izin GPS Terputus</DialogTitle>
               <DialogDescription className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed mt-2">Agar sinyal tetap memancar lintas halaman, atur HP Anda:</DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-5">
               <div className="flex gap-4 items-start">
                  <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                  <p className="text-[11px] font-bold text-primary uppercase leading-tight">Pengaturan HP &rarr; Aplikasi &rarr; Jastip Siau.</p>
               </div>
               <div className="flex gap-4 items-start">
                  <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                  <p className="text-[11px] font-bold text-primary uppercase leading-tight">Izin &rarr; Lokasi &rarr; Pilih <b>"Izinkan Sepanjang Waktu"</b>.</p>
               </div>
               <div className="flex gap-4 items-start">
                  <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black shrink-0">3</div>
                  <p className="text-[11px] font-bold text-primary uppercase leading-tight">Baterai &rarr; Pilih <b>"Tidak Dibatasi"</b>.</p>
               </div>
               <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
                  <Info className="h-5 w-5 text-blue-600 shrink-0" />
                  <p className="text-[8px] font-black text-blue-800 uppercase italic">Tanpa izin ini, radar akan mati otomatis saat layar mati atau kurir berpindah menu.</p>
               </div>
            </div>
            <DialogFooter>
               <Button className="w-full h-14 bg-primary text-white rounded-xl font-black uppercase text-[10px] shadow-xl" onClick={() => { setShowIzinGuide(false); startRadar(); }}>Coba Lagi</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}
