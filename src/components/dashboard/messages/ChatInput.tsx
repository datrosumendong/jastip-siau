
"use client";

/**
 * COMPONENT: Chat Input (MAHAKARYA REFINED)
 * SOP: Memulihkan visual input dengan Avatar dan tombol Kirim Lingkaran.
 * FIX: Menjamin input tetap merdeka dari Ghost Lock.
 */

import { Send, X, Quote, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function ChatInput({ 
  inputRef, message, setMessage, sending, replyTo, setReplyTo, 
  handleSendMessage, editingMsg, setEditingMsg, handleTyping, profileImage 
}: any) {
  
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !sending) handleSendMessage();
  };

  const typingTimeoutRef = useRef<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMessage(val);
    if (typeof handleTyping === 'function') {
      handleTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => handleTyping(false), 2000);
    }
  };

  return (
    <div className="p-3 pb-6 bg-white border-t space-y-3 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-[41]">
      {/* REPLY PREVIEW */}
      {replyTo && (
         <div className="flex items-center justify-between bg-primary/5 p-3 rounded-xl border-l-4 border-primary animate-in slide-in-from-bottom-2">
            <div className="min-w-0 flex-1 flex gap-3">
               <Quote className="h-4 w-4 text-primary opacity-20 shrink-0" />
               <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase text-primary mb-0.5">{replyTo.senderName}</p>
                  <p className="text-[11px] text-muted-foreground truncate uppercase">{replyTo.text}</p>
               </div>
            </div>
            <button onClick={() => setReplyTo(null)} className="h-6 w-6 rounded-full bg-white shadow-sm flex items-center justify-center"><X className="h-3 w-3" /></button>
         </div>
      )}

      <form onSubmit={onSubmit} className="flex gap-3 items-center">
         <Avatar className="h-10 w-10 border-2 border-primary/5 shadow-inner shrink-0">
            <AvatarImage src={profileImage} className="object-cover" />
            <AvatarFallback className="bg-muted text-primary text-[10px] font-black uppercase">
               {(editingMsg ? "E" : "N")}
            </AvatarFallback>
         </Avatar>

         <input 
          ref={inputRef}
          placeholder={editingMsg ? "Koreksi pesan..." : "Tulis balasan..."}
          className={cn(
            "flex-1 h-12 text-sm font-bold border-none rounded-full px-5 outline-none focus:ring-2 transition-all shadow-inner",
            editingMsg ? "bg-orange-50 focus:ring-orange-200" : "bg-muted/40 focus:ring-primary/20"
          )} 
          value={message} 
          onChange={handleInputChange}
          disabled={sending} 
         />

         <button 
          type="submit" 
          className={cn(
            "h-12 w-12 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-90 shrink-0",
            editingMsg ? "bg-orange-600 text-white" : "bg-primary text-white"
          )}
          disabled={!message.trim() || sending}
         >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : editingMsg ? (
              <CheckCircle2 className="h-6 w-6" />
            ) : (
              <Send className="h-5 w-5 rotate-[-45deg] mr-1 mt-1" />
            )}
         </button>
      </form>
    </div>
  );
}
