"use client";

/**
 * CONTROLLER: View State MVC (SOVEREIGN NAVIGATION V12)
 * SOP: Integrasi pilar informasi Berita Developer dan Donasi ke dalam sistem navigasi.
 */

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export type DashboardView = 
  | 'home' | 'orders' | 'community' | 'edit_profile_user' 
  | 'profile_user' | 'shop' | 'couriers' | 'rankings' | 'info' 
  | 'join' | 'notifications' | 'order_detail' | 'order_chat' 
  | 'order_new' | 'shop_detail' | 'courier_price_input' 
  | 'admin_stats' | 'admin_users' | 'admin_orders' | 'admin_umkm' 
  | 'admin_apps' | 'admin_complaints' | 'admin_complaint_detail' 
  | 'admin_testimonials' | 'umkm_products' | 'umkm_orders' | 'umkm_ledger'
  | 'umkm_settings' | 'courier_dashboard' | 'courier_history' 
  | 'courier_reports' | 'courier_unpaid' | 'member_complaint_detail'
  | 'member_complaints' | 'testimonials' | 'marketplace_catalog' | 'admin_moderation'
  | 'admin_messages' | 'admin_info_settings' | 'messages_center' | 'chat_view'
  | 'admin_auto_notif' | 'news' | 'admin_news' | 'donation';

interface ViewContextType {
  currentView: DashboardView;
  viewData: any;
  setView: (view: DashboardView, data?: any) => void;
  goBack: () => void;
  isInitialized: boolean;
  isNotifDrawerOpen: boolean;
  setIsNotifDrawerOpen: (open: boolean) => void;
  isProfilePanelOpen: boolean;
  setIsProfilePanelOpen: (open: boolean) => void;
  closeAllPanels: () => void;
  forceUnlockUI: () => void;
  refreshKey: number;
  triggerRefresh: () => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export function ViewProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentView, setCurrentView] = useState<DashboardView>('home');
  const [viewData, setViewData] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isProfilePanelOpen, setIsProfilePanelOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const forceUnlockUI = useCallback(() => {
    if (typeof document !== 'undefined') {
      document.body.style.pointerEvents = 'auto';
      document.body.style.overflow = 'auto';
      document.documentElement.style.pointerEvents = 'auto';
      document.documentElement.style.overflow = 'auto';
      document.body.removeAttribute('data-scroll-locked');
      document.body.removeAttribute('aria-hidden');
      document.body.classList.remove('overflow-hidden');
      document.querySelectorAll('[data-radix-focus-guard]').forEach(el => el.remove());
      document.querySelectorAll('[data-radix-portal]').forEach(el => el.remove());
    }
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const closeAllPanels = useCallback(() => {
    setIsNotifDrawerOpen(false);
    setIsProfilePanelOpen(false);
    forceUnlockUI();
  }, [forceUnlockUI]);

  useEffect(() => {
    const viewParam = searchParams.get('view') as DashboardView;
    const editParam = searchParams.get('edit');
    const params: any = {};
    searchParams.forEach((v, k) => { params[k] = v; });
    const activeView: DashboardView = editParam === 'profil_user' ? 'edit_profile_user' : (viewParam || 'home');
    setCurrentView(activeView);
    setViewData(params);
    setIsInitialized(true);
    forceUnlockUI();
  }, [searchParams, forceUnlockUI]);

  const setView = (view: DashboardView, data?: any) => {
    forceUnlockUI();
    const params = new URLSearchParams(); 
    if (view === 'edit_profile_user') params.set('edit', 'profil_user');
    else params.set('view', view);
    if (data) {
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params.set(k, String(v));
      });
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setTimeout(forceUnlockUI, 100);
  };

  const goBack = () => {
    forceUnlockUI();
    router.back();
    setTimeout(forceUnlockUI, 100);
  };

  return (
    <ViewContext.Provider value={{ 
      currentView, viewData, setView, goBack, isInitialized, 
      isNotifDrawerOpen, setIsNotifDrawerOpen,
      isProfilePanelOpen, setIsProfilePanelOpen,
      closeAllPanels, forceUnlockUI,
      refreshKey, triggerRefresh
    }}>
      {children}
    </ViewContext.Provider>
  );
}

export const useView = () => {
  const context = useContext(ViewContext);
  if (!context) throw new Error('useView must be used within ViewProvider');
  return context;
};
