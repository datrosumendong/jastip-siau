"use client";

/**
 * @fileOverview COMPONENT: Complaint Chat (GROUP MODERATION V16.000)
 * SOP: Penegakan Notifikasi ke seluruh partisipan (Member & Kurir) dalam mode investigasi.
 * FIX: Menjamin kedaulatan group chat 3 arah dipantau Admin secara real-time.
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { 
  collection, addDoc, serverTimestamp, query, doc, 
  updateDoc, limit, onSnapshot, setDoc, deleteDoc, writeBatch
} from 'firebase/firestore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from '../dashboard/messages/MessageBubble';
import { ChatInput } from '../dashboard/messages/ChatInput';
import { format, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar, Loader2 } from 'lucide-react';
import React from 'react';

interface ComplaintChatProps {
  complaintId: string;
}

export function ComplaintChat({ complaintId }: ComplaintChatProps) {
  const { user } = useUser();
  const db = useFirestore();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [editingMsg, setEditingMsg] = useState<any>(null);
  const [otherTyping, setOtherTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const myProfileRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: myProfile } = useDoc(myProfileRef, true);

  const complaintRef = useMemo(() => (db && complaintId ? doc(db, 'complaints', complaintId) : null), [db, complaintId]);
  const { data: complaint } = useDoc(complaintRef, true);

  const messagesQuery = useMemo(() => (db && complaintId ? query(collection(db, 'complaints', complaintId, 'messages'), limit(200)) : null), [db, complaintId]);
  const { data: rawMessages = [] } = useCollection(messagesQuery, true);

  const messages = useMemo(() => {
    return [...rawMessages].sort((a: any, b: any) => {
      const tA = a.createdAt?.seconds || (Date.now() / 1000) + 10000;
      const tB = b.createdAt?.seconds || (Date.now() / 1000) + 10000;
      return tA - tB;
    });
  }, [rawMessages]);

  useEffect(() => {
    if (!db || !complaintId || !user || messages.length === 0) return;
    const unread = messages.filter(m => m.senderId !== user.uid && m.status !== 'read');
    if (unread.length > 0) {
      const batch = writeBatch(db);
      unread.forEach(m => batch.update(doc(db, 'complaints', complaintId, 'messages', m.id), { status: 'read' }));
      batch.commit().catch(() => {});
    }
  }, [messages, complaintId, user, db]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!db || !complaintId || !user) return;
    const unsub = onSnapshot(doc(db, 'complaints', complaintId), (snap) => {
      if (snap.exists()) {
        const typingData = snap.data().typing || {};
        const isTyping = Object.keys(typingData).some(uid => uid !== user.uid && typingData[uid] === true);
        setOtherTyping(isTyping);
      }
    });
    return () => unsub();
  }, [db, complaintId, user]);

  const handleTyping = (isTyping: boolean) => {
    if (!db || !complaintId || !user) return;
    setDoc(doc(db, 'complaints', complaintId), { typing: { [user.uid]: isTyping } }, { merge: true }).catch(() => {});
  };

  const handleSendMessage = async () => {
    const finalMsg = message.trim();
    if (!finalMsg || !user || !db || !complaintId || sending) return;
    setSending(true);
    const currentReply = replyTo;
    const isEditMode = !!editingMsg;
    const editId = editingMsg?.id;

    setMessage('');
    setReplyTo(null);
    setEditingMsg(null);
    handleTyping(false);

    try {
      if (isEditMode) {
        await updateDoc(doc(db, 'complaints', complaintId, 'messages', editId), { text: finalMsg, isEdited: true, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, 'complaints', complaintId, 'messages'), {
          senderId: user.uid, senderName: myProfile?.fullName || 'User', text: finalMsg,
          createdAt: serverTimestamp(), status: 'sent',
          replyTo: currentReply ? { text: currentReply.text, senderName: currentReply.senderName } : null,
          reactions: {}
        });
        updateDoc(doc(db, 'complaints', complaintId), { updatedAt: serverTimestamp() }).catch(() => {});

        // SOP GROUP NOTIFIKASI (V16.000)
        // Kirim sinyal ke seluruh partisipan selain pengirim
        const participants = complaint?.participants || [];
        const isMeStaff = myProfile?.role === 'admin' || myProfile?.role === 'owner';

        if (isMeStaff) {
          // Jika admin yang kirim, kabari seluruh partisipan (Member & Kurir)
          participants.forEach((pid: string) => {
            if (pid !== user.uid) {
              addDoc(collection(db, 'notifications'), {
                userId: pid, title: "💬 Moderasi Investigasi", message: finalMsg,
                type: 'complaint', targetId: complaintId, senderId: user.uid, senderPhoto: myProfile?.imageUrl || "", createdAt: serverTimestamp()
              });
            }
          });
        } else {
          // Jika warga yang kirim, kabari Admin
          addDoc(collection(db, 'notifications'), {
            userId: 'SYSTEM_ADMIN_NOTIF', title: `Respon Investigasi: ${myProfile?.fullName}`, message: finalMsg,
            type: 'admin_complaint', targetId: complaintId, senderId: user.uid, senderPhoto: myProfile?.imageUrl || "", createdAt: serverTimestamp()
          });
        }
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    } finally { setSending(false); }
  };

  const handleReactMessage = async (mid: string, emoji: string) => {
    if (!db || !complaintId || !user) return;
    await updateDoc(doc(db, 'complaints', complaintId, 'messages', mid), { [`reactions.${user.uid}`]: emoji });
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!db || !complaintId) return;
    deleteDoc(doc(db, 'complaints', complaintId, 'messages', msgId)).catch(() => {});
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#F8FAFC] relative overflow-hidden">
      {otherTyping && (
        <div className="absolute top-2 left-0 right-0 z-[45] flex justify-center animate-in slide-in-from-top-2">
           <div className="bg-white/80 backdrop-blur-md text-orange-600 border border-orange-100 shadow-sm text-[7px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">Lawan bicara sedang mengetik...</div>
        </div>
      )}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="space-y-6 p-4 pb-20">
            {messages.map((msg: any, index: number) => {
              const prevMsg = messages[index - 1];
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
                    msg={msg} 
                    user={user} 
                    onReply={setReplyTo} 
                    onReact={handleReactMessage} 
                    onEdit={() => { setEditingMsg(msg); setMessage(msg.text); inputRef.current?.focus(); }}
                    onDelete={handleDeleteMessage}
                  />
                </React.Fragment>
              );
            })}
            <div ref={scrollRef} className="h-4" />
          </div>
        </ScrollArea>
      </div>
      <ChatInput 
        inputRef={inputRef}
        message={message} 
        setMessage={setMessage} 
        sending={sending} 
        replyTo={replyTo} 
        setReplyTo={setReplyTo} 
        handleSendMessage={handleSendMessage}
        editingMsg={editingMsg}
        setEditingMsg={setEditingMsg}
        handleTyping={handleTyping}
        profileImage={myProfile?.imageUrl}
      />
    </div>
  );
}