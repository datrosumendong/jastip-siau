"use client";

/**
 * VIEW FRAMEWORK (MAHAKARYA SOLID LAYER V21.000 - FULL FLUSH)
 * SOP: Penegakan kedaulatan visual Full-Page Flush jika mode square aktif.
 * FIX: Menghilangkan seluruh padding eksternal agar konten menyentuh tepi layar.
 */

import React, { ReactNode, useMemo, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { useUser, useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { ShieldAlert, Gavel, RefreshCw, Loader2 } from "lucide-react";
import { useView } from "@/context/view-context";

interface FlexibleFrameProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  controls?: ReactNode;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'admin' | 'courier' | 'umkm' | 'member';
  scrollable?: boolean;
  square?: boolean; 
}

export function FlexibleFrame({ 
  title, 
  subtitle, 
  icon: Icon, 
  controls, 
  children,
  className,
  variant = 'default',
  scrollable = true,
  square = false
}: FlexibleFrameProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { triggerRefresh, forceUnlockUI } = useView();

  const userRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: profile } = useDoc(userRef, true);
  const isBlocked = profile?.hasActiveDebt === true;

  const [pullY, setPullY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const threshold = 100; 
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isRefreshing) return;
    if (scrollContainerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].pageY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;
    const currentY = e.touches[0].pageY;
    const diff = currentY - startY.current;
    
    if (diff > 0) {
      const dampenedDiff = Math.pow(diff, 0.85);
      setPullY(dampenedDiff);
      if (diff > 10 && e.cancelable) e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (!isPulling || isRefreshing) return;
    if (pullY >= threshold) handleTriggerRefresh();
    else resetPull();
  };

  const handleTriggerRefresh = () => {
    setIsRefreshing(true);
    setPullY(threshold);
    if (window.navigator.vibrate) window.navigator.vibrate(50); 
    setTimeout(() => {
      forceUnlockUI();
      triggerRefresh();
    }, 800);
  };

  const resetPull = () => {
    setPullY(0);
    setIsPulling(false);
  };

  const variantStyles = {
    default: "text-primary border-primary/10",
    admin: "text-purple-600 border-purple-100 bg-purple-50/10",
    courier: "text-green-600 border-green-100 bg-green-50/10",
    umkm: "text-orange-600 border-orange-100 bg-orange-50/10",
    member: "text-blue-600 border-blue-100 bg-blue-50/10",
  };

  return (
    <div 
      className="flex flex-col h-full w-full max-w-full mx-auto overflow-hidden bg-white relative z-10"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="absolute top-0 left-0 right-0 flex justify-center items-center pointer-events-none z-0 transition-opacity"
        style={{ height: `${Math.min(pullY, threshold + 40)}px`, opacity: Math.min(pullY / threshold, 1) }}
      >
        <div className={cn("p-2.5 rounded-full bg-white shadow-xl border-2 transition-all duration-300", pullY >= threshold ? "border-primary scale-110" : "border-primary/10 scale-100")}>
           {isRefreshing ? <Loader2 className="h-6 w-6 text-primary animate-spin" /> : <RefreshCw className="h-6 w-6 text-primary" style={{ transform: `rotate(${pullY * 2}deg)` }} />}
        </div>
      </div>

      {/* HEADER: FULL FLUSH IF SQUARE */}
      <div className={cn("shrink-0 z-20 w-full bg-white border-b", square ? "p-0" : "px-2 pt-2 pb-1")}>
        <div className={cn("bg-white p-4 transition-all w-full", square ? "rounded-none border-x-0" : "rounded-2xl border shadow-sm", variantStyles[variant])}>
          <div className="flex items-center justify-between w-full">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-black uppercase leading-tight tracking-tighter flex items-center gap-2.5">
                <Icon className="h-5 w-5 shrink-0" /> 
                <span className="truncate">{title}</span>
              </h1>
              <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest mt-1 opacity-60 truncate">
                {subtitle}
              </p>
            </div>
          </div>
          {controls && <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-300 w-full">{controls}</div>}
        </div>
      </div>

      {/* CONTENT: FULL FLUSH IF SQUARE */}
      <div 
        ref={scrollContainerRef}
        className={cn(
          "flex-1 min-h-0 flex flex-col w-full overflow-hidden bg-white transition-transform duration-150 ease-out", 
          square ? "p-0" : "px-2 py-1",
          scrollable ? "overflow-y-auto custom-scrollbar h-full" : "h-full"
        )}
        style={{ transform: `translateY(${pullY * 0.4}px)`, pointerEvents: isRefreshing ? 'none' : 'auto' }}
      >
        {isBlocked && (
          <div className={cn("animate-in shake duration-500 shrink-0 w-full", square ? "mb-0" : "mb-3")}>
            <div className={cn("bg-red-600 text-white p-5 shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-4 relative overflow-hidden", square ? "rounded-none border-b-8 border-white/20" : "rounded-xl border-2 border-white")}>
               <ShieldAlert className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10 rotate-12" />
               <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-lg"><Gavel className="h-5 w-5 text-white" /></div>
               <div className="space-y-1 text-center sm:text-left relative z-10 min-w-0">
                  <h3 className="text-md font-black uppercase tracking-tighter leading-none">Akses Terkunci!</h3>
                  <p className="text-[10px] font-bold uppercase leading-relaxed opacity-90">Akun ditangguhkan sesuai Pasal 378 KUHP. Segera lunasi tunggakan belanja!</p>
               </div>
            </div>
          </div>
        )}
        <div className={cn("w-full max-w-full bg-white min-h-full", scrollable ? "space-y-0 pb-48" : "h-full flex flex-col", className)}>
          {children}
        </div>
      </div>

      {isRefreshing && (
        <div className="absolute inset-0 z-[100] bg-white/20 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-300">
           <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary opacity-40" />
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-primary/40 animate-pulse">Menyegarkan...</p>
           </div>
        </div>
      )}
    </div>
  );
}
