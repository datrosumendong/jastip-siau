"use client";

/**
 * VIEW: Member Complaint Detail (RIGID VIEWPORT)
 * SOP: Mengunci Header dan Area Bantuan agar tidak terangkat saat keyboard smartphone muncul.
 * FIX: TOMBOL CHAT HILANG secara otomatis jika status laporan sudah Resolved/Closed.
 */

import { useMemo } from 'react';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { ComplaintChat } from '@/components/chat/complaint-chat';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, ShieldAlert, Info, Package, FileClock, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useView } from '@/context/view-context';
import { cn } from '@/lib/utils';

export default function MemberComplaintView() {
  const { viewData, goBack } = useView();
  const complaintId = viewData?.complaintId || viewData?.id;
  const db = useFirestore();

  const complaintRef = useMemo(() => (db && complaintId ? doc(db, 'complaints', complaintId) : null), [db, complaintId]);
  const { data: complaint, loading } = useDoc(complaintRef, true);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
      <Loader2 className="animate-spin text-primary opacity-20 h-10 w-10" />
      <p className="text-[10px] font-black uppercase text-primary/40 animate-pulse">Menghubungkan Bantuan...</p>
    </div>
  );

  if (!complaint) return (
    <div className="flex flex-col items-center justify-center h-full p-10 text-center animate-in fade-in duration-500">
       <div className="p-8 rounded-[2.5rem] bg-muted/5 mb-6 border-4 border-dashed border-primary/10">
          <FileClock className="h-20 w-20 text-primary opacity-30" />
       </div>
       <h2 className="text-2xl font-black uppercase text-primary tracking-tighter leading-none">Bantuan Selesai</h2>
       <p className="text-[10px] font-bold text-muted-foreground uppercase mt-6 max-w-[280px] leading-relaxed italic">
          Halaman bantuan yang Anda cari sudah diarsipkan atau dipindahkan oleh sistem.
       </p>
       <div className="flex flex-col gap-3 w-full max-w-[200px] mt-10 mx-auto">
          <Button onClick={goBack} variant="outline" className="h-12 rounded-xl font-black uppercase text-[10px] border-primary/10">
             <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
       </div>
    </div>
  );

  const isClosed = complaint.status === 'resolved' || complaint.status === 'closed';

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden animate-in fade-in duration-500">
      {/* HEADER: LOCKED (SHRINK-0) */}
      <header className="p-3 border-b bg-white flex flex-col shrink-0 z-[40] shadow-sm">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary rounded-xl hover:bg-primary/5" onClick={goBack}><ArrowLeft className="h-4 w-4" /></Button>
            <div className="min-w-0">
              <h2 className="text-[12px] font-black uppercase text-primary truncate leading-none">Pusat Resolusi</h2>
              <div className="flex items-center gap-1 mt-1">
                 <Package className="h-2.5 w-2.5 text-muted-foreground" />
                 <span className="text-[7px] font-black text-muted-foreground uppercase">Order Ref: {complaint.orderId?.slice(-8)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Badge className={cn(
               "text-[8px] font-black uppercase px-3 py-0.5 border-none shadow-sm",
               complaint.status === 'open' ? 'bg-red-500' : isClosed ? 'bg-green-600' : 'bg-blue-600'
             )}>{complaint.status}</Badge>
          </div>
        </div>

        {/* PROBLEM CONTEXT: INTEGRATED IN HEADER (SHRINK-0) */}
        <div className={cn(
          "mt-3 p-3 rounded-2xl border flex items-start gap-3 shadow-inner",
          isClosed ? "bg-green-50 border-green-100" : "bg-red-50/30 border-red-100"
        )}>
           {isClosed ? <ShieldCheck className="h-4 w-4 text-green-600 shrink-0 mt-0.5" /> : <ShieldAlert className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />}
           <p className={cn(
             "text-[10px] font-bold uppercase italic leading-tight truncate",
             isClosed ? "text-green-800" : "text-red-600"
           )}>{isClosed ? "Terima Kasih, Amanah Telah Dilunasi" : `"${complaint.reason}"`}</p>
        </div>
      </header>

      {/* CHAT AREA: SOP LOCKDOWN IF CLOSED */}
      <div className="flex-1 min-h-0 relative overflow-hidden bg-[#F8FAFC]">
        {isClosed ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-6">
             <div className="h-20 w-20 rounded-[2rem] bg-green-100 text-green-600 flex items-center justify-center shadow-sm animate-in zoom-in-95 duration-700">
                <ShieldCheck className="h-10 w-10" />
             </div>
             <div className="space-y-2">
                <h3 className="text-xl font-black uppercase text-primary tracking-tighter">Sengketa Selesai</h3>
                <p className="text-[9px] font-bold text-muted-foreground uppercase max-w-[260px] leading-relaxed italic mx-auto">
                   Akses chat ditutup oleh sistem karena tagihan pesanan telah dikonfirmasi lunas oleh kurir. Terima kasih telah menjaga kejujuran warga Siau.
                </p>
             </div>
             <Button onClick={goBack} variant="outline" className="h-11 rounded-xl font-black uppercase text-[9px] px-8 border-primary/10 shadow-sm bg-white">Tutup Halaman</Button>
          </div>
        ) : (
          <ComplaintChat complaintId={complaintId} />
        )}
      </div>
      
      {/* FOOTER ADVISORY: LOCKED (SHRINK-0) */}
      <div className="p-3 bg-blue-50 border-t flex items-center justify-center gap-2 shrink-0">
         <Info className="h-3 w-3 text-blue-600" />
         <p className="text-[7px] font-black text-blue-800 uppercase italic">
            {isClosed ? "Status: TERARSIP (Pelunasan Terverifikasi)" : "Admin biasanya merespons dalam 1x24 Jam kerja."}
         </p>
      </div>
    </div>
  );
}
