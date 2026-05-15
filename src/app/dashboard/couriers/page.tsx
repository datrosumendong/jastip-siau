
"use client";

import { useState } from 'react';
import { Card, CardFooter, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, Loader2, ShoppingBag, Truck, PowerOff, ShieldAlert
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useView } from '@/context/view-context';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { useCourierListController } from '@/hooks/controllers/use-courier-list-controller';

/**
 * VIEW: Daftar Kurir (MVC Pure View)
 */
export default function CouriersPage() {
  const { setView } = useView();
  const c = useCourierListController();

  if (c.loading) return <div className="flex flex-col items-center justify-center h-64"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <FlexibleFrame
      title="Pilih Kurir"
      subtitle="Mitra Logistik Jastip Siau"
      icon={Truck}
      variant="member"
    >
      {c.isBlocked && (
        <Card className="border-4 border-destructive bg-destructive/5 rounded-2xl overflow-hidden animate-in shake duration-500 mb-6">
          <CardContent className="p-4 flex items-start gap-4">
             <ShieldAlert className="h-8 w-8 text-destructive shrink-0" />
             <div>
                <h3 className="text-[11px] font-black uppercase text-destructive tracking-tight">AKUN ANDA DITANGGUHKAN</h3>
                <p className="text-[9px] font-bold text-red-900 uppercase leading-relaxed italic mt-1">
                  Sesuai SOP, silakan selesaikan tunggakan sebelumnya agar fitur pemesanan pulih kembali.
                </p>
             </div>
          </CardContent>
        </Card>
      )}

      <ScrollArea className="h-full">
        <div className="flex flex-col gap-5 pr-1 pb-32">
          {c.couriers.length === 0 ? (
            <div className="py-20 text-center opacity-30 flex flex-col items-center justify-center">
              <Truck className="h-12 w-12 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">Belum ada mitra kurir tersedia.</p>
            </div>
          ) : (
            c.couriers.map((courier: any) => {
              const isOnline = courier.courierStatus === 'online';
              
              return (
                <Card key={courier.id} className={`overflow-hidden border-none shadow-lg bg-white rounded-[2rem] transition-all ${(!isOnline || c.isBlocked) ? 'opacity-60 grayscale-[0.5]' : 'hover:shadow-xl'}`}>
                  <CardHeader className="p-5 flex flex-row items-center gap-5">
                    <div className="relative">
                      <Avatar className="h-16 w-16 border-4 border-white shadow-md">
                        <AvatarImage src={courier.imageUrl} className="object-cover" />
                        <AvatarFallback className="font-black bg-primary/10 text-primary">{courier.fullName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {isOnline && (
                        <div className="absolute top-0 right-0 h-4 w-4 bg-green-500 border-2 border-white rounded-full shadow-sm animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-[16px] font-black uppercase text-primary truncate leading-none mb-2">
                        {courier.fullName}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[8px] font-black uppercase border-none px-3 ${isOnline ? 'bg-green-600' : 'bg-slate-500'}`}>
                          {isOnline ? 'ONLINE' : 'ISTIRAHAT'}
                        </Badge>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-[10px] font-black text-muted-foreground">5.0</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardFooter className="bg-muted/5 p-3 border-t flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 h-12 text-[10px] font-black uppercase rounded-2xl border-primary/10 bg-white text-primary shadow-sm active:scale-95"
                      onClick={() => setView('profile_user', { id: courier.uid })}
                    >
                      Profil
                    </Button>
                    
                    <Button 
                      className={`flex-[2] h-12 text-[11px] font-black uppercase rounded-2xl shadow-xl gap-2 transition-all ${isOnline && !c.isBlocked ? 'bg-primary' : 'bg-slate-400 cursor-not-allowed'}`}
                      onClick={() => isOnline && !c.isBlocked && setView('order_new', { courierId: courier.uid })}
                      disabled={!isOnline || c.isBlocked}
                    >
                      {c.isBlocked ? (
                        <><ShieldAlert className="h-4 w-4" /> Terkunci</>
                      ) : isOnline ? (
                        <><ShoppingBag className="h-4 w-4" /> Pesan Jasa</>
                      ) : (
                        <><PowerOff className="h-4 w-4" /> Sedang Offline</>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>
    </FlexibleFrame>
  );
}
