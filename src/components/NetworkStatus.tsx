'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi, X } from 'lucide-react';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Inisialisasi status awal
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      // Sembunyikan notifikasi otomatis setelah 1 detik jika kembali online
      setTimeout(() => setShowNotification(false), 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Jika online dan tidak ada notifikasi yang perlu ditampilkan, jangan render apa pun
  if (isOnline && !showNotification) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 z-[9999] md:left-auto md:right-4 md:w-80 p-4 rounded-2xl shadow-2xl border flex items-center justify-between transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 ${
        isOnline 
          ? 'bg-green-600 border-green-500 text-white' 
          : 'bg-destructive border-destructive text-white'
      } ${showNotification ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-xl">
          {isOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-tight leading-none">
            {isOnline ? 'Terhubung Kembali' : 'Koneksi Terputus'}
          </p>
          <p className="text-[9px] font-bold opacity-90 uppercase mt-1">
            {isOnline ? 'Internet Anda sudah aktif.' : 'Periksa jaringan internet Anda.'}
          </p>
        </div>
      </div>
      <button 
        onClick={() => setShowNotification(false)}
        className="p-1 hover:bg-white/10 rounded-full transition-colors shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
