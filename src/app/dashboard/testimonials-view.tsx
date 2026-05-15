
"use client";

/**
 * VIEW: Suara Warga (ULTRA LANDSCAPE V950 - APPROVED ONLY)
 * SOP: Penegakan kedaulatan visual kaku Lanskap 100% Horizontal.
 * SOP: Filter kaku - HANYA menampilkan ulasan yang sudah resmi DISETUJUI Admin.
 * FIX: Menghilangkan ulasan pending/draft dari pandangan publik sesuai instruksi pimpinan.
 */

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Loader2, Quote, Calendar, CheckCircle2, Hash, Clock } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function TestimonialsView() {
  const db = useFirestore();

  const testiQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'testimonials'), limit(200));
  }, [db]);

  const { data: rawTesti = [], loading } = useCollection(testiQuery, true);

  const testimonials = useMemo(() => {
    return [...rawTesti]
      .filter((t: any) => t.isApproved === true) // SOP: Filter mutlak ulasan terverifikasi
      .sort((a: any, b: any) => {
        const tA = a.createdAt?.seconds || 0;
        const tB = b.createdAt?.seconds || 0;
        return tB - tA; 
      });
  }, [rawTesti]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] space-y-4">
      <Loader2 className="animate-spin h-10 w-10 text-primary opacity-20" />
      <p className="text-[10px] font-black uppercase text-primary/40 animate-pulse tracking-widest">Sinkronisasi Vault Reputasi...</p>
    </div>
  );

  return (
    <FlexibleFrame
      title="Suara Warga"
      subtitle="Kesan & Apresiasi Terverifikasi Warga Siau"
      icon={CheckCircle2}
      variant="member"
    >
      <div className="space-y-4 pb-48 px-1">
        {testimonials.length === 0 ? (
          <div className="py-32 text-center bg-white rounded-[2.5rem] border-dashed border-2 opacity-30 flex flex-col items-center justify-center space-y-4">
             <Quote className="h-16 w-16 text-muted-foreground/50" />
             <p className="text-[11px] font-black uppercase tracking-[0.4em] px-10 leading-relaxed text-center">Pangkalan ulasan bersih.</p>
          </div>
        ) : (
          testimonials.map((testi: any) => {
            const date = testi.createdAt?.seconds ? new Date(testi.createdAt.seconds * 1000) : new Date();

            return (
              <Card key={testi.id} className="overflow-hidden border-none shadow-xl bg-white rounded-[2rem] transition-all animate-in slide-in-from-bottom-2 ring-1 ring-primary/5">
                 {/* SOP LANDSKAP MUTLAK: Menggunakan flex-row secara rigid tanpa breakpoint vertikal */}
                 <div className="flex flex-row min-h-[160px] sm:min-h-[220px]">
                    
                    {/* PILAR KIRI: BENTENG KURIR (RIGID WIDTH) */}
                    <div className="w-[110px] sm:w-[180px] bg-primary/[0.03] p-4 flex flex-col items-center justify-center border-r border-primary/5 text-center shrink-0">
                       <div className="relative mb-2 sm:mb-3">
                          <Avatar className="h-14 w-14 sm:h-20 sm:w-20 border-[3px] sm:border-[6px] border-white shadow-lg rounded-full ring-1 ring-primary/5">
                             <AvatarImage src={testi.courierPhoto} className="object-cover rounded-full" />
                             <AvatarFallback className="bg-primary/5 text-primary text-lg sm:text-2xl font-black uppercase">K</AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 bg-green-500 rounded-full p-1 sm:p-1.5 border-2 border-white shadow-lg">
                             <CheckCircle2 className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-white" />
                          </div>
                       </div>
                       <h3 className="text-[9px] sm:text-[13px] font-black uppercase text-primary truncate w-full mb-1 tracking-tighter leading-none">{testi.courierName?.split(' ')[0]}</h3>
                       <div className="flex gap-0.5 mb-2 sm:mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={cn("h-2.5 w-2.5 sm:h-3.5 sm:w-3.5", i < (testi.rating || 5) ? "fill-yellow-400 text-yellow-400" : "text-slate-200")} />
                          ))}
                       </div>
                       <Badge variant="outline" className="bg-white border-primary/10 text-primary text-[6px] sm:text-[8px] font-black uppercase px-1.5 sm:px-3 h-4 sm:h-5 rounded-lg shadow-sm">HERO LOGISTIK</Badge>
                    </div>

                    {/* PILAR KANAN: LEMBAH ASPIRASI (WIDE AREA) */}
                    <div className="flex-1 p-4 sm:p-8 flex flex-col relative min-w-0 bg-white">
                       <Quote className="absolute top-4 right-6 sm:top-6 sm:right-8 h-10 w-10 sm:h-16 sm:w-16 text-primary/5 rotate-12 pointer-events-none" />
                       
                       <div className="flex items-center gap-2 mb-3 sm:mb-4">
                          <Badge className="bg-green-600 text-white text-[6px] sm:text-[8px] font-black uppercase border-none px-2 sm:px-3 h-4 sm:h-5 flex items-center shadow-inner">
                            TERVERIFIKASI
                          </Badge>
                          <div className="flex items-center gap-1 sm:gap-1.5 bg-muted/40 px-2 py-0.5 rounded-md border border-primary/5">
                             <Hash className="h-2 w-2 sm:h-3 sm:w-3 text-primary/30" />
                             <span className="text-[6px] sm:text-[7px] font-black text-primary/40 uppercase tracking-tighter">REF: {testi.id?.slice(-8)}</span>
                          </div>
                       </div>

                       <div className="flex-1 flex items-center mb-4 sm:mb-8">
                          <p className="text-[14px] sm:text-[20px] font-black text-primary/80 leading-tight uppercase italic tracking-tight break-words">
                             "{testi.message}"
                          </p>
                       </div>

                       <div className="mt-auto pt-3 sm:pt-5 border-t-2 border-dashed border-primary/5 flex flex-row items-center justify-between gap-2">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                             <Avatar className="h-6 w-6 sm:h-9 sm:w-9 border-2 border-white shadow-lg rounded-full shrink-0"><AvatarImage src={testi.userPhoto} /></Avatar>
                             <div className="min-w-0">
                                <p className="text-[9px] sm:text-[11px] font-black uppercase text-primary truncate leading-none">{testi.userName?.split(' ')[0]}</p>
                                <p className="text-[6px] sm:text-[8px] font-bold text-muted-foreground uppercase opacity-60">Pemberi Ulasan</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-1.5 opacity-40 text-[6px] sm:text-[7px] font-black uppercase bg-muted/20 px-2 sm:px-3 py-1 rounded-xl shrink-0">
                             <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                             {format(date, 'dd/MM/yy', { locale: id })}
                          </div>
                       </div>
                    </div>
                 </div>
              </Card>
            );
          })
        )}
      </div>
    </FlexibleFrame>
  );
}
