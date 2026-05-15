"use client";

/**
 * VIEW: Pusat Pesan SPA (DAFTAR INBOX SOVEREIGN V210)
 * SOP: Penegakan kedaulatan visual sesuai tipe chat & identitas bantuan resmi.
 * FIX: Menampilkan NAMA PENGIRIM terakhir di bawah label untuk jalur Bantuan Admin.
 */

import { useMessagesCenterController, ChatTypeFilter } from '@/hooks/controllers/use-messages-center-controller';
import { FlexibleFrame } from '@/components/dashboard/flexible-frame';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, Search, User, Store, Package, 
  Headset, AlertCircle, Loader2, ChevronRight, CheckCircle2,
  Quote
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useView } from '@/context/view-context';

export default function MessagesCenterView() {
  const c = useMessagesCenterController();
  const { setView, forceUnlockUI } = useView();

  const categories: { id: ChatTypeFilter; label: string; icon: any }[] = [
    { id: 'all', label: 'Semua', icon: MessageSquare },
    { id: 'cht_private', label: 'Warga', icon: User },
    { id: 'cht_toko', label: 'Toko', icon: Store },
    { id: 'cht_order', label: 'Order', icon: Package },
    { id: 'cht_admin', label: 'Bantuan', icon: Headset },
    { id: 'cht_komplain', label: 'Laporan', icon: AlertCircle },
  ];

  const handleOpenChat = (chatId: string) => {
    forceUnlockUI();
    setView('chat_view', { id: chatId });
  };

  const getChatMeta = (type: string) => {
    switch (type) {
      case 'cht_admin': return { label: 'BANTUAN ADMIN', icon: Headset, color: 'bg-purple-600', text: 'text-purple-600' };
      case 'cht_toko': return { label: 'CHAT TOKO', icon: Store, color: 'bg-orange-600', text: 'text-orange-600' };
      case 'cht_order': return { label: 'CHAT ORDER', icon: Package, color: 'bg-blue-600', text: 'text-blue-600' };
      case 'cht_komplain': return { label: 'CHAT KOMPLAIN', icon: AlertCircle, color: 'bg-red-600', text: 'text-red-600' };
      default: return { label: 'CHAT PRIVATE', icon: User, color: 'bg-slate-600', text: 'text-slate-600' };
    }
  };

  return (
    <FlexibleFrame
      title="Inbox Warga"
      subtitle={`Terdeteksi ${c.chats.length} Obrolan Aktif`}
      icon={MessageSquare}
      variant="member"
      controls={
        <div className="space-y-4">
          <div className="relative group w-full">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Audit obrolan atau pesan..." 
              className="pl-10 h-10 bg-muted/20 border-none rounded-xl font-bold text-xs shadow-inner w-full focus-visible:ring-1 focus-visible:ring-primary/20"
              value={c.search}
              onChange={(e) => c.setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
             {categories.map((cat) => {
               const Icon = cat.icon;
               const isActive = c.activeCategory === cat.id;
               return (
                 <button 
                  key={cat.id} 
                  onClick={() => c.setActiveCategory(cat.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-[9px] font-black uppercase whitespace-nowrap transition-all flex items-center gap-2 border shadow-sm",
                    isActive ? "bg-primary text-white border-primary" : "bg-white text-muted-foreground border-primary/5 hover:bg-primary/5"
                  )}
                 >
                   <Icon className="h-3.5 w-3.5" /> {cat.label}
                 </button>
               );
             })}
          </div>
        </div>
      }
    >
      <div className="space-y-2 pb-48 px-1">
        {c.loading ? (
          <div className="py-20 text-center flex flex-col items-center gap-3 opacity-30">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Menghubungkan Radar...</p>
          </div>
        ) : c.chats.length === 0 ? (
          <div className="py-32 text-center opacity-10 flex flex-col items-center gap-4 px-10">
            <div className="p-6 rounded-full bg-primary/5 border border-primary/5 shadow-inner">
               <MessageSquare className="h-16 w-16 text-primary opacity-20" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-center leading-relaxed">Pangkalan Sepi. <br/> Belum ada sinyal masuk.</p>
          </div>
        ) : (
          c.chats.map((chat: any) => {
            const isUnread = chat.lastMessageSenderId !== c.user?.uid && chat.lastMessageStatus === 'sent' && chat.lastMessage !== '';
            const meta = getChatMeta(chat.type);
            const MetaIcon = meta.icon;
            const isAdminChat = chat.type === 'cht_admin';

            // SOP IDENTITAS V210: Ambil nama asli pengirim terakhir
            const lastSenderName = chat.participantNames?.[chat.lastMessageSenderId] || "Sistem";
            
            return (
              <Card 
                key={chat.id} 
                className={cn(
                  "overflow-hidden border-none shadow-md bg-white rounded-[1.8rem] transition-all active:scale-[0.98] cursor-pointer ring-1 ring-primary/5",
                  isUnread ? "ring-2 ring-primary shadow-lg" : "hover:bg-primary/[0.01]"
                )}
                onClick={() => handleOpenChat(chat.id)}
              >
                 <div className="p-4 flex items-center gap-4">
                    <div className="relative shrink-0">
                       <Avatar className={cn(
                         "h-14 w-14 border-2 shadow-md rounded-full",
                         isAdminChat ? "border-purple-200" : "border-white"
                       )}>
                          {chat.displayPhoto ? (
                             <>
                               <AvatarImage src={chat.displayPhoto} className="object-cover rounded-full" />
                               <AvatarFallback className="bg-primary text-white font-black uppercase text-sm">
                                  {chat.displayTitle?.charAt(0)}
                               </AvatarFallback>
                             </>
                          ) : (
                             <AvatarFallback className={cn("text-white", isAdminChat ? "bg-purple-600" : "bg-primary")}>
                                {isAdminChat ? <Headset className="h-6 w-6" /> : <User className="h-6 w-6" />}
                             </AvatarFallback>
                          )}
                       </Avatar>
                       
                       <div className={cn(
                         "absolute -bottom-1 -right-1 p-1 rounded-full shadow-lg border-2 border-white text-white",
                         meta.color
                       )}>
                          <MetaIcon className="h-2.5 w-2.5" />
                       </div>

                       {isUnread && (
                         <div className="absolute top-0 right-0 h-4 w-4 bg-red-600 rounded-full border-2 border-white shadow-lg animate-pulse" />
                       )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                       <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                             <h4 className={cn(
                               "text-[13.5px] font-black uppercase truncate", 
                               isAdminChat ? "text-purple-700" : isUnread ? "text-primary" : "text-primary/70"
                             )}>
                                {chat.displayTitle}
                             </h4>
                             {isAdminChat && <CheckCircle2 className="h-3.5 w-3.5 text-purple-600 fill-purple-600 shrink-0" />}
                          </div>
                          <span className="text-[7px] font-black text-muted-foreground opacity-40 tabular-nums uppercase shrink-0">
                             {chat.updatedAt?.seconds ? format(new Date(chat.updatedAt.seconds * 1000), 'HH:mm', { locale: id }) : '...'}
                          </span>
                       </div>
                       
                       <div className="flex flex-col gap-1.5">
                          {/* LABEL & NAMA PENGIRIM (SOP V210) */}
                          <div className="flex items-center gap-2">
                             <div className={cn(
                               "px-2 py-0.5 rounded-md flex items-center gap-1.5 w-fit border shadow-inner",
                               meta.color, "bg-white border-transparent"
                             )}>
                                <span className={cn("text-[6px] font-black uppercase", meta.text)}>{meta.label}</span>
                             </div>
                             {isAdminChat && (
                                <p className="text-[7.5px] font-black text-purple-600 uppercase tracking-widest opacity-60">
                                   Sender: {lastSenderName}
                                </p>
                             )}
                          </div>

                          <div className={cn(
                            "p-2.5 rounded-2xl border-l-4 relative overflow-hidden transition-all", 
                            isUnread ? "bg-primary/[0.03] border-primary" : "bg-muted/30 border-muted-foreground/30 opacity-60"
                          )}>
                             <p className={cn(
                               "text-[10.5px] font-bold leading-relaxed uppercase italic truncate pr-4", 
                               isUnread ? "text-primary/80" : "text-muted-foreground"
                             )}>
                                "{chat.lastMessage || "Memulai amanah..."}"
                             </p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="shrink-0 opacity-20"><ChevronRight className="h-4 w-4" /></div>
                 </div>
              </Card>
            );
          })
        )}
      </div>
    </FlexibleFrame>
  );
}
