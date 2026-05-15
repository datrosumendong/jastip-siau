"use client";

/**
 * VIEW: Pangkalan Radar Individu (SOP DEEP PURGE V13.100)
 * SOP: Menampilkan seluruh log (isOpened true/false) secara real-time.
 * FIX: Penegakan pemusnahan dokumen fisik untuk membasmi sampah database.
 * ADD: Tombol pembersihan total radar.
 */

import { useNotificationsController } from '@/hooks/controllers/use-notifications-controller';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, Loader2, Trash2, 
  MessageSquare, Package, Zap, ShieldAlert,
  CheckCircle2, Clock, Eraser
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function NotificationsView() {
  const c = useNotificationsController();

  if (c.loading && c.notifications.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
      <Loader2 className="animate-spin text-primary opacity-20 h-10 w-10" />
      <p className="text-[10px] font-black uppercase text-primary/40 animate-pulse">Sinkronisasi Radar Live...</p>
    </div>
  );

  const getIcon = (type: string, isOpened: boolean) => {
    const className = cn("h-3 w-3", isOpened ? "opacity-40" : "opacity-100");
    switch (type) {
      case 'chat':
      case 'order_chat':
      case 'cht_private':
      case 'cht_toko': return <MessageSquare className={className} />;
      case 'order':
      case 'umkm_order': return <Package className={className} />;
      case 'complaint':
      case 'admin_complaint':
      case 'payment_issue': return <ShieldAlert className={className} />;
      case 'system': return <Zap className={className} />;
      default: return <Bell className={className} />;
    }
  };

  const hasSelection = c.selectedIds.length > 0;

  return (
    <FlexibleFrame
      title="Radar Notifikasi"
      subtitle={c.notifications.length > 0 ? `Tersinkronisasi ${c.notifications.length} Log` : "Sinyal Bersih"}
      icon={Bell}
      variant="member"
      controls={
        <div className="space-y-3">
           <div className="flex items-center gap-2">
              <div className="flex items-center gap-3 bg-muted/20 px-4 h-11 rounded-xl border border-primary/5 shadow-inner flex-1">
                 <Checkbox 
                  id="select-all-radar" 
                  checked={c.notifications.length > 0 && c.selectedIds.length === c.notifications.length}
                  onCheckedChange={(v) => c.selectAll(!!v)}
                  className="h-5 w-5 border-primary/20 rounded-md bg-white shadow-sm"
                 />
                 <label htmlFor="select-all-radar" className="text-[9px] font-black uppercase text-primary cursor-pointer select-none">Pilih Semua</label>
              </div>
              
              <Button 
                onClick={c.handleDeleteAll}
                variant="outline"
                className="h-11 px-4 rounded-xl border-primary/10 text-primary font-black uppercase text-[8px] gap-2 bg-white"
                disabled={c.notifications.length === 0 || c.deleting}
              >
                 <Eraser className="h-3.5 w-3.5" /> Bersihkan
              </Button>
           </div>

           {hasSelection && (
             <Button 
                className="w-full h-12 rounded-xl font-black uppercase text-[10px] shadow-xl transition-all gap-3 bg-destructive text-white animate-in zoom-in-95" 
                onClick={c.handleDeleteSelected}
                disabled={c.deleting}
              >
                {c.deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Musnahkan {c.selectedIds.length} Sinyal Terpilih
              </Button>
           )}
        </div>
      }
    >
      <div className="space-y-2 pb-48 px-1">
        {c.notifications.length === 0 ? (
          <div className="py-32 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-primary/10 opacity-30 flex flex-col items-center justify-center space-y-4">
             <div className="p-8 rounded-full bg-muted/20 shadow-inner">
                <Bell className="h-14 w-14 text-primary opacity-20" />
             </div>
             <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">Radar Kosong</p>
          </div>
        ) : (
          c.notifications.map((n: any) => {
            const isSelected = c.selectedIds.includes(n.id);
            const isRead = n.isOpened === true;
            
            return (
              <Card key={n.id} className={cn(
                "overflow-hidden border-none shadow-md bg-white rounded-[1.8rem] transition-all duration-300 relative group/card",
                isRead ? "opacity-75 grayscale-[0.1]" : "ring-1 ring-primary/5 shadow-lg border-l-4 border-primary",
                isSelected ? "ring-2 ring-destructive bg-destructive/[0.01]" : ""
              )}>
                <div className="flex items-center gap-3 p-4">
                  <div className="shrink-0">
                     <Checkbox 
                      checked={isSelected} 
                      onCheckedChange={() => c.toggleSelect(n.id)}
                      className="h-6 w-6 border-primary/10 shadow-inner rounded-lg"
                     />
                  </div>

                  <div 
                    className="flex flex-1 gap-4 cursor-pointer active:bg-primary/[0.02] transition-colors min-w-0"
                    onClick={() => isSelected ? c.toggleSelect(n.id) : c.handleOpenNotification(n)}
                  >
                    <div className="relative shrink-0 pt-0.5">
                       <Avatar className={cn(
                         "h-12 w-12 border-2 shadow-md rounded-full overflow-hidden",
                         isRead ? "border-muted" : "border-white"
                       )}>
                          <AvatarImage src={n.senderPhoto} className="object-cover rounded-full" />
                          <AvatarFallback className="bg-primary/10 text-primary font-black uppercase text-[10px]">{(n.title || 'J').charAt(0)}</AvatarFallback>
                       </Avatar>
                       <div className={cn(
                         "absolute -bottom-1 -right-1 p-1.5 rounded-full shadow-lg border-2 border-white text-white",
                         isRead ? "bg-muted text-muted-foreground" : "bg-primary"
                       )}>
                          {getIcon(n.type, isRead)}
                       </div>
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                         <div className="flex items-center gap-2 truncate">
                            <h4 className={cn(
                              "text-[12.5px] font-black uppercase truncate",
                              isRead ? "text-muted-foreground" : "text-primary"
                            )}>{n.title}</h4>
                            {isRead && <CheckCircle2 className="h-3.5 w-3.5 text-green-600/40" />}
                         </div>
                         <span className="text-[7px] font-black text-muted-foreground opacity-40 tabular-nums uppercase">
                            {n.createdAt?.seconds ? format(new Date(n.createdAt.seconds * 1000), 'HH:mm', { locale: id }) : '...'}
                         </span>
                      </div>
                      <div className={cn(
                        "p-3 rounded-2xl border-l-4 relative overflow-hidden transition-all shadow-inner", 
                        isRead ? "bg-muted/10 border-muted-foreground/20" : "bg-primary/[0.03] border-primary"
                      )}>
                        <p className={cn(
                          "text-[11px] font-bold leading-relaxed uppercase italic break-words", 
                          isRead ? "text-muted-foreground/70" : "text-primary/80"
                        )}>
                           "{n.message}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ACTION: PURGE ROOT (ID BASED) */}
                  <div className="shrink-0 flex flex-col items-center gap-3">
                     <button 
                      onClick={(e) => { e.stopPropagation(); c.handleDeleteSingle(n.id); }}
                      className="h-10 w-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all active:scale-75 shadow-sm border border-red-100 group/del"
                      title="Hapus Dari Database"
                     >
                        <Trash2 className="h-5 w-5" />
                     </button>
                     {!isRead && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </FlexibleFrame>
  );
}
