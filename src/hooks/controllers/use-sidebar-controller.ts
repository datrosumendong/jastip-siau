
"use client";

/**
 * CONTROLLER: Sidebar Logic (SOP JASTIP SIAU V14)
 * SOP: Zero-Barrier Navigation - Penegakan responsivitas ketukan pertama.
 * FIX: Menjamin kelancaran navigasi dengan memutus tumpukan lock UI secara atomik.
 * REVISI: Penegakan kedaulatan logout dengan pembersihan storage dan redireksi mutlak.
 */

import { useMemo, useCallback } from "react";
import { useView } from "@/context/view-context";
import { useUser, useDoc, useFirestore, useAuth } from "@/firebase";
import { doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useSidebar as useSidebarUI } from "@/components/ui/sidebar";

export function useSidebarController() {
  const { currentView, setView, setIsNotifDrawerOpen, forceUnlockUI } = useView();
  const { isMobile, setOpenMobile } = useSidebarUI();
  const { user } = useUser();
  const db = useFirestore();
  const auth = useAuth();

  const userRef = useMemo(() => (user && db ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: profile } = useDoc(userRef, true);

  const recruitmentRef = useMemo(() => (db ? doc(db, 'settings', 'recruitment') : null), [db]);
  const { data: recruitment } = useDoc(recruitmentRef, true);

  /**
   * ACTION: handleNav (SOP SOVEREIGN NAVIGATION)
   * Protokol urutan navigasi matang untuk membasmi bug Frozen UI dan Double Tap.
   */
  const handleNav = useCallback((view: any) => {
    // 1. Initial Liberation (Tebas rintangan visual sisa view sebelumnya)
    forceUnlockUI();

    // 2. State Cleanup
    if (isMobile) {
      setOpenMobile(false);
    }
    setIsNotifDrawerOpen(false);
    
    // 3. Jeda milidetik (Acommodation Jitter) untuk membiarkan transisi Sheet Radix menutup
    setTimeout(() => {
      // 4. Force Unlock Lagi (Deep Sweep sebelum render view baru)
      forceUnlockUI();
      
      // 5. Eksekusi Navigasi Utama
      setView(view);
      
      // 6. Final Liberation (Detak jantung penutup)
      setTimeout(forceUnlockUI, 150);
      setTimeout(forceUnlockUI, 500);
    }, 50);
  }, [isMobile, setOpenMobile, setIsNotifDrawerOpen, forceUnlockUI, setView]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      if (typeof window !== 'undefined') {
        // SOP: Pembersihan total sisa-sisa kedaulatan sesi
        window.localStorage.clear();
        window.sessionStorage.clear();
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        // Navigasi paksa ke gerbang utama
        window.location.href = '/';
      }
    } catch (e) {
      window.location.href = '/';
    }
  };

  return {
    currentView,
    profile,
    recruitment,
    isOwner: profile?.role === "owner",
    isAdmin: profile?.role === "admin",
    isUMKM: profile?.role === "umkm",
    isCourier: profile?.role === "courier",
    isMember: profile?.role === "member",
    handleNav,
    handleLogout,
    forceUnlockUI
  };
}
