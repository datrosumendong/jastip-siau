"use client";

/**
 * @fileOverview VIEW: Form Chat Standalone (SOVEREIGN MASTER V220)
 * SOP: Penataan Header dinamis, Centang Biru, dan Identitas Bantuan Resmi.
 * FIX: Penambahan Garis Pemisah Tanggal (Date Separator) di tengah form chat.
 */

import { useChatViewportController } from '@/hooks/controllers/use-chat-viewport-controller';
import { useView } from '@/context/view-context';
import { 
  ArrowLeft, Loader2, MessageSquare, X, CheckCircle2, 
  MoreVertical, Eraser, Trash2, ShieldAlert,
  Store, Package, Headset, Crown, User, Calendar
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from '@/components/dashboard/messages/MessageBubble';
import { ChatInput } from '@/components/dashboard/messages/ChatInput';
import { OrderContextBar } from '@/components/dashboard/messages/OrderContextBar';
import { ShopContextBar } from '@/components/dashboard/messages/ShopContextBar';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ChatView() {
  const { viewData, goBack, forceUnlockUI } = useView();
  const chatId = viewData?.id || '';
  const c = useChatViewportController(chatId);

  const handleGoBack = () => {
    forceUnlockUI();
    goBack(); 
    setTimeout(forceUnlockUI, 150);
  };

  if (c.chatLoading && !c.isNewChat && c.messages.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full space-y-4 bg-white">
      <Loader2 className="animate-spin text-primary opacity-20 h-10 w-10" />
      <p className="text-[10px] font-black uppercase text-primary/40 animate-pulse">Menghubungkan Sinyal...</p>
    </div>
  );

  const getChatTypeMetadata = () => {
    const type = c.chatData?.type || 'cht_private';
    switch (type) {
      case 'cht_admin': return { label: 'BANTUAN ADMIN', icon: Headset, color: 'bg-purple-600', text: 'text-purple-600' };
      case 'cht_toko': return { label: 'CHAT TOKO', icon: Store, color: 'bg-orange-600', text: 'text-orange-600' };
      case 'cht_order': return { label: 'CHAT ORDER', icon: Package, color: 'bg-blue-600', text: 'text-blue-600' };
      case 'cht_komplain': return { label: 'CHAT KOMPLAIN', icon: ShieldAlert, color: 'bg-red-600', text: 'text-red-600' };
      default: return { label: 'CHAT PRIVATE', icon: User, color: 'bg-slate-600', text: 'text-slate-600' };
    }
  };

  const meta = getChatTypeMetadata();
  const isVerified = ['admin', 'owner', 'courier', 'umkm'].includes(c.otherInfo.role);
  const isAdminChat = c.chatData?.type === 'cht_admin';
  const isMeStaff = c.myProfile?.role === 'admin' || c.myProfile?.role === 'owner';

  const displayTitle = (isAdminChat && !isMeStaff) ? 'Pusat Bantuan Jastip' : (c.otherInfo.name || "Warga Siau");

  return (
    <div className="flex flex-col h-full w-full bg-white relative overflow-hidden animate-in fade-in duration-300">
      
      <header className="p-3 border-b bg-white flex flex-col shrink-0 z-[50] shadow-sm">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2">
               <button 
                className="p-2 -ml-1 text-primary active:scale-90 transition-transform hover:bg-primary/5 rounded-full" 
                onClick={handleGoBack}
               >
                 <ArrowLeft className="h-6 w-6 stroke-[2.5px]" />
               </button>
               <div className="relative">
                  <Avatar className="h-10 w-10 border-2 border-primary/5 shadow-sm rounded-full">
                    {(isAdminChat && !isMeStaff) ? (
                      <AvatarFallback className="bg-purple-600 text-white">
                        <Headset className="h-5 w-5" />
                      </AvatarFallback>
                    ) : (
                      <>
                        <AvatarImage src={c.otherInfo.photo} className="object-cover rounded-full" />
                        <AvatarFallback className="bg-primary text-white font-black text-[10px] uppercase">
                          {displayTitle.charAt(0)}
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  {isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                       <CheckCircle2 className={cn("h-3.5 w-3.5", (isAdminChat && !isMeStaff) ? "text-purple-600 fill-purple-600" : "text-blue-500 fill-blue-500")} />
                    </div>
                  )}
               </div>
            </div>
            <div className="min-w-0">
               <div className="flex items-center gap-1.5">
                  <h2 className="text-[13px] font-black uppercase text-primary truncate leading-none">
                    {displayTitle}
                  </h2>
                  {c.otherInfo.role === 'admin' && !isAdminChat && <Crown className="h-3 w-3 text-amber-500" />}
                  {c.otherInfo.role === 'owner' && !isAdminChat && <Crown className="h-3 w-3 text-purple-600" />}
               </div>
               
               <div className="flex items-center gap-2 mt-1">
                  <Badge className={cn("text-[6px] font-black uppercase px-1.5 h-3.5 border-none shadow-inner", meta.color, "text-white")}>
                     {meta.label}
                  </Badge>
                  <div className="flex items-center gap-1">
                     <div className={cn("h-1.5 w-1.5 rounded-full", c.otherTyping ? "bg-orange-500 animate-pulse" : "bg-green-500")} />
                     <p className="text-[7px] font-black text-primary/40 uppercase tracking-widest leading-none">
                       {c.otherTyping ? "Mengetik..." : "Sinyal Aktif"}
                     </p>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
             {!c.isNewChat && (
               <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted/30 text-primary active:scale-90 transition-all">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-52 rounded-2xl border-none shadow-2xl p-1.5 z-[100] animate-in zoom-in-95"
                      onInteractOutside={(e) => { if (c.confirmType) e.preventDefault(); }}
                    >
                       <DropdownMenuItem 
                        className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer text-primary font-black uppercase text-[9px] hover:bg-primary/5"
                        onSelect={(e) => { 
                          e.preventDefault(); 
                          forceUnlockUI(); 
                          c.setConfirmType('clear'); 
                        }}
                       >
                          <Eraser className="h-4 w-4 opacity-40" /> Bersihkan Percakapan
                       </DropdownMenuItem>
                       <div className="h-px bg-muted my-1" />
                       <DropdownMenuItem 
                        className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer text-destructive font-black uppercase text-[9px] hover:bg-destructive/5"
                        onSelect={(e) => { 
                          e.preventDefault(); 
                          forceUnlockUI(); 
                          c.setConfirmType('delete'); 
                        }}
                       >
                          <Trash2 className="h-4 w-4 opacity-40" /> Hapus Jalur Chat
                       </DropdownMenuItem>
                    </DropdownMenuContent>
               </DropdownMenu>
             )}
          </div>
        </div>
      </header>

      {!c.isNewChat && c.chatData?.type === 'cht_order' && c.chatData?.orderId && <OrderContextBar orderId={c.chatData.orderId} />}
      {!c.isNewChat && c.chatData?.type === 'cht_toko' && c.otherInfo.id && <ShopContextBar storeId={c.otherInfo.id} />}

      <div className="flex-1 min-h-0 relative bg-[#F8FAFC]">
        <ScrollArea className="h-full w-full">
          {c.isNewChat ? (
            <div className="p-6 space-y-6 animate-in fade-in duration-500">
               <div className="p-6 bg-white rounded-[2rem] border-2 border-dashed border-primary/10 flex flex-col items-center text-center space-y-4 shadow-inner">
                  <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shadow-sm"><User className="h-6 w-6" /></div>
                  <div className="space-y-1">
                     <h3 className="text-sm font-black uppercase text-primary">Kamar Chat Kosong</h3>
                     <p className="text-[9px] font-bold text-muted-foreground uppercase leading-relaxed">Cari warga Siau di bawah ini untuk memulai amanah baru.</p>
                  </div>
               </div>
               
               <div className="space-y-4">
                  <div className="relative group">
                     <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                     <input 
                      placeholder="Cari Nama atau Username..." 
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
                          className="p-4 bg-white rounded-2xl border border-primary/5 shadow-md flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer hover:shadow-lg"
                          onClick={() => c.handleCreateNewChat(u)}
                         >
                            <div className="flex items-center gap-4">
                               <Avatar className="h-12 w-12 border shadow-sm rounded-full"><AvatarImage src={u.imageUrl} className="object-cover rounded-full" /><AvatarFallback className="font-black uppercase text-[10px]">U</AvatarFallback></Avatar>
                               <div className="min-w-0">
                                  <div className="flex items-center gap-1">
                                    <p className="text-[12px] font-black uppercase text-primary truncate leading-none">{u.fullName}</p>
                                    {['admin', 'owner', 'courier', 'umkm'].includes(u.role) && <CheckCircle2 className="h-3 w-3 text-blue-500 fill-blue-500" />}
                                  </div>
                                  <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1.5 opacity-60">@{u.username || u.id.slice(0,8)}</p>
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
                    <div className="p-6 rounded-full bg-primary/5 border border-primary/5 shadow-inner">
                       <MessageSquare className="h-16 w-16 text-primary opacity-20" />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-center leading-relaxed">Sinyal Terhubung Amanah. <br/> Silakan mulai obrolan.</p>
                 </div>
              ) : (
                c.messages.map((msg: any, index: number) => {
                  const prevMsg = c.messages[index - 1];
                  const msgDate = msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000) : new Date();
                  const prevMsgDate = prevMsg?.createdAt?.seconds ? new Date(prevMsg.createdAt.seconds * 1000) : null;
                  
                  const isNewDay = !prevMsgDate || !isSameDay(msgDate, prevMsgDate);

                  return (
                    <React.Fragment key={msg.id}>
                      {isNewDay && (
                        <div className="flex items-center gap-4 py-6 px-10">
                           <div className="h-px bg-primary/10 flex-1" />
                           <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-primary/5 shadow-sm">
                              <Calendar className="h-3 w-3 text-primary/40" />
                              <span className="text-[8px] font-black uppercase text-primary/60 tracking-[0.2em]">
                                 {format(msgDate, 'dd MMMM yyyy', { locale: id })}
                              </span>
                           </div>
                           <div className="h-px bg-primary/10 flex-1" />
                        </div>
                      )}
                      <MessageBubble 
                        msg={msg} user={c.user} 
                        onReply={c.setReplyTo} onReact={c.handleReactMessage}
                        onDelete={c.handleDeleteMessage}
                        onEdit={() => { c.setEditingMsg(msg); c.setMessage(msg.text); c.inputRef.current?.focus(); }}
                      />
                    </React.Fragment>
                  );
                })
              )}
              <div ref={c.scrollRef} className="h-2" />
            </div>
          )}
        </ScrollArea>
      </div>

      {c.isProcessing && (
         <div className="absolute inset-0 z-[120] bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-[9px] font-black uppercase text-primary tracking-widest animate-pulse">Memproses Database...</p>
         </div>
      )}

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

      <AlertDialog 
        open={!!c.confirmType} 
        onOpenChange={(v) => { if(!v) c.setConfirmType(null); forceUnlockUI(); }}
      >
        <AlertDialogContent className="w-[92vw] rounded-[2.5rem] p-8 border-none shadow-2xl animate-in zoom-in-95 z-[500]">
           <AlertDialogHeader className="text-center">
              <div className="mx-auto h-20 w-20 rounded-[2rem] bg-destructive/10 flex items-center justify-center mb-6">
                 {c.confirmType === 'delete' ? <Trash2 className="h-10 w-10 text-destructive" /> : <Eraser className="h-10 w-10 text-primary" />}
              </div>
              <AlertDialogTitle className="text-2xl font-black uppercase text-primary tracking-tighter italic">
                 {c.confirmType === 'delete' ? "MUSNAHKAN CHAT?" : "BERSIHKAN PESAN?"}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-[11px] font-bold text-muted-foreground mt-4 leading-relaxed">
                 {c.confirmType === 'delete' 
                   ? "DANGER: Seluruh jalur obrolan dan log pesan akan dihapus secara fisik dari database Jastip Siau." 
                   : "SOP: Hanya log pesan yang akan dimusnahkan. Jalur chat induk tetap dipertahankan."}
              </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-10">
              <AlertDialogCancel className="h-14 rounded-2xl font-black uppercase text-[10px] border-primary/10">Batal</AlertDialogCancel>
              <AlertDialogAction 
                className="h-14 rounded-2xl font-black uppercase text-[10px] bg-destructive text-white shadow-xl active:scale-95 transition-all"
                onClick={() => {
                   if (c.confirmType === 'delete') c.handleDeleteChatChain(handleGoBack);
                   else c.handleClearChat();
                }}
              >
                 {c.confirmType === 'delete' ? "Ya, Hapus Semua" : "Ya, Bersihkan"}
              </AlertDialogAction>
           </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
