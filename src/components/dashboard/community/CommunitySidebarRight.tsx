"use client";

/**
 * COMPONENT: Community Sidebar Right (FIX RESPONSIVITAS)
 * SOP: Menjamin sinkronisasi data ekonomi warga terkunci pada lebar kontainer.
 */

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquareHeart, Heart, MessageSquare, Store, ArrowRight } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { useMemo } from 'react';
import { collection, query, limit, orderBy } from 'firebase/firestore';

export function CommunitySidebarRight({ popularPosts, testimonials, onlineCouriers, setView, commentsMap, onPostClick }: any) {
  const db = useFirestore();

  const productsQuery = useMemo(() => 
    db ? query(collection(db, 'products'), limit(3), orderBy('createdAt', 'desc')) : null, 
  [db]);
  const { data: products = [] } = useCollection(productsQuery, true);

  return (
    <div className="flex flex-col gap-4 w-full min-w-0 overflow-hidden">
      {/* CARD: KABAR POPULER */}
      <Card className="border-none shadow-sm rounded-[1.5rem] overflow-hidden bg-white ring-1 ring-primary/5 w-full">
          <CardHeader className="p-4 bg-primary/[0.03] border-b flex flex-row items-center justify-between min-w-0">
             <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-6 w-6 rounded-lg bg-red-50 flex items-center justify-center text-red-500 shadow-sm shrink-0">
                   <Heart className="h-3.5 w-3.5 fill-current animate-pulse" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-primary truncate">Kabar Populer</span>
             </div>
          </CardHeader>
          <CardContent className="p-2 space-y-1.5 w-full min-w-0 overflow-hidden">
             {popularPosts.length === 0 ? (
               <div className="p-6 text-center opacity-20"><span className="text-[8px] font-black uppercase tracking-tighter">Sunyi...</span></div>
             ) : popularPosts.map((p: any) => (
               <div key={p.id} className="p-2.5 rounded-xl bg-white border border-primary/5 hover:border-primary/20 transition-all cursor-pointer min-w-0 overflow-hidden" onClick={() => onPostClick(p)}>
                  <p className="text-[9px] font-bold text-primary/80 uppercase truncate italic leading-none mb-1.5">"{p.content}"</p>
                  <div className="flex items-center gap-3 opacity-50">
                     <div className="flex items-center gap-1 text-[7px] font-black uppercase"><Heart className="h-2.5 w-2.5" /> {p.likes?.length || 0}</div>
                     <div className="flex items-center gap-1 text-[7px] font-black uppercase"><MessageSquare className="h-2.5 w-2.5" /> {(commentsMap[p.id] || []).length}</div>
                  </div>
               </div>
             ))}
          </CardContent>
      </Card>

      {/* CARD: PASAR SIAU */}
      <Card className="border-none shadow-sm rounded-[1.5rem] overflow-hidden bg-white ring-1 ring-orange-100 w-full">
          <CardHeader className="p-4 bg-orange-50/50 border-b flex flex-row items-center justify-between min-w-0">
             <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-6 w-6 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-md shrink-0">
                   <Store className="h-3.5 w-3.5" />
                </div>
                <span className="text-[9px] font-black uppercase text-orange-900 tracking-widest truncate">Pasar Siau</span>
             </div>
          </CardHeader>
          <CardContent className="p-2 space-y-1.5 w-full min-w-0">
             {products.length === 0 ? (
               <div className="p-6 text-center opacity-20"><span className="text-[8px] font-black uppercase">Kosong</span></div>
             ) : products.map((p: any) => (
               <div key={p.id} className="p-1.5 rounded-xl bg-orange-50/20 border border-orange-100/30 flex items-center gap-2.5 w-full shadow-sm min-w-0 overflow-hidden">
                  <div className="h-9 w-9 rounded-lg bg-white overflow-hidden shrink-0 border border-orange-100">
                     <img src={p.imageUrl} className="w-full h-full object-cover" alt="Product" />
                  </div>
                  <div className="min-w-0 flex-1">
                     <p className="text-[9px] font-black text-primary uppercase truncate leading-none mb-0.5">{p.name}</p>
                     <p className="text-[8px] font-black text-orange-600 tracking-tighter">Rp{p.price?.toLocaleString()}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-orange-600 rounded-lg hover:bg-orange-100 shrink-0" onClick={() => setView('shop_detail', { storeId: p.umkmId })}><ArrowRight className="h-3 w-3" /></Button>
               </div>
             ))}
          </CardContent>
      </Card>

      {/* CARD: SUARA WARGA */}
      <Card className="border-none shadow-sm rounded-[1.5rem] overflow-hidden bg-white ring-1 ring-pink-100 w-full">
          <CardHeader className="p-4 bg-pink-50/50 border-b flex flex-row items-center justify-between min-w-0">
             <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-6 w-6 rounded-lg bg-pink-600 flex items-center justify-center text-white shadow-md shrink-0">
                   <MessageSquareHeart className="h-3.5 w-3.5" />
                </div>
                <span className="text-[9px] font-black uppercase text-pink-900 tracking-widest truncate">Suara Warga</span>
             </div>
          </CardHeader>
          <CardContent className="p-2 space-y-1.5 w-full min-w-0">
             {testimonials.slice(0, 2).map((t: any) => (
               <div key={t.id} className="p-2.5 rounded-xl bg-pink-50/10 italic border border-pink-100/20 min-w-0 overflow-hidden">
                  <p className="text-[9px] font-bold text-pink-900 leading-relaxed uppercase line-clamp-2 break-words">"{t.message}"</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-pink-100/30">
                     <div className="flex items-center gap-1.5 min-w-0">
                        <Avatar className="h-5 w-5 border border-white shrink-0"><AvatarImage src={t.userPhoto} className="object-cover" /></Avatar>
                        <span className="text-[7px] font-black uppercase text-pink-700 truncate">{t.userName?.split(' ')[0]}</span>
                     </div>
                     <Star className="h-2 w-2 fill-yellow-400 text-yellow-400 shrink-0" />
                  </div>
               </div>
             ))}
          </CardContent>
      </Card>
    </div>
  );
}
