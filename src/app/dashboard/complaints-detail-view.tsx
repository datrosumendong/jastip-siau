
"use client";

import { useMemo, useState } from 'react';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { ComplaintChat } from '@/components/chat/complaint-chat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, AlertCircle, Phone, Package, Truck, Ban, Unlock, ShieldAlert, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useView } from '@/context/view-context';
import { openWhatsAppChat } from '@/lib/whatsapp';

/**
 * VIEW: Detail Resolusi Admin (MVC)
 * SOP: Penanganan kasus hukum Pasal 378 dan eskalasi Owner.
 */
export default function AdminComplaintDetailView() {
  const { viewData, goBack } = useView();
  const complaintId = viewData?.complaintId;
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);

  const complaintRef = useMemo(() => (db && complaintId ? doc(db, 'complaints', complaintId) : null), [db, complaintId]);
  const { data: complaint, loading } = useDoc(complaintRef);

  const userRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: myProfile } = useDoc(userRef);

  const targetUserRef = useMemo(() => (db && complaint?.userId ? doc(db, 'users', complaint.userId) : null), [db, complaint?.userId]);
  const { data: targetProfile } = useDoc(targetUserRef);

  const isAdmin = myProfile?.role === 'admin';
  const isOwner = myProfile?.role === 'owner';

  const handleUpdateStatus = (val: string) => {
    if (!db || !complaintId || !complaint) return;
    setUpdating(true);
    updateDoc(doc(db, 'complaints', complaintId), {
      status: val,
      updatedAt: serverTimestamp()
    }).then(async () => {
      await addDoc(collection(db, 'notifications'), {
        userId: complaint.userId,
        title: "Update Tiket Bantuan",
        message: `Status laporan Anda: ${val.toUpperCase()}.`,
        type: 'complaint',
        targetId: complaintId,
        createdAt: serverTimestamp()
      });
      toast({ title: "Status Terupdate" });
    }).finally(() => setUpdating(false));
  };

  const handleToggleBlock = async () => {
    if (!db || !complaint || !targetProfile) return;
    setUpdating(true);
    const newBlockState = !targetProfile.hasActiveDebt;
    try {
      await updateDoc(doc(db, 'users', complaint.userId), { hasActiveDebt: newBlockState, updatedAt: serverTimestamp() });
      toast({ title: newBlockState ? "User Diblokir" : "Blokir Dibuka" });
    } finally { setUpdating(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!complaint) return <div className="p-10 text-center uppercase font-black text-[10px]">Laporan tidak ditemukan.</div>;

  return (
    <div className="flex flex-col h-full space-y-3 overflow-hidden px-1">
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-primary/10 shadow-sm shrink-0">
        <Button onClick={goBack} variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[11px] font-black text-primary uppercase truncate leading-none">Resolusi: {complaint.userName}</h1>
          <p className="text-[7px] text-muted-foreground uppercase font-bold truncate">Order Ref: {complaint.orderId?.slice(-12)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-3 flex-1 min-h-0 overflow-hidden">
        <div className="lg:col-span-1 h-full overflow-hidden flex flex-col">
          <Card className="border-none shadow-md bg-white rounded-2xl overflow-hidden flex flex-col h-full">
            <CardHeader className="bg-destructive/5 p-3 border-b shrink-0">
               <CardTitle className="text-[9px] font-black uppercase text-destructive flex items-center gap-2"><AlertCircle className="h-3.5 w-3.5" /> Detail Masalah</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3 overflow-y-auto custom-scrollbar flex-1">
              {complaint.type === 'payment_issue' && (
                <div className="p-3 bg-red-600 rounded-xl text-white space-y-3 shadow-lg">
                   <p className="text-[9px] font-bold leading-relaxed uppercase">SOP: Blokir akses jika member menolak membayar tagihan resmi di lokasi.</p>
                   <Button onClick={handleToggleBlock} disabled={updating} className={`w-full h-8 ${targetProfile?.hasActiveDebt ? 'bg-white text-green-600' : 'bg-black text-white'} font-black uppercase text-[8px] rounded-lg`}>
                     {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : targetProfile?.hasActiveDebt ? <Unlock className="h-3 w-3 mr-1.5" /> : <Ban className="h-3 w-3 mr-1.5" />}
                     {targetProfile?.hasActiveDebt ? "Buka Blokir" : "Blokir Member"}
                   </Button>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">Update Status:</span>
                <Select defaultValue={complaint.status} onValueChange={handleUpdateStatus} disabled={updating}>
                  <SelectTrigger className="h-8 text-[8px] font-black uppercase rounded-xl border-primary/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open" className="text-[8px] font-black uppercase">Kasus Baru</SelectItem>
                    <SelectItem value="investigating" className="text-[8px] font-black uppercase">Investigasi</SelectItem>
                    <SelectItem value="resolved" className="text-[8px] font-black uppercase">Tuntas</SelectItem>
                    <SelectItem value="closed" className="text-[8px] font-black uppercase">Tutup Kasus</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2 border-t border-dashed">
                 <p className="text-[7px] font-black text-muted-foreground uppercase mb-1">Kontak:</p>
                 <Button variant="outline" className="w-full h-8 text-[8px] font-black uppercase rounded-lg border-green-200 text-green-600" onClick={() => openWhatsAppChat(complaint.userWhatsapp, "Halo, saya Admin Jastip Siau.")}>Hubungi WA Pelapor</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2 h-full flex flex-col min-h-0">
           <ComplaintChat complaintId={complaintId} />
        </div>
      </div>
    </div>
  );
}
