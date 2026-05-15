"use client";

/**
 * VIEW: Admin Testimonial Moderation (MAHAKARYA LANSKAP V950)
 * SOP: Penegakan Lanskap Horizontal Mutlak 100%.
 * FIX: Perbaikan Tombol Hapus dengan AlertDialog Jastip Siau (Membasmi confirm() error).
 */

import { useAdminTestimonialController } from "@/hooks/controllers/use-admin-testimonial-controller";
import { FlexibleFrame } from "@/components/dashboard/flexible-frame";
import { Card, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Heart, CheckCircle2, XCircle, Loader2, Star, 
  Trash2, Clock, ShieldCheck, Quote, Hash, Calendar, AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useView } from "@/context/view-context";

export default function AdminTestimonialsView() {
  const c = useAdminTestimonialController();
  const { forceUnlockUI } = useView();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  if (c.loading) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      <p className="text-[10px] font-black uppercase text-primary/40 animate-pulse tracking-widest">Sinkronisasi Suara Warga...</p>
    </div>
  );

  const handleDeleteClick = (id: string) => {
    forceUnlockUI();
    setDeleteTargetId(id);
  };

  const executeDelete = async () => {
    if (deleteTargetId) {
      await c.handleFinalDelete(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  const renderTestiCard = (testi: any, isPending: boolean) => (
    <Card key={testi.id} className="overflow-hidden border-none shadow-xl rounded-[2.2rem] bg-white animate-in slide-in-from-bottom-2 duration-300 ring-1 ring-primary/5">
       <div className="flex flex-row min-h-[160px] sm:min-h-[220px]">
          
          {/* PILAR KIRI: PROFIL KURIR (RIGID LANDSCAPE) */}
          <div className="w-[100px] sm:w-[180px] bg-primary/[0.03] p-4 flex flex-col items-center justify-center border-r border-primary/5 text-center shrink-0">
             <div className="relative mb-2 sm:mb-3">
                <Avatar className="h-14 w-14 sm:h-20 sm:w-20 border-[3px] sm:border-[6px] border-white shadow-lg rounded-full">
                  <AvatarImage src={testi.courierPhoto} className="object-cover rounded-full" />
                  <AvatarFallback className="bg-primary/5 text-primary text-xl font-black uppercase">K</AvatarFallback>
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
             <Badge variant="outline" className="bg-white border-primary/10 text-primary text-[6px] sm:text-[8px] font-black uppercase px-2 sm:px-3 h-4 sm:h-5 rounded-lg shadow-sm">HERO</Badge>
          </div>

          {/* PILAR KANAN: KONTEN (WIDE) */}
          <div className="flex-1 p-4 sm:p-8 flex flex-col relative min-w-0 bg-white">
             <Quote className="h-10 w-10 sm:h-16 sm:w-16 text-primary/5 absolute top-4 right-6 sm:top-6 sm:right-8 rotate-12 pointer-events-none" />
             
             <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Badge className={cn(
                  "text-[6px] sm:text-[8px] font-black uppercase border-none px-2 h-4 sm:h-5 flex items-center shadow-inner",
                  testi.isApproved ? "bg-green-600 text-white" : "bg-orange-500 text-white"
                )}>
                  {testi.isApproved ? "TAYANG" : "PENDING"}
                </Badge>
                <div className="flex items-center gap-1.5 bg-muted/40 px-2 py-0.5 rounded-md">
                   <Hash className="h-2.5 w-2.5 text-primary/30" />
                   <span className="text-[6px] sm:text-[7px] font-black text-primary/40 uppercase tracking-tighter">ORDER: {testi.id?.slice(-8)}</span>
                </div>
             </div>

             <div className="relative z-10 flex-1 flex items-center mb-4 sm:mb-8">
                <p className="text-[14px] sm:text-[20px] font-black text-primary/80 uppercase italic leading-tight tracking-tight break-words">
                  "{testi.message}"
                </p>
             </div>

             <div className="mt-auto flex items-center justify-between pt-3 sm:pt-5 border-t-2 border-dashed border-primary/5">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                   <Avatar className="h-7 w-7 sm:h-9 sm:w-9 border-2 border-white shadow-lg rounded-full shrink-0"><AvatarImage src={testi.userPhoto} /></Avatar>
                   <div className="min-w-0">
                      <p className="text-[10px] sm:text-[11px] font-black uppercase text-primary truncate leading-none">{testi.userName?.split(' ')[0]}</p>
                      <p className="text-[6px] sm:text-[7px] font-bold text-muted-foreground uppercase opacity-60">PEMBERI ULASAN</p>
                   </div>
                </div>
                <div className="flex items-center gap-1.5 opacity-40 text-[6px] sm:text-[7px] font-black uppercase bg-muted/20 px-2 sm:px-3 py-1 rounded-xl">
                   <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                   {testi.createdAt?.seconds ? format(new Date(testi.createdAt.seconds * 1000), 'dd/MM/yy', { locale: id }) : '-'}
                </div>
             </div>
          </div>
       </div>

       {/* MODERASI ACTION BAR: SOP MULTI-PURGE */}
       <CardFooter className="p-2 bg-muted/5 border-t flex gap-2">
          {isPending ? (
            <>
               <div className="flex flex-1 gap-1">
                  <Button 
                    variant="ghost" 
                    className="flex-1 h-10 text-destructive rounded-xl font-black uppercase text-[10px] hover:bg-destructive/5 active:scale-95 transition-all"
                    onClick={() => c.handleReject(testi.id)}
                    disabled={!!c.updatingId}
                  >
                    <XCircle className="mr-1.5 h-4 w-4" /> Tolak
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="h-10 w-10 text-destructive rounded-xl hover:bg-red-50 flex items-center justify-center shrink-0"
                    onClick={() => handleDeleteClick(testi.id)}
                    disabled={!!c.updatingId}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
               </div>
               <Button 
                className="flex-[1.5] h-10 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black uppercase text-[10px] shadow-lg active:scale-95 transition-all gap-2"
                onClick={() => c.handleApprove(testi.id)}
                disabled={!!c.updatingId}
               >
                 {c.updatingId === testi.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-4 w-4" /> Publikasikan</>}
               </Button>
            </>
          ) : (
            <Button 
              variant="ghost" 
              className="w-full h-10 text-destructive rounded-xl font-black uppercase text-[9px] gap-2 active:scale-95 hover:bg-destructive/5"
              onClick={() => handleDeleteClick(testi.id)}
              disabled={!!c.updatingId}
            >
               {c.updatingId === testi.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Trash2 className="h-4 w-4" /> Musnahkan Dari Vault</>}
            </Button>
          )}
       </CardFooter>
    </Card>
  );

  return (
    <FlexibleFrame
      title="Moderasi Ulasan"
      subtitle="Radar Reputasi & Apresiasi Warga"
      icon={Heart}
      variant="admin"
    >
      <Tabs defaultValue="pending" className="w-full">
         <TabsList className="grid w-full grid-cols-2 h-14 bg-white p-1 rounded-2xl border border-primary/10 shadow-sm mb-6">
            <TabsTrigger value="pending" className="rounded-xl font-black uppercase text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white relative transition-all">
               Antrean {c.pending.length > 0 && (
                 <Badge className="absolute -top-2 -right-1 h-5 min-w-5 p-1 bg-destructive text-white border-white border-2 text-[9px] font-black rounded-full flex items-center justify-center shadow-lg">
                   {c.pending.length}
                 </Badge>
               )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="rounded-xl font-black uppercase text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
               Vault Terverifikasi
            </TabsTrigger>
         </TabsList>

         <TabsContent value="pending" className="space-y-4 outline-none pb-40">
            {c.pending.length === 0 ? (
              <div className="py-24 text-center bg-white rounded-[2.5rem] border-dashed border-2 opacity-30 flex flex-col items-center justify-center">
                 <ShieldCheck className="h-12 w-12 text-primary mb-4" />
                 <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Antrean ulasan bersih.</p>
              </div>
            ) : (
              c.pending.map(t => renderTestiCard(t, true))
            )}
         </TabsContent>

         <TabsContent value="approved" className="space-y-4 outline-none pb-40">
            {c.approved.length === 0 ? (
              <div className="py-24 text-center bg-white rounded-[2.5rem] border-dashed border-2 opacity-30 flex flex-col items-center">
                 <ShieldCheck className="h-12 w-12 text-primary mb-4" />
                 <p className="text-[10px] font-black uppercase tracking-widest">Vault masih kosong.</p>
              </div>
            ) : (
              c.approved.map(t => renderTestiCard(t, false))
            )}
         </TabsContent>
      </Tabs>

      {/* ALERT DIALOG: PURGE SOVEREIGNTY (SIAU MASTER) */}
      <AlertDialog open={!!deleteTargetId} onOpenChange={(v) => !v && setDeleteTargetId(null)}>
        <AlertDialogContent className="w-[92vw] rounded-[2.5rem] p-10 border-none shadow-2xl text-center bg-white z-[1500] animate-in zoom-in-95">
           <AlertDialogHeader>
              <div className="mx-auto h-20 w-20 rounded-[2rem] bg-destructive/10 flex items-center justify-center mb-6">
                 <Trash2 className="h-10 w-10 text-destructive" />
              </div>
              <AlertDialogTitle className="text-2xl font-black uppercase text-primary tracking-tighter italic">Musnahkan Ulasan?</AlertDialogTitle>
              <AlertDialogDescription className="text-center text-[11px] font-bold text-muted-foreground mt-4 leading-relaxed uppercase">
                 DANGER: Anda akan menghapus data ini secara fisik dari Vault Jastip Siau. Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-10">
              <AlertDialogCancel className="h-14 rounded-2xl font-black uppercase text-[10px] border-primary/10 bg-muted/20">Batalkan</AlertDialogCancel>
              <AlertDialogAction 
                className="h-14 rounded-2xl font-black uppercase text-[10px] bg-destructive text-white shadow-xl active:scale-95 transition-all gap-2"
                onClick={executeDelete}
              >
                 <Trash2 className="h-4 w-4" /> Ya, Musnahkan Sekarang
              </AlertDialogAction>
           </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FlexibleFrame>
  );
}
