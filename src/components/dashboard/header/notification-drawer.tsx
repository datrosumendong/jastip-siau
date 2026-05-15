"use client";

/**
 * COMPONENT: Notification Drawer (COLLECTIVE UNREAD-ONLY V6)
 * SOP: Laci Lonceng HANYA menampilkan sinyal yang BELUM dibaca secara kolektif.
 * FIX: Menjamin ketersediaan impor Badge.
 */

import { Bell, X, MessageSquare, ShieldAlert, Package, Zap, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useMemo } from "react";

export function NotificationDrawer({ isOpen, onClose, activeNotifications, handleOpenNotif, handleProfileNav }: any) {
  
  const groupedUnread = useMemo(() => {
    if (!activeNotifications) return [];
    const unread = activeNotifications.filter((n: any) => !n.isOpened);
    const groups: { [key: string]: any } = {};
    
    unread.forEach((n: any) => {
      const gid = n.targetId || n.id;
      if (!groups[gid]) {
        groups[gid] = { ...n, count: 1, allIds: [n.id] };
      } else {
        groups[gid].count += 1;
        groups[gid].allIds.push(n.id);
      }
    });

    return Object.values(groups).sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [activeNotifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'chat':
      case 'order_chat':
      case 'cht_private':
      case 'cht_toko': return <MessageSquare className="h-3 w-3" />;
      case 'order':
      case 'umkm_order': return <Package className="h-3 w-3" />;
      case 'complaint':
      case 'admin_complaint':
      case 'payment_issue': return <ShieldAlert className="h-3 w-3" />;
      case 'system': return <Zap className="h-3 w-3" />;
      default: return <Bell className="h-3 w-3" />;
    }
  };

  return (
    <div className={cn(
      "fixed right-0 top-16 h-[calc(100svh-64px)] bg-white z-[1000] shadow-[-20px_0_60px_rgba(0,0,0,0.1)] flex flex-col transition-all duration-500 ease-in-out border-l border-primary/5",
      "w-[85vw] max-w-[320px] sm:w-[380px]",
      isOpen ? "translate-x-0" : "translate-x-full"
    )}>
      <div className="p-4 bg-white border-b shrink-0 flex items-center justify-between shadow-sm z-50">
         <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner"><Bell className="h-5 w-5" /></div>
            <div>
               <h3 className="text-[12px] font-black uppercase tracking-tight text-primary leading-none">Antrean Sinyal</h3>
               <p className="text-[7px] font-bold text-muted-foreground uppercase mt-1">Unread Collective</p>
            </div>
         </div>
         <button onClick={onClose} className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-muted active:scale-75 transition-all"><X className="h-4 w-4 text-primary" /></button>
      </div>
      
      <div className="flex-1 min-h-0 bg-[#F8FAFC]">
        <ScrollArea className="h-full w-full">
          <div className="px-3 py-4 space-y-3 pb-32">
            {groupedUnread.length === 0 ? (
              <div className="py-24 text-center opacity-20 flex flex-col items-center gap-4 px-6">
                 <Bell className="h-10 w-10 text-primary" />
                 <p className="text-[9px] font-black uppercase tracking-[0.4em]">Antrean Bersih</p>
                 <Button variant="ghost" className="text-[8px] font-black uppercase text-primary underline" onClick={() => handleProfileNav('notifications')}>Buka Radar</Button>
              </div>
            ) : (
              groupedUnread.map((n: any) => (
                <div 
                  key={n.targetId || n.id} 
                  className="p-4 cursor-pointer bg-white rounded-2xl border border-primary/5 shadow-sm hover:shadow-md transition-all active:scale-[0.98] ring-1 ring-primary/5 animate-in slide-in-from-right-2"
                  onClick={() => handleOpenNotif(n)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative pt-0.5 shrink-0">
                      <Avatar className="h-11 w-11 border-2 border-white shadow-md rounded-full overflow-hidden">
                        <AvatarImage src={n.senderPhoto} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary font-black uppercase text-[10px]">{n.title?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "absolute -bottom-1 -right-1 p-1 rounded-full shadow-lg text-white bg-primary"
                      )}>{getIcon(n.type)}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                       <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 truncate">
                            <h4 className="text-[11px] font-black uppercase text-primary truncate leading-none">{n.title}</h4>
                            {n.count > 1 && <Badge className="h-3.5 px-1 bg-primary text-white border-none text-[7px] font-black">{n.count}</Badge>}
                          </div>
                          <span className="text-[6px] font-black text-muted-foreground uppercase">{n.createdAt?.seconds ? format(new Date(n.createdAt.seconds * 1000), 'HH:mm', { locale: id }) : '...'}</span>
                       </div>
                       <p className="text-[9px] font-bold line-clamp-2 leading-tight uppercase italic text-primary/70">"{n.message}"</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="p-4 bg-white border-t flex flex-col gap-2 shadow-xl shrink-0 z-20">
         <Button variant="outline" className="w-full h-11 text-[9px] font-black uppercase rounded-xl border-primary/10 text-primary gap-2" onClick={() => handleProfileNav('notifications')}>
            <ExternalLink className="h-3.5 w-3.5" /> Buka Radar Utama
         </Button>
      </div>
    </div>
  );
}
