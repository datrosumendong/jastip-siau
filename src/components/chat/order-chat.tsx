
"use client";

/**
 * @fileOverview COMPONENT: Order Chat (CHRONOS MASTER V240)
 * SOP: Integrasi Status Centang (Triple-Check) & Mark-as-Read Otomatis.
 * FIX: Penambahan Garis Pemisah Tanggal di tengah form chat order.
 * FIX V10.300: Stabilisasi referensi doc dengan useMemo untuk membasmi Infinite Loop.
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { 
  collection, addDoc, serverTimestamp, query, doc, 
  updateDoc, setDoc, limit, onSnapshot, deleteDoc, writeBatch
} from 'firebase/firestore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from '../dashboard/messages/MessageBubble';
import { ChatInput } from '../dashboard/messages/ChatInput';
import { format, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
import React from 'react';

interface OrderChatProps {
  orderId: string;
  orderName?: string;
}

export function OrderChat({ orderId }: OrderChatProps) {
  const { user } = useUser();
  const db = useFirestore();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [editingMsg, setEditingMsg] = useState<any>(null);
  const [otherTyping, setOtherTyping] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatId = useMemo(() => (orderId ? `order_${orderId}` : ''), [orderId]);
  
  // 1. DATA MODEL: Stabilisasi Referensi (Anti-Loop)
  const myProfileRef = useMemo(() => (user && db ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: myProfile } = useDoc(myProfileRef, true);

  const orderRef = useMemo(() => (db && orderId ? doc(db, 'orders', orderId) : null), [db, orderId]);
  const { data: order } = useDoc(orderRef, true);

  const messagesQuery = useMemo(() => (db && chatId ? query(collection(db, 'chats', chatId, 'messages'), limit(200)) : null), [db, chatId]);
  const { data: rawMessages = [] } = useCollection(messagesQuery, true);

  const messages = useMemo(() => {
    return [...rawMessages].sort((a: any, b: any) => {
      const tA = a.createdAt?.seconds || (Date.now() / 1000) + 10000;
      const tB = b.createdAt?.seconds || (Date.now() / 1000) + 10000;
      return tA - tB;
    });
  }, [rawMessages]);

  useEffect(() => {
    if (!db || !chatId || !user || messages.length === 0) return;
    const unread = messages.filter(m => m.senderId !== user.uid && m.status !== 'read');
    if (unread.length > 0) {
      const batch = writeBatch(db);
      unread.forEach(m => batch.update(doc(db, 'chats', chatId, 'messages', m.id), { status: 'read' }));
      batch.update(doc(db, 'chats', chatId), { lastMessageStatus: 'read' });
      batch.commit().catch(() => {});
    }
  }, [messages, chatId, user, db]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!db || !chatId || !user) return;
    const unsub = onSnapshot(doc(db, 'chats', chatId), (snap) => {
      if (snap.exists()) {
        const typingData = snap.data().typing || {};
        const isTyping = Object.keys(typingData).some(uid => uid !== user.uid && typingData[uid] === true);
        setOtherTyping(isTyping);
      }
    });
    return () => unsub();
  }, [db, chatId, user]);

  const handleTyping = (isTyping: boolean) => {
    if (!db || !chatId || !user) return;
    setDoc(doc(db, 'chats', chatId), { typing: { [user.uid]: isTyping } }, { merge: true }).catch(() => {});
  };

  const handleSendMessage = async () => {
    const finalMsg = message.trim();
    if (!finalMsg || !user || !db || !order || !chatId || sending) return;
    setSending(true);

    const isEditMode = !!editingMsg;
    const currentReply = replyTo;
    
    setMessage('');
    setReplyTo(null);
    setEditingMsg(null);
    handleTyping(false);

    try {
      if (isEditMode) {
        await updateDoc(doc(db, 'chats', chatId, 'messages', editingMsg.id), {
          text: finalMsg, isEdited: true, updatedAt: serverTimestamp()
        });
      } else {
        const targetId = user.uid === order.userId ? (order.courierId || order.umkmId) : order.userId;
        
        await setDoc(doc(db, 'chats', chatId), {
          id: chatId, type: 'order', orderId: orderId,
          participants: [order.userId, order.courierId, order.umkmId].filter(id => !!id),
          participantNames: { 
            [order.userId]: order.userName || 'Member', 
            [order.courierId]: order.courierName || "Kurir",
            [order.umkmId]: order.umkmName || "Toko"
          },
          participantPhotos: {
            [order.userId]: order.userPhoto || '',
            [order.courierId]: order.courierPhoto || '',
            ...(order.umkmId ? { [order.umkmId]: order.umkmPhoto || '' } : {})
          },
          lastMessage: finalMsg, lastMessageSenderId: user.uid, lastMessageStatus: 'sent', updatedAt: serverTimestamp()
        }, { merge: true });

        const msgDocRef = doc(collection(db, 'chats', chatId, 'messages'));
        await setDoc(msgDocRef, {
          id: msgDocRef.id, senderId: user.uid, senderName: myProfile?.fullName || 'User', text: finalMsg,
          createdAt: serverTimestamp(), status: 'sent',
          replyTo: currentReply ? { text: currentReply.text, senderName: currentReply.senderName } : null,
          reactions: {}
        });

        if (targetId && targetId !== user.uid) {
          addDoc(collection(db, 'notifications'), {
            userId: targetId, title: `Chat Order: ${myProfile?.fullName}`, message: finalMsg,
            type: 'order_chat', targetId: chatId, senderId: user.uid, senderPhoto: myProfile?.imageUrl || "", createdAt: serverTimestamp()
          });
        }
      }
    } finally { setSending(false); }
  };

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden">
      {otherTyping && (
        <div className="absolute top-2 left-0 right-0 z-[45] flex justify-center animate-in slide-in-from-top-2">
           <div className="bg-white/80 backdrop-blur-md text-orange-600 border border-orange-100 text-[7px] font-black uppercase px-3 py-1 rounded-full shadow-lg">Sedang mengetik...</div>
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
                    onEdit={() => { setEditingMsg(msg); setMessage(msg.text); inputRef.current?.focus(); }}
                    onDelete={(mid: string) => deleteDoc(doc(db, 'chats', chatId, 'messages', mid))}
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
