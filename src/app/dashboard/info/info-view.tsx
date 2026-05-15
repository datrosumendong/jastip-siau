
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Info, ShieldCheck, BookOpen, UserCheck, Truck, Store 
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useView } from '@/context/view-context';

/**
 * VIEW: Info & SOP (Pure MVC View)
 */
export default function InfoSopView() {
  const { setView } = useView();

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar bg-[#F8FAFC]">
      <div className="space-y-6 pb-40 px-4 py-8 animate-in fade-in duration-700 max-w-3xl mx-auto">
        <div className="bg-white p-8 rounded-[2rem] border border-primary/10 shadow-sm text-center space-y-4">
          <div className="mx-auto h-20 w-20 rounded-[1.5rem] bg-primary/10 flex items-center justify-center mb-2 shadow-inner">
            <BookOpen className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-primary uppercase tracking-tighter leading-none">Informasi & SOP</h1>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] opacity-60">Panduan Lengkap Jastip Siau</p>
          </div>
        </div>

        <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-primary text-white p-8">
            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <ShieldCheck className="h-7 w-7" /> Keamanan Berbasis Hukum
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-10 space-y-10">
            <section className="space-y-4">
               <div className="flex items-center gap-3 text-red-600">
                  <Info className="h-5 w-5" />
                  <h3 className="font-black uppercase text-sm">Peringatan Pasal 378</h3>
               </div>
               <div className="p-5 bg-red-50 border-2 border-red-100 rounded-3xl">
                  <p className="text-[10px] font-bold text-red-900 leading-relaxed uppercase italic">
                    "Member yang menolak membayar pesanan yang sudah dikirim akan diblokir otomatis dan data transaksi diserahkan ke pihak berwajib sebagai alat bukti penipuan."
                  </p>
               </div>
            </section>
            
            <Accordion type="single" collapsible className="w-full space-y-3">
               <AccordionItem value="member" className="border-none bg-muted/30 rounded-[1.5rem] px-5">
                 <AccordionTrigger className="hover:no-underline py-5 text-[12px] font-black uppercase text-primary">SOP Untuk Member</AccordionTrigger>
                 <AccordionContent className="pb-6 text-[10px] font-bold text-muted-foreground uppercase leading-relaxed space-y-3">
                    <p>• Dilarang membatalkan pesanan jika kurir sudah belanja.</p>
                    <p>• Pastikan titik GPS rumah akurat.</p>
                 </AccordionContent>
               </AccordionItem>
               <AccordionItem value="courier" className="border-none bg-muted/30 rounded-[1.5rem] px-5">
                 <AccordionTrigger className="hover:no-underline py-5 text-[12px] font-black uppercase text-primary">SOP Untuk Kurir</AccordionTrigger>
                 <AccordionContent className="pb-6 text-[10px] font-bold text-muted-foreground uppercase leading-relaxed space-y-3">
                    <p>• Wajib input harga sesuai struk asli belanja.</p>
                    <p>• Bersikap ramah di chat aplikasi.</p>
                 </AccordionContent>
               </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter className="p-6 bg-primary/5 flex flex-col items-center">
             <p className="text-[10px] font-bold uppercase opacity-80 text-center mb-4">Butuh bantuan darurat? Hubungi Admin.</p>
             <Button variant="outline" className="bg-white border-primary/20 rounded-2xl font-black uppercase text-[10px] h-12 px-10" onClick={() => setView('messages', { with: 'ADMIN_UID' })}>Chat Admin</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
