
"use client";

/**
 * VIEW: Auth Login (SOP BYPASS MODE)
 * REVISI: Mematikan sementara fitur 2FA agar pimpinan bisa masuk tanpa kode OTP.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface LoginViewProps {
  onBack: () => void;
  onGoToRegister: () => void;
}

export default function LoginView({ onBack, onGoToRegister }: LoginViewProps) {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleAfterLogin = async (uid: string) => {
    if (!db) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
        router.replace(`/${uid}`);
        return;
      }
      const profile = userDoc.data();
      router.replace(`/${profile.username || uid}`);
    } catch (e) {
      router.replace(`/${uid}`);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      await handleAfterLogin(result.user.uid);
    } catch (err) { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string).trim();
    const password = formData.get('password') as string;
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await handleAfterLogin(result.user.uid);
    } catch (err) { 
      setError('Email atau password salah.'); 
      setLoading(false); 
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
      <Card className="w-full max-w-md shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-white">
        <div className="h-2 bg-primary w-full" />
        <CardHeader className="text-center space-y-2 pt-8">
          <div className="flex justify-center mb-2"><div className="p-4 rounded-[2rem] bg-primary/10 shadow-inner"><Package className="h-10 w-10 text-primary" /></div></div>
          <CardTitle className="text-2xl font-black uppercase text-primary tracking-tighter leading-none">JASTIP SIAU</CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">Pintu Masuk Warga</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-8">
          {error && <Alert variant="destructive" className="rounded-2xl border-none bg-destructive/10 text-destructive"><AlertDescription className="text-[10px] font-black uppercase">{error}</AlertDescription></Alert>}
          <Button variant="outline" className="w-full h-12 font-black uppercase text-[10px] rounded-2xl border-primary/10 hover:bg-primary/5 active:scale-95 transition-all" onClick={handleGoogleLogin}>Masuk Dengan Google</Button>
          <div className="relative py-2"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-dashed" /></div><div className="relative flex justify-center text-[8px] font-black uppercase"><span className="bg-white px-3 text-muted-foreground tracking-widest">Atau Email</span></div></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">Email</Label><Input name="email" type="email" required className="rounded-2xl h-12 bg-muted/30 border-none font-bold text-sm px-5" /></div>
            <div className="space-y-1.5 relative"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">Kata Sandi</Label><div className="relative"><Input name="password" type={showPassword ? "text" : "password"} required className="rounded-2xl h-12 bg-muted/30 border-none font-bold text-sm pl-5 pr-12" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div></div>
            <Button className="w-full h-14 bg-primary font-black uppercase text-xs shadow-xl rounded-2xl mt-4 active:scale-95 transition-all" disabled={loading}>{loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Buka Dashboard'}</Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pb-10 pt-4 px-8">
          <p className="text-[10px] font-bold text-muted-foreground uppercase text-center">Belum punya akun? <button onClick={onGoToRegister} className="text-primary font-black underline">Daftar Di Sini</button></p>
          <Button onClick={onBack} variant="ghost" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted/50 rounded-xl"><ArrowLeft className="mr-2 h-3.5 w-3.5" /> Kembali</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
