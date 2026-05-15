
"use client";

/**
 * COMPONENT: Community Edit Dialog (REFINED)
 * SOP: Menangani status scroll body agar tidak terkunci setelah modal ditutup.
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogPortal, DialogOverlay } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export function CommunityEditDialog({ isOpen, onClose, content, setContent, onSave, isUpdating, checkForbiddenWords }: any) {
  
  // SOP STABILITAS SCROLL: Paksa body untuk bisa di-scroll kembali saat komponen ini unmount
  useEffect(() => {
    return () => {
      document.body.style.pointerEvents = 'auto';
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    // Berikan jeda sedikit agar transisi Radix UI selesai sebelum kita paksa scroll
    setTimeout(() => {
      document.body.style.pointerEvents = 'auto';
      document.body.style.overflow = 'auto';
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && handleClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
        <DialogContent className="w-[92vw] sm:max-w-md rounded-[2rem] p-6 border-none shadow-2xl z-[200] overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
            <DialogTitle className="text-xl font-black uppercase text-primary tracking-tighter">Koreksi Kabar</DialogTitle>
            <button onClick={handleClose} className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-primary active:scale-75 transition-all"><X className="h-4 w-4" /></button>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/10">
               <p className="text-[9px] font-bold text-primary/60 uppercase mb-2">Pastikan kabar yang Anda perbarui tetap menjunjung etika warga Siau.</p>
               <Textarea 
                className={cn(
                  "min-h-[120px] bg-white border-none rounded-xl p-4 font-bold text-sm shadow-inner focus-visible:ring-1 focus-visible:ring-primary/20", 
                  checkForbiddenWords(content) ? "ring-2 ring-red-500" : ""
                )} 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                placeholder="Tulis koreksi di sini..."
               />
            </div>
            
            {checkForbiddenWords(content) && (
              <p className="text-[8px] font-black text-red-600 uppercase text-center animate-pulse">Peringatan: Kata terlarang terdeteksi!</p>
            )}
          </div>

          <DialogFooter className="flex flex-row gap-3 pt-6">
             <Button variant="ghost" className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] border" onClick={handleClose}>Batal</Button>
             <Button 
              className="flex-1 h-12 bg-primary text-white rounded-xl font-black uppercase text-[10px] shadow-lg gap-2 active:scale-95 transition-all" 
              onClick={onSave} 
              disabled={isUpdating || !content.trim() || checkForbiddenWords(content)}
             >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Simpan
             </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

