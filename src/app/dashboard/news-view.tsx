"use client";

/**
 * VIEW: Berita Developer (DEEP-LINK EDITION V32.000)
 * SOP: Penegakan kedaulatan navigasi langsung melalui parameter postId.
 * FIX: Aktivasi radar pendaratan otomatis untuk tautan yang dibagikan.
 */

import { useNewsController } from '@/hooks/controllers/use-news-controller';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  Newspaper, Loader2, Clock, X, Share2, 
  LayoutGrid, Quote, Zap, ArrowLeft, Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useToast } from '@/hooks/use-toast';
import { useView } from '@/context/view-context';

export default function NewsView() {
  const c = useNewsController();
  const { toast } = useToast();
  const { viewData } = useView();
  const [selectedPost, setSelectedPost] = useState<any>(null);

  // 1. RADAR PENDARATAN: Deteksi postId dari URL untuk pendaratan langsung
  useEffect(() => {
    if (viewData?.postId && c.news.length > 0) {
      const target = c.news.find((n: any) => n.id === viewData.postId);
      if (target) setSelectedPost(target);
    }
  }, [viewData?.postId, c.news]);

  const { headlines, archives } = useMemo(() => {
    const list = [...c.news].sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    const h = list.filter((p: any) => p.isHeadline === true).slice(0, 3);
    const hIds = h.map(x => x.id);
    const a = list.filter(p => !hIds.includes(p.id));
    return { headlines: h, archives: a };
  }, [c.news]);

  /**
   * ACTION: handleShare (SOP DEEP-LINK V32.000)
   * Menghasilkan tautan yang bertahta langsung ke ID berita terkait.
   */
  const handleShare = async (post: any) => {
    // SOP: Gunakan root URL + view=news + postId untuk pendaratan presisi
    const shareUrl = `${window.location.origin}/?view=news&postId=${post.id}`;
    
    const shareData = {
      title: `🗞️ ${post.title} - JASTIP SIAU`,
      text: post.content?.slice(0, 100) + '...',
      url: shareUrl,
    };

    try {
      if (typeof window !== 'undefined' && window.navigator.share) {
        await window.navigator.share(shareData);
        toast({ 
          title: "Sinyal Terpancar", 
          description: "Tautan berita langsung telah disiarkan." 
        });
      } else {
        copyToClipboard(shareUrl);
      }
    } catch (e) {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (url: string) => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Tautan Langsung Disalin",
        description: "Alamat berita bertahta di clipboard Anda.",
      });
    });
  };

  if (c.loading && c.news.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full bg-white">
      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      <p className="text-[10px] font-black uppercase text-primary/40 mt-4 tracking-widest">Sinkronisasi Kabar...</p>
    </div>
  );

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col bg-white">
      <FlexibleFrame
        title="Berita Developer"
        subtitle="Radar Informasi Strategis Siau"
        icon={Newspaper}
        variant="member"
        square={true} 
        scrollable={false}
      >
        <ScrollArea className="h-full w-full bg-white">
          <div className="space-y-0 pb-48 w-full animate-in fade-in duration-700">
            
            {/* 1. TRIPLE HEADLINE SLIDER */}
            {headlines.length > 0 && (
              <section className="w-full border-b border-primary/10 bg-slate-950 overflow-hidden">
                <Carousel
                  opts={{ align: "start", loop: true }}
                  plugins={[ Autoplay({ delay: 5000 }) ]}
                  className="w-full"
                >
                  <CarouselContent className="-ml-0">
                    {headlines.map((post) => (
                      <CarouselItem key={post.id} className="pl-0 basis-full">
                        <div 
                          className="relative w-full h-[400px] sm:h-[550px] cursor-pointer overflow-hidden bg-slate-950 group"
                          onClick={() => setSelectedPost(post)}
                        >
                          {post.imageUrl && (
                            <Image src={post.imageUrl} alt="Headline" fill className="object-cover opacity-60 transition-transform duration-[2000ms] group-hover:scale-110" unoptimized />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                          
                          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 space-y-3 z-10">
                             <div className="flex flex-wrap gap-2">
                                <Badge className="bg-orange-600 text-white border-none text-[8px] font-black uppercase px-3 h-5 rounded-none tracking-widest animate-pulse">
                                   <Zap className="h-3 w-3 mr-1.5 fill-current" /> HEADLINE
                                </Badge>
                                <Badge className="bg-white/10 backdrop-blur-md text-white border border-white/20 text-[8px] font-black uppercase px-3 h-5 rounded-none">
                                  {post.category?.toUpperCase()}
                                </Badge>
                             </div>
                             <h1 className="text-white font-black uppercase leading-[0.85] tracking-tighter drop-shadow-2xl transition-all group-hover:text-accent text-2xl sm:text-7xl max-w-4xl">
                                {post.title}
                             </h1>
                             <p className="text-[10px] font-black uppercase text-white/60 tracking-[0.4em] leading-none pt-2 flex items-center gap-2">
                               <Calendar className="h-3 w-3" />
                               {post.createdAt?.seconds ? format(new Date(post.createdAt.seconds * 1000), 'dd MMMM yyyy', { locale: id }) : '-'}
                             </p>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </section>
            )}

            {/* 2. ARSIP GRID */}
            <div className="w-full bg-white">
               <div className="flex items-center justify-between p-4 border-b border-primary/5 bg-slate-50">
                  <div className="flex items-center gap-2">
                     <div className="h-6 w-6 rounded-none bg-primary/10 flex items-center justify-center text-primary"><LayoutGrid className="h-3.5 w-3.5" /></div>
                     <h3 className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Arsip Kabar Terbaru</h3>
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y divide-primary/5 sm:divide-y-0 sm:divide-x border-b border-primary/5">
                  {archives.map((post: any) => (
                    <div 
                      key={post.id} 
                      className="flex flex-col group cursor-pointer hover:bg-slate-50 transition-all duration-300"
                      onClick={() => setSelectedPost(post)}
                    >
                       <div className="relative aspect-[21/9] bg-muted overflow-hidden">
                          {post.imageUrl && (
                            <Image src={post.imageUrl} alt="News" fill className="object-cover transition-transform duration-700 group-hover:scale-110" unoptimized />
                          )}
                          <div className="absolute top-0 left-0">
                             <Badge className="bg-primary text-white border-none text-[6px] font-black uppercase px-3 h-5 flex items-center rounded-none shadow-xl">{post.category}</Badge>
                          </div>
                       </div>
                       <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-1.5">
                             <h3 className="text-[16px] font-black uppercase text-primary leading-[0.95] group-hover:text-blue-800 transition-colors line-clamp-3 tracking-tight">{post.title}</h3>
                             <p className="text-[11px] font-medium text-muted-foreground uppercase line-clamp-2 leading-tight opacity-70 italic">
                               "{post.content}"
                             </p>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-dashed border-primary/5">
                             <span className="text-[8px] font-black text-primary/40 uppercase">#{post.labels?.[0] || 'Kabar'}</span>
                             <span className="text-[8px] font-black text-muted-foreground uppercase opacity-40">
                               {post.createdAt?.seconds ? format(new Date(post.createdAt.seconds * 1000), 'dd/MM/yy') : '-'}
                             </span>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </ScrollArea>
      </FlexibleFrame>

      {/* 3. LIGHTBOX READER: FULL-FLUSH IMMERSIVE */}
      {selectedPost && (
        <div className="fixed inset-0 z-[1000] bg-white flex flex-col animate-in slide-in-from-bottom duration-500">
           <header className="p-3 border-b flex items-center justify-between shrink-0 bg-white z-20">
              <div className="flex items-center gap-3">
                 <button onClick={() => setSelectedPost(null)} className="h-10 w-10 bg-primary text-white flex items-center justify-center rounded-none active:scale-75 transition-all">
                    <ArrowLeft className="h-5 w-5" />
                 </button>
                 <div className="min-w-0">
                    <p className="text-[7px] font-black text-primary/40 uppercase tracking-widest leading-none">Berita Developer</p>
                    <h4 className="text-[10px] font-black uppercase text-primary truncate mt-1 leading-none">{selectedPost.title}</h4>
                 </div>
              </div>
              <button onClick={() => setSelectedPost(null)} className="h-10 w-10 bg-slate-100 text-primary flex items-center justify-center active:scale-75"><X className="h-5 w-5" /></button>
           </header>

           <ScrollArea className="flex-1">
              <article className="pb-40">
                 {selectedPost.imageUrl && (
                   <div className="relative w-full aspect-[21/9] bg-slate-950">
                      <img src={selectedPost.imageUrl} className="w-full h-full object-cover opacity-80" alt="Hero" />
                      <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
                   </div>
                 )}
                 
                 <div className="px-5 sm:px-10 md:px-20 lg:px-40 max-w-4xl mx-auto space-y-6 pt-8">
                    <header className="space-y-4 border-b pb-6 border-primary/5">
                       <Badge className="bg-primary text-white border-none font-black text-[8px] uppercase px-4 h-6 rounded-none shadow-lg">{selectedPost.category}</Badge>
                       <h1 className="text-3xl sm:text-6xl font-black uppercase text-primary leading-[0.85] tracking-tighter">
                         {selectedPost.title}
                       </h1>
                       <div className="flex items-center gap-3 text-[9px] font-black uppercase text-muted-foreground opacity-60">
                          <Clock className="h-3 w-3" />
                          <span>{selectedPost.createdAt?.seconds ? format(new Date(selectedPost.createdAt.seconds * 1000), 'EEEE, dd MMMM yyyy', { locale: id }) : '-'}</span>
                       </div>
                    </header>

                    <div className="prose prose-slate max-w-none">
                       <div className="p-6 bg-slate-50 border-x-4 border-primary/10 relative shadow-inner">
                          <Quote className="absolute top-4 left-4 h-8 w-8 text-primary/5 -rotate-12" />
                          <div className="text-[16px] sm:text-[20px] font-medium leading-[1.2] uppercase tracking-tight text-primary/90 whitespace-pre-wrap italic relative z-10">
                             {selectedPost.content}
                          </div>
                       </div>
                    </div>

                    <footer className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                       <div className="flex items-center gap-3 opacity-40">
                          <div className="h-12 w-12 rounded-none bg-primary text-white flex items-center justify-center font-black text-xl">S</div>
                          <p className="text-[12px] font-black uppercase tracking-tighter">Redaksi Developer Jastip Siau</p>
                       </div>
                       <Button 
                         variant="default" 
                         size="sm" 
                         className="h-12 px-8 bg-primary text-white rounded-none font-black uppercase text-[10px] gap-2 shadow-xl active:scale-95 transition-all" 
                         onClick={() => handleShare(selectedPost)}
                       >
                          <Share2 className="h-4 w-4" /> Bagikan Kabar
                       </Button>
                    </footer>
                 </div>
              </article>
           </ScrollArea>
        </div>
      )}
    </div>
  );
}