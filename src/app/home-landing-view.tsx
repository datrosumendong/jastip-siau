"use client";

/**
 * VIEW: Landing Page (SPA Component)
 * Menggunakan dispatcher untuk mengganti state ke Login atau Register.
 * REVISI SLOGAN: 'Aman!' diubah menjadi 'Aman & Terpercaya!'.
 */

import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Package, Smartphone, Download, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface LandingViewProps {
  onGoToLogin: () => void;
  onGoToRegister: () => void;
}

export default function LandingView({ onGoToLogin, onGoToRegister }: LandingViewProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-delivery');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    }
    const handleBeforeInstallPrompt = (e: any) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background overflow-x-hidden animate-in fade-in duration-700">
      {!isStandalone && deferredPrompt && (
        <div className="bg-primary text-white p-3 sticky top-0 z-[110] shadow-2xl">
          <div className="container mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <p className="text-[10px] font-black uppercase leading-tight">Instal JASTIP SIAU untuk pengalaman terbaik!</p>
            </div>
            <Button onClick={handleInstallPWA} size="sm" className="bg-white text-primary h-8 px-3 text-[9px] font-black uppercase rounded-lg">Pasang App</Button>
          </div>
        </div>
      )}

      <header className="h-16 flex items-center border-b bg-white/95 backdrop-blur-md sticky top-0 z-[100] w-full shadow-sm px-4 lg:px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center group">
            <div className="p-1.5 rounded-lg bg-primary text-white shadow-md group-hover:scale-110 transition-transform"><Package className="h-5 w-5" /></div>
            <span className="ml-2 text-xl font-black tracking-tighter text-primary font-headline uppercase italic">JASTIP SIAU</span>
          </div>
          <nav className="flex gap-4 sm:gap-6 items-center">
            <button onClick={onGoToLogin} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Masuk</button>
            <Button onClick={onGoToRegister} variant="default" size="sm" className="h-9 px-6 text-[10px] font-black uppercase shadow-lg rounded-xl">Daftar</Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
              <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
                <div className="space-y-4">
                  <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mx-auto lg:mx-0">Terpercaya di Kepulauan Siau</div>
                  <h1 className="text-4xl font-black tracking-tighter sm:text-6xl xl:text-7xl/none font-headline text-primary uppercase leading-[0.9]">Titip Barang <br /> Apa Saja, <span className="text-accent italic">Aman & Terpercaya!</span></h1>
                  <p className="max-w-[600px] mx-auto lg:mx-0 text-muted-foreground text-sm md:text-lg font-medium leading-relaxed uppercase">Pesan belanjaan dari mana saja lewat kurir lokal pilihanmu. Transparan, cepat, dan praktis.</p>
                </div>
                
                <div className="flex flex-col gap-3 sm:flex-row justify-center lg:justify-start">
                  <Button onClick={onGoToRegister} size="lg" className="h-16 px-10 text-xs font-black uppercase bg-primary shadow-xl hover:translate-y-[-2px] transition-all rounded-2xl gap-2">Mulai Pesan Sekarang <ArrowRight className="h-4 w-4" /></Button>
                  <Button onClick={onGoToLogin} variant="outline" size="lg" className="h-16 px-10 text-xs font-black uppercase border-primary/20 hover:bg-primary/5 shadow-sm transition-all rounded-2xl">Dashboard Kurir</Button>
                </div>

                {!isStandalone && deferredPrompt && (
                  <Card className="border-2 border-primary/20 shadow-2xl bg-primary/5 rounded-[2.5rem] overflow-hidden mt-8 max-w-xl">
                    <CardContent className="p-6 md:p-8 space-y-4 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="h-16 w-16 rounded-[1.5rem] bg-primary flex items-center justify-center shadow-xl text-white shrink-0"><Download className="h-8 w-8" /></div>
                        <div className="flex-1 min-w-0"><h3 className="text-xl font-black uppercase text-primary tracking-tight">Instal di Smartphone</h3><p className="text-[11px] font-bold text-muted-foreground uppercase leading-relaxed mt-1 opacity-70">Akses lebih cepat, notifikasi instan, dan hemat kuota tanpa harus buka browser.</p></div>
                        <Button onClick={handleInstallPWA} size="lg" className="w-full sm:w-auto h-14 px-8 bg-primary text-[10px] font-black uppercase shadow-2xl rounded-2xl hover:scale-105 active:scale-95 transition-all">Pasang Sekarang</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              {heroImage && (
                <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-white transform lg:rotate-3 hover:rotate-0 transition-transform duration-700 hidden lg:block">
                  <Image src={heroImage.imageUrl} alt={heroImage.description} fill className="object-cover" unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent"></div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-4 py-12 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white">
        <div className="flex items-center gap-2"><Package className="h-5 w-5 text-primary" /><span className="text-sm font-black uppercase text-primary tracking-widest italic">JASTIP SIAU</span></div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">© 2024. Melayani dengan hati di Bumi Karangetang.</p>
      </footer>
    </div>
  );
}
