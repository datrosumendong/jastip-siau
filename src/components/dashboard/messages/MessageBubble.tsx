"use client";

/**
 * @fileOverview COMPONENT: Message Bubble (MAHAKARYA TRIPLE-CHECK V300)
 * SOP: Penegakan kedaulatan status sinyal: Terkirim, Diterima, Terbaca.
 * FIX: Menjamin visibilitas centang ganda biru (Accent) pada balon pengirim.
 */

import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck, Quote, SmilePlus, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const REACTION_EMOJIS = ['👍', '💕', '🙏', '🔥', '😇', '😡', '🥵'];

export function MessageBubble({ msg, user, onReply, onReact, onEdit, onDelete }: any) {
  const isMe = msg.senderId === user?.uid;
  const reactions = msg.reactions || {};
  
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartRef = useRef(0);
  const swipeThreshold = 60;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = e.touches[0].clientX - touchStartRef.current;
    if (diff > 0) setSwipeOffset(Math.min(diff, 100)); 
    else setSwipeOffset(Math.max(diff, -100)); 
  };

  const handleTouchEnd = () => {
    if (Math.abs(swipeOffset) > swipeThreshold) {
      if (window.navigator.vibrate) window.navigator.vibrate(10);
      if (onReply) onReply(msg);
    }
    setSwipeOffset(0);
  };

  /**
   * SOP VISUAL TRIPLE-CHECK:
   * 1. 1 Centang: Sinyal sampai Server (sent)
   * 2. 2 Centang Abu: Sinyal sampai HP Lawan (delivered)
   * 3. 2 Centang Biru (Accent): Sinyal telah Dibaca (read)
   */
  const renderStatus = () => {
    if (!isMe) return null;
    
    if (msg.status === 'read') {
      // Centang Ganda Biru (Accent)
      return <CheckCheck className="h-3.5 w-3.5 text-accent animate-in zoom-in-50 duration-500" />;
    }
    if (msg.status === 'delivered') {
      // Centang Ganda Abu
      return <CheckCheck className="h-3.5 w-3.5 text-white/40" />;
    }
    // Centang Tunggal Abu (Sent)
    return <Check className="h-3.5 w-3.5 text-white/40" />;
  };

  return (
    <div className={cn(
      "flex flex-col max-w-full group relative transition-all animate-in fade-in duration-300 w-full mb-8", 
      isMe ? "items-end" : "items-start"
    )}>
      <span className={cn(
        "text-[7px] font-black uppercase text-muted-foreground mb-1.5 px-4 opacity-40 tracking-[0.2em]",
        isMe ? "text-right" : "text-left"
      )}>
        {isMe ? "Anda" : msg.senderName}
      </span>
      
      <div 
        className={cn(
          "relative flex items-center w-full px-2 gap-3 transition-transform duration-150 ease-out z-10",
          isMe ? "flex-row justify-end" : "flex-row justify-start"
        )}
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* OPTIONS & REACTIONS (HIDDEN BY DEFAULT) */}
        {isMe && (
          <div className="shrink-0 order-1 opacity-0 group-hover:opacity-100 transition-opacity">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-8 w-8 rounded-full bg-white shadow-lg border border-primary/5 flex items-center justify-center text-primary/40 hover:text-primary active:scale-75 transition-all">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40 rounded-2xl border-none shadow-2xl p-1.5 z-[160] animate-in zoom-in-95">
                   <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-primary font-black uppercase text-[9px] hover:bg-primary/5" onClick={onEdit}>
                      <Edit2 className="h-4 w-4 opacity-40" /> Koreksi Pesan
                   </DropdownMenuItem>
                   <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-destructive font-black uppercase text-[9px] hover:bg-destructive/5" onClick={() => onDelete && onDelete(msg.id)}>
                      <Trash2 className="h-4 w-4 opacity-40" /> Hapus Permanen
                   </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </div>
        )}

        {!isMe && (
          <div className="shrink-0 order-2">
             <Popover>
                <PopoverTrigger asChild>
                  <button className="h-8 w-8 rounded-full bg-white shadow-lg border border-primary/5 flex items-center justify-center text-primary/40 hover:text-primary active:scale-75 transition-all">
                    <SmilePlus className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent side="top" className="w-fit p-2 rounded-full border-none shadow-2xl bg-white/95 backdrop-blur flex gap-1 z-[170]">
                  {REACTION_EMOJIS.map(e => (
                     <button key={e} onClick={() => onReact && onReact(msg.id, e)} className="h-9 w-9 flex items-center justify-center rounded-full text-xl hover:bg-primary/5 active:scale-75 transition-all">{e}</button>
                  ))}
                </PopoverContent>
             </Popover>
          </div>
        )}

        {/* BALON PESAN UTAMA */}
        <div className={cn(
          "p-4 rounded-[1.8rem] text-[13.5px] shadow-sm break-words leading-relaxed transition-all relative border min-w-[140px] max-w-[85%]", 
          isMe ? "bg-primary text-white rounded-tr-none border-primary/20 order-2" : "bg-white border-primary/5 rounded-tl-none shadow-md order-1"
        )}>
          
          {msg.replyTo && (
            <div className={cn("p-2.5 rounded-xl mb-3 border-l-4 text-[11px] opacity-80 bg-black/10", isMe ? "border-white/40" : "border-primary/40")}>
              <div className="flex items-center gap-1.5 mb-1">
                <Quote className="h-2.5 w-2.5" />
                <p className="font-black uppercase text-[8px]">{msg.replyTo.senderName}</p>
              </div>
              <p className="line-clamp-1 italic uppercase tracking-tight">"{msg.replyTo.text}"</p>
            </div>
          )}

          <div className="whitespace-pre-wrap pr-2 font-medium">{msg.text}</div>

          {/* FOOTER BALON: WAKTU & STATUS CENTANG */}
          <div className={cn("flex items-center gap-2 mt-3 opacity-60 text-[7.5px] font-black uppercase tracking-widest", isMe ? "justify-end" : "justify-start")}>
             {msg.isEdited && <span className="text-[6px] italic lowercase opacity-50">edited</span>}
             <span>{msg.createdAt?.seconds ? format(new Date(msg.createdAt.seconds * 1000), 'HH:mm') : '...'}</span>
             {isMe && <div className="ml-1 shrink-0 flex items-center">{renderStatus()}</div>}
          </div>

          {/* EMOJI REACTIONS LAYER */}
          {reactions && Object.keys(reactions).length > 0 && (
            <div className={cn(
              "absolute -bottom-3.5 flex items-center gap-1 bg-white rounded-full px-2 py-1 shadow-lg border-2 border-white z-20", 
              isMe ? "right-2" : "left-2"
            )}>
              {Object.entries(reactions).map(([uid, emoji]: any) => (
                <span key={uid} className="text-[11px] animate-in zoom-in-50">{emoji}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
