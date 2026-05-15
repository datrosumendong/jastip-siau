"use client";

/**
 * VIEW: Sidebar Navigation (SOP REFINED V13)
 * SOP: Perampingan menu - Informasi publik dipindahkan ke Pangkalan Profil (Header).
 * Menjaga sidebar tetap fokus pada operasional logistik dan ekonomi.
 */

import { 
  Home, Package, Truck, Users, LayoutDashboard, LogOut, 
  ShoppingCart, Trophy, Store, Box, 
  Settings2, Globe, UserPlus, BookOpen, 
  History, Wallet, Gavel, ShieldAlert, Heart, Receipt, 
  User as UserIcon, MonitorCheck, ClipboardList, MessageSquare, Database, Zap, Newspaper, PenTool, HandCoins
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, 
  SidebarMenuButton, SidebarMenuItem, SidebarGroup, SidebarGroupLabel, SidebarSeparator
} from "@/components/ui/sidebar";
import { useSidebarController } from "@/hooks/controllers/use-sidebar-controller";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const c = useSidebarController();

  return (
    <Sidebar collapsible="icon" className="border-r border-primary/10 shadow-2xl bg-white z-[1200]">
      <SidebarHeader className="h-16 flex items-center px-4 border-b bg-white">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => c.handleNav('home')}>
          <div className="p-2 rounded-xl bg-primary text-white shadow-xl group-hover:rotate-12 transition-all duration-500 flex items-center justify-center shrink-0">
            <Package className="h-5 w-5" />
          </div>
          <span className="font-black text-primary font-headline tracking-tighter group-data-[collapsible=icon]:hidden uppercase italic text-lg whitespace-nowrap">
            JASTIP SIAU
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white custom-scrollbar">
        <SidebarGroup>
          <SidebarGroupLabel className="px-5 py-4 font-black text-[9px] uppercase tracking-[0.3em] opacity-30">Operasional Warga</SidebarGroupLabel>
          <SidebarMenu className="px-2 space-y-1">
            <NavBtn icon={Home} title="Beranda" active={c.currentView === 'home'} onClick={() => c.handleNav('home')} />
            <NavBtn icon={MessageSquare} title="Pusat Pesan" active={c.currentView === 'messages_center'} onClick={() => c.handleNav('messages_center')} color="text-primary" />
            <NavBtn icon={Store} title="Pasar UMKM" active={c.currentView === 'shop'} onClick={() => c.handleNav('shop')} />
            <NavBtn icon={Truck} title="Cari Kurir" active={c.currentView === 'couriers'} onClick={() => c.handleNav('couriers')} />
            <NavBtn icon={Package} title="Orderan Saya" active={c.currentView === 'orders'} onClick={() => c.handleNav('orders')} />
            <NavBtn icon={Trophy} title="Peringkat" active={c.currentView === 'rankings'} onClick={() => c.handleNav('rankings')} />
          </SidebarMenu>
        </SidebarGroup>

        {(c.isAdmin || c.isOwner) && (
          <SidebarGroup className="mt-2">
            <SidebarGroupLabel className="px-5 font-black text-[9px] uppercase tracking-[0.3em] text-purple-600 opacity-60">Sistem Admin</SidebarGroupLabel>
            <SidebarMenu className="px-2 space-y-1">
              <NavBtn icon={LayoutDashboard} title="Statistik" active={c.currentView === 'admin_stats'} onClick={() => c.handleNav('admin_stats')} color="text-purple-600" />
              <NavBtn icon={PenTool} title="Tulis Berita" active={c.currentView === 'admin_news'} onClick={() => c.handleNav('admin_news')} color="text-purple-600" />
              <NavBtn icon={Users} title="Manajemen User" active={c.currentView === 'admin_users'} onClick={() => c.handleNav('admin_users')} color="text-purple-600" />
              <NavBtn icon={Zap} title="Radar Otomatis" active={c.currentView === 'admin_auto_notif'} onClick={() => c.handleNav('admin_auto_notif')} color="text-purple-600" />
              <NavBtn icon={Package} title="Monitoring" active={c.currentView === 'admin_orders'} onClick={() => c.handleNav('admin_orders')} color="text-purple-600" />
              <NavBtn icon={Database} title="Audit Pesan" active={c.currentView === 'admin_messages'} onClick={() => c.handleNav('admin_messages')} color="text-purple-600" />
              <NavBtn icon={UserPlus} title="Audit Pelamar" active={c.currentView === 'admin_apps'} onClick={() => c.handleNav('admin_apps')} color="text-purple-600" />
              <NavBtn icon={MonitorCheck} title="Moderasi Konten" active={c.currentView === 'admin_moderation'} onClick={() => c.handleNav('admin_moderation')} color="text-purple-600" />
              <NavBtn icon={ShieldAlert} title={c.isOwner ? "Eskalasi Owner" : "Tiket Bantuan"} active={c.currentView === 'admin_complaints'} onClick={() => c.handleNav('admin_complaints')} color={c.isOwner ? "text-amber-600" : "text-purple-600"} />
              <NavBtn icon={Heart} title="Moderasi Ulasan" active={c.currentView === 'admin_testimonials'} onClick={() => c.handleNav('admin_testimonials')} color="text-purple-600" />
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t p-1.5 bg-[#F8FAFC] space-y-0.5">
        <SidebarMenu className="px-1.5">
          {(c.isCourier || c.isOwner) && (
            <div className="mb-1">
              <SidebarGroupLabel className="px-2 py-1 h-auto font-black text-[7px] uppercase tracking-[0.2em] text-green-600 opacity-50">Logistik Kurir</SidebarGroupLabel>
              <div className="space-y-0.5">
                <NavBtn icon={ShoppingCart} title="Tugas Aktif" active={c.currentView === 'courier_dashboard'} onClick={() => c.handleNav('courier_dashboard')} color="text-green-600" />
                <NavBtn icon={History} title="Riwayat" active={c.currentView === 'courier_history'} onClick={() => c.handleNav('courier_history')} color="text-green-600" />
                <NavBtn icon={Gavel} title="Penagihan" active={c.currentView === 'courier_unpaid'} onClick={() => c.handleNav('courier_unpaid')} color="text-green-600" />
                <NavBtn icon={Wallet} title="Laporan" active={c.currentView === 'courier_reports'} onClick={() => c.handleNav('courier_reports')} color="text-green-600" />
              </div>
            </div>
          )}
          {c.isUMKM && (
            <div className="mb-1">
              <SidebarGroupLabel className="px-2 py-1 h-auto font-black text-[7px] uppercase tracking-[0.2em] text-orange-600 opacity-50">Bisnis UMKM</SidebarGroupLabel>
              <div className="space-y-0.5">
                <NavBtn icon={Receipt} title="Buku Kasir" active={c.currentView === 'umkm_ledger'} onClick={() => c.handleNav('umkm_ledger')} color="text-orange-600" />
                <NavBtn icon={ClipboardList} title="Pesanan Masuk" active={c.currentView === 'umkm_orders'} onClick={() => c.handleNav('umkm_orders')} color="text-orange-600" />
                <NavBtn icon={Box} title="Katalog Produk" active={c.currentView === 'umkm_products'} onClick={() => c.handleNav('umkm_products')} color="text-orange-600" />
                <NavBtn icon={Settings2} title="Setting Toko" active={c.currentView === 'umkm_settings'} onClick={() => c.handleNav('umkm_settings')} color="text-orange-600" />
              </div>
            </div>
          )}
          <SidebarSeparator className="my-1 opacity-50" />
          <NavBtn icon={UserIcon} title="Akun Profil" active={c.currentView === 'edit_profile_user'} onClick={() => c.handleNav('edit_profile_user')} />
          <SidebarMenuItem className="mt-1">
            <SidebarMenuButton className="h-10 rounded-xl text-destructive hover:bg-destructive/5 font-black uppercase text-[10px] tracking-widest gap-3" onClick={c.handleLogout}>
              <LogOut className="h-4.5 w-4.5" />
              <span className="group-data-[collapsible=icon]:hidden">Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function NavBtn({ icon: Icon, title, active, onClick, color }: any) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={active} onClick={onClick} className={cn("h-9 rounded-lg transition-all duration-300 gap-3 border-2 border-transparent", active ? "bg-primary/10 border-primary/5 shadow-sm" : "hover:bg-primary/[0.03]")}>
        <div className={cn("p-1.5 rounded-lg transition-all flex items-center justify-center shrink-0", active ? (color || 'bg-primary text-white') : 'text-muted-foreground')}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className={cn("uppercase text-[9px] tracking-tight transition-all group-data-[collapsible=icon]:hidden", active ? `font-black ${color || 'text-primary'}` : 'font-bold text-muted-foreground')}>
          {title}
        </span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
