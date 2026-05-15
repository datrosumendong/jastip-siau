"use client";

/**
 * COMPONENT: Community Mobile Drawer (TITANIUM WIDTH GUARD)
 * SOP: Mengunci posisi tepat di bawah Header (top-16) dan menjamin kedaulatan lebar 100%.
 * FIX: Menjamin stabilitas lebar 100% dengan w-full, min-w-0, dan overflow-x-hidden mutlak.
 * FIX: Memastikan ScrollArea menjamin viewport tetap selaras dengan lebar layar smartphone.
 */

import { X, PanelLeft, ShieldCheck, Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CommunitySidebarLeft } from './CommunitySidebarLeft';
import { CommunitySidebarRight } from './CommunitySidebarRight';
import { cn } from '@/lib/utils';

export function CommunityMobileDrawer({ 
  isOpen, onClose, profile, posts, user, popularPosts, testimonials, onlineCouriers, setView, commentsMap, onPostClick 
}: any) {
  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed top-16 left-0 right-0 bottom-0 z-[450] lg:hidden flex flex-col bg-[#F8FAFC]",
      "animate-in slide-in-from-left duration-300 overflow-hidden w-full h-[calc(100svh-64px)] max-w-full box-border"
    )}>
      
      {/* HEADER LACI: STICKY & RIGID WIDTH */}
      <header className="px-4 py-4 border-b flex items-center justify-between bg-white shrink-0 shadow-sm z-50 w-full min-w-0 box-border">
         <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
               <PanelLeft className="h-5 w-5" />
            </div>
            <div className="min-w-0">
               <h2 className="text-[12px] font-black uppercase tracking-widest text-primary leading-none truncate">Menu Warga</h2>
               <p className="text-[7px] font-bold text-muted-foreground uppercase mt-1">Radar Siau Connect</p>
            </div>
         </div>
         <button 
          onClick={onClose} 
          className="h-10 w-10 rounded-full bg-muted/5 flex items-center justify-center text-primary active:scale-75 transition-all shadow-inner border border-primary/5 shrink-0 ml-4"
         >
            <X className="h-5 w-5" />
         </button>
      </header>

      {/* CONTENT AREA: TITANIUM WIDTH LOCK */}
      <div className="flex-1 w-full max-w-full overflow-hidden bg-inherit box-border min-w-0">
        <ScrollArea className="h-full w-full">
          <div className="flex flex-col p-4 space-y-8 w-full max-w-full overflow-x-hidden box-border pb-32 min-w-0">
             
             {/* SIDEBAR KIRI (PROFIL & MAP) - MOBILE FLUID LOCK */}
             <div className="w-full max-w-full overflow-hidden box-border min-w-0 flex flex-col">
               <CommunitySidebarLeft 
                 profile={profile} 
                 posts={posts} 
                 user={user} 
                 setView={setView} 
                 onPostClick={(post: any) => {
                   onPostClick(post);
                   onClose();
                 }}
               />
             </div>

             {/* SIDEBAR KANAN (DATA EKONOMI) - MOBILE FLUID LOCK */}
             <div className="w-full max-w-full overflow-hidden box-border min-w-0 flex flex-col">
               <CommunitySidebarRight 
                 popularPosts={popularPosts} 
                 testimonials={testimonials} 
                 onlineCouriers={onlineCouriers} 
                 setView={setView} 
                 commentsMap={commentsMap} 
                 onPostClick={(post: any) => {
                   onPostClick(post);
                   onClose();
                 }}
               />
             </div>

             {/* FOOTER KEAMANAN */}
             <div className="p-6 rounded-[2rem] bg-primary text-white shadow-xl relative overflow-hidden w-full shrink-0 box-border border-4 border-white/10 min-w-0">
                <ShieldCheck className="absolute -bottom-6 -right-6 h-24 w-24 opacity-10 rotate-12" />
                <div className="relative z-10 space-y-2 min-w-0">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 truncate"><Info className="h-4 w-4 text-accent shrink-0" /> Integritas Radar</h4>
                   <p className="text-[8px] font-medium uppercase leading-relaxed opacity-90 italic break-words">
                      SOP Jastip Siau: Seluruh aktivitas warga di feed terpantau secara real-time demi keamanan dan kenyamanan bersama.
                   </p>
                </div>
             </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
