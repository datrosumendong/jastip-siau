"use client";

/**
 * VIEW: Public Profile View (SOP PRIVACY & LIVE TRACKER V470)
 * SOP: Penegakan kedaulatan pelacakan fisik bagi peran Kurir & Owner.
 * FIX: Restorasi tombol kembali dengan navigasi paksa ke 'home' untuk membasmi bug stack.
 * REVISI: Penajaman spasi kaku (Ultra-Padat) untuk efisiensi maksimal pandangan smartphone.
 */

import { useMemo, useState, useEffect } from 'react';
import { useView } from '@/context/view-context';
import { useDoc, useFirestore, useUser, useCollection } from '@/firebase';
import { 
  doc, query, collection, where, orderBy, limit, 
  getDocs, setDoc, serverTimestamp, onSnapshot
} from 'firebase/firestore';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, MessageSquare, Phone, MapPin, 
  Star, Heart, Clock, Globe, AtSign, User, ChevronRight, ShieldAlert, ShieldCheck,
  Zap, ZapOff, Navigation, Info, Loader2
} from 'lucide-react';
import { openWhatsAppChat } from '@/lib/whatsapp';
import { formatDistanceToNow, format } from 'date-fns';
import { id } from 'date-fns/locale';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';

const OrderMap = dynamic(() => import('@/components/order-map'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted/20 animate-pulse flex items-center justify-center font-black text-[10px] uppercase">Menyiapkan Radar...</div>
});

export default function PublicProfileView() {
  const { setView, viewData, forceUnlockUI } = useView();
  const targetId = viewData?.id || viewData?.userId;
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [isNavigating, setIsNavigating] = useState(false);
  const [hasActiveOrder, setHasActiveOrder] = useState(false);

  // 1. DATA MODEL: Profil Target (Real-time Stream)
  const targetRef = useMemo(() => (db && targetId ? doc(db, 'users', targetId) : null), [db, targetId]);
  const { data: profile, loading } = useDoc(targetRef, true);

  // 2. DATA MODEL: Profil Saya
  const myRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: myProfile } = useDoc(myRef, true);

  const isMe = user?.uid === targetId;
  const isStaff = myProfile?.role === 'admin' || myProfile?.role === 'owner';

  // 3. LOGIKA KEDAULATAN: Deteksi Amanah Aktif
  useEffect(() => {
    if (!db || !user || !targetId || isMe) return;

    const q1 = query(collection(db, 'orders'), where('userId', '==', user.uid), where('courierId', '==', targetId));
    const q2 = query(collection(db, 'orders'), where('userId', '==', targetId), where('courierId', '==', user.uid));

    const unsub1 = onSnapshot(q1, (snap) => {
      const active = snap.docs.some(d => !['completed', 'cancelled'].includes(d.data().status));
      if (active) setHasActiveOrder(true);
    });

    const unsub2 = onSnapshot(q2, (snap) => {
      const active = snap.docs.some(d => !['completed', 'cancelled'].includes(d.data().status));
      if (active) setHasActiveOrder(true);
    });

    return () => { unsub1(); unsub2(); };
  }, [db, user, targetId, isMe]);

  // 4. DATA MODEL: Feed Personal
  const postsQuery = useMemo(() => {
    if (!db || !targetId) return null;
    return query(collection(db, 'posts'), where('userId', '==', targetId), limit(10));
  }, [db, targetId]);
  
  const { data: rawPosts = [], loading: postsLoading } = useCollection(postsQuery, true);
  const posts = useMemo(() => [...rawPosts].sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)), [rawPosts]);

  const handleChatPrivate = async () => {
    if (!user || !db || !profile || isNavigating) return;
    if (profile.privateChat === true && !isStaff && !hasActiveOrder) {
       toast({ variant: "destructive", title: "Akses Dibatasi", description: "Warga ini membatasi obrolan pribadi." });
       return;
    }

    setIsNavigating(true);
    forceUnlockUI();

    try {
      const q = query(collection(db, 'chats'), where('type', '==', 'cht_private'), where('participants', 'array-contains', user.uid));
      const snap = await getDocs(q);
      const existingChat = snap.docs.find(d => d.data().participants?.includes(targetId));

      if (existingChat) {
        setView('chat_view', { id: existingChat.id });
      } else {
        const newChatRef = doc(collection(db, 'chats'));
        const chatId = newChatRef.id;
        await setDoc(newChatRef, {
          id: chatId, type: 'cht_private', participants: [user.uid, targetId].sort(),
          participantNames: { [user.uid]: myProfile?.fullName || "Warga", [targetId]: profile.fullName || "Warga" },
          participantPhotos: { [user.uid]: myProfile?.imageUrl || "", [targetId]: profile.imageUrl || "" },
          lastMessage: "Memulai percakapan...", lastMessageSenderId: user.uid, lastMessageStatus: 'read',
          updatedAt: serverTimestamp(), createdAt: serverTimestamp()
        });
        setView('chat_view', { id: chatId });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal Hubungkan" });
    } finally { 
      setIsNavigating(false); 
      setTimeout(forceUnlockUI, 150);
    }
  };

  /**
   * ACTION: handleBack (SOP NAV RECOVERY V470)
   * Menggunakan navigasi paksa ke 'home' untuk menjamin tombol berfungsi mutlak.
   */
  const handleBack = () => {
    forceUnlockUI();
    setView('home'); 
    setTimeout(forceUnlockUI, 150);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      <p className="text-[10px] font-black uppercase text-primary/40 animate-pulse tracking-widest">Sinkronisasi Identitas...</p>
    </div>
  );

  if (!profile) return (
    <div className="flex flex-col items-center justify-center h-full p-20 text-center space-y-6">
       <ShieldAlert className="h-16 w-16 text-destructive opacity-20" />
       <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Warga Tidak Ditemukan</p>
       <Button onClick={handleBack} variant="outline" className="rounded-xl font-black uppercase text-[10px]">Kembali</Button>
    </div>
  );

  // VISIBILITY FLAGS
  const canSeeAddress = profile.showAddress === true || isStaff || isMe || hasActiveOrder;
  const canSeeGender = profile.showGender === true || isStaff || isMe;
  const canSeeAge = profile.showAge === true || isStaff || isMe;
  const canSeeWhatsapp = profile.showWhatsapp === true || isStaff || isMe || hasActiveOrder;
  const canChat = profile.privateChat !== true || isStaff || hasActiveOrder;

  const showLiveRadar = (profile.role === 'courier' || profile.role === 'owner') && profile.latitude && profile.longitude;

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar bg-[#F8FAFC]">
      <div className="max-w-2xl mx-auto space-y-1 py-1 px-1 pb-48 animate-in fade-in duration-700">
        
        {/* HEADER MINI: ULTRA PADAT */}
        <div className="bg-white p-1.5 rounded-xl border border-primary/5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={handleBack} className="p-1.5 text-primary active:scale-90 transition-transform rounded-lg hover:bg-primary/5">
              <ArrowLeft className="h-5 w-5 stroke-[2.5px]" />
            </button>
            <div className="min-w-0">
               <h1 className="text-[11px] font-black uppercase text-primary truncate tracking-tight">Identitas Warga</h1>
               <p className="text-[7px] text-muted-foreground uppercase font-black opacity-40">Verified Siau System</p>
            </div>
          </div>
          {isMe && <Button onClick={() => setView('edit_profile_user')} variant="outline" size="sm" className="h-7 text-[8px] font-black uppercase rounded-lg">Edit</Button>}
        </div>

        <Card className="border-none shadow-lg rounded-[1.8rem] overflow-hidden bg-white">
          {/* RADAR HEADER */}
          {showLiveRadar ? (
             <div className="h-44 w-full relative bg-muted overflow-hidden z-0">
                <OrderMap 
                  destLat={profile.latitude} 
                  destLng={profile.longitude} 
                  courierLat={profile.latitude} 
                  courierLng={profile.longitude} 
                />
                <div className="absolute top-2 left-2 z-10">
                   <Badge className="bg-green-600 text-white font-black text-[6px] uppercase border-none px-2 shadow-lg animate-pulse">RADAR AKTIF</Badge>
                </div>
             </div>
          ) : (
             <div className={cn(
               "h-20 w-full", 
               profile.role === 'courier' ? 'bg-blue-600' : profile.role === 'umkm' ? 'bg-orange-600' : 'bg-primary'
             )} />
          )}

          <CardContent className="p-0">
             <div className="px-4 pb-3 -mt-10 flex flex-col items-center text-center space-y-2.5">
                <div className="relative">
                   <Avatar className="h-24 w-24 border-[5px] border-white shadow-xl rounded-full ring-1 ring-primary/5">
                     <AvatarImage src={profile.imageUrl} className="object-cover rounded-full" />
                     <AvatarFallback className="bg-muted text-primary text-2xl font-black uppercase">{profile.fullName?.charAt(0)}</AvatarFallback>
                   </Avatar>
                   {profile.isOnline && (
                     <div className="absolute top-1 right-1 h-4.5 w-4.5 bg-green-500 border-4 border-white rounded-full shadow-lg animate-pulse" />
                   )}
                </div>

                <div className="space-y-0.5">
                   <h2 className="text-xl font-black uppercase tracking-tighter text-primary leading-none">
                     {profile.storeName || profile.fullName}
                   </h2>
                   <div className="flex items-center justify-center gap-1.5 mt-1">
                      <Badge className={cn("text-[7px] font-black uppercase border-none px-2 h-4.5 flex items-center", profile.isOnline ? "bg-green-600" : "bg-slate-400")}>
                        {profile.isOnline ? "SIAGA" : "OFFLINE"}
                      </Badge>
                      {profile.role === 'admin' && <Badge className="bg-purple-600 text-white text-[7px] font-black uppercase border-none px-2 h-4.5">ADMIN</Badge>}
                      {hasActiveOrder && <Badge className="bg-blue-100 text-blue-700 text-[6px] font-black border-none px-2 h-4.5 shadow-sm animate-pulse">AMANAH</Badge>}
                   </div>
                </div>

                <div className="w-full p-2.5 bg-muted/10 rounded-2xl border border-primary/5 italic shadow-inner">
                   <p className="text-[10px] font-bold text-primary/70 uppercase tracking-tight leading-relaxed">
                     "{profile.bio || "Melayani dengan integritas di Bumi Karangetang."}"
                   </p>
                </div>

                <div className="w-full grid grid-cols-2 gap-2 text-left">
                   {canSeeAddress ? (
                     <DetailTile icon={MapPin} label="Domisili" value={profile.address || "Siau"} />
                   ) : <PrivacyLockedTile icon={MapPin} label="Domisili" />}

                   <DetailTile icon={AtSign} label="Username" value={profile.username || profile.uid.slice(0,6)} />

                   {canSeeGender ? (
                     <DetailTile icon={User} label="Kelamin" value={profile.gender || "-"} />
                   ) : <PrivacyLockedTile icon={User} label="Kelamin" />}

                   {canSeeAge ? (
                     <DetailTile icon={Clock} label="Usia" value={profile.age ? `${profile.age} Thn` : "-"} />
                   ) : <PrivacyLockedTile icon={Clock} label="Usia" />}
                </div>
             </div>
          </CardContent>
          
          <CardFooter className="p-2.5 bg-muted/5 border-t gap-2 flex flex-row">
             {!isMe && (
               <>
                 {canChat ? (
                    <Button 
                      variant="outline" 
                      className="flex-1 h-11 border-primary/10 text-primary rounded-xl font-black uppercase text-[9px] bg-white shadow-sm active:scale-95 transition-all" 
                      onClick={handleChatPrivate}
                      disabled={isNavigating}
                    >
                      {isNavigating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4 mr-1.5" />} CHAT
                    </Button>
                 ) : (
                    <div className="flex-1 h-11 bg-muted/30 rounded-xl flex items-center justify-center border border-dashed border-primary/10 opacity-40">
                       <span className="text-[8px] font-black uppercase text-primary/40 tracking-tighter">Chat Privat</span>
                    </div>
                 )}

                 {canSeeWhatsapp ? (
                   <Button className="flex-1 h-11 bg-green-600 text-white rounded-xl font-black uppercase text-[9px] shadow-lg active:scale-95 gap-1.5" onClick={() => openWhatsAppChat(profile.whatsapp, `Halo ${profile.fullName}, saya warga Jastip Siau.`)}>
                     <Phone className="h-4 w-4" /> WHATSAPP
                   </Button>
                 ) : (
                    <div className="flex-1 h-11 bg-muted/30 rounded-xl flex items-center justify-center border border-dashed border-primary/10 opacity-40">
                       <span className="text-[8px] font-black uppercase text-primary/40 tracking-tighter">WA Privat</span>
                    </div>
                 )}
               </>
             )}
             {isMe && <Button onClick={() => setView('edit_profile_user')} className="w-full h-11 bg-primary text-white rounded-xl font-black uppercase text-[9px] shadow-lg">Kelola Akun</Button>}
          </CardFooter>
        </Card>

        {/* FEED SECTOR: ULTRA PADAT */}
        <div className="space-y-1">
           <div className="flex items-center gap-3 px-1 mt-1.5">
              <h3 className="text-[9px] font-black uppercase text-primary flex items-center gap-2 tracking-widest opacity-40"><Globe className="h-3 w-3" /> Kabar Terkini</h3>
              <div className="h-px bg-primary/5 flex-1" />
           </div>
           
           {postsLoading ? (
             <div className="flex justify-center py-6 opacity-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
           ) : posts.length === 0 ? (
             <div className="text-center py-8 bg-white rounded-2xl border-2 border-dashed border-primary/5 opacity-20 font-black uppercase text-[8px]">Hampa...</div>
           ) : (
            <div className="space-y-1">
              {posts.map(p => (
                <Card key={p.id} className="border-none shadow-sm rounded-xl bg-white overflow-hidden cursor-pointer hover:shadow-md active:scale-[0.99] transition-all ring-1 ring-primary/5" onClick={() => setView('community', { postId: p.id })}>
                   <div className="flex p-2 gap-3">
                      {p.imageUrl ? (
                        <div className="h-12 w-12 rounded-lg overflow-hidden shrink-0 border bg-muted shadow-inner relative">
                          <Image src={p.imageUrl} alt="Kabar" fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 border border-primary/5 shadow-inner">
                          <MessageSquare className="h-4 w-4 text-primary opacity-20" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1 flex flex-col justify-center">
                         <p className="text-[10px] font-bold text-primary/80 uppercase tracking-tight line-clamp-2 italic leading-tight">"{p.content}"</p>
                         <div className="flex items-center justify-between mt-1 opacity-40">
                            <span className="text-[6.5px] font-black uppercase flex items-center gap-1">
                              <Clock className="h-2 w-2" /> 
                              {p.createdAt?.seconds ? formatDistanceToNow(new Date(p.createdAt.seconds * 1000), { addSuffix: true, locale: id }) : '-'}
                            </span>
                            <ChevronRight className="h-3 w-3" />
                         </div>
                      </div>
                   </div>
                </Card>
              ))}
            </div>
           )}
        </div>
      </div>
    </div>
  );
}

function DetailTile({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-white p-2 rounded-xl border border-primary/5 shadow-sm space-y-0.5 ring-1 ring-primary/[0.02] flex flex-col">
       <div className="flex items-center gap-1.5 text-primary/40"><Icon className="h-3 w-3" /><span className="text-[7px] font-black uppercase tracking-widest">{label}</span></div>
       <p className="text-[9px] font-black uppercase text-primary truncate leading-none mt-0.5">{value}</p>
    </div>
  );
}

function PrivacyLockedTile({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div className="bg-muted/30 p-2 rounded-xl border border-dashed border-primary/10 space-y-0.5 opacity-40 flex flex-col">
       <div className="flex items-center gap-1.5 text-muted-foreground"><Icon className="h-3 w-3" /><span className="text-[7px] font-black uppercase tracking-widest">{label}</span></div>
       <p className="text-[8px] font-bold uppercase text-muted-foreground italic flex items-center gap-1 mt-0.5"><ShieldAlert className="h-2.5 w-2.5" /> Privat</p>
    </div>
  );
}
