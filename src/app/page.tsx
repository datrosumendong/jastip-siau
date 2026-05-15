
"use client";

/**
 * ARCHITECTURE: INITIAL GATEKEEPER (SOP V133 - TOTAL HYDRATION GUARD)
 * SOP: Restorasi Visual Mahakarya Orisinal & Radar Purge Total.
 * FIX: Membasmi Galat Hidrasi secara absolut dengan Mounted State Guard.
 * FIX: Teks branding manual CAPS untuk menjamin sinkronisasi radar NextJS.
 */

import { useUser, useFirestore, useDoc } from "@/firebase";
import { Suspense, lazy, useEffect, useState, useMemo } from "react";
import { Package } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc } from "firebase/firestore";

const LandingView = lazy(() => import("./home-landing-view"));
const LoginView = lazy(() => import("./auth-login-view"));
const RegisterView = lazy(() => import("./auth-register-view"));

type AppState = 'LOADING' | 'GUEST' | 'LOGIN' | 'REGISTER';

function RootIndexContent() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [appState, setAppState] = useState<AppState>('LOADING');
  const [mounted, setMounted] = useState(false);

  const userRef = useMemo(() => (user && db ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: profile, loading: profileLoading } = useDoc(userRef, true);

  // 1. SOP RADAR PURGE & HYDRATION GUARD
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      console.clear();
    }
  }, []);

  // 2. SOP AMNESTI CACHE GUEST
  useEffect(() => {
    if (!mounted || authLoading) return;

    if (!user) {
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
        window.sessionStorage.clear();
        // Clear all cookies
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        }
      }
      setAppState('GUEST');
    }
  }, [user, authLoading, mounted]);

  // 3. NAVIGATION RADAR
  useEffect(() => {
    if (!mounted || authLoading || profileLoading || !user || !profile) return;
    const username = profile.username;
    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : "";
    router.replace(`/${username || user.uid}${queryStr}`);
  }, [user, profile, authLoading, profileLoading, router, searchParams, mounted]);

  // SOP VISUAL: Hydration Guard (Membasmi Error Merah)
  if (!mounted) return null;

  if (authLoading || (user && profileLoading) || (appState === 'LOADING' && user)) {
    return <SplashScreen />;
  }

  return (
    <Suspense fallback={<SplashScreen />}>
      {appState === 'GUEST' && <LandingView onGoToLogin={() => setAppState('LOGIN')} onGoToRegister={() => setAppState('REGISTER')} />}
      {appState === 'LOGIN' && <LoginView onBack={() => setAppState('GUEST')} onGoToRegister={() => setAppState('REGISTER')} />}
      {appState === 'REGISTER' && <RegisterView onBack={() => setAppState('GUEST')} onGoToLogin={() => setAppState('LOGIN')} />}
    </Suspense>
  );
}

export default function RootIndex() {
  return (
    <Suspense fallback={null}>
      <RootIndexContent />
    </Suspense>
  );
}

/**
 * COMPONENT: SplashScreen (MAHAKARYA ORISINAL V133)
 * SOP: Penegakan gaya visual kaku sesuai instruksi Mahakarya Pimpinan.
 */
function SplashScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white animate-in fade-in duration-700 relative overflow-hidden">
      {/* ICON PANGKALAN: KARTU PUTIH BULAT DENGAN SHADOW */}
      <div className="relative mb-8">
        <div className="p-7 rounded-[2.5rem] bg-white shadow-[0_25px_60px_rgba(23,104,179,0.15)] border border-primary/5 flex items-center justify-center">
           <Package className="h-14 w-14 text-primary" />
        </div>
      </div>

      {/* TIPOGRAFI KAKU: WELCOME TO JASTIP SIAU */}
      <div className="text-center relative z-10 flex flex-col items-center px-6">
        <h1 className="text-4xl md:text-5xl font-black italic text-primary leading-[0.8] tracking-tighter uppercase text-center">
          WELCOME TO
        </h1>
        <h1 className="text-4xl md:text-5xl font-black italic text-primary leading-[0.8] tracking-tighter uppercase text-center">
          JASTIP SIAU
        </h1>

        {/* RADAR FEEDBACK & PROGRESS */}
        <div className="flex flex-col items-center mt-12 w-full max-w-[200px]">
           <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-muted-foreground opacity-60 text-center">
             SINKRONISASI SESI...
           </p>
           <div className="w-full h-1 bg-slate-100 rounded-full mt-4 overflow-hidden relative shadow-inner">
              <div className="absolute inset-0 bg-primary w-1/2 rounded-full animate-marquee-progress" />
           </div>
        </div>
      </div>

      {/* FOOTER IDENTITAS */}
      <div className="absolute bottom-12">
         <p className="text-[9px] font-black uppercase tracking-[0.5em] text-primary/20">
            GEN 1.0 BETA
         </p>
      </div>
    </div>
  );
}
