
'use client';

import { useMemo, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc, updateDoc, serverTimestamp, addDoc, collection, writeBatch, getDocs } from 'firebase/firestore';
import { ComplaintChat } from '@/components/chat/complaint-chat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Loader2, ShieldAlert, Package, Phone, MapPin, CheckCircle2, AlertCircle, Share2, Crown, Lock, Truck, User, Trash2, AlertTriangle, Ban, Unlock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cleanWhatsAppNumber, openWhatsAppChat } from '@/lib/whatsapp';
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

export default function AdminComplaintDetailPage() {
  const { complaintId } = useParams();
  const db = useFirestore();
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const complaintRef = useMemo(() => (db && complaintId ? doc(db, 'complaints', complaintId as string) : null), [db, complaintId]);
  const { data: complaint, loading } = useDoc(complaintRef);

  const userRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: myProfile } = useDoc(userRef);

  // Ambil profil user yang dikomplain (untuk fitur blokir)
  const targetUserRef = useMemo(() => (db && complaint?.userId ? doc(db, 'users', complaint.userId) : null), [db, complaint?.userId]);
  const { data: targetProfile } = useDoc(targetUserRef);

  const isAdmin = myProfile?.role === 'admin';
  const isOwner = myProfile?.role === 'owner';

  const handleUpdateStatus = (val: string) => {
    if (!db || !complaintId || !complaint) return;
    setUpdating(true);
    updateDoc(doc(db, 'complaints', complaintId as string), {
      status: val,
      updatedAt: serverTimestamp()
    }).then(async () => {
      await addDoc(collection(db, 'notifications'), {
        userId: complaint.userId,
        title: "Update Tiket Bantuan",
        message: `Admin telah memperbarui status laporan Anda menjadi: ${val.toUpperCase()}.`,
        type: 'complaint',
        targetId: complaintId,
        createdAt: serverTimestamp()
      });
      toast({ title: "Status Terupdate", description: `Kasus kini berstatus ${val.toUpperCase()}.` });
    }).finally(() => setUpdating(false));
  };

  const handleToggleBlock = async () => {
    if (!db || !complaint || !targetProfile) return;
    setUpdating(true);
    const newBlockState = !targetProfile.hasActiveDebt;

    try {
      await updateDoc(doc(db, 'users', complaint.userId), {
        hasActiveDebt: newBlockState,
        updatedAt: serverTimestamp()
      });

      if (newBlockState) {
        // Kirim notifikasi blokir ke member
        await addDoc(collection(db, 'notifications'), {
          userId: complaint.userId,
          title: "🚨 AKUN DITANGGUHKAN",
          message: "Akses pemesanan Anda diblokir sementara karena kendala pembayaran. Segera lunasi tagihan agar blokir dibuka.",
          type: 'system',
          createdAt: serverTimestamp()
        });
        toast({ title: "User Diblokir", description: "Akses member telah dikunci." });
      } else {
        toast({ title: "Blokir Dibuka", description: "Akses member telah dipulihkan." });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const handleEscalateToOwner = () => {
    if (!db || !complaintId || !complaint) return;
    setUpdating(true);
    updateDoc(doc(db, 'complaints', complaintId as string), {
      isEscalated: true,
      status: 'investigating',
      updatedAt: serverTimestamp()
    }).then(async () => {
      await addDoc(collection(db, 'notifications'), {
        userId: 'OWNER_UID', 
        title: "ESKALASI KASUS BERAT",
        message: `Admin ${myProfile?.fullName} melimpahkan kasus ${complaintId.slice(-6)} ke Anda untuk keputusan final.`,
        type: 'escalation',
        targetId: complaintId,
        createdAt: serverTimestamp()
      });
      toast({ title: "Kasus Dilimpahkan", description: "Owner telah mendapatkan pemberitahuan terkait kasus ini." });
    }).finally(() => setUpdating(false));
  };

  const handleDeleteComplaint = async () => {
    if (!db || !complaintId) return;
    setUpdating(true);
    try {
      const batch = writeBatch(db);
      const msgsSnap = await getDocs(collection(db, 'complaints', complaintId as string, 'messages'));
      msgsSnap.forEach(d => batch.delete(d.ref));
      batch.delete(doc(db, 'complaints', complaintId as string));
      await batch.commit();
      toast({ title: "Laporan Dihapus", description: "Data komplain telah dibersihkan secara permanen." });
      router.push('/dashboard/admin/complaints');
    } catch (e) {
      console.error(e);
      setUpdating(false);
    }
  };

  if (loading) return <div className="flex flex-col items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  if (!complaint) return <div className="p-10 text-center">Komplain tidak ditemukan.</div>;

  const isAdminAndEscalated = isAdmin && complaint.isEscalated;
  const isPaymentIssue = complaint.type === 'payment_issue';

  return (
    <div className="flex flex-col h-[calc(100dvh-56px-16px)] space-y-3 max-w-full overflow-hidden">
      {/* HEADER RINGKAS */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-primary/10 shadow-sm shrink-0">
        <Button onClick={() => router.back()} variant="ghost" size="icon" className="h-7 w-7 text-primary">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-[11px] font-black text-primary uppercase leading-none truncate">Resolusi: {complaint.userName}</h1>
            {complaint.isEscalated && (
              <Badge className="bg-amber-500 text-[6px] px-1 py-0 font-black uppercase"><Crown className="h-2 w-2 mr-0.5" /> Owner</Badge>
            )}
          </div>
          <p className="text-[7px] text-muted-foreground uppercase font-bold tracking-widest truncate">Order: {complaint.orderId?.slice(-12)}</p>
        </div>
        {(isAdmin || isOwner) && (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/5 rounded-full" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-3 flex-1 min-h-0 overflow-hidden">
        {/* PANEL KIRI: DETAIL MASALAH */}
        <div className="lg:col-span-1 h-full overflow-hidden flex flex-col">
          <Card className="border-none shadow-md bg-white rounded-2xl overflow-hidden flex flex-col h-full max-h-full">
            <CardHeader className="bg-destructive/5 p-3 border-b shrink-0">
               <CardTitle className="text-[9px] font-black uppercase tracking-widest text-destructive flex items-center gap-2">
                 <AlertCircle className="h-3.5 w-3.5" /> Detail Masalah
               </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3 overflow-y-auto custom-scrollbar flex-1">
              
              {isPaymentIssue && (
                <div className="p-3 bg-red-600 rounded-xl text-white space-y-3 shadow-lg animate-pulse">
                   <div className="flex items-center gap-2">
                     <Ban className="h-4 w-4" />
                     <p className="text-[10px] font-black uppercase">Masalah Pembayaran</p>
                   </div>
                   <p className="text-[9px] font-bold leading-relaxed uppercase">
                     Member dilaporkan menolak membayar tagihan kurir. Lakukan tindakan pemblokiran jika diperlukan.
                   </p>
                   <Button 
                    onClick={handleToggleBlock} 
                    disabled={updating}
                    className={`w-full h-8 ${targetProfile?.hasActiveDebt ? 'bg-white text-green-600' : 'bg-black text-white'} font-black uppercase text-[8px] rounded-lg shadow-inner`}
                   >
                     {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : targetProfile?.hasActiveDebt ? <Unlock className="h-3 w-3 mr-1.5" /> : <Ban className="h-3 w-3 mr-1.5" />}
                     {targetProfile?.hasActiveDebt ? "Buka Blokir Member" : "Blokir Akses Member"}
                   </Button>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-[7px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                  <User className="h-2.5 w-2.5" /> Data Pelapor:
                </p>
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/20 border border-primary/5">
                  <p className="text-[9px] font-black uppercase text-primary truncate flex-1 mr-2">{complaint.userName}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-1.5 text-green-600 bg-white border border-green-200 rounded-lg text-[7px] font-black uppercase shadow-sm shrink-0" 
                    onClick={() => openWhatsAppChat(complaint.userWhatsapp, "Halo, saya Admin Jastip Siau terkait laporan Anda.")}
                  >
                    <Phone className="h-2 w-2 mr-1" /> WA
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[7px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                  <Truck className="h-2.5 w-2.5" /> Kurir Terlibat:
                </p>
                <div className="flex items-center justify-between p-2 rounded-xl bg-accent/5 border border-accent/20">
                  <p className="text-[9px] font-black uppercase text-accent-foreground truncate flex-1 mr-2">{complaint.courierName || 'Mencari Kurir'}</p>
                  {complaint.courierWhatsapp && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-1.5 text-green-600 bg-white border border-green-200 rounded-lg text-[7px] font-black uppercase shadow-sm shrink-0" 
                      onClick={() => openWhatsAppChat(complaint.courierWhatsapp, "Halo kurir, Admin memantau laporan pesanan Anda.")}
                    >
                      <Phone className="h-2 w-2 mr-1" /> WA
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-2 bg-muted/20 rounded-xl border border-dashed">
                 <p className="text-[7px] font-black text-muted-foreground uppercase mb-1">Daftar Barang:</p>
                 <div className="space-y-0.5 max-h-[80px] overflow-y-auto">
                   {complaint.orderItems?.map((it: string, i: number) => (
                     <div key={i} className="flex items-center gap-1.5">
                       <Package className="h-2.5 w-2.5 text-primary shrink-0" />
                       <span className="text-[8px] font-bold uppercase truncate">{it}</span>
                     </div>
                   ))}
                 </div>
                 <div className="pt-1.5 border-t border-dashed mt-1.5 flex justify-between items-center">
                   <span className="text-[7px] font-black text-muted-foreground uppercase">Tagihan:</span>
                   <span className="text-[9px] font-black text-primary">Rp{complaint.orderPrice?.toLocaleString()}</span>
                 </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-dashed shrink-0">
                <div className="space-y-1">
                   <p className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">Update Status:</p>
                   <Select defaultValue={complaint.status} onValueChange={handleUpdateStatus} disabled={updating}>
                     <SelectTrigger className="h-8 text-[8px] font-black uppercase rounded-xl border-primary/20 shadow-sm">
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

                {isAdmin && !complaint.isEscalated && (
                  <Button 
                    onClick={handleEscalateToOwner} 
                    disabled={updating}
                    className="w-full h-8 bg-amber-500 hover:bg-amber-600 text-[8px] font-black uppercase shadow-md rounded-xl"
                  >
                    <Share2 className="h-3 w-3 mr-1" /> Eskalasi Ke Owner
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PANEL KANAN: CHAT RESOLUSI */}
        <div className="lg:col-span-2 h-full flex flex-col min-h-0">
           {isAdminAndEscalated ? (
             <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-muted/20 rounded-2xl border-2 border-dashed">
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                  <Crown className="h-6 w-6 text-amber-600" />
                </div>
                <h2 className="text-[12px] font-black uppercase text-primary mb-1">Kasus Diambil Alih Owner</h2>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest max-w-[220px] leading-relaxed">
                  Akses chat ditutup untuk Admin karena kasus ini telah dilimpahkan ke level Owner.
                </p>
                <Button onClick={() => router.push('/dashboard/admin/complaints')} variant="outline" size="sm" className="mt-4 h-7 text-[8px] font-black uppercase border-primary/20">
                  Kembali
                </Button>
             </div>
           ) : (
             <ComplaintChat complaintId={complaintId as string} />
           )}
        </div>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="w-[92vw] rounded-[2rem] border-none shadow-2xl p-8">
          <AlertDialogHeader>
            <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl font-black uppercase text-center text-primary">Hapus Tiket Laporan?</AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] font-bold text-muted-foreground text-center uppercase mt-2 leading-relaxed">
              Seluruh data laporan dan riwayat percakapan akan dihapus permanen. Laporan ini juga akan hilang dari dashboard Member.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
            <AlertDialogCancel className="h-12 rounded-xl font-black uppercase text-[10px]">Batal</AlertDialogCancel>
            <AlertDialogAction 
              className="h-12 rounded-xl font-black uppercase text-[10px] bg-destructive text-white" 
              onClick={handleDeleteComplaint}
              disabled={updating}
            >
              {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Ya, Hapus Permanen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
