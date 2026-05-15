
"use client";

/**
 * VIEW: Daftar Kurir (SOP INVESTIGASI V16.200)
 * SOP: Penegakan label Investigasi merah di radar warga.
 */

import { useCourierListController } from '@/hooks/controllers/use-courier-list-controller';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { Card, CardFooter, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Loader2, ShoppingBag, Truck, PowerOff, ShieldAlert, Zap, ZapOff, ShieldMinus } from 'lucide-react';
import { useView } from '@/context/view-context';
import { cn } from '@/lib/utils';

export default function CourierListView() {
  const { setView } = useView();
  const c = useCourierListController();

  if (c.loading) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 animate-pulse">Memantau Radar Logistik...</p>
    </div>
  );

  return (
    <FlexibleFrame
      title="Pilih Kurir"
      subtitle="Radar Logistik Aktif Pulau Siau"
      icon={Truck}
      variant="member"
    >
      {c.isBlocked && (
        <Card className="border-2 border-destructive bg-destructive/5 rounded-2xl overflow-hidden mb-6 animate-in shake duration-500 shadow-lg">
          <CardContent className="p-6 flex items-start gap-4">
             <div className="h-12 w-12 rounded-xl bg-destructive text-white flex items-center justify-center shrink-0 shadow-md">
               <ShieldAlert className="h-7 w-7" />
             </div>
             <div className="space-y-1">
                <h3 className="text-sm font-black uppercase text-destructive tracking-tight leading-none">AKUN DITANGGUHKAN</h3>
                <p className="text-[10px] font-bold text-red-900 uppercase leading-relaxed italic opacity-80">
                  Mohon selesaikan pelunasan tagihan tertunda Anda untuk memulihkan fitur pemesanan.
                </p>
                <Button onClick={() => setView('orders')} variant="outline" className="h-7 mt-1 border-destructive/20 text-destructive text-[8px] font-black uppercase rounded-lg">Cek Tagihan</Button>
             </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-40">
        {c.couriers.length === 0 ? (
          <div className="col-span-full py-24 text-center opacity-30 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl bg-white">
            <Truck className="h-16 w-16 mb-4 text-primary" />
            <p className="text-sm font-black uppercase tracking-widest text-primary">Belum Ada Kurir Aktif</p>
          </div>
        ) : (
          c.couriers.map((kr: any) => {
            const isOnline = kr.isOnline === true;
            const hasSignal = kr.isSignalFresh === true;
            const isInvestigating = kr.isUnderInvestigation === true;
            const isReady = kr.isOrderWorthy;
            
            return (
              <Card key={kr.id} className={cn(
                "overflow-hidden border-none shadow-md bg-white rounded-[2rem] transition-all duration-300 group",
                !isReady ? 'opacity-60 grayscale-[0.5]' : 'hover:shadow-xl hover:-translate-y-1',
                isInvestigating && "ring-2 ring-red-500 shadow-red-100"
              )}>
                 <CardHeader className="p-4 flex flex-row items-center gap-4 relative">
                    <div className="relative">
                       <Avatar className="h-20 w-20 border-[4px] border-white shadow-lg transition-transform duration-500 group-hover:rotate-3">
                          <AvatarImage src={kr.imageUrl} className="object-cover" />
                          <AvatarFallback className="font-black bg-primary/10 text-primary text-2xl uppercase">{kr.fullName?.charAt(0)}</AvatarFallback>
                       </Avatar>
                       {isOnline && !isInvestigating && (
                         <div className={cn(
                           "absolute top-0.5 right-0.5 h-5 w-5 border-4 border-white rounded-full shadow-md animate-pulse z-10",
                           hasSignal ? "bg-green-500" : "bg-orange-500"
                         )} />
                       )}
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center justify-between mb-1.5">
                          <CardTitle className="text-[17px] font-black uppercase text-primary truncate tracking-tighter leading-none">
                            {kr.fullName}
                          </CardTitle>
                          {isInvestigating && (
                            <Badge className="bg-red-600 text-white text-[7px] font-black uppercase border-none px-2 shadow-sm animate-pulse">INVESTIGASI</Badge>
                          )}
                       </div>
                       <div className="flex flex-wrap items-center gap-1.5">
                          <Badge className={cn(
                            "text-[8px] font-black uppercase border-none px-3 h-5 flex items-center rounded-full transition-colors",
                            isOnline ? 'bg-green-600 text-white' : 'bg-slate-400 text-white'
                          )}>
                            {isOnline ? 'SIAGA' : 'OFFLINE'}
                          </Badge>
                          
                          {isOnline && !isInvestigating && (
                            <Badge variant="outline" className={cn(
                              "text-[7px] font-black uppercase h-5 px-2 rounded-full gap-1 border-none",
                              hasSignal ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                            )}>
                              {hasSignal ? <Zap className="h-2 w-2 fill-current" /> : <ZapOff className="h-2 w-2" />}
                              {hasSignal ? "RADAR LOCK" : "LOST SIGNAL"}
                            </Badge>
                          )}

                          <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 h-5 rounded-lg border border-yellow-100">
                            <Star className="h-2.5 w-2.5 fill-current" />
                            <span className="text-[9px] font-black text-yellow-700">5.0</span>
                          </div>
                       </div>
                    </div>
                 </CardHeader>
                 
                 <CardContent className="px-6 pb-2">
                    <div className="p-3 rounded-xl bg-muted/20 border border-primary/5 italic shadow-inner">
                       <p className="text-[10px] font-bold text-primary/60 uppercase leading-relaxed line-clamp-2">
                         {isInvestigating ? "SOP: Kurir sedang dalam tahap moderasi Admin." : `"${kr.bio || 'Siap melayani dengan amanah.'}"`}
                       </p>
                    </div>
                 </CardContent>

                 <CardFooter className="bg-primary/[0.01] p-3 border-t border-primary/5 flex gap-2.5">
                    <Button variant="outline" className="flex-1 h-11 text-[9px] font-black uppercase rounded-xl border-primary/10 bg-white shadow-sm" onClick={() => setView('profile_user', { id: kr.uid })}>PROFIL</Button>
                    <Button 
                      className={cn(
                        "flex-[1.8] h-11 text-[10px] font-black uppercase rounded-xl shadow-lg gap-2 active:scale-95 transition-all",
                        isReady && !c.isBlocked ? 'bg-primary text-white' : 'bg-slate-400 text-white cursor-not-allowed'
                      )} 
                      onClick={() => isReady && !c.isBlocked && setView('order_new', { courierId: kr.uid })} 
                      disabled={!isReady || c.isBlocked}
                    >
                       {c.isBlocked ? 'TERKUNCI' : isInvestigating ? 'LOCKDOWN' : !isOnline ? 'OFFLINE' : !hasSignal ? 'SINYAL LEMAH' : <><ShoppingBag className="h-4 w-4" /> PESAN JASA</>}
                    </Button>
                 </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </FlexibleFrame>
  );
}
