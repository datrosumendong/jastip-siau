
"use client";

/**
 * VIEW: Penagihan Kurir (Sanksi Pasal 378)
 * REVISI: Tombol Chat diarahkan secara mutlak ke 'chat_view' (Pusat Pesan Terpadu).
 */

import { useCourierUnpaidController } from '@/hooks/controllers/use-courier-unpaid-controller';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Gavel, ShieldAlert, Wallet2, CheckCircle2, MessageSquare, Phone } from 'lucide-react';
import { useView } from '@/context/view-context';
import { openWhatsAppChat } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function CourierUnpaidView() {
  const { setView, forceUnlockUI } = useView();
  const { toast } = useToast();
  const c = useCourierUnpaidController();

  if (c.loading) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
      <Loader2 className="animate-spin text-primary opacity-20 h-10 w-10" />
      <p className="text-[10px] font-black uppercase text-primary/40 mt-4 animate-pulse">Audit Penagihan...</p>
    </div>
  );

  /**
   * ACTION: handleOpenChat (SOP DIRECT STRIKE)
   * Membuka form chat terpadu dengan protokol pembebasan layar.
   */
  const handleOpenChat = (chatId: string) => {
    if (!chatId) {
      toast({ title: "Sinkronisasi...", description: "Jalur chat sedang disiapkan." });
      return;
    }
    forceUnlockUI();
    setView('chat_view', { id: chatId });
    // Detak jantung pembersihan layar sisa transisi
    setTimeout(forceUnlockUI, 150);
  };

  return (
    <FlexibleFrame
      title="Penagihan Sanksi"
      subtitle="Member Tertangguh (Pasal 378)"
      icon={Gavel}
      variant="courier"
    >
      {c.unpaidOrders.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[2.5rem] border-dashed border-2 opacity-40 flex flex-col items-center justify-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
          <p className="text-[11px] font-black uppercase tracking-widest">Semua Tagihan Lunas.</p>
        </div>
      ) : (
        <div className="space-y-4 pb-32">
           {c.unpaidOrders.map((order: any) => (
             <Card key={order.id} className="overflow-hidden shadow-xl rounded-[2rem] bg-white border-2 border-red-500 animate-in slide-in-from-bottom-2">
                <div className="p-5 space-y-5">
                   <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[14px] font-black text-primary uppercase truncate leading-none">{order.userName}</h3>
                        <p className="text-[8px] font-black uppercase text-muted-foreground mt-2 tracking-widest">Ref: {order.id.slice(-8)}</p>
                      </div>
                      <Badge className="bg-red-600 text-white text-[8px] font-black uppercase border-none animate-pulse shadow-lg">Menunggak</Badge>
                   </div>
                   
                   <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex flex-col items-center justify-center text-center space-y-1 shadow-inner">
                      <p className="text-[9px] font-black uppercase text-red-800 tracking-tighter">Total Hutang Jasa</p>
                      <h4 className="text-3xl font-black text-red-600 tracking-tighter">Rp{order.totalAmount?.toLocaleString()}</h4>
                   </div>

                   <div className="grid grid-cols-1 gap-2.5">
                      <Button 
                        className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-black uppercase text-[11px] rounded-xl shadow-lg gap-2 active:scale-95" 
                        onClick={() => c.handleResolve(order)} 
                        disabled={c.updatingId === order.id}
                      >
                        {c.updatingId === order.id ? <Loader2 className="animate-spin h-4 w-4" /> : <Wallet2 className="h-4 w-4" />} Konfirmasi Pelunasan
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="h-11 text-[9px] font-black uppercase rounded-xl border-green-200 text-green-600 bg-white" onClick={() => openWhatsAppChat(order.userWhatsapp, "Halo, mohon segera selesaikan tagihan Jastip Anda agar akun aktif kembali.")}>
                          <Phone className="h-3.5 w-3.5 mr-1.5" /> WA Member
                        </Button>
                        <Button variant="outline" className="h-11 text-[9px] font-black uppercase rounded-xl border-primary/10 text-primary bg-white" onClick={() => handleOpenChat(order.chatId || `order_${order.id}`)}>
                          <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Chat App
                        </Button>
                      </div>
                   </div>
                </div>
             </Card>
           ))}
        </div>
      )}
    </FlexibleFrame>
  );
}
