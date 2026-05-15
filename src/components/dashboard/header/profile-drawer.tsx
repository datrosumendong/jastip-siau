
"use client";

/**
 * COMPONENT: Profile Drawer (ULTRA COMPACT V34.000)
 * SOP: Integrasi pilar informasi publik (Siau Connect, Berita, Donasi, SOP).
 * FIX: Penegakan jarak "Padat" (py-1.5) untuk kenyamanan pandangan smartphone.
 */

import { 
  X, LogOut, User as UserIcon, Settings, Package, 
  BookOpen, ShieldAlert, Globe, Newspaper, HandCoins, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  user: any;
  handleProfileNav: (view: string, data?: any) => void;
  handleLogout: () => void;
}

export function ProfileDrawer({
  isOpen,
  onClose,
  profile,
  user,
  handleProfileNav,
  handleLogout
}: ProfileDrawerProps) {
  return (
    <div className={cn(
      "fixed right-0 top-16 h-[calc(100svh-64px)] bg-white z-[1100] shadow-[-20px_0_60px_rgba(0,0,0,0.15)] flex flex-col transition-all duration-500 ease-in-out border-l border-primary/5",
      "w-[300px] sm:w-[350px]",
      isOpen ? "translate-x-0" : "translate-x-full"
    )}>
      {/* HEADER DRAWER */}
      <div className="p-4 bg-primary text-white shrink-0 relative overflow-hidden shadow-lg">
         <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
         <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3 min-w-0">
               <Avatar className="h-11 w-11 border-[3px] border-white/20 shadow-xl shrink-0 rounded-full">
                 <AvatarImage src={profile?.imageUrl} className="object-cover rounded-full" />
                 <AvatarFallback className="bg-white/10 text-white font-black uppercase text-[10px]">{(profile?.fullName || 'U').charAt(0)}</AvatarFallback>
               </Avatar>
               <div className="min-w-0">
                 <p className="text-[12px] font-black uppercase truncate tracking-tighter leading-none">{profile?.fullName || 'Warga Siau'}</p>
                 <Badge className="bg-white/20 text-white border-none text-[6px] font-black uppercase px-2 h-3.5 mt-1">{profile?.role || 'MEMBER'}</Badge>
               </div>
            </div>
            <button onClick={onClose} className="h-9 w-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all active:scale-75 shadow-inner">
               <X className="h-5 w-5" />
            </button>
         </div>
      </div>
      
      <ScrollArea className="flex-1 bg-[#F8FAFC]">
        <div className="flex flex-col p-2 space-y-0.5 pb-40">
          
          <div className="px-4 pt-3 pb-1">
             <p className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/30">Akun & Transaksi</p>
          </div>
          <PanelItem icon={UserIcon} label="Identitas Warga" onClick={() => handleProfileNav('profile_user', { id: user?.uid })} />
          <PanelItem icon={Settings} label="Pengaturan Akun" onClick={() => handleProfileNav('edit_profile_user')} />
          <PanelItem icon={Package} label="Orderan Saya" onClick={() => handleProfileNav('orders')} />
          <PanelItem icon={ShieldAlert} label="Pusat Resolusi" onClick={() => handleProfileNav('member_complaints')} />
          
          <div className="px-4 pt-4 pb-1 border-t border-primary/5 mt-2">
             <p className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/30">Radar Informasi</p>
          </div>
          <PanelItem icon={Globe} label="Siau Connect" onClick={() => handleProfileNav('community')} color="blue" />
          <PanelItem icon={Newspaper} label="Berita Developer" onClick={() => handleProfileNav('news')} color="orange" />
          <PanelItem icon={HandCoins} label="Donasi Pengembangan" onClick={() => handleProfileNav('donation')} color="pink" />
          <PanelItem icon={Heart} label="Suara Warga" onClick={() => handleProfileNav('testimonials')} />
          <PanelItem icon={BookOpen} label="Info & SOP" onClick={() => handleProfileNav('info')} />
        </div>
      </ScrollArea>
      
      {/* FOOTER ACTION */}
      <div className="p-4 border-t bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-[160]">
         <Button 
          variant="destructive" 
          className="w-full h-12 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] gap-3 shadow-lg active:scale-95 transition-all" 
          onClick={handleLogout}
         >
            <LogOut className="h-4 w-4" /> LOG OUT
         </Button>
      </div>
    </div>
  );
}

function PanelItem({ icon: Icon, label, onClick, color }: any) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    pink: "bg-pink-50 text-pink-600",
    default: "bg-primary/5 text-primary"
  };

  const activeColor = color ? colorStyles[color as keyof typeof colorStyles] : colorStyles.default;

  return (
    <div 
      className="py-1.5 px-4 cursor-pointer hover:bg-primary/[0.03] flex items-center gap-3.5 transition-all group active:bg-primary/5 rounded-xl"
      onClick={onClick}
    >
      <div className={cn("p-1.5 rounded-lg transition-all shadow-sm shrink-0 group-hover:scale-110", activeColor)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-tight text-primary/70 group-hover:text-primary transition-colors truncate">
        {label}
      </span>
    </div>
  );
}
