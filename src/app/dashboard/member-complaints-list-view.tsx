"use client";

/**
 * VIEW: Daftar Komplain Member & Kurir (MVC V16.000)
 * SOP: Penegakan kedaulatan list berbasis participants (Group Chat).
 */

import { useMemo, useState } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldAlert, MessageSquare, Package, Info } from 'lucide-react';
import { format } from 'date-fns';
import { useView } from '@/context/view-context';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { cn } from '@/lib/utils';

export default function MemberComplaintsListView() {
  const db = useFirestore();
  const { user } = useUser();
  const { setView } = useView();
  const [showHistory, setShowHistory] = useState(false);

  // KEDAULATAN QUERY: Mencari tiket dimana user adalah partisipan (Member atau Kurir)
  const complaintsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'complaints'),
      where('participants', 'array-contains', user.uid),
      limit(100)
    );
  }, [db, user]);

  const { data: rawComplaints = [], loading } = useCollection(complaintsQuery, true);

  const complaints = useMemo(() => {
    return [...rawComplaints].sort((a: any, b: any) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
  }, [rawComplaints]);

  const filtered = useMemo(() => {
    if (showHistory) return complaints.filter(c => ['resolved', 'closed'].includes(c.status));
    return complaints.filter(c => !['resolved', 'closed'].includes(c.status));
  }, [complaints, showHistory]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      <p className="text-[10px] font-black uppercase text-primary/40 mt-4 animate-pulse">Menghubungkan Bantuan...</p>
    </div>
  );

  return (
    <FlexibleFrame
      title="Bantuan & Resolusi"
      subtitle="Pantau Progres Laporan Anda"
      icon={ShieldAlert}
      variant="member"
      controls={
        <div className="flex items-center justify-between">
           <span className="text-[9px] font-black uppercase text-primary tracking-widest">{filtered.length} Tiket Ditemukan</span>
           <Button 
            onClick={() => setShowHistory(!showHistory)} 
            variant={showHistory ? "default" : "outline"} 
            size="sm" 
            className="h-8 text-[9px] font-black uppercase rounded-xl"
           >
             {showHistory ? "Antrean" : "Arsip"}
           </Button>
        </div>
      }
    >
      <div className="space-y-4 pb-40">
        {filtered.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-[2rem] border-dashed border-2 opacity-30 flex flex-col items-center">
             <ShieldAlert className="h-16 w-16 mb-4" />
             <p className="text-[10px] font-black uppercase tracking-widest">Belum ada laporan {showHistory ? 'di arsip' : 'aktif'}.</p>
          </div>
        ) : (
          filtered.map((c: any) => (
            <Card key={c.id} className="overflow-hidden border-none shadow-md bg-white rounded-2xl group transition-all hover:shadow-xl">
               <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                     <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <h3 className="text-[14px] font-black text-primary uppercase truncate leading-none">Tiket #{c.id.slice(-6)}</h3>
                           <Badge className={cn(
                             "text-[7px] font-black uppercase border-none px-2", 
                             c.status === 'open' ? 'bg-red-500' : c.status === 'investigating' ? 'bg-orange-500' : 'bg-green-600'
                           )}>{c.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2 opacity-60">
                           <Package className="h-3 w-3" />
                           <p className="text-[8px] font-black uppercase">Order: {c.orderId?.slice(-8)}</p>
                        </div>
                     </div>
                     <div className="text-right flex flex-col items-end gap-1">
                        <span className="text-[7px] font-black text-muted-foreground uppercase">{c.createdAt?.seconds ? format(new Date(c.createdAt.seconds * 1000), 'dd MMM yyyy') : '-'}</span>
                        {c.type === 'admin_sanction' && <Badge variant="outline" className="text-[6px] font-black bg-purple-50 text-purple-600 border-purple-100 uppercase">Audit Admin</Badge>}
                     </div>
                  </div>

                  <div className="p-4 rounded-xl bg-primary/[0.02] border border-primary/5 italic">
                     <p className="text-[11px] font-bold text-primary/80 uppercase leading-relaxed line-clamp-2">"{c.reason}"</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-dashed border-primary/10">
                     <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                        <Info className="h-3 w-3 text-blue-600" />
                        <span className="text-[7px] font-black text-blue-800 uppercase">Respon Admin ~24 Jam</span>
                     </div>
                     <Button 
                      onClick={() => setView('member_complaint_detail', { id: c.id })} 
                      size="sm" 
                      className="h-10 px-6 bg-primary rounded-xl text-[10px] font-black uppercase shadow-lg gap-2"
                     >
                       Lihat Resolusi <MessageSquare className="h-4 w-4" />
                     </Button>
                  </div>
               </div>
            </Card>
          ))
        )}
      </div>
    </FlexibleFrame>
  );
}