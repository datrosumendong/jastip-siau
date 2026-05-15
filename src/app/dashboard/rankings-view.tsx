
"use client";

/**
 * VIEW: Peringkat Mahakarya (VAULT INDEPENDENT EDITION)
 * SOP: Data bertahta di monthly_rankings, kebal dari penghapusan order.
 */

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Loader2, Award, Users, Truck, Sparkles } from 'lucide-react';
import { useCollection, useFirestore, useUser, useDoc } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp, doc, limit } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { cn } from '@/lib/utils';

export default function RankingsView() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'member' | 'courier'>('member');

  const currentUserRef = useMemo(() => (db && user ? doc(db, "users", user.uid) : null), [db, user]);
  const { data: myProfile } = useDoc(currentUserRef, true);

  const rankingsQuery = useMemo(() => {
    if (!db) return null;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    return query(
      collection(db, 'monthly_rankings'),
      where('year', '==', year),
      where('month', '==', month),
      limit(100)
    );
  }, [db]);

  const { data: rawRankings = [], loading } = useCollection(rankingsQuery, true);

  const rankings = useMemo(() => {
    return [...rawRankings]
      .filter((r: any) => r.role === activeTab)
      .sort((a: any, b: any) => (b.orderCount || 0) - (a.orderCount || 0));
  }, [rawRankings, activeTab]);

  const isAdmin = myProfile?.role === 'admin' || myProfile?.role === 'owner';

  const handleSendRankNotif = async (target: any, rankIndex: number) => {
    if (!db || !target.userId || sendingId) return;
    setSendingId(target.userId);
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: target.userId,
        title: `🏆 Penghargaan Peringkat ${rankIndex + 1}`,
        message: `Selamat ${target.userName}! Anda menduduki posisi puncak bulan ini.`,
        type: 'ranking',
        createdAt: serverTimestamp(),
      });
      toast({ title: "Apresiasi Terkirim" });
    } finally {
      setSendingId(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
    </div>
  );

  return (
    <FlexibleFrame
      title="Papan Peringkat"
      subtitle={`Vault Prestasi • ${format(new Date(), 'MMMM yyyy', { locale: id })}`}
      icon={Trophy}
      variant="member"
    >
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
         <TabsList className="grid w-full grid-cols-2 h-12 bg-white p-1 rounded-2xl border border-primary/10 shadow-sm mb-6">
            <TabsTrigger value="member" className="rounded-xl font-black uppercase text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2">
               <Users className="h-4 w-4" /> Warga Teladan
            </TabsTrigger>
            <TabsTrigger value="courier" className="rounded-xl font-black uppercase text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2">
               <Truck className="h-4 w-4" /> Mitra Hero
            </TabsTrigger>
         </TabsList>

         <div className="space-y-3 pb-32">
           {rankings.length === 0 ? (
             <div className="py-24 text-center bg-white rounded-xl border-dashed border-2 opacity-30 flex flex-col items-center">
                <Trophy className="h-12 w-12 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Memulai periode baru...</p>
             </div>
           ) : (
             rankings.map((target: any, index: number) => {
               const isTop3 = index < 3;
               const rankIcon = index === 0 ? <Trophy className="h-6 w-6 text-yellow-500" /> : 
                                index === 1 ? <Medal className="h-6 w-6 text-slate-400" /> : 
                                index === 2 ? <Medal className="h-6 w-6 text-amber-600" /> : 
                                <span className="text-[12px] font-black opacity-30">{index + 1}</span>;

               return (
                 <Card key={target.id} className={cn(
                   "overflow-hidden border-none shadow-md bg-white transition-all rounded-xl",
                   isTop3 ? "ring-2 ring-primary/5 shadow-lg" : "opacity-90"
                 )}>
                   <CardContent className="p-4 flex items-center gap-4">
                     <div className="w-10 shrink-0 flex justify-center">{rankIcon}</div>
                     <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                       <AvatarImage src={target.userPhoto} className="object-cover rounded-full" />
                       <AvatarFallback className="bg-primary/5 text-primary text-sm font-black uppercase">{(target.userName || "U").charAt(0)}</AvatarFallback>
                     </Avatar>
                     <div className="flex-1 min-w-0">
                       <h4 className="text-[14px] font-black uppercase text-primary truncate tracking-tighter">{target.userName}</h4>
                       <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[6px] font-black uppercase border-primary/10 h-3.5 px-1.5">{target.role}</Badge>
                          {isAdmin && isTop3 && (
                            <Button 
                              variant="ghost" 
                              className="h-5 px-2 bg-primary/5 text-[6px] font-black uppercase rounded-full gap-1 active:scale-90" 
                              onClick={() => handleSendRankNotif(target, index)}
                              disabled={sendingId === target.userId}
                            >
                               <Award className="h-2 w-2" /> Beri Piagam
                            </Button>
                          )}
                       </div>
                     </div>
                     <div className="text-right shrink-0">
                        <span className="text-xl font-black text-primary tracking-tight tabular-nums">{target.orderCount}</span>
                        <p className="text-[7px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">{activeTab === 'member' ? 'Testimoni' : 'Order Sukses'}</p>
                     </div>
                   </CardContent>
                 </Card>
               );
             })
           )}
         </div>
      </Tabs>
    </FlexibleFrame>
  );
}
