"use client";

/**
 * VIEW: Courier Price Input (SOP V15.400 - TOTAL SYNC)
 * SOP: Penegakan Harga Tetap UMKM & Sinyal WA Nota Belanja.
 */

import { useState, useMemo, useEffect } from 'react';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, Loader2, Calculator, CheckCircle2, Scale, 
  ShoppingCart, User, Package, Store, X, RotateCcw, Info, ShieldCheck, Save,
  AlertTriangle
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { formatIDR } from '@/lib/currency';
import { useView } from '@/context/view-context';
import { openWhatsAppChat } from '@/lib/whatsapp';
import { calculateGPSDistance } from '@/lib/geo';
import { cn } from '@/lib/utils';

export default function CourierPriceInputView() {
  const { viewData, goBack, setView, forceUnlockUI } = useView();
  const orderId = viewData?.id || viewData?.orderId;
  
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [itemPrices, setItemPrices] = useState<{[key: number]: string}>({});
  const [itemStatus, setItemStatus] = useState<{[key: number]: 'available' | 'out_of_stock'}>({});
  const [serviceFee, setServiceFee] = useState('');
  const [feeCategory, setFeeCategory] = useState<'normal' | 'ekstra'>('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const orderRef = useMemo(() => (db && orderId ? doc(db, 'orders', orderId) : null), [db, orderId]);
  const { data: order, loading } = useDoc(orderRef, true);

  const myProfileRef = useMemo(() => (user && db ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: myProfile } = useDoc(myProfileRef, true);

  useEffect(() => {
    if (order) {
      const initialPrices: {[key: number]: string} = {};
      const initialStatus: {[key: number]: 'available' | 'out_of_stock'} = {};
      
      order.items?.forEach((_: any, idx: number) => {
        initialStatus[idx] = order.itemStatus?.[idx] || 'available';
        const itemDetail = order.itemDetails?.[idx];
        const isUmkmItem = !!itemDetail?.umkmId;

        if (isUmkmItem) {
          const pricePerUnit = Number(itemDetail.price) || 0;
          const qty = Number(itemDetail.quantity) || 1;
          const finalPrice = pricePerUnit * qty;
          initialPrices[idx] = finalPrice.toString();
        } else {
          initialPrices[idx] = order.itemPrices?.[idx]?.toString() || '';
        }
      });
      
      setItemPrices(initialPrices);
      setItemStatus(initialStatus);
    }
  }, [order]);

  const calculatedFee = useMemo(() => {
    if (!order || !myProfile) return 0;
    let distance = order.distance || 1;
    const rate = feeCategory === 'normal' ? 10000 : 15000;
    return Math.ceil(Math.max(1, distance) * rate);
  }, [order, feeCategory, myProfile]);

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
      const isUmkmItem = !!itemDetail?.umkmId;
      if (isUmkmItem) {
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
        totalAmount, 
        status: 'delivering', 
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, 'notifications'), {
        userId: order.userId,
        title: "🛒 Nota Belanja Siap",
        message: `Total tagihan: ${formatIDR(totalAmount)}. Kurir sedang mengantar ke lokasi.`,
        type: 'order',
        targetId: order.id,
        createdAt: serverTimestamp(),
        isOpened: false
      });

      const rincianText = itemsList.map((it: string, idx: number) => {
        const status = itemStatus[idx] === 'out_of_stock' ? '❌ STOK HABIS' : formatIDR(parseFloat(itemPrices[idx]) || 0);
        return `• ${it}: _${status}_`;
      }).join('\n');

      if (order.userWhatsapp) {
        const memberMsg = `🌟 *NOTA JASTIP SIAU* 🏝️\n\nHalo *${order.userName}* 👋\nBelanjaan Kakak sudah siap diantar!\n\n📦 *RINCIAN*:\n${rincianText}\n\n🎫 *JASA*: Layanan ${feeCategory.toUpperCase()} (${formatIDR(fee)})\n\n━━━━━━━━━━━━━━━━\n💰 *TOTAL*: *${formatIDR(totalAmount)}*\n━━━━━━━━━━━━━━━━\n\n🛵 Kurir sedang meluncur ke lokasi Kakak. 🙏✨`;
        openWhatsAppChat(order.userWhatsapp, memberMsg);
      }

      toast({ title: "Tagihan Terkirim" });
      setView('courier_dashboard');
    } catch (e) {
      toast({ title: "Gagal Sinkronisasi", variant: "destructive" });
    } finally { setIsSubmitting(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin h-10 w-10 text-primary opacity-20" /></div>;

  return (
    <div className="flex flex-col h-full space-y-4 max-w-full overflow-hidden px-1 bg-[#F8FAFC] animate-in fade-in duration-500">
      <header className="flex items-center gap-3 bg-white p-3 rounded-xl border border-primary/10 shadow-sm shrink-0">
        <Button onClick={goBack} variant="ghost" size="icon" className="h-8 w-8 text-primary"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1 min-w-0">
           <h1 className="text-[11px] font-black uppercase text-primary leading-tight">Nota: {order?.userName}</h1>
           <p className="text-[7px] font-bold text-muted-foreground uppercase">Otoritas Harga & Stok Terpadu</p>
        </div>
        <Badge className="bg-primary/10 text-primary text-[8px] font-black px-2 py-0.5 rounded-lg border-none shadow-inner">
           <ShoppingCart className="h-2.5 w-2.5 mr-1 inline" /> Kalkulasi
        </Badge>
      </header>

      <Card className="border-none shadow-xl overflow-hidden rounded-[2.2rem] bg-white flex-1 flex flex-col min-h-0">
        <CardHeader className="bg-primary/[0.03] border-b p-5 shrink-0">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <Calculator className="h-5 w-5 text-primary" />
                 <CardTitle className="text-[10px] font-black uppercase text-primary">Input Nota Amanah</CardTitle>
              </div>
           </div>
        </CardHeader>
        
        <ScrollArea className="flex-1">
          <CardContent className="p-5 space-y-6">
            <div className="space-y-4">
               {order?.items?.map((item: string, index: number) => {
                 const isOut = itemStatus[index] === 'out_of_stock';
                 const itemDetail = order.itemDetails?.[index];
                 const isUmkmItem = !!itemDetail?.umkmId;
                 const itemStore = itemDetail?.umkmName;

                 return (
                   <div key={index} className={cn(
                     "p-4 rounded-2xl border transition-all duration-300 relative",
                     isOut ? "bg-red-50/50 border-red-200 grayscale-[0.5]" : 
                     isUmkmItem ? "bg-orange-50/30 border-orange-100 ring-1 ring-orange-50" : "bg-muted/20 border-primary/5 shadow-inner"
                   )}>
                      <div className="flex justify-between items-start mb-2">
                         <div className="min-w-0 flex-1">
                            <Label className={cn("text-[10px] font-black uppercase", isOut ? "text-red-700" : isUmkmItem ? "text-orange-900" : "text-primary")}>{item}</Label>
                            {itemStore && (
                               <div className="flex items-center gap-1 mt-1">
                                  <Store className="h-2.5 w-2.5 text-orange-600" />
                                  <span className="text-[7px] font-black text-orange-800 uppercase tracking-tighter truncate">{itemStore}</span>
                               </div>
                            )}
                         </div>
                         
                         <button 
                          onClick={() => handleToggleStatus(index)}
                          className={cn(
                            "h-8 w-8 rounded-xl flex items-center justify-center transition-all active:scale-75 shadow-sm",
                            isOut ? "bg-red-600 text-white" : "bg-white text-muted-foreground border border-primary/10"
                          )}
                         >
                            {isOut ? <RotateCcw className="h-4 w-4" /> : <X className="h-4 w-4" />}
                         </button>
                      </div>

                      <div className="relative">
                         <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground">Rp</div>
                         <Input 
                           type="number" 
                           placeholder="0" 
                           className={cn(
                             "h-11 font-black text-xs pl-9 rounded-xl border-primary/10 transition-all shadow-inner",
                             isUmkmItem ? "bg-white text-orange-900 border-orange-200 cursor-not-allowed ring-2 ring-orange-500/20" : "bg-white"
                           )} 
                           value={itemPrices[index] || ''} 
                           onChange={(e) => !isUmkmItem && setItemPrices({...itemPrices, [index]: e.target.value})} 
                           readOnly={isUmkmItem || isOut}
                           disabled={isOut}
                         />
                         {isUmkmItem && !isOut && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-orange-600 text-white px-2 py-0.5 rounded-lg shadow-md animate-in slide-in-from-right-1">
                               <ShieldCheck className="h-3 w-3" />
                               <span className="text-[7px] font-black uppercase tracking-tighter">Fixed UMKM</span>
                            </div>
                         )}
                      </div>
                      
                      {isOut && <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-white/20 backdrop-blur-[1px] z-10"><Badge className="bg-red-600 text-white font-black text-[8px] uppercase rotate-[-12deg] shadow-2xl px-4 py-1 border-2 border-white">STOK HABIS</Badge></div>}
                   </div>
                 );
               })}
            </div>

            <div className="p-6 rounded-[2rem] bg-primary/[0.03] border-2 border-dashed border-primary/10 space-y-5">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Kategori Layanan Antar:</Label>
                <Select value={feeCategory} onValueChange={(val: any) => setFeeCategory(val)}>
                  <SelectTrigger className="h-11 text-[10px] font-black uppercase bg-white border-primary/10 rounded-xl shadow-sm"><Scale className="h-4 w-4 mr-2 text-primary" /><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl">
                    <SelectItem value="normal" className="text-[10px] font-black uppercase">Normal (10k/KM)</SelectItem>
                    <SelectItem value="ekstra" className="text-[10px] font-black uppercase text-blue-600">Ekstra (15k/KM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-primary/5 shadow-sm">
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase opacity-60">Estimasi Jasa</span>
                    <span className="text-base font-black text-primary">{formatIDR(calculatedFee)}</span>
                 </div>
                 <Button size="sm" className="h-8 px-5 bg-primary text-white font-black uppercase text-[9px] rounded-lg shadow-md active:scale-95 transition-all" onClick={() => setServiceFee(calculatedFee.toString())}>Gunakan</Button>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">Ongkir Final (Biaya Jasa)</Label>
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary">Rp</div>
                   <Input type="number" className="h-12 font-black text-sm bg-white pl-10 rounded-xl border-primary/20 shadow-inner" value={serviceFee} onChange={(e) => setServiceFee(e.target.value)} placeholder="Tentukan biaya jasa..." />
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3">
               <Info className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
               <p className="text-[8px] font-black text-orange-800 uppercase italic leading-relaxed">
                 SOP JASTIP SIAU: Harga produk katalog dikunci otomatis oleh sistem sesuai database Mitra UMKM. Kurir dilarang merubah harga tersebut dan hanya berhak menentukan biaya jasa pengantaran.
               </p>
            </div>
          </CardContent>
        </ScrollArea>

        <CardFooter className="p-4 sm:p-5 border-t bg-muted/5 flex flex-col gap-3 shrink-0">
           <Button 
            className="w-full h-16 bg-primary text-white rounded-[1.5rem] font-black uppercase text-xs shadow-2xl active:scale-95 transition-all gap-4 py-8" 
            onClick={handleConfirm} 
            disabled={isSubmitting || !serviceFee}
           >
            {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : <Save className="h-6 w-6" />} Simpan & Kirim Nota (WA)
           </Button>
        </CardFooter>
      </Card>
    </div>
  );
}