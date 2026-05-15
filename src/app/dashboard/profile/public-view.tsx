
"use client";

import { useMemo } from 'react';
import { useView } from '@/context/view-context';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, MessageSquare, Phone, MapPin, Truck, Store, UserCheck, Star, ShieldCheck } from 'lucide-react';
import { openWhatsAppChat } from '@/lib/whatsapp';

/**
 * VIEW: Public Profile View (MVC REFINED V170)
 * SOP: Digunakan untuk melihat profil mitra (Kurir/UMKM) secara transparan.
 * REVISI: Tombol Chat diarahkan secara mutlak ke 'chat_view'.
 */
export default function PublicProfilePage() {
  const { setView, viewData, goBack, forceUnlockUI } = useView();
  const targetId = viewData?.id;
  const db = useFirestore();

  const targetRef = useMemo(() => (db && targetId ? doc(db, 'users', targetId) : null), [db, targetId]);
  const { data: profile, loading } = useDoc(targetRef, true);

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

  if (!profile) return (
    <div className="flex flex-col items-center justify-center h-full p-10 text-center space-y-4">
       <ShieldCheck className="h-16 w-16 text-muted-foreground opacity-20" />
       <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Profil tidak ditemukan.</p>
       <Button onClick={goBack}>Kembali</Button>
    </div>
  );

  const isCourier = profile.role === 'courier';
  const isUMKM = profile.role === 'umkm';

  const handleGoToChat = () => {
    forceUnlockUI();
    setView('chat_view', { id: `private_${targetId}` }); // Fallback jika ID chat belum ada akan ditangani controller
    setTimeout(forceUnlockUI, 150);
  };

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar bg-[#F8FAFC]">
      <div className="max-w-2xl mx-auto space-y-6 py-6 px-4 pb-40 animate-in fade-in duration-500">
        
        <div className="bg-white p-3 rounded-2xl border shadow-sm flex items-center gap-4">
          <Button onClick={goBack} variant="ghost" size="icon" className="h-9 w-9 text-primary rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
             <h1 className="text-sm font-black uppercase text-primary truncate leading-tight">Profil Mitra Siau</h1>
             <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Terverifikasi Sistem Jastip</p>
          </div>
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <div className={`h-32 w-full ${isCourier ? 'bg-blue-600' : isUMKM ? 'bg-orange-600' : 'bg-primary'}`} />
          <CardContent className="p-0">
             <div className="px-8 pb-8 -mt-16 flex flex-col items-center text-center space-y-4">
                <Avatar className="h-32 w-32 border-8 border-white shadow-2xl">
                  <AvatarImage src={profile.imageUrl} className="object-cover" />
                  <AvatarFallback className="bg-muted text-primary text-4xl font-black">
                    {profile.fullName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                   <div className="flex items-center justify-center gap-2">
                      <CardTitle className="text-2xl font-black uppercase tracking-tighter text-primary">
                        {profile.storeName || profile.fullName}
                      </CardTitle>
                      <Badge className="bg-green-500 text-white border-none text-[8px] font-black uppercase px-2 h-5">Aktif</Badge>
                   </div>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                     Mitra {profile.role?.toUpperCase()} Jastip Siau
                   </p>
                </div>

                <div className="flex items-center gap-1 text-yellow-500">
                   {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-current" />)}
                   <span className="text-xs font-black text-primary ml-1">5.0 (Terpercaya)</span>
                </div>

                <div className="w-full p-6 bg-muted/20 rounded-[2rem] border-2 border-white shadow-inner italic">
                   <p className="text-[12px] font-bold text-primary/80 uppercase leading-relaxed">
                     "{profile.bio || 'Siap melayani kebutuhan warga Siau dengan aman dan transparan.'}"
                   </p>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full pt-4">
                   <div className="bg-white p-4 rounded-2xl border shadow-sm space-y-1">
                      <div className="flex items-center gap-2 text-primary">
                         <MapPin className="h-4 w-4" />
                         <span className="text-[9px] font-black uppercase">Domisili</span>
                      </div>
                      <p className="text-[10px] font-bold uppercase truncate">{profile.address || "Kepulauan Siau"}</p>
                   </div>
                   <div className="bg-white p-4 rounded-2xl border shadow-sm space-y-1">
                      <div className="flex items-center gap-2 text-primary">
                         <UserCheck className="h-4 w-4" />
                         <span className="text-[9px] font-black uppercase">Status Akun</span>
                      </div>
                      <p className="text-[10px] font-bold uppercase text-green-600">Terverifikasi</p>
                   </div>
                </div>
             </div>
          </CardContent>
          <CardFooter className="p-6 bg-muted/5 border-t gap-3 flex flex-col sm:flex-row">
             <Button 
               variant="outline" 
               className="w-full h-14 border-2 border-primary/10 text-primary rounded-2xl font-black uppercase text-xs bg-white shadow-md active:scale-95 transition-all"
               onClick={handleGoToChat}
             >
                <MessageSquare className="mr-2 h-5 w-5" /> Chat Aplikasi
             </Button>
             <Button 
               className="w-full h-14 bg-green-600 text-white rounded-2xl font-black uppercase text-xs shadow-2xl active:scale-95 transition-all"
               onClick={() => openWhatsAppChat(profile.whatsapp, "Halo Mitra Jastip Siau!")}
             >
                <Phone className="mr-2 h-5 w-5" /> WhatsApp Mitra
             </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
