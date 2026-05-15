"use client";

/**
 * COMPONENT: Community Sidebar Left (FIX RESPONSIVITAS)
 * SOP: Menjamin seluruh konten terkunci pada lebar kontainer agar tidak meluber.
 */

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, ImageIcon, MessageSquare, Clock, ChevronRight, User } from 'lucide-react';
import dynamic from 'next/dynamic';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const OrderMap = dynamic(() => import('@/components/order-map'), {
  ssr: false,
  loading: () => <div className="h-[140px] w-full bg-muted/20 animate-pulse flex items-center justify-center font-black text-[8px] uppercase">Sinkronisasi Peta...</div>
});

export function CommunitySidebarLeft({ profile, posts, user, setView, onPostClick }: any) {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const userGallery = (posts || []).filter((p: any) => p.userId === user?.uid && p.imageUrl).slice(0, 12);
  const myPosts = (posts || []).filter((p: any) => p.userId === user?.uid).slice(0, 5);

  return (
    <div className="flex flex-col gap-4 w-full min-w-0 overflow-hidden">
      {/* CARD: PROFIL & MAP */}
      <Card className="border-none shadow-md rounded-[1.8rem] overflow-hidden bg-white ring-1 ring-primary/5 w-full">
         <div className="h-[140px] w-full relative z-0 bg-primary/[0.02] border-b overflow-hidden shrink-0">
            {isReady && profile?.latitude ? (
              <OrderMap destLat={profile.latitude} destLng={profile.longitude} />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center gap-2 opacity-10">
                <MapPin className="h-8 w-8 text-primary" />
                <span className="text-[7px] font-black uppercase tracking-widest">Radar GPS</span>
              </div>
            )}
         </div>

         <CardContent className="p-5 flex flex-col items-center text-center space-y-4 w-full min-w-0 overflow-hidden">
            <div className="relative shrink-0">
               <Avatar 
                 className="h-16 w-16 border-[4px] border-white shadow-xl cursor-pointer active:scale-95 transition-all rounded-full ring-1 ring-primary/5"
                 onClick={() => setView('profile_user', { id: user?.uid })}
               >
                  <AvatarImage src={profile?.imageUrl} className="object-cover rounded-full" />
                  <AvatarFallback className="bg-primary/5 text-primary text-xl font-black uppercase">
                    {(profile?.fullName || "U").charAt(0)}
                  </AvatarFallback>
               </Avatar>
               {profile?.isOnline && (
                 <div className="absolute top-0 right-0 h-4 w-4 bg-green-500 border-2 border-white rounded-full animate-pulse" />
               )}
            </div>
            
            <div className="min-w-0 w-full px-1">
              <h3 className="text-[14px] font-black uppercase text-primary truncate tracking-tighter leading-none mb-1">
                {profile?.fullName || "Warga Siau"}
              </h3>
              <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase px-2 h-4 rounded-full">
                {profile?.role || "MEMBER"}
              </Badge>
            </div>
            
            <div className="p-3 bg-muted/20 rounded-xl italic w-full border border-primary/5 shadow-inner overflow-hidden min-w-0">
               <p className="text-[9px] font-bold text-primary/70 uppercase leading-relaxed line-clamp-3 break-words">
                 "{profile?.bio || "Melayani dengan integritas."}"
               </p>
            </div>
         </CardContent>
      </Card>

      {/* CARD: KABAR SAYA */}
      <Card className="border-none shadow-sm rounded-[1.5rem] bg-white overflow-hidden ring-1 ring-primary/5 w-full">
         <div className="p-4 bg-primary/[0.03] border-b flex items-center justify-between min-w-0">
            <div className="flex items-center gap-2.5 min-w-0">
               <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0"><MessageSquare className="h-3.5 w-3.5" /></div>
               <span className="text-[9px] font-black uppercase tracking-widest text-primary truncate">Kabar Saya</span>
            </div>
            <Badge className="bg-primary text-white border-none text-[8px] font-black h-4.5 min-w-[1rem] px-1.5 rounded-lg shrink-0">
              {myPosts.length}
            </Badge>
         </div>
         <div className="p-2 space-y-1 w-full min-w-0">
            {myPosts.length === 0 ? (
              <div className="py-4 text-center opacity-30"><p className="text-[8px] font-black uppercase italic">Belum ada siaran.</p></div>
            ) : myPosts.map((mp: any) => (
              <div key={mp.id} className="p-2.5 rounded-xl bg-white border border-primary/5 hover:border-primary/20 transition-all cursor-pointer group min-w-0 overflow-hidden" onClick={() => onPostClick(mp)}>
                 <p className="text-[9px] font-bold text-primary/80 uppercase truncate italic leading-none mb-1">"{mp.content}"</p>
                 <div className="flex items-center justify-between opacity-40">
                    <span className="text-[7px] font-black uppercase">{mp.createdAt?.seconds ? formatDistanceToNow(new Date(mp.createdAt.seconds * 1000), { addSuffix: true, locale: id }) : 'Baru'}</span>
                    <ChevronRight className="h-3 w-3" />
                 </div>
              </div>
            ))}
         </div>
      </Card>

      {/* CARD: GALERI SIARAN */}
      <Card className="border-none shadow-sm rounded-[1.5rem] bg-white p-3 space-y-3 ring-1 ring-primary/5 w-full overflow-hidden">
         <div className="flex items-center gap-2 px-1">
            <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0"><ImageIcon className="h-3.5 w-3.5" /></div>
            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 truncate">Galeri Foto</h4>
         </div>
         <div className="grid grid-cols-4 gap-1.5 w-full">
            {userGallery.length === 0 ? (
              <div className="col-span-4 py-6 text-center opacity-10 bg-muted/20 rounded-xl border-dashed border-2"><span className="text-[8px] font-black uppercase">Kosong</span></div>
            ) : userGallery.map((p: any, i: number) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden border border-white bg-muted/20 shadow-sm active:scale-90 transition-transform cursor-pointer" onClick={() => onPostClick(p)}>
                 <img src={p.imageUrl} className="w-full h-full object-cover" alt="Gallery" />
              </div>
            ))}
         </div>
      </Card>
    </div>
  );
}
