
"use client";

/**
 * VIEW: Panel Moderasi Ulasan (Pure View)
 * Hanya menangani presentasi data dari useAdminTestimonialController.
 */

import { useAdminTestimonialController } from "@/hooks/controllers/use-admin-testimonial-controller";
import { FlexibleFrame } from "@/components/dashboard/flexible-frame";
import { Card, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Heart, CheckCircle2, XCircle, Loader2, MessageSquare, 
  Star, Truck, Trash2, Clock, ShieldCheck 
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function AdminTestimonialsView() {
  const c = useAdminTestimonialController();

  if (c.loading) return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  const renderTestiCard = (testi: any, isPending: boolean) => (
    <Card key={testi.id} className="overflow-hidden border-none shadow-md rounded-[1.8rem] bg-white animate-in fade-in duration-500">
       <div className="p-5 space-y-4">
          <div className="flex justify-between items-start gap-4">
             <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-10 w-10 border border-primary/5">
                   <AvatarImage src={testi.userPhoto} className="object-cover" />
                   <AvatarFallback className="bg-primary/5 text-primary text-xs font-black uppercase">
                     {(testi.userName || "U").charAt(0)}
                   </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                   <h3 className="text-[12px] font-black uppercase text-primary truncate leading-none">{testi.userName}</h3>
                   <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1">Pelanggan Siau</p>
                </div>
             </div>
             <div className="flex items-center gap-0.5 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
                <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                <span className="text-[10px] font-black text-yellow-700">{testi.rating}</span>
             </div>
          </div>

          <div className="p-4 rounded-2xl bg-muted/20 border border-primary/5 italic relative">
             <MessageSquare className="h-10 w-10 text-primary/5 absolute top-2 right-2 rotate-12" />
             <p className="text-[11px] font-bold text-primary uppercase leading-relaxed relative z-10">
                "{testi.message}"
             </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-dashed border-primary/10">
             <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/5 flex items-center justify-center">
                   <Truck className="h-3 w-3 text-primary" />
                </div>
                <span className="text-[8px] font-black uppercase text-muted-foreground truncate max-w-[120px]">
                   Kurir: {testi.courierName}
                </span>
             </div>
             <div className="flex items-center gap-1 text-[8px] font-bold text-muted-foreground uppercase">
                <Clock className="h-3 w-3 opacity-40" />
                {testi.createdAt?.seconds ? format(new Date(testi.createdAt.seconds * 1000), 'dd MMM yyyy', { locale: id }) : '-'}
             </div>
          </div>
       </div>

       <CardFooter className="p-2 bg-muted/5 border-t flex gap-2">
          {isPending ? (
            <>
               <Button 
                variant="ghost" 
                className="flex-1 h-10 text-destructive rounded-xl font-black uppercase text-[10px] hover:bg-destructive/5"
                onClick={() => c.handleReject(testi.id)}
                disabled={!!c.updatingId}
               >
                 <XCircle className="mr-1.5 h-4 w-4" /> Tolak
               </Button>
               <Button 
                className="flex-[1.5] h-10 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black uppercase text-[10px] shadow-lg"
                onClick={() => c.handleApprove(testi.id)}
                disabled={!!c.updatingId}
               >
                 {c.updatingId === testi.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="mr-1.5 h-4 w-4" /> Setujui</>}
               </Button>
            </>
          ) : (
            <Button 
              variant="ghost" 
              className="w-full h-9 text-destructive rounded-xl font-black uppercase text-[9px] gap-2"
              onClick={() => c.handleReject(testi.id)}
              disabled={!!c.updatingId}
            >
               <Trash2 className="h-4 w-4" /> Hapus Testimoni
            </Button>
          )}
       </CardFooter>
    </Card>
  );

  return (
    <FlexibleFrame
      title="Moderasi Ulasan"
      subtitle="Filter Suara Pelanggan"
      icon={Heart}
      variant="admin"
    >
      <Tabs defaultValue="pending" className="w-full">
         <TabsList className="grid w-full grid-cols-2 h-12 bg-white p-1 rounded-2xl border border-primary/10 shadow-sm mb-6">
            <TabsTrigger value="pending" className="rounded-xl font-black uppercase text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white relative">
               Antrean {c.pending.length > 0 && <Badge className="absolute -top-1 -right-1 h-4 min-w-4 p-1 bg-destructive text-white border-white text-[8px] font-black rounded-full flex items-center justify-center">{c.pending.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="approved" className="rounded-xl font-black uppercase text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white">
               Telah Tayang
            </TabsTrigger>
         </TabsList>

         <TabsContent value="pending" className="space-y-4 outline-none">
            {c.pending.length === 0 ? (
              <div className="py-24 text-center bg-white rounded-[2rem] border-dashed border-2 opacity-30 flex flex-col items-center">
                 <ShieldCheck className="h-16 w-16 mb-4" />
                 <p className="text-[11px] font-black uppercase tracking-widest px-10 leading-relaxed">Semua ulasan sudah dimoderasi.</p>
              </div>
            ) : (
              c.pending.map(t => renderTestiCard(t, true))
            )}
         </TabsContent>

         <TabsContent value="approved" className="space-y-4 outline-none">
            {c.approved.length === 0 ? (
              <div className="py-24 text-center bg-white rounded-[2rem] border-dashed border-2 opacity-30 flex flex-col items-center">
                 <MessageSquare className="h-16 w-16 mb-4" />
                 <p className="text-[11px] font-black uppercase tracking-widest">Belum ada ulasan yang disetujui.</p>
              </div>
            ) : (
              c.approved.map(t => renderTestiCard(t, false))
            )}
         </TabsContent>
      </Tabs>
    </FlexibleFrame>
  );
}
