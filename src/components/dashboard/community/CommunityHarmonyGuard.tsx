
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HandHeart } from 'lucide-react';

export function CommunityHarmonyGuard({ isOpen, onClose }: any) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[85vw] sm:max-w-[300px] rounded-[2rem] p-6 border-none shadow-2xl z-[200]">
        <DialogHeader className="text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-green-50 flex items-center justify-center mb-4"><HandHeart className="h-7 w-7 text-green-600" /></div>
          <DialogTitle className="text-lg font-black uppercase text-primary leading-tight">Etika Siau</DialogTitle>
          <DialogDescription className="text-[9px] font-bold text-muted-foreground uppercase mt-2">Jaga marwah Bumi Karangetang dengan tutur kata santun.</DialogDescription>
        </DialogHeader>
        <Button className="w-full h-12 bg-primary text-white rounded-xl font-black uppercase text-[10px] shadow-lg mt-4" onClick={onClose}>Saya Mengerti</Button>
      </DialogContent>
    </Dialog>
  );
}
