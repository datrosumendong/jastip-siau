
"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Package, Truck, MessageSquare, ShieldCheck, ArrowRight, ArrowLeft, Store, Zap } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const steps: TutorialStep[] = [
  {
    title: "Selamat Datang!",
    description: "Halo warga Siau! Sekarang belanja kebutuhan sehari-hari jadi lebih mudah dengan Jastip Siau. Titip apapun, kapanpun.",
    icon: Package,
    color: "bg-primary"
  },
  {
    title: "Pilih Kurir Favorit",
    description: "Anda bebas memilih kurir lokal yang Anda percayai. Cek status online mereka di menu 'Cari Kurir'.",
    icon: Truck,
    color: "bg-green-600"
  },
  {
    title: "Belanja UMKM Lokal",
    description: "Dukung ekonomi Siau dengan membeli produk langsung dari mitra UMKM di menu 'Marketplace'.",
    icon: Store,
    color: "bg-orange-600"
  },
  {
    title: "Chat Real-time",
    description: "Komunikasi lancar dengan kurir lewat fitur chat aplikasi untuk update lokasi dan harga belanjaan.",
    icon: MessageSquare,
    color: "bg-blue-600"
  },
  {
    title: "Keamanan Transaksi",
    description: "Kami mencatat log transaksi secara permanen demi keamanan bersama. Jujur dalam bertransaksi adalah kunci.",
    icon: ShieldCheck,
    color: "bg-purple-600"
  }
];

export function TutorialOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useUser();
  const db = useFirestore();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleFinish = async () => {
    if (user && db) {
      await updateDoc(doc(db, 'users', user.uid), { hasSeenTutorial: true }).catch(() => {});
    }
    onClose();
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleFinish()}>
      <DialogContent className="w-[94vw] sm:max-w-md p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl animate-in zoom-in-95">
        <div className={`h-40 ${step.color} flex items-center justify-center transition-colors duration-500`}>
          <div className="p-6 rounded-[2rem] bg-white/20 backdrop-blur-md shadow-xl">
             <Icon className="h-16 w-16 text-white" />
          </div>
        </div>
        
        <div className="p-8 text-center space-y-4">
           <div className="space-y-1">
              <h2 className="text-2xl font-black uppercase text-primary tracking-tighter">{step.title}</h2>
              <div className="flex justify-center gap-1.5 mt-2">
                 {steps.map((_, i) => (
                   <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-primary' : 'w-1.5 bg-muted'}`} />
                 ))}
              </div>
           </div>
           <p className="text-sm font-medium text-muted-foreground leading-relaxed uppercase">
             {step.description}
           </p>
        </div>

        <DialogFooter className="p-6 bg-muted/5 border-t flex flex-row gap-3">
          {currentStep > 0 && (
            <Button variant="ghost" onClick={handleBack} className="h-12 w-12 rounded-2xl p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Button 
            className={`flex-1 h-14 font-black uppercase text-xs rounded-2xl shadow-xl transition-all ${currentStep === steps.length - 1 ? 'bg-green-600' : 'bg-primary'}`}
            onClick={handleNext}
          >
            {currentStep === steps.length - 1 ? "Mulai Belanja" : "Lanjut"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
