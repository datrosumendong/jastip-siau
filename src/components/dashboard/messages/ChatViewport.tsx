
"use client";

/**
 * @fileOverview COMPONENT: Chat Viewport - Sovereign Engine (SIAU MASTER V155)
 * SOP: Murni mengelola kedaulatan data percakapan melalui controllernya sendiri.
 * REVISI: Tombol telepon dimusnahkan secara fisik sesuai perintah pimpinan.
 */

import { useChatViewportController } from '@/hooks/controllers/use-chat-viewport-controller';
import { 
  ArrowLeft, Loader2, MessageSquare, X, UserPlus, Search, CheckCircle2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { OrderContextBar } from './OrderContextBar';
import { ShopContextBar } from './ShopContextBar';
import { cn } from '@/lib/utils';

interface ChatViewportProps {
  chatId: string;
  onClose: () => void;
  onExit: () => void;
  onChatCreated?: (id: string) => void;
}

export function ChatViewport({ chatId, onClose, onExit, onChatCreated }: ChatViewportProps) {
  const c = useChatViewportController(chatId);

  if (c.chatLoading && !c.isNewChat && c.messages.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <Loader2 className="animate-spin text-primary opacity-20 h-10 w-10" />
      <p className="text-[10px] font-black uppercase text-primary/40 animate-pulse">Menghubungkan Sinyal...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full bg-white relative overflow-hidden">
      {/* HEADER CHAT */}
      <header className="p-3 border-b bg-white flex flex-col shrink-0 z-[50] shadow-sm">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2">
               {/* PANAH KEMBALI: EXIT KE INBOX */}
               <button className="p-2 -ml-1 text-primary active:scale-90" onClick={onClose}>
                 <ArrowLeft className="h-6 w-6 stroke-[2.5px]" />
               </button>
               <Avatar className="h-10 w-10 border-2 border-primary/5 shadow-sm">
                 <AvatarImage src={c.otherInfo.photo} className="object-cover" />
                 <AvatarFallback className="bg-primary text-white font-black text-[10px] uppercase">
                   {c.otherInfo.name?.charAt(0)}
                 </AvatarFallback>
               </Avatar>
            </div>
            <div className="min-w-0">
               <h2 className="text-[13px] font-black uppercase text-primary truncate leading-none">
                 {c.otherInfo.name}
               </h2>
               <div className="flex items-center gap-1.5 mt-1">
                  <div className={cn("h-1.5 w-1.5 rounded-full", c.otherTyping ? "bg-orange-500 animate-pulse" : "bg-green-500")} />
                  <p className="text-[7px] font-black text-primary/40 uppercase tracking-widest">
                    {c.isNewChat ? "Kamar Chat Kosong" : c.otherTyping ? "Sedang Mengetik..." : "Online"}
                  </p>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
             <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted/30 text-primary active:scale-90" onClick={onExit}>
                <X className="h-5 w-5" />
             </button>
          </div>
        </div>
      </header>

      {/* CONTEXT BARS */}
      {!c.isNewChat && c.chatData?.type === 'cht_order' && c.chatData?.orderId && <OrderContextBar orderId={c.chatData.orderId} />}
      {!c.isNewChat && c.chatData?.type === 'cht_toko' && c.otherInfo.id && <ShopContextBar storeId={c.otherInfo.id} />}

      <div className="flex-1 min-h-0 relative bg-[#F8FAFC]">
        <ScrollArea className="h-full w-full">
          {c.isNewChat ? (
            <div className="p-6 space-y-6 animate-in fade-in duration-500">
               <div className="p-6 bg-white rounded-[2rem] border-2 border-dashed border-primary/10 flex flex-col items-center text-center space-y-4 shadow-inner">
                  <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary"><UserPlus className="h-6 w-6" /></div>
                  <div className="space-y-1">
                     <h3 className="text-sm font-black uppercase text-primary">Obrolan Baru</h3>
                     <p className="text-[9px] font-bold text-muted-foreground uppercase leading-relaxed">Cari warga Siau untuk memulai percakapan amanah.</p>
                  </div>
               </div>
               
               <div className="space-y-4">
                  <div className="relative group">
                     <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                     <input 
                      placeholder="Audit Nama atau Username..." 
                      className="w-full pl-12 h-14 bg-white border-none rounded-2xl font-bold text-sm shadow-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      value={c.searchWarga}
                      onChange={(e) => c.setSearchWarga(e.target.value)}
                     />
                  </div>
                  
                  <div className="space-y-2">
                     {c.isSearching ? (
                       <div className="py-10 text-center opacity-30"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
                     ) : c.foundUsers.length === 0 && c.searchWarga.length >= 3 ? (
                       <div className="py-10 text-center opacity-20 font-black uppercase text-[10px]">Warga tidak ditemukan</div>
                     ) : (
                       c.foundUsers.map((u) => (
                         <div 
                          key={u.id} 
                          className="p-4 bg-white rounded-2xl border border-primary/5 shadow-md flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer"
                          onClick={() => c.handleCreateNewChat(u).then(id => id && onChatCreated?.(id))}
                         >
                            <div className="flex items-center gap-4">
                               <Avatar className="h-12 w-12 border shadow-sm"><AvatarImage src={u.imageUrl} /><AvatarFallback className="font-black uppercase text-[10px]">{(u.fullName || "U").charAt(0)}</AvatarFallback></Avatar>
                               <div className="min-w-0">
                                  <p className="text-[12px] font-black uppercase text-primary truncate">{u.fullName}</p>
                                  <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1">@{u.username || u.id.slice(0,8)}</p>
                               </div>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity shadow-inner">
                               <MessageSquare className="h-4 w-4" />
                            </div>
                         </div>
                       ))
                     )}
                  </div>
               </div>
            </div>
          ) : (
            <div className="space-y-6 p-4 pb-32">
              {c.messages.length === 0 ? (
                 <div className="py-32 text-center opacity-10 flex flex-col items-center gap-4 px-10">
                    <MessageSquare className="h-16 w-16 text-primary" />
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-center leading-relaxed">Sinyal Terhubung. <br/> Silakan mulai obrolan.</p>
                 </div>
              ) : (
                c.messages.map((msg: any) => (
                  <MessageBubble 
                    key={msg.id} msg={msg} user={c.user} 
                    onReply={c.setReplyTo} onReact={c.handleReactMessage}
                    onDelete={c.handleDeleteMessage}
                    onEdit={() => { c.setEditingMsg(msg); c.setMessage(msg.text); c.inputRef.current?.focus(); }}
                  />
                ))
              )}
              <div ref={c.scrollRef} className="h-2" />
            </div>
          )}
        </ScrollArea>
      </div>

      {!c.isNewChat && (
        <ChatInput 
          inputRef={c.inputRef} 
          message={c.message} 
          setMessage={c.setMessage} 
          sending={c.sending} 
          replyTo={c.replyTo} 
          setReplyTo={c.setReplyTo} 
          handleSendMessage={c.handleSendMessage} 
          editingMsg={c.editingMsg}
          setEditingMsg={c.setEditingMsg} 
          handleTyping={c.handleTyping}
          profileImage={c.myProfile?.imageUrl}
        />
      )}
    </div>
  );
}
