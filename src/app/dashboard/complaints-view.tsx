
"use client";

import { useMemo, useState } from 'react';
import { useCollection, useFirestore, useUser, useDoc } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Search, MessageSquare, AlertCircle, ShieldAlert, Crown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useView } from '@/context/view-context';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { cn } from '@/lib/utils';

/**
 * VIEW: Panel Resolusi (Admin/Owner)
 * SOP: Memisahkan antrean berdasarkan tingkat eskalasi.
 */
export default function AdminComplaintsView() {
  const db = useFirestore();
  const { user } = useUser();
  const { setView } = useView();
  const [search, setSearch] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const userRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: myProfile } = useDoc(userRef);

  const complaintsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'complaints'), orderBy('updatedAt', 'desc'));
  }, [db]);

  const { data: complaints, loading } = useCollection(complaintsQuery);

  const filtered = useMemo(() => {
    if (!complaints || !myProfile) return [];
    
    const isOwner = myProfile.role === 'owner';
    const isAdmin = myProfile.role === 'admin';
    
    let list = [...complaints];
    
    if (isOwner) list = list.filter((c: any) => c.isEscalated === true);
    else if (isAdmin) list = list.filter((c: any) => !c.isEscalated);

    if (showHistory) list = list.filter((c: any) => ['resolved', 'closed'].includes(c.status));
    else list = list.filter((c: any) => !['resolved', 'closed'].includes(c.status));

    const s = search.toLowerCase().trim();
    if (!s) return list;

    return list.filter((c: any) => 
      (c.userName || "").toLowerCase().includes(s) || 
      (c.orderId || "").toLowerCase().includes(s) ||
      (c.reason || "").toLowerCase().includes(s)
    );
  }, [complaints, search, myProfile, showHistory]);

  if (loading || !myProfile) return <div className="flex flex-col items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <FlexibleFrame
      title={myProfile.role === 'owner' ? "Pusat Eskalasi" : "Resolusi Bantuan"}
      subtitle="Antrean Tiket Masalah"
      icon={ShieldAlert}
      variant="admin"
      controls={
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 mr-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari tiket..." className="pl-10 h-9 text-[10px] font-bold bg-muted/20 border-none rounded-xl" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button onClick={() => setShowHistory(!showHistory)} variant={showHistory ? "default" : "outline"} size="sm" className="h-8 text-[9px] font-black uppercase rounded-xl">
              {showHistory ? "Antrean" : "Arsip"}
            </Button>
          </div>
        </div>
      }
    >
      {filtered.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[2rem] border-dashed border-2 opacity-20 flex flex-col items-center">
           <AlertCircle className="h-16 w-16 mb-4" />
           <p className="text-[10px] font-black uppercase tracking-widest">Semua laporan tuntas</p>
        </div>
      ) : (
        filtered.map((c: any) => (
          <Card key={c.id} className={cn("overflow-hidden border-none shadow-md bg-white rounded-[2rem] group", c.type === 'payment_issue' && "ring-2 ring-red-500")}>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                     <h3 className="text-[14px] font-black text-primary uppercase truncate">{c.userName}</h3>
                     <Badge className={cn("text-[7px] font-black uppercase", c.status === 'open' ? 'bg-red-500' : 'bg-blue-600')}>{c.status}</Badge>
                  </div>
                  <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest">REF: {c.orderId?.slice(-12)}</p>
                </div>
                {c.type === 'payment_issue' && <Badge className="bg-red-600 text-white text-[7px] font-black uppercase border-none animate-pulse">PASAL 378</Badge>}
              </div>

              <div className={cn("p-4 rounded-2xl border italic bg-muted/30 border-primary/5")}>
                 <p className="text-[11px] font-bold leading-relaxed uppercase tracking-tight text-primary/80">"{c.reason}"</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-dashed">
                <div className="flex flex-col">
                   <span className="text-[7px] font-black text-muted-foreground uppercase mb-0.5">Pelapor:</span>
                   <span className="text-[9px] font-black text-primary uppercase">{c.courierName || "Member"}</span>
                </div>
                <Button onClick={() => setView('admin_complaint_detail', { complaintId: c.id })} size="sm" className="h-10 px-6 bg-primary rounded-xl text-[10px] font-black uppercase shadow-lg gap-2">
                  Ambil Kasus <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </FlexibleFrame>
  );
}
