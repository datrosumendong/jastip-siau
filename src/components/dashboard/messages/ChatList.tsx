"use client";

/**
 * @fileOverview COMPONENT: Chat List - Inbox Radar (SIAU MASTER V150)
 * REVISI: Tombol "Mulai Obrolan" baru dimusnahkan secara fisik sesuai instruksi.
 */

import { 
  MessageSquare as MessageIcon, 
  Search as SearchIcon, 
  User as UserIcon, 
  Store as StoreIcon, 
  Package as PackageIcon, 
  Headset as SupportIcon, 
  Loader2 as LoadingIcon,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useMessageCenterController, ChatCategory } from '@/hooks/controllers/use-message-center-controller';

interface ChatListProps {
  handleSelectChat: (id: string) => void;
  handleExitCenter: () => void;
}

export function ChatList({ handleSelectChat, handleExitCenter }: ChatListProps) {
  const c = useMessageCenterController();
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'cht_private': return { label: 'WARGA', icon: UserIcon, color: 'text-blue-600 bg-blue-50' };
      case 'cht_toko': return { label: 'TOKO', icon: StoreIcon, color: 'text-orange-600 bg-orange-50' };
      case 'cht_order': return { label: 'ORDER', icon: PackageIcon, color: 'text-green-600 bg-green-50' };
      case 'cht_admin': return { label: 'BANTUAN', icon: SupportIcon, color: 'text-purple-600 bg-purple-50' };
      default: return { label: 'PESAN', icon: MessageIcon, color: 'text-slate-600 bg-slate-50' };
    }
  };

  const categories: { id: ChatCategory; label: string; icon: any }[] = [
    { id: 'all', label: 'Semua', icon: MessageIcon },
    { id: 'cht_private', label: 'Warga', icon: UserIcon },
    { id: 'cht_toko', label: 'Toko', icon: StoreIcon },
    { id: 'cht_order', label: 'Pesanan', icon: PackageIcon },
    { id: 'cht_admin', label: 'Bantuan', icon: SupportIcon },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-white relative overflow-hidden">
      {/* HEADER LIST */}
      <div className="p-4 border-b bg-white flex items-center justify-between shrink-0 shadow-sm z-20">
         <div className="flex items-center gap-3">
            <button 
              className="p-2 -ml-2 text-primary active:scale-90 transition-transform hover:bg-primary/5 rounded-full" 
              onClick={handleExitCenter}
            >
              <ArrowLeft className="h-6 w-6 stroke-[2.5px]" />
            </button>
            <div className="min-w-0">
               <h1 className="text-base font-black uppercase text-primary tracking-tighter leading-none">Pusat Pesan</h1>
               <p className="text-[7px] font-black text-primary/40 uppercase mt-0.5 tracking-widest">Radar Siau Connect</p>
            </div>
         </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="p-4 bg-[#F8FAFC]/50 border-b shrink-0 space-y-3">
         <div className="relative group">
            <SearchIcon className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              placeholder="Cari obrolan..." 
              className="w-full pl-10 h-11 text-xs font-bold bg-white border border-primary/5 rounded-2xl outline-none shadow-inner" 
              value={c.search} 
              onChange={(e) => c.setSearch(e.target.value)} 
            />
         </div>
         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button 
                  key={cat.id} 
                  onClick={() => c.setActiveCategory(cat.id)} 
                  className={cn(
                    "px-4 py-2 rounded-full text-[9px] font-black uppercase whitespace-nowrap transition-all flex items-center gap-2 border", 
                    c.activeCategory === cat.id ? "bg-primary text-white shadow-lg border-primary" : "bg-white text-muted-foreground border-primary/10"
                  )}
                >
                   <Icon className="h-3.5 w-3.5" /> {cat.label}
                </button>
              );
            })}
         </div>
      </div>

      {/* LIST DATA */}
      <ScrollArea className="flex-1 bg-white">
         <div className="flex flex-col divide-y divide-primary/5">
          {c.loading ? (
            <div className="py-20 text-center opacity-30"><LoadingIcon className="h-10 w-10 animate-spin mx-auto text-primary" /></div>
          ) : c.chats.length === 0 ? (
            <div className="py-32 text-center opacity-10 flex flex-col items-center gap-4 px-10">
               <MessageIcon className="h-16 w-16 text-primary" />
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-center leading-relaxed">Inbox Kosong.</p>
            </div>
          ) : (
            c.chats.map((conv: any) => {
              const isUnread = conv.lastMessageSenderId !== c.user?.uid && conv.lastMessageStatus === 'sent' && conv.lastMessage !== '';
              const typeInfo = getTypeLabel(conv.type);
              const TypeIcon = typeInfo.icon;
              
              return (
                <div 
                  key={conv.id} 
                  className={cn(
                    "p-4 flex items-center gap-4 transition-all border-l-4 cursor-pointer", 
                    "bg-white border-transparent hover:bg-muted/30 active:bg-primary/[0.02]"
                  )} 
                  onClick={() => handleSelectChat(conv.id)}
                >
                  <div className="relative shrink-0">
                     <Avatar className="h-14 w-14 border-2 shadow-sm rounded-full">
                        <AvatarImage src={conv.displayPhoto} className="object-cover rounded-full" />
                        <AvatarFallback className="bg-primary text-white font-black text-sm uppercase">{conv.displayTitle?.charAt(0)}</AvatarFallback>
                     </Avatar>
                     {isUnread && <div className="absolute top-0 right-0 h-4 w-4 bg-red-600 rounded-full border-2 border-white shadow-lg animate-pulse" />}
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                       <h3 className={cn("text-[13px] font-black uppercase truncate", isUnread ? "text-primary" : "text-primary/70")}>{conv.displayTitle}</h3>
                       <span className="text-[7px] font-black text-muted-foreground uppercase shrink-0">{conv.updatedAt?.seconds ? format(new Date(conv.updatedAt.seconds * 1000), 'HH:mm') : '-'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                       <div className={cn("px-1.5 py-0.5 rounded-md flex items-center gap-1 w-fit", typeInfo.color)}>
                          <TypeIcon className="h-2.5 w-2.5" />
                          <span className="text-[6px] font-black uppercase">{typeInfo.label}</span>
                       </div>
                       <p className={cn("text-[10px] line-clamp-1 uppercase italic", isUnread ? "text-primary font-black not-italic" : "text-muted-foreground opacity-60")}>{conv.lastMessage || "Siap mengobrol..."}</p>
                    </div>
                  </div>
                  <div className="shrink-0 opacity-20"><ChevronRight className="h-4 w-4" /></div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
