
"use client";

import { create } from 'zustand';

/**
 * CONTROLLER: Global View State Manager
 * Mengontrol tampilan mana yang aktif di dalam viewport dashboard tanpa merubah URL.
 */

type DashboardView = 
  | 'home' 
  | 'messages' 
  | 'orders' 
  | 'community' 
  | 'profile' 
  | 'shop' 
  | 'couriers' 
  | 'rankings' 
  | 'info' 
  | 'join'
  | 'admin_stats'
  | 'admin_users'
  | 'admin_orders'
  | 'admin_umkm'
  | 'umkm_products'
  | 'umkm_orders'
  | 'umkm_settings';

interface ViewState {
  currentView: DashboardView;
  viewData: any;
  setView: (view: DashboardView, data?: any) => void;
}

// Menggunakan pattern simple state (bisa diganti context jika tidak ingin dep tambahan, 
// tapi di sini saya implementasikan logic-nya secara eksplisit di layout)
export const useViewController = () => {
  // Logic ini akan dipindahkan ke Context di layout.tsx agar "Librari Aman"
};
