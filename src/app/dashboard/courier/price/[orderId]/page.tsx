
"use client";

/**
 * VIEW: Courier Price Input (Physical Route V12.800 - RIGID FIXED PRICE)
 * SOP: Penegakan Harga Tetap UMKM - Kurir DILARANG merubah harga katalog atau menjadikannya 0.
 * FIX: Penguncian mutlak item Partner UMKM dengan visual peringatan kaku.
 */

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc, updateDoc, serverTimestamp, addDoc, collection, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Package, Calculator, CheckCircle2, Scale, User, ShoppingCart, Phone, ShieldCheck, Info, X, RotateCcw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { formatIDR } from '@/lib/currency';
import { openWhatsAppChat } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

export default function CourierPriceInputPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  const { user, loading: authLoading } = useUser();

  const [itemPrices, setItemPrices] = useState<{[key: number]: string}>({});
  const [itemStatus, setItemStatus] = useState<{[key: number]: 'available' | 'out_of_stock'}>({});
  const [serviceFee, setServiceFee] = useState('');
  const [feeCategory, setFeeCategory] = useState<'normal' | 'ekstra'>('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading || !user || !db) return;
    const checkAccess = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const role = snap.data()?.role;
        if (snap.exists() && (role === 'courier' || role === 'owner' || role === 'admin')) {
          setIsAuthorized(true);
        } else {
          router.push("/");
        }
      } catch (e) { console.error(e); }
    };
    checkAccess();
  }, [user, authLoading, db, router]);

  const orderRef = useMemo(() => (db && orderId ? doc(db, 'orders', orderId) : null), [db, orderId]);
  const { data: order, loading: orderLoading } = useDoc(orderRef, true);

  /**
   * SOP V12.800: RIGID INITIALIZATION
   * Kunci Harga UMKM secara absolut dari database.
   */
  useEffect(() => {
    if (order) {
      const initialPrices: {[key: number]: string} = {};
      const initialStatus: {[key: number]: 'available' | 'out_of_stock'} = {};
      
      order.items?.forEach((_: any, idx: number) => {
        initialStatus[idx] = order.itemStatus?.[idx] || 'available';
        
        const itemDetail = order.itemDetails?.[idx];
        const isPartnerItem = !!itemDetail?.umkmId;
        
        if (isPartnerItem) {
          // HARGA TETAP: Pre-filled dan Read-Only
          const price = Number(itemDetail.price) || 0;
          const qty = Number(itemDetail.quantity) || 1;
          initialPrices[idx] = (price * qty).toString();
        } else {
          // JALUR BEBAS: Mengambil inputan kurir jika sudah tersimpan
          initialPrices[idx] = order.itemPrices?.[idx]?.toString() || '';
        }
      });
      
      setItemPrices(initialPrices);
      setItemStatus(initialStatus);
    }
  }, [order]);

  const calculatedFee = useMemo(() => {
    if (!order) return 0;
    const distance = Math.max(1, order.distance || 0);
    const rate = feeCategory === 'normal' ? 10000 : 15000;
    return Math.ceil(distance * rate);
  }, [order, feeCategory]);

  useEffect(() => {
    if (calculatedFee > 0 && !serviceFee) {
       setServiceFee(calculatedFee.toString());
    }
  }, [calculatedFee, serviceFee]);

  const handleToggleStatus = (index: number) => {
    const nextStatus = itemStatus[index] === 'available' ? 'out_of_stock' : 'available';
    setItemStatus(prev => ({ ...prev, [index]: nextStatus }));
    if (nextStatus === 'out_of_stock') {
      setItemPrices(prev => ({ ...prev, [index]: '0' }));
    } else {
      const itemDetail = order?.itemDetails?.[index];
      const isPartnerItem = !!itemDetail?.umkmId;
      if (isPartnerItem) {
        const price = Number(itemDetail.price) || 0;
        const qty = Number(itemDetail.quantity) || 1;
        setItemPrices(prev => ({ ...prev, [index]: (price * qty).toString() }));
      } else {
        setItemPrices(prev => ({ ...prev, [index]: '' }));
      }
    }
  };

  const handleConfirm = async () => {
    if (!db || !order || !serviceFee || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const fee = parseFloat(serviceFee) || 0;
      let totalGoods = 0;
      const finalItemPrices: {[key: number]: number} = {};
      const itemsList = order.items || [];
      
      itemsList.forEach((_: any, i: number) => {
        const p = itemStatus[i] === 'out_of_stock' ? 0 : (parseFloat(itemPrices[i]) || 0);
        finalItemPrices[i] = p;
        totalGoods += p;
      });

      const totalAmount = totalGoods + fee;

      await updateDoc(doc(db, 'orders', order.id), {
        itemPrices: finalItemPrices,
        itemPrice: totalGoods,
        itemStatus: itemStatus,
        serviceFee: fee,
        totalAmount: totalAmount,
        status: 'delivering', 
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, 'notifications'), {
        userId: order.userId,
        title: "Nota Belanja Siap",
        message: `Total bayar: ${formatIDR(totalAmount)}. Kurir sedang mengantar ke lokasi.`,
        type: 'order',
        targetId: order.id,
        createdAt: serverTimestamp()
      });

      if (order.userWhatsapp) {
        const waMsg = `🌟 *NOTA JASTIP SIAU* 🏝️\n\nHalo *${order.userName}* 👋\nBelanjaan Kakak sudah siap diantar!\n\n🎫 *JASA*: Layanan ${feeCategory.toUpperCase()} (${formatIDR(fee)})\n\n━━━━━━━━━━━━━━━━\n💰 *TOTAL*: *${formatIDR(totalAmount)}*\n━━━━━━━━━━━━━━━━\n\n🛵 Kurir sedang menuju lokasi Anda. 🙏✨`;
        openWhatsAppChat(order.userWhatsapp, waMsg);
      }

      toast({ title: "Nota Terkirim" });
      router.push("/");
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal Sinkronisasi" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderLoading || authLoading || isAuthorized === null) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-primary" /></div>;

  if (!order) return <div className="p-10 text-center font-black uppercase text-xs">Pesanan tidak ditemukan.</div>;

  return (
    <div className="flex flex-col h-full space-y-4 max-w-full overflow-hidden px-1 animate-in fade-in duration-500 bg-[#F8FAFC]">
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-primary/10 shadow-sm shrink-0">
        <Button onClick={() => router.back()} variant="ghost" size="icon" className="h-8 w-8 text-primary"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-black text-primary uppercase leading-tight truncate">Rincian Nota</h1>
        </div>
      </div>

      <Card className="border-none shadow-xl overflow-hidden rounded-[2.2rem] bg-white flex-1 flex flex-col min-h-0">
        <CardHeader className="bg-primary/[0.03] border-b p-5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Calculator className="h-5 w-5 text-primary" />
               <CardTitle className="text-[10px] font-black uppercase text-primary">Kalkulasi Jastip Siau</CardTitle>
            </div>
          </div>
        </CardHeader>
        
        <ScrollArea className="flex-1">
          <CardContent className="p-5 space-y-6">
            <div className="space-y-4">
              {order.items?.map((item: string, index: number) => {
                 const isOut = itemStatus[index] === 'out_of_stock';
                 const itemDetail = order.itemDetails?.[index];
                 const isPartnerItem = !!itemDetail?.umkmId;

                 return (
                   <div key={index} className={cn(
                     "p-4 rounded-2xl border transition-all duration-300 relative",
                     isOut ? "bg-red-50/50 border-red-200 grayscale-[0.5]" : 
                     isPartnerItem ? "bg-orange-50/30 border-orange-100 ring-1 ring-orange-50" : "bg-muted/20 border-primary/5 shadow-inner"
                   )}>
                      <div className="flex justify-between items-start mb-2">
                         <div className="min-w-0 flex-1">
                            <Label className={cn("text-[10px] font-black uppercase", isOut ? "text-red-700" : isPartnerItem ? "text-orange-900" : "text-primary")}>{item}</Label>
                         </div>
                         <button 
                          onClick={() => handleToggleStatus(index)}
                          className={cn("h-8 w-8 rounded-xl flex items-center justify-center shadow-sm", isOut ? "bg-red-600 text-white" : "bg-white text-muted-foreground border")}
                         >
                            {isOut ? <RotateCcw className="h-4 w-4" /> : <X className="h-4 w-4" />}
                         </button>
                      </div>

                      <div className="relative">
                         <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground">Rp</div>
                         <Input 
                           type="number" 
                           className={cn(
                             "h-11 font-black text-xs pl-9 rounded-xl border-primary/10",
                             isPartnerItem ? "bg-white text-orange-900 border-orange-200 ring-2 ring-orange-500/10 cursor-not-allowed" : "bg-white"
                           )} 
                           value={itemPrices[index] || ''} 
                           onChange={(e) => !isPartnerItem && setItemPrices({...itemPrices, [index]: e.target.value})} 
                           readOnly={isPartnerItem || isOut}
                           disabled={isOut}
                         />
                         {isPartnerItem && !isOut && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-orange-600 text-white px-2 py-0.5 rounded-lg shadow-md">
                               <ShieldCheck className="h-3 w-3" />
                               <span className="text-[7px] font-black uppercase">Fixed UMKM</span>
                            </div>
                         )}
                      </div>
                   </div>
                 );
               })}
            </div>
            
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
               <p className="text-[8px] font-black text-orange-800 uppercase italic leading-relaxed text-center">
                 SOP: Harga produk katalog Mitra UMKM terkunci otomatis. Kurir dilarang merubah harga tersebut.
               </p>
            </div>
          </CardContent>
        </ScrollArea>

        <CardFooter className="p-5 border-t bg-muted/5 shrink-0">
          <Button className="w-full h-16 bg-primary font-black uppercase text-xs shadow-2xl rounded-2xl" onClick={handleConfirm} disabled={isSubmitting || !serviceFee}>
            {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : "Simpan & Kirim Nota"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
