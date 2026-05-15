"use client";

/**
 * VIEW: Dashboard Header (MAHAKARYA REFINED V4)
 * SOP: Integrasi Radar GPS Control untuk kedaulatan sinyal Kurir.
 */

import { useHeaderController } from "@/hooks/controllers/use-header-controller";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ProfileDrawer } from "./header/profile-drawer";
import { NotificationDrawer } from "./header/notification-drawer";
import { CourierRadarControl } from "./header/courier-radar-control";

export function DashboardHeader() {
  const c = useHeaderController();
  const hasQueue = c.unreadCount > 0;

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-white/95 backdrop-blur-xl z-[900] px-4 md:px-6 shadow-sm sticky top-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="h-10 w-10 text-primary hover:bg-primary/5 rounded-2xl transition-all active:scale-90" />
            <span className="text-[10px] font-black uppercase text-primary tracking-[0.2em] select-none">Menu</span>
          </div>
          <div className="hidden md:flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase text-primary tracking-[0.4em]">Siau Live System</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* RADAR COMMANDER CONTROL: Only for Courier/Owner */}
          <CourierRadarControl />

          {/* TOMBOL LONCENG NOTIFIKASI */}
          <button 
            onClick={c.handleBellClick} 
            className={cn(
              "h-10 w-10 relative flex items-center justify-center rounded-full transition-all duration-300 active:scale-90", 
              c.isNotifDrawerOpen ? "bg-primary text-white shadow-lg" : "hover:bg-primary/5 text-muted-foreground"
            )}
          >
            <Bell className={cn("h-5.5 w-5.5", hasQueue && !c.isNotifDrawerOpen ? "text-primary animate-bounce" : "")} />
            {hasQueue && (
              <span className="absolute top-1.5 right-1.5 h-4 min-w-4 bg-red-600 border-2 border-white rounded-full flex items-center justify-center text-[7px] font-black text-white shadow-md">
                {c.unreadCount}
              </span>
            )}
          </button>

          <button onClick={() => c.setIsProfilePanelOpen(!c.isProfilePanelOpen)} className={cn("h-10 w-10 rounded-full overflow-hidden border-2 transition-all active:scale-90 ring-4 ring-transparent", c.isProfilePanelOpen ? "border-primary ring-primary/10" : "border-white shadow-md")}>
            <Avatar className="h-full w-full">
              <AvatarImage src={c.profile?.imageUrl} className="object-cover" />
              <AvatarFallback className="bg-primary text-white font-black text-[10px]">{(c.profile?.fullName || 'U').charAt(0)}</AvatarFallback>
            </Avatar>
          </button>
        </div>
      </header>

      {/* OVERLAY PENGUNCI KEDAULATAN */}
      {(c.isProfilePanelOpen || c.isNotifDrawerOpen) && (
        <div className="fixed inset-0 z-[990] bg-black/10 backdrop-blur-[1px] animate-in fade-in duration-300" onClick={c.closeAllPanels} />
      )}

      {/* LACI RADAR NOTIFIKASI */}
      <NotificationDrawer 
        isOpen={c.isNotifDrawerOpen} 
        onClose={c.closeAllPanels} 
        activeNotifications={c.notifications} 
        handleOpenNotif={c.handleOpenNotif} 
        handleProfileNav={c.handleProfileNav} 
      />

      {/* LACI PROFIL AKUN */}
      <ProfileDrawer 
        isOpen={c.isProfilePanelOpen} 
        onClose={c.closeAllPanels} 
        profile={c.profile} 
        user={c.user} 
        handleProfileNav={c.handleProfileNav} 
        handleLogout={c.handleLogout} 
      />
    </>
  );
}
