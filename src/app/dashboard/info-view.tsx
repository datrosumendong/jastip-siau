"use client";

/**
 * VIEW: Info & SOP (SOVEREIGN MANUAL V650)
 * SOP: Penegakan kedaulatan informasi alur kerja 3 arah.
 * FIX: Dokumentasi mutlak alur WhatsApp, Notifikasi, dan Penegakan Hukum.
 * REVISI: Perbaikan sintaksis JSX untuk karakter terlarang (Unexpected token).
 * FIX: Menambahkan ShieldAlert ke pangkalan impor untuk membasmi ReferenceError.
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Info, ShieldCheck, BookOpen, Gavel, 
  Phone, Mail, MapPin, Settings2, Loader2, CheckCircle2, Crown, UserCheck, Headset,
  Zap, ShoppingBag, Truck, Store, MessageSquare, History, Trophy, ShieldAlert
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useView } from '@/context/view-context';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { useSupportFabController } from '@/hooks/controllers/use-support-fab-controller';

const OrderMap = dynamic(() => import('@/components/order-map'), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-muted animate-pulse rounded-xl flex items-center justify-center font-bold text-[10px] uppercase">Menyiapkan Peta Kantor...</div>
});

export default function InfoSopView() {
  const { setView } = useView();
  const db = useFirestore();
  const { user } = useUser();
  const { handleContactAdmin, loading: contactLoading } = useSupportFabController();

  const contactRef = useMemo(() => (db ? doc(db, 'settings', 'contact') : null), [db]);
  const { data: contact, loading } = useDoc(contactRef, true);

  const userRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: myProfile } = useDoc(userRef, true);

  const isExclusiveAdmin = myProfile?.role === 'admin' || myProfile?.role === 'owner';

  const officeInfo = {
    whatsapp: contact?.whatsapp || "082293110414",
    email: contact?.email || "dsumendong@gmail.com",
    address: contact?.address || "Jl. Lokongbanua No. 2D. Kel. Akesimbeka, Kec. Siau timur, Kab. Kepl. Siau Tagulandang Biaro, Kode Post 95861",
    lat: contact?.latitude || 2.7482,
    lng: contact?.longitude || 125.4056
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
    </div>
  );

  return (
    <FlexibleFrame
      title="Informasi & SOP"
      subtitle="Panduan Resmi & Konstitusi Jastip Siau"
      icon={BookOpen}
      variant="member"
      controls={
        isExclusiveAdmin ? (
          <Button 
            onClick={() => setView('admin_info_settings')} 
            className="h-9 w-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white rounded-xl font-black uppercase text-[9px] shadow-sm transition-all gap-2"
          >
            <Settings2 className="h-3.5 w-3.5" /> Kelola Info & Peta
          </Button>
        ) : null
      }
    >
      <div className="space-y-6 max-w-3xl mx-auto pb-20 px-1">
        
        {/* SEKSI 1: ALUR KERJA AMANAH (PROSES ORDER) */}
        <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white animate-in slide-in-from-bottom-2 duration-500">
           <CardHeader className="bg-gradient-to-r from-primary to-blue-700 text-white p-6">
              <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                 <Zap className="h-6 w-6 text-accent animate-pulse" /> Protokol Amanah 3 Arah
              </CardTitle>
           </CardHeader>
           <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full space-y-3">
                 <AccordionItem value="alur-toko" className="border-none bg-orange-50 rounded-2xl px-5">
                    <AccordionTrigger className="hover:no-underline py-4">
                       <div className="flex items-center gap-3">
                          <Store className="h-5 w-5 text-orange-600" />
                          <span className="text-[11px] font-black uppercase text-orange-900">Alur Belanja UMKM</span>
                       </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 space-y-3 text-[10px] font-bold text-orange-800 uppercase leading-relaxed">
                       <p className="flex gap-2"><span className="shrink-0">1.</span> Member pilih produk dan kurir → Sinyal WA meluncur ke TOKO.</p>
                       <p className="flex gap-2"><span className="shrink-0">2.</span> Toko konfirmasi stok → Kurir baru diizinkan menerima tugas.</p>
                       <p className="flex gap-2"><span className="shrink-0">3.</span> Kurir Terima → WA ke Toko: "Siapkan Produk sekarang".</p>
                       <p className="flex gap-2"><span className="shrink-0">4.</span> Produk Siap → Toko klik tombol "Ready" → WA ke Kurir untuk jemput.</p>
                    </AccordionContent>
                 </AccordionItem>

                 <AccordionItem value="alur-kurir" className="border-none bg-blue-50 rounded-2xl px-5">
                    <AccordionTrigger className="hover:no-underline py-4">
                       <div className="flex items-center gap-3">
                          <Truck className="h-5 w-5 text-blue-600" />
                          <span className="text-[11px] font-black uppercase text-blue-900">Alur Belanja Bebas</span>
                       </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 space-y-3 text-[10px] font-bold text-blue-800 uppercase leading-relaxed">
                       <p className="flex gap-2"><span className="shrink-0">1.</span> Member tulis belanjaan manual → Sinyal WA langsung ke KURIR.</p>
                       <p className="flex gap-2"><span className="shrink-0">2.</span> Kurir Terima → Berangkat ke lokasi belanja.</p>
                       <p className="flex gap-2"><span className="shrink-0">3.</span> Input Nota → Kurir foto/tulis harga asli → WA Nota ke Member.</p>
                       <p className="flex gap-2"><span className="shrink-0">4.</span> Tiba di Lokasi → Kurir kirim sinyal WA "Saya Sudah Sampai".</p>
                    </AccordionContent>
                 </AccordionItem>

                 <AccordionItem value="alur-selesai" className="border-none bg-green-50 rounded-2xl px-5">
                    <AccordionTrigger className="hover:no-underline py-4">
                       <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="text-[11px] font-black uppercase text-green-900">Penyelesaian dan Ranking</span>
                       </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 space-y-3 text-[10px] font-bold text-green-800 uppercase leading-relaxed">
                       <p className="flex gap-2"><span className="shrink-0">1.</span> Member Bayar Tunai → Kurir klik "Lunas" → Order Selesai.</p>
                       <p className="flex gap-2"><span className="shrink-0">2.</span> Chat Purge → Seluruh riwayat chat dihapus otomatis demi privasi.</p>
                       <p className="flex gap-2"><span className="shrink-0">3.</span> Peringkat → Kurir dan Member dapat +1 poin peringkat di Vault Permanen.</p>
                       <p className="flex gap-2"><span className="shrink-0">4.</span> Testimoni → Member kirim ulasan → Diaudit Admin sebelum tayang publik.</p>
                    </AccordionContent>
                 </AccordionItem>
              </Accordion>
           </CardContent>
        </Card>

        {/* SEKSI 2: PENEGAKAN HUKUM PASAL 378 */}
        <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white ring-2 ring-red-100">
          <CardHeader className="bg-red-600 text-white p-6">
            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
              <Gavel className="h-7 w-7" /> Peringatan Pasal 378 KUHP
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="p-5 bg-red-50 border-2 border-dashed border-red-200 rounded-3xl">
               <p className="text-[11px] font-black text-red-900 leading-relaxed uppercase italic text-center">
                 "Barangsiapa dengan maksud untuk menguntungkan diri sendiri... dengan tipu muslihat... diancam karena penipuan."
               </p>
            </div>
            <div className="space-y-4">
               <h4 className="text-[11px] font-black uppercase text-primary border-b border-dashed pb-2">Konsekuensi Pelanggaran:</h4>
               <ul className="space-y-3 text-[10px] font-bold text-muted-foreground uppercase">
                  <li className="flex gap-3 items-start"><ShieldAlert className="h-4 w-4 text-red-600 shrink-0" /> Pemblokiran akun otomatis (Lockdown total fitur pemesanan).</li>
                  <li className="flex gap-3 items-start"><ShieldAlert className="h-4 w-4 text-red-600 shrink-0" /> Data koordinasi dan GPS diserahkan ke Admin/Pihak Berwajib sebagai bukti sah.</li>
                  <li className="flex gap-3 items-start"><ShieldAlert className="h-4 w-4 text-red-600 shrink-0" /> Riwayat chat sengketa TIDAK AKAN DIHAPUS sampai pelunasan dikonfirmasi.</li>
               </ul>
            </div>
          </CardContent>
        </Card>

        {/* SEKSI 3: VERIFIKASI IDENTITAS */}
        <Card className="border-none shadow-lg rounded-[2.5rem] overflow-hidden bg-white">
           <CardHeader className="bg-blue-600 text-white p-6">
              <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                 <UserCheck className="h-6 w-6" /> Keamanan Status Mitra
              </CardTitle>
           </CardHeader>
           <CardContent className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                 <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0" />
                    <div className="min-w-0">
                       <p className="text-[10px] font-black uppercase text-blue-900">Centang Biru</p>
                       <p className="text-[8px] font-bold text-blue-700 uppercase leading-tight mt-1">Akun Kurir/UMKM Terverifikasi KTP dan SIM.</p>
                    </div>
                 </div>
                 <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-start gap-3">
                    <Crown className="h-5 w-5 text-purple-600 shrink-0" />
                    <div className="min-w-0">
                       <p className="text-[10px] font-black uppercase text-purple-900">Mahkota Ungu</p>
                       <p className="text-[8px] font-bold text-purple-700 uppercase leading-tight mt-1">Otoritas Tertinggi Admin dan Owner Operasional.</p>
                    </div>
                 </div>
              </div>
           </CardContent>
        </Card>

        {/* SEKSI 4: KONTAK & PETA KANTOR */}
        <Card className="border-none shadow-lg rounded-2xl overflow-hidden bg-white">
           <div className="h-[220px] w-full relative z-0">
              <OrderMap destLat={officeInfo.lat} destLng={officeInfo.lng} />
           </div>
           <div className="p-6 flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0 shadow-inner">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                 <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] block">Markas Besar Jastip Siau:</span>
                 <p className="text-[11px] font-bold text-primary uppercase leading-relaxed mt-2">
                   {officeInfo.address}
                 </p>
              </div>
           </div>
           <CardFooter className="p-6 bg-muted/5 border-t flex flex-col items-center gap-6">
             <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex flex-col items-center text-center gap-2">
                   <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center shadow-sm"><Phone className="h-5 w-5 text-green-600" /></div>
                   <span className="text-[8px] font-black uppercase text-muted-foreground">WA Admin</span>
                   <p className="text-[10px] font-black text-primary">{officeInfo.whatsapp}</p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                   <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shadow-sm"><Mail className="h-5 w-5 text-blue-600" /></div>
                   <span className="text-[8px] font-black uppercase text-muted-foreground">Email Support</span>
                   <p className="text-[10px] font-black text-primary truncate w-full px-2">{officeInfo.email}</p>
                </div>
             </div>
             
             {!isExclusiveAdmin && (
               <Button 
                  variant="outline" 
                  className="w-full h-14 rounded-2xl font-black uppercase text-[10px] border-primary/20 bg-white active:scale-95 transition-all shadow-xl gap-3 text-primary" 
                  onClick={handleContactAdmin}
                  disabled={contactLoading || !user}
               >
                  {contactLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Headset className="h-5 w-5" />}
                  Layanan Bantuan Darurat
               </Button>
             )}
          </CardFooter>
        </Card>

        <div className="text-center py-10 opacity-30">
           <div className="flex items-center justify-center gap-2 mb-2">
              <History className="h-4 w-4" />
              <span className="text-[8px] font-black uppercase tracking-widest">Konstitusi Digital V6.5.0</span>
           </div>
           <p className="text-[7px] font-bold uppercase">Seluruh transaksi diawasi oleh Radar Kedaulatan Jastip Siau.</p>
        </div>
      </div>
    </FlexibleFrame>
  );
}
