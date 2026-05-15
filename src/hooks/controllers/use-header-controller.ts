
"use client";

/**
 * CONTROLLER: Header Dashboard (SIAU MASTER COMMAND V490)
 * SOP: Navigasi Laci Notifikasi dengan penegakan kedaulatan pendaratan Radar.
 * FIX: Pembersihan link redundan dan penajaman pendaratan 'broadcast_radar'.
 */

import { useCallback } from "react";
import { useView } from "@/context/view-context";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNotifications } from "@/hooks/use-notifications";

export function useHeaderController() {
  const { 
    setView, 
    isProfilePanelOpen,
    setIsProfilePanelOpen,
    isNotifDrawerOpen,
    setIsNotifDrawerOpen,
    closeAllPanels,
    forceUnlockUI
  } = useView();
  
  const { user } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  
  const { notifications, unreadCount, profile } = useNotifications();

  const handleProfileNav = useCallback((view: any, data?: any) => {
    forceUnlockUI(); 
    closeAllPanels();
    setView(view, data);
    setTimeout(forceUnlockUI, 200);
  }, [setView, closeAllPanels, forceUnlockUI]);

  const handleBellClick = useCallback(() => {
    forceUnlockUI();
    if (unreadCount === 0) {
      handleProfileNav('notifications');
    } else {
      setIsNotifDrawerOpen(!isNotifDrawerOpen);
      setIsProfilePanelOpen(false);
    }
  }, [unreadCount, isNotifDrawerOpen, setIsNotifDrawerOpen, setIsProfilePanelOpen, forceUnlockUI, handleProfileNav]);

  /**
   * ACTION: handleOpenNotif (SOP NAVIGATION RECOVERY V490)
   * Mengunci kedaulatan pendaratan agar tidak nyasar ke domain salah.
   */
  const handleOpenNotif = async (notif: any) => {
    if (!db || !user) return;
    
    const targetId = notif.targetId;
    const type = notif.type || '';
    const isStaff = profile?.role === 'admin' || profile?.role === 'owner';
    const idsToMark = notif.allIds || [notif.id];

    forceUnlockUI();
    closeAllPanels();

    try {
      // 1. Mark as Read secara kolektif
      const batch = writeBatch(db);
      idsToMark.forEach((id: string) => {
        batch.update(doc(db, 'notifications', id), { 
          isOpened: true, 
          openedAt: serverTimestamp() 
        });
      });
      batch.commit().catch(() => {});
      
      // 2. RADAR PENDARATAN BERDAULAT
      // Mengabaikan link eksternal jika tipe terdeteksi sebagai sistem internal
      if (!targetId || type === 'system' || type === 'broadcast_radar') {
        setView('home');
        return;
      }

      const chatTypes = ['chat', 'cht_private', 'cht_toko', 'cht_admin', 'cht_order', 'order_chat', 'chat_reaction'];
      const orderTypes = ['order', 'umkm_order'];
      const complaintTypes = ['complaint', 'admin_sanction', 'payment_issue', 'admin_complaint'];

      if (type === 'news') {
        setView('news', { postId: targetId });
      }
      else if (chatTypes.some(t => type.includes(t))) {
        setView('chat_view', { id: targetId });
      } 
      else if (orderTypes.some(t => type.includes(t))) {
        setView('order_detail', { id: targetId });
      } 
      else if (complaintTypes.some(t => type.includes(t))) {
        if (isStaff) setView('admin_complaint_detail', { id: targetId });
        else setView('member_complaint_detail', { id: targetId });
      } 
      else if (type.includes('post')) {
        setView('community', { postId: targetId });
      }
      else {
        setView('home');
      }
    } catch (e) {
      setView('home');
    } finally {
      setTimeout(forceUnlockUI, 200);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
      window.sessionStorage.clear();
      window.location.href = '/';
    }
  };

  return {
    profile, 
    user, 
    notifications,
    unreadCount, 
    isProfilePanelOpen, 
    setIsProfilePanelOpen,
    isNotifDrawerOpen,
    setIsNotifDrawerOpen,
    handleLogout, 
    handleBellClick, 
    handleOpenNotif,
    closeAllPanels,
    handleProfileNav
  };
}
