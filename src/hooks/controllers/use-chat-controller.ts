
"use client";

/**
 * CONTROLLER: Sovereign Chat Engine (MVC)
 * SOP: Menangani mutlak satu alur percakapan secara real-time.
 * FIX: Navigasi kembali murni ke 'messages_center' untuk stabilitas SPA.
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { 
  collection, addDoc, serverTimestamp, query, doc, 
  updateDoc, limit, onSnapshot, setDoc, deleteDoc, orderBy
} from 'firebase/firestore';
import { useView } from '@/context/view-context';

export function useChatController() {
  const { user } = useUser();
  const db = useFirestore();
  const { viewData, setView, forceUnlockUI } = useView();
  const chatId = viewData?.id || '';

  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [editingMsg, setEditingMsg] = useState<any>(null);
  const [otherTyping, setOtherTyping] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. DATA MODEL: Profil Saya & Metadata Chat
  const { data: myProfile } = useDoc(user && db ? doc(db, 'users', user.uid) : null, true);
  const { data: chatData, loading: chatLoading } = useDoc(db && chatId ? doc(db, 'chats', chatId) : null, true);

  // 2. DATA MODEL: Real-time Messages Stream
  const messagesQuery = useMemo(() => {
    if (!db || !chatId) return null;
    return query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(200)
    );
  }, [db, chatId]);

  const { data: messages = [], loading: messagesLoading } = useCollection(messagesQuery, true);

  // 3. LOGIKA KEDAULATAN: Metadata Lawan Bicara
  const otherInfo = useMemo(() => {
    if (!chatData || !user) return { name: 'Warga Siau', photo: '', id: '' };
    const otherId = chatData.participants?.find((p: string) => p !== user.uid);
    return {
      id: otherId,
      name: chatData.participantNames?.[otherId] || 'Warga Siau',
      photo: chatData.participantPhotos?.[otherId] || ''
    };
  }, [chatData, user]);

  // SOP: AUTO-SCROLL
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4. REAL-TIME TYPING INDICATOR
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
    if (!finalMsg || !user || !db || !chatId || sending) return;
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
        await updateDoc(doc(db, 'chats', chatId), {
          lastMessage: finalMsg, 
          lastMessageSenderId: user.uid, 
          lastMessageStatus: 'sent', 
          updatedAt: serverTimestamp()
        });

        const msgDocRef = doc(collection(db, 'chats', chatId, 'messages'));
        await setDoc(msgDocRef, {
          id: msgDocRef.id, 
          senderId: user.uid, 
          senderName: myProfile?.fullName || 'User', 
          text: finalMsg,
          createdAt: serverTimestamp(), 
          status: 'sent',
          replyTo: currentReply ? { text: currentReply.text, senderName: currentReply.senderName } : null,
          reactions: {}
        });

        if (otherInfo.id) {
          addDoc(collection(db, 'notifications'), {
            userId: otherInfo.id, 
            title: `Pesan: ${myProfile?.fullName}`, 
            message: finalMsg,
            type: chatData?.type || 'chat', 
            targetId: chatId, 
            senderId: user.uid, 
            senderPhoto: myProfile?.imageUrl || "", 
            createdAt: serverTimestamp()
          });
        }
      }
    } finally { setSending(false); }
  };

  const handleReactMessage = (mid: string, emoji: string) => {
    if (!db || !chatId || !user) return;
    updateDoc(doc(db, 'chats', chatId, 'messages', mid), { [`reactions.${user.uid}`]: emoji });
  };

  const handleDeleteMessage = (mid: string) => {
    if (!db || !chatId) return;
    deleteDoc(doc(db, 'chats', chatId, 'messages', mid));
  };

  const handleGoBack = () => {
    forceUnlockUI();
    setView('messages_center');
  };

  return {
    chatId, chatData, messages, user, otherInfo,
    message, setMessage, sending, replyTo, setReplyTo,
    editingMsg, setEditingMsg, otherTyping,
    scrollRef, inputRef, chatLoading, messagesLoading,
    handleSendMessage, handleReactMessage, handleDeleteMessage, handleTyping,
    handleGoBack, setView, myProfile
  };
}
