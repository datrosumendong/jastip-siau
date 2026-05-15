"use client";

/**
 * COMPONENT: Community Post Input (ULTRA COMPACT REFINED)
 * SOP: Memadatkan tata letak dan memangkas jarak enter lebay.
 * FIX: Menjamin input postingan tetap padat dan profesional di smartphone.
 */

import { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Camera, ImageIcon, X, Send, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CommunityPostInput({ 
  newPost, setNewPost, postImage, setPostImage, posting, isCompressing, setIsCompressing, handleCreatePost, checkForbiddenWords, profile 
}: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const isPostDirty = checkForbiddenWords(newPost);

  const handleImageInput = (file: File) => {
    if (!file) return;
    setIsCompressing(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 800;
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let sX = 0, sY = 0, sW = img.width, sH = img.height;
        if (img.width > img.height) { sW = img.height; sX = (img.width - img.height) / 2; }
        else { sH = img.width; sY = (img.height - img.width) / 2; }

        ctx.drawImage(img, sX, sY, sW, sH, 0, 0, size, size);
        setPostImage(canvas.toDataURL('image/webp', 0.6));
        setIsCompressing(false);
      };
    };
  };

  if (profile?.hasActiveDebt) return null;

  return (
    <Card className="border-none shadow-md rounded-[1.2rem] overflow-hidden bg-white ring-1 ring-primary/5 mx-1">
      <CardContent className="p-2 space-y-1.5">
        {isPostDirty && (
          <div className="flex items-center gap-1.5 text-red-600 bg-red-50 p-1 rounded-lg animate-in slide-in-from-top-1 border border-red-100">
            <AlertTriangle className="h-3 w-3" />
            <span className="text-[7px] font-black uppercase">Kata dilarang terdeteksi!</span>
          </div>
        )}
        <div className="flex gap-2">
          <Avatar className="h-8 w-8 border shadow-sm shrink-0"><AvatarImage src={profile?.imageUrl} /><AvatarFallback className="text-[9px] font-black uppercase">{(profile?.fullName || "U").charAt(0)}</AvatarFallback></Avatar>
          <div className="flex-1 space-y-1">
            <Textarea 
              placeholder="Siarkan kabar Siau..." 
              className={cn(
                "w-full bg-muted/30 border-none rounded-xl p-2 text-[11px] font-bold resize-none min-h-[40px] shadow-inner focus-visible:ring-1 focus-visible:ring-primary/20 leading-tight", 
                isPostDirty ? "ring-2 ring-red-500" : ""
              )}
              value={newPost} onChange={(e) => setNewPost(e.target.value)}
            />
            {postImage && (
              <div className="relative w-full aspect-square max-w-[100px] rounded-lg overflow-hidden border-2 border-white shadow-md mt-1">
                <img src={postImage} className="w-full h-full object-cover" />
                <button className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center shadow-lg" onClick={() => setPostImage(null)}><X className="h-3 w-3" /></button>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-dashed">
          <div className="flex gap-1">
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={(e) => { const f = e.target.files?.[0]; if(f) handleImageInput(f); }} />
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => { const f = e.target.files?.[0]; if(f) handleImageInput(f); }} />
            <Button variant="ghost" size="sm" className="h-7 text-[7px] font-black uppercase rounded-lg px-2" onClick={() => cameraInputRef.current?.click()} disabled={isCompressing}><Camera className="h-3.5 w-3.5 mr-1" /> Kamera</Button>
            <Button variant="ghost" size="sm" className="h-7 text-[7px] font-black uppercase rounded-lg px-2" onClick={() => fileInputRef.current?.click()} disabled={isCompressing}><ImageIcon className="h-3.5 w-3.5 mr-1" /> Galeri</Button>
          </div>
          <Button onClick={handleCreatePost} disabled={posting || (!newPost.trim() && !postImage) || isPostDirty || isCompressing} className="h-8 px-4 bg-primary text-white rounded-lg font-black uppercase text-[9px] shadow-md active:scale-95">
             {posting ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Send className="h-3 w-3 mr-1" /> Posting</>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}