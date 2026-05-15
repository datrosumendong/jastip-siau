
"use client";

/**
 * VIEW: Auth Register (MAHAKARYA SECURE V5)
 * SOP: Penegakan seluruh kolom wajib, fitur Lihat Password, dan validasi Username Unik.
 * FIX: Memulihkan visibilitas Checkbox Ketentuan dan menambahkan panduan keamanan password.
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Loader2, MailCheck, ArrowLeft, MapPin, ShieldCheck, AtSign, Calendar, Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { differenceInYears } from 'date-fns';
import { cleanWhatsAppNumber } from '@/lib/whatsapp';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const LocationPicker = dynamic(() => import('@/components/location-picker'), {
  ssr: false,
  loading: () => <div className="h-[180px] w-full bg-muted animate-pulse rounded-2xl flex items-center justify-center font-bold text-[10px] uppercase">Menyiapkan Peta...</div>
});

interface RegisterViewProps {
  onBack: () => void;
  onGoToLogin: () => void;
}

export default function RegisterView({ onBack, onGoToLogin }: RegisterViewProps) {
  const auth = useAuth();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [agreed, setAgreed] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [lat, setLat] = useState(-2.5489);
  const [lng, setLng] = useState(118.0149);
  const [locating, setLocating] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);

  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState({ a: 0, b: 0, result: 0 });

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    if (birthDate) {
      const age = differenceInYears(new Date(), new Date(birthDate));
      setCalculatedAge(age);
    } else {
      setCalculatedAge(null);
    }
  }, [birthDate]);

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    setCaptchaQuestion({ a, b, result: a + b });
    setCaptchaAnswer('');
  };

  const handleGetGPS = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth || !db) return;
    
    if (parseInt(captchaAnswer) !== captchaQuestion.result) {
      setError('Verifikasi keamanan salah.');
      generateCaptcha();
      return;
    }

    if (!agreed) { 
      setError('Harap setujui ketentuan layanan.'); 
      return; 
    }

    if (password.length < 8) {
      setError('Password minimal harus 8 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string).trim().toLowerCase();
    const fullName = formData.get('fullName') as string;
    const username = (formData.get('username') as string).trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    
    const whatsappRaw = formData.get('whatsapp') as string;
    const whatsapp = cleanWhatsAppNumber(whatsappRaw);
    
    if (whatsapp.length < 11) {
      setError('Nomor WhatsApp tidak valid.');
      setLoading(false);
      return;
    }

    try {
      // 1. SOP: Verifikasi Kedaulatan Username (Must be Unique)
      const userCheck = await getDoc(doc(db, 'usernames', username));
      if (userCheck.exists()) {
        setError('Username ini sudah terpakai warga lain.');
        setLoading(false);
        return;
      }

      // 2. Ciptakan Akun
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userRes = userCredential.user;

      await updateProfile(userRes, { displayName: fullName });
      await sendEmailVerification(userRes);

      // 3. Kunci Username di Registry
      await setDoc(doc(db, 'usernames', username), { uid: userRes.uid });

      const userData = {
        uid: userRes.uid, 
        username,
        fullName, 
        email, 
        whatsapp, 
        address: formData.get('address') as string,
        latitude: lat,
        longitude: lng,
        birthDate: birthDate, 
        gender: formData.get('gender') as string, 
        age: calculatedAge || 0, 
        role: 'member',
        isOnline: false,
        hasActiveDebt: false,
        showWhatsapp: true,
        showAddress: true,
        showAge: true,
        showGender: true,
        privateChat: false,
        twoStepEnabled: false,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', userRes.uid), userData);
      setVerificationSent(true);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email sudah terdaftar di pangkalan data.');
      } else {
        setError('Gangguan sistem. Mohon cek koneksi internet Anda.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background animate-in fade-in duration-500">
        <Card className="w-full max-w-md shadow-2xl border-none rounded-[2.5rem] text-center overflow-hidden bg-white">
          <div className="h-2 bg-green-500 w-full" />
          <CardHeader className="space-y-4 pt-10 px-8">
            <div className="mx-auto p-5 rounded-full bg-green-50 w-fit shadow-inner">
              <MailCheck className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-black uppercase tracking-tighter text-primary leading-none">Cek Email!</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest leading-relaxed">
              Tautan verifikasi telah dikirim. Aktifkan akun Anda sebelum masuk ke Dashboard.
            </CardDescription>
          </CardHeader>
          <CardFooter className="pb-12 px-8 flex flex-col gap-3">
            <Button onClick={onGoToLogin} className="w-full h-14 bg-primary text-white text-xs font-black uppercase rounded-2xl shadow-xl active:scale-95 transition-all">Buka Gerbang Masuk</Button>
            <Button onClick={onBack} variant="ghost" className="text-[9px] font-black uppercase text-muted-foreground underline">Kembali ke Beranda</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background items-center justify-center p-4 py-8 animate-in fade-in duration-300 overflow-y-auto custom-scrollbar">
      <Card className="w-full max-w-2xl shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-white">
        <div className="h-1.5 bg-primary w-full" />
        <CardHeader className="text-center pt-6 pb-2 space-y-1">
          <div className="flex justify-center mb-1">
            <div className="p-2.5 rounded-2xl bg-primary/10">
              <Package className="h-7 w-7 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl font-black text-primary uppercase tracking-tighter leading-none">Daftar Member</CardTitle>
          <CardDescription className="text-[9px] font-bold uppercase tracking-widest opacity-60">Lengkapi identitas warga pangkalan Siau.</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3.5 px-6 md:px-10">
            {error && <Alert variant="destructive" className="rounded-xl border-none bg-destructive/10 text-destructive p-3"><AlertDescription className="text-[9px] font-black uppercase">{error}</AlertDescription></Alert>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase tracking-widest ml-1">Username Unik *</Label>
                <div className="relative">
                   <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary/40" />
                   <Input name="username" placeholder="jastiper_siau" required className="h-10 bg-muted/20 border-none rounded-xl font-bold text-xs pl-9 shadow-inner focus:ring-1 focus:ring-primary/20" />
                </div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase tracking-widest ml-1">Nama Sesuai KTP *</Label>
                <Input name="fullName" required className="h-10 bg-muted/20 border-none rounded-xl font-bold text-xs shadow-inner" />
              </div>

              <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase tracking-widest ml-1 text-primary">WhatsApp Aktif *</Label>
                <div className="relative">
                   <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-primary">+62</div>
                   <Input name="whatsapp" placeholder="8123456..." required className="h-10 bg-muted/20 border-none rounded-xl font-bold text-xs pl-10 ring-1 ring-primary/5 shadow-inner" />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase tracking-widest ml-1">Kelamin *</Label>
                <Select name="gender" required><SelectTrigger className="h-10 bg-muted/20 border-none rounded-xl font-bold text-xs shadow-inner"><SelectValue placeholder="Pilih..." /></SelectTrigger><SelectContent className="rounded-xl border-none shadow-2xl"><SelectItem value="pria" className="text-[10px] font-black uppercase">PRIA</SelectItem><SelectItem value="wanita" className="text-[10px] font-black uppercase">WANITA</SelectItem></SelectContent></Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase tracking-widest ml-1">Tanggal Lahir *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary/40" />
                  <Input type="date" required className="h-10 bg-muted/20 border-none rounded-xl font-bold text-xs pl-9 shadow-inner" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[8px] font-black uppercase tracking-widest ml-1">Usia Terdeteksi</Label>
                <div className="h-10 bg-primary/5 rounded-xl flex items-center px-4 border border-dashed border-primary/20">
                  <span className={cn("text-[10px] font-black", calculatedAge ? "text-primary" : "text-muted-foreground opacity-30")}>
                    {calculatedAge !== null ? `${calculatedAge} TAHUN` : "---"}
                  </span>
                </div>
              </div>

              <div className="md:col-span-2 space-y-1">
                <Label className="text-[8px] font-black uppercase tracking-widest ml-1">Email Aktif *</Label>
                <Input name="email" type="email" required className="h-10 bg-muted/20 border-none rounded-xl font-bold text-xs shadow-inner" />
              </div>
              
              <div className="md:col-span-2 space-y-3 pt-2 border-t border-dashed">
                <div className="flex items-center justify-between">
                  <Label className="text-[8px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Pin Lokasi Rumah (GPS) *</Label>
                  <button type="button" onClick={handleGetGPS} disabled={locating} className="text-[7px] font-black uppercase text-primary underline active:scale-95">
                    {locating ? "Sinyal Aktif..." : "Ambil GPS"}
                  </button>
                </div>
                <div className="rounded-2xl overflow-hidden border shadow-inner">
                  <LocationPicker initialLat={lat} initialLng={lng} onLocationSelect={(lt, ln) => { setLat(lt); setLng(ln); }} height="160px" />
                </div>
                <Input name="address" placeholder="Detail Alamat: Kel. Ondong, Lorong Gereja..." required className="h-10 bg-muted/20 border-none rounded-xl font-bold text-xs shadow-inner" />
              </div>

              <div className="space-y-1 relative">
                <Label className="text-[8px] font-black uppercase tracking-widest ml-1">Password *</Label>
                <div className="relative">
                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary/30" />
                   <Input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="h-10 bg-muted/20 border-none rounded-xl font-bold text-xs pl-9 pr-10 shadow-inner" 
                   />
                   <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground active:scale-75 transition-all">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                   </button>
                </div>
              </div>

              <div className="space-y-1 relative">
                <Label className="text-[8px] font-black uppercase tracking-widest ml-1">Konfirmasi *</Label>
                <div className="relative">
                   <Input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    className="h-10 bg-muted/20 border-none rounded-xl font-bold text-xs pr-10 shadow-inner" 
                   />
                   <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground active:scale-75 transition-all">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                   </button>
                </div>
              </div>
              
              <div className="md:col-span-2 px-1">
                 <div className="flex items-center gap-2 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                    <CheckCircle2 className="h-3 w-3 text-blue-600" />
                    <span className="text-[7px] font-black text-blue-700 uppercase tracking-widest">Saran: Minimal 8 karakter agar akun bertahta aman.</span>
                 </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between gap-4">
               <span className="text-[9px] font-black text-primary uppercase tracking-widest">Verifikasi: {captchaQuestion.a} + {captchaQuestion.b} ?</span>
               <Input type="number" className="h-10 w-24 bg-white text-center font-black text-primary rounded-lg border-primary/10 shadow-sm" value={captchaAnswer} onChange={(e) => setCaptchaAnswer(e.target.value)} required />
            </div>

            <div className="pt-1 flex items-start gap-3">
              <div className="flex items-center space-x-2">
                 <Checkbox 
                  id="terms" 
                  checked={agreed} 
                  onCheckedChange={(v) => setAgreed(v as boolean)} 
                  className="h-5 w-5 rounded-lg border-primary/30 bg-white data-[state=checked]:bg-primary shadow-sm" 
                  required
                 />
                 <div className="text-[9px] font-black uppercase text-muted-foreground leading-relaxed cursor-pointer select-none">
                   Saya menyetujui seluruh <TermsDialog /> Jastip Siau.
                 </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pb-8 pt-2 px-6 md:px-10">
            <Button className="w-full h-14 bg-primary text-white text-xs font-black uppercase rounded-2xl shadow-xl active:scale-95 transition-all" type="submit" disabled={loading || !agreed}>
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Daftar Member'}
            </Button>
            <Button type="button" onClick={onBack} variant="ghost" size="sm" className="text-[8px] font-black uppercase opacity-40">Kembali ke Beranda</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

function TermsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="text-primary underline hover:text-blue-800 transition-colors">Ketentuan Layanan</button>
      </DialogTrigger>
      <DialogContent className="w-[92vw] sm:max-w-lg rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl z-[500] animate-in zoom-in-95">
         <div className="bg-primary p-6 text-white shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/10"><ShieldCheck className="h-6 w-6" /></div>
               <div>
                  <DialogTitle className="text-lg font-black uppercase tracking-tight leading-none">Konstitusi Siau</DialogTitle>
                  <p className="text-[8px] font-bold text-white/60 uppercase tracking-widest mt-1">Integritas Warga & Mitra</p>
               </div>
            </div>
         </div>
         <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4 bg-white">
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4">
               <ShieldCheck className="h-6 w-6 text-red-600 shrink-0" />
               <div className="space-y-1">
                  <h4 className="text-[10px] font-black text-red-900 uppercase">Peringatan Pasal 378 KUHP</h4>
                  <p className="text-[9px] font-medium text-red-800 uppercase leading-relaxed italic opacity-80">"Penolakan membayar titipan yang sudah dibelanjakan kurir akan diproses secara hukum sebagai tindakan penipuan."</p>
               </div>
            </div>

            <div className="space-y-4 pt-2">
               <TermItem title="Larangan Pembatalan" desc="Warga dilarang keras membatalkan pesanan secara sepihak jika kurir sudah berada di lokasi belanja atau sudah membeli barang." />
               <TermItem title="Akurasi GPS" desc="Titik antar (GPS) yang diberikan harus akurat. Kurir hanya akan mengantar sesuai titik yang tertera pada radar navigasi." />
               <TermItem title="Pembayaran Tunai" desc="Seluruh transaksi saat ini diselesaikan dengan tunai di lokasi pengantaran sesuai tagihan yang muncul di aplikasi." />
               <TermItem title="Etika Berkomunikasi" desc="Warga dan Kurir wajib menjaga kesopanan di dalam chat aplikasi. Bahasa kasar akan dideteksi oleh Radar AI dan mengakibatkan blokir akun." />
            </div>
         </div>
         <div className="p-6 bg-muted/5 border-t">
            <Button className="w-full h-12 bg-primary rounded-xl font-black uppercase text-[10px] shadow-lg active:scale-95 transition-all">Saya Mengerti & Patuh</Button>
         </div>
      </DialogContent>
    </Dialog>
  );
}

function TermItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex gap-3 items-start group">
       <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0 group-hover:scale-150 transition-transform" />
       <div className="min-w-0">
          <p className="text-[10px] font-black uppercase text-primary mb-0.5">{title}</p>
          <p className="text-[9px] font-medium text-muted-foreground uppercase leading-relaxed">{desc}</p>
       </div>
    </div>
  );
}
