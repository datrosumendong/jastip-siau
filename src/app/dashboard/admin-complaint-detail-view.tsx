
"use client";

/**
 * VIEW: Detail Resolusi Admin (SOP INVESTIGASI V16.200)
 * SOP: Amnesti otomatis - Mencabut status investigasi kurir saat tiket ditutup.
 */

import { useMemo, useState } from 'react';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc, updateDoc, serverTimestamp, addDoc, collection, writeBatch, getDocs } from 'firebase/firestore';
import { ComplaintChat } from '@/components/chat/complaint-chat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, Loader2, AlertCircle, Phone, Trash2, Ban, Unlock, 
  ShieldAlert, Crown, Package, Truck, PanelLeftClose, PanelLeftOpen, CheckCircle2,
  ShieldCheck, User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useView } from '@/context/view-context';
import { openWhatsAppChat } from '@/lib/whatsapp';
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
import { cn } from '@/lib/utils';

export default function AdminComplaintDetailView() {
  const { viewData, goBack, setView } = useView();
  const complaintId = viewData?.complaintId || viewData?.id;
  
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [updating, setUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false); 

  const complaintRef = useMemo(() => (db && complaintId ? doc(db, 'complaints', complaintId) : null), [db, complaintId]);
  const { data: complaint, loading } = useDoc(complaintRef, true);

  const userRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: myProfile } = useDoc(userRef, true);

  const targetUserRef = useMemo(() => (db && complaint?.userId ? doc(db, 'users', complaint.userId) : null), [db, complaint?.userId]);
  const { data: targetProfile } = useDoc(targetUserRef, true);

  const isAdmin = myProfile?.role === 'admin' || myProfile?.role === 'owner';
  const isClosed = complaint?.status === 'resolved' || complaint?.status === 'closed';

  /**
   * ACTION: handleUpdateStatus (SOP AMNESTI INVESTIGASI V16.200)
   * Menutup tiket investigasi otomatis memulihkan hak operasional Kurir.
   */
  const handleUpdateStatus = async (val: string) => {
    if (!db || !complaintId || !complaint) return;
    setUpdating(true);
    
    // Deteksi Amnesti Investigasi (Status Final & Tipe Investigasi)
    const isClearingInvestigation = (val === 'resolved' || val === 'closed') && complaint.type === 'admin_sanction';

    try {
      await updateDoc(doc(db, 'complaints', complaintId), {
        status: val,
        updatedAt: serverTimestamp()
      });

      if (isClearingInvestigation && complaint.courierId) {
        // CABUT LOCKDOWN KURIR
        await updateDoc(doc(db, 'users', complaint.courierId), {
          isUnderInvestigation: false,
          updatedAt: serverTimestamp()
        });

        await addDoc(collection(db, 'notifications'), {
          userId: complaint.courierId,
          title: "✅ Investigasi Tuntas",
          message: "Status investigasi Anda telah dicabut. Anda bisa menerima orderan kembali.",
          type: 'system', createdAt: serverTimestamp(), isOpened: false
        });
      }

      await addDoc(collection(db, 'notifications'), {
        userId: complaint.userId,
        title: "Update Tiket Resolusi",
        message: `Admin telah memperbarui status laporan Anda menjadi: ${val.toUpperCase()}.`,
        type: 'complaint', targetId: complaintId, createdAt: serverTimestamp()
      });

      toast({ title: "Status Diperbarui" });
    } finally { setUpdating(false); }
  };

  const handleToggleBlock = async () => {
    if (!db || !complaint || !targetProfile) return;
    setUpdating(true);
    const newBlockState = !targetProfile.hasActiveDebt;
    try {
      await updateDoc(doc(db, 'users', complaint.userId), { hasActiveDebt: newBlockState, updatedAt: serverTimestamp() });
      toast({ title: newBlockState ? "Member Diblokir" : "Blokir Dibuka" });
    } finally { setUpdating(false); }
  };

  const handleDeleteComplaint = async () => {
    if (!db || !complaintId) return;
    setUpdating(true);
    try {
      const batch = writeBatch(db);
      const msgsSnap = await getDocs(collection(db, 'complaints', complaintId, 'messages'));
      msgsSnap.forEach(d => batch.delete(d.ref));
      batch.delete(doc(db, 'complaints', complaintId));
      await batch.commit();
      toast({ title: "Laporan Dihapus" });
      setView('admin_complaints');
    } finally { setUpdating(false); setShowDeleteConfirm(false); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
      <Loader2 className="animate-spin text-primary opacity-20 h-10 w-10" />
      <p className="text-[10px] font-black uppercase text-primary/40 animate-pulse">Menghubungkan Sinyal...</p>
    </div>
  );

  if (!complaint) return (
    <div className="flex flex-col items-center justify-center h-full p-10 text-center animate-in fade-in duration-500">
       <Trash2 className="h-20 w-20 text-destructive opacity-30 mb-6" />
       <h2 className="text-2xl font-black uppercase text-primary tracking-tighter">Data Terputus</h2>
       <Button onClick={goBack} variant="outline" className="mt-10">Kembali</Button>
    </div>
  );

  return (
    <div className="flex flex-col h-full space-y-3 overflow-hidden px-1 bg-[#F8FAFC]">
      <header className="p-3 border-b bg-white flex flex-col shrink-0 z-[50] shadow-sm">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 min-w-0">
            <Button onClick={goBack} variant="ghost" size="icon" className="h-8 w-8 text-primary"><ArrowLeft className="h-4 w-4" /></Button>
            <div className="min-w-0">
              <h1 className="text-[11px] font-black text-primary uppercase truncate leading-none">Resolusi: {complaint.userName}</h1>
              <p className="text-[7px] text-muted-foreground uppercase font-bold truncate mt-1">REF: {complaint.orderId?.slice(-12)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
             <Button 
              variant="outline" size="icon" 
              className={cn("h-9 w-9 rounded-xl shadow-sm", showSidePanel ? "bg-primary text-white" : "bg-white text-primary")}
              onClick={() => setShowSidePanel(!showSidePanel)}
             >
               {showSidePanel ? <PanelLeftClose className="h-4.5 w-4.5" /> : <PanelLeftOpen className="h-4.5 w-4.5" />}
             </Button>
             <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => setShowDeleteConfirm(true)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 gap-3 min-h-0 overflow-hidden relative">
        <div className={cn(
          "h-full overflow-hidden transition-all duration-500 ease-in-out shrink-0 absolute lg:relative lg:opacity-100 z-50 lg:z-10",
          showSidePanel ? "w-[280px] opacity-100 translate-x-0" : "w-0 opacity-0 -translate-x-full lg:w-0"
        )}>
          <Card className="border-none shadow-2xl lg:shadow-md bg-white rounded-2xl overflow-hidden flex flex-col h-full border-r">
            <CardHeader className="bg-destructive/5 p-4 border-b shrink-0">
               <CardTitle className="text-[9px] font-black uppercase text-destructive flex items-center gap-2"><AlertCircle className="h-3.5 w-3.5" /> Detail Masalah</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-5 overflow-y-auto custom-scrollbar flex-1 bg-white">
              {complaint.type === 'payment_issue' && !isClosed && (
                <div className="p-4 bg-red-600 rounded-2xl text-white space-y-4 shadow-lg animate-pulse">
                   <p className="text-[9px] font-bold uppercase italic">SOP: Blokir akses jika member menolak membayar tagihan.</p>
                   <Button onClick={handleToggleBlock} disabled={updating} className={`w-full h-10 ${targetProfile?.hasActiveDebt ? 'bg-white text-green-600' : 'bg-black text-white'} font-black uppercase text-[8px] rounded-xl shadow-inner`}>
                     {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : targetProfile?.hasActiveDebt ? <Unlock className="h-3 w-3 mr-1.5" /> : <Ban className="h-3 w-3 mr-1.5" />}
                     {targetProfile?.hasActiveDebt ? "Buka Blokir Member" : "Blokir Akses Member"}
                   </Button>
                </div>
              )}

              {complaint.type === 'admin_sanction' && !isClosed && (
                 <div className="p-4 bg-orange-600 rounded-2xl text-white space-y-2 shadow-lg">
                    <div className="flex items-center gap-2"><ShieldAlert className="h-4 w-4" /><p className="text-[10px] font-black uppercase">Lockdown Kurir Aktif</p></div>
                    <p className="text-[8px] font-medium leading-relaxed uppercase italic opacity-90">SOP V16.200: Kurir tidak bisa menerima order baru sampai Admin menutup tiket ini sebagai Tuntas/Selesai.</p>
                 </div>
              )}

              <div className="space-y-1">
                <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1"><User className="h-2 w-2" /> Data Pelapor:</span>
                <p className="text-[10px] font-black uppercase text-primary p-2 bg-muted/20 rounded-xl">{complaint.userName}</p>
              </div>

              <div className="p-4 rounded-2xl bg-primary/[0.02] border-2 border-dashed border-primary/10">
                 <p className="text-[7px] font-black text-muted-foreground uppercase mb-2">Kasus:</p>
                 <p className="text-[11px] font-bold text-primary uppercase italic leading-relaxed">"{complaint.reason}"</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-dashed">
                <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">Update Status:</span>
                <Select defaultValue={complaint.status} onValueChange={handleUpdateStatus} disabled={updating || isClosed}>
                  <SelectTrigger className="h-10 text-[9px] font-black uppercase rounded-xl border-primary/10 bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl">
                    <SelectItem value="open" className="text-[9px] font-black uppercase">Antrean</SelectItem>
                    <SelectItem value="investigating" className="text-[9px] font-black uppercase">Investigasi</SelectItem>
                    <SelectItem value="resolved" className="text-[9px] font-black uppercase">Tuntas (Buka Sanksi)</SelectItem>
                    <SelectItem value="closed" className="text-[9px] font-black uppercase">Tutup (Buka Sanksi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 h-full flex flex-col min-h-0 bg-white rounded-2xl shadow-lg border overflow-hidden">
           {isClosed ? (
             <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-6 bg-green-50/20">
                <ShieldCheck className="h-20 w-20 text-green-600 animate-in zoom-in-50 duration-700" />
                <h2 className="text-2xl font-black uppercase text-primary tracking-tighter leading-none">Resolusi Selesai</h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase max-w-[300px] italic">SOP: Sengketa telah diselesaikan. Akses komunikasi ditutup untuk integritas data.</p>
             </div>
           ) : (
             <ComplaintChat complaintId={complaintId} />
           )}
        </div>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="w-[92vw] rounded-[2.5rem] border-none shadow-2xl p-8 text-center bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black uppercase text-primary tracking-tighter leading-none italic">Musnahkan Tiket?</AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] font-bold text-muted-foreground uppercase mt-6 leading-relaxed">
              SOP: Seluruh log pesan akan dihapus permanen dari basis data Jastip Siau.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-10">
            <AlertDialogCancel className="h-14 rounded-2xl font-black uppercase text-[10px] border-primary/10">Batal</AlertDialogCancel>
            <AlertDialogAction className="h-14 rounded-2xl font-black uppercase text-[10px] bg-destructive text-white" onClick={handleDeleteComplaint}>Ya, Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
