"use client";

/**
 * @fileOverview CONTROLLER: Pusat Pesan (SOVEREIGN 1-URL ENGINE)
 * SOP: Menangani Inbox & Percakapan dalam satu state internal terpadu.
 * FIX: Menggunakan local state untuk 'activeChatId' agar URL tetap tunggal.
 * FIX: Membasmi seluruh babi (diagnosa/lock) yang menghambat sinyal sentuhan.
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { 
  collection, addDoc, serverTimestamp, query, doc, 
  updateDoc, limit, onSnapshot, setDoc, deleteDoc, orderBy, where
} from 'firebase/firestore';
import { useView } from '@/context/view-context';

export type ChatCategory = 'all' | 'cht_private' | 'cht_toko' | 'cht_order' | 'cht_admin';

export function useMessageController() {
  const { user } = useUser();
  const db = useFirestore();
  const { setView } = useView();

  // 1. STATE KEDAULATAN (INTERNAL TOGGLE - 1 URL)
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<ChatCategory>('all');
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [editingMsg, setEditingMsg] = useState<any>(null);
  const [otherTyping, setOtherTyping] = useState(false);
  
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  const { data: myProfile } = useDoc(user && db ? doc(db, 'users', user.uid) : null, true);

  // 2. RADAR INBOX: Real-time List Sync
  useEffect(() => {
    if (!db || !user) return;
    setChatsLoading(true);
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid));
    
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setChats(list);
      setChatsLoading(false);
    });
    return () => unsub();
  }, [db, user]);

  // 3. RADAR CHAT: Real-time Messages Sync
  useEffect(() => {
    if (!db || !activeChatId) {
      setMessages([]);
      return;
    }
    setMessagesLoading(true);
    const q = query(collection(db, 'chats', activeChatId, 'messages'), orderBy('createdAt', 'asc'), limit(150));
    
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setMessages(msgs);
      setMessagesLoading(false);
      // Auto-scroll
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    const unsubTyping = onSnapshot(doc(db, 'chats', activeChatId), (snap) => {
      if (snap.exists()) {
        const typingData = snap.data().typing || {};
        const isOtherTyping = Object.keys(typingData).some(uid => uid !== user?.uid && typingData[uid] === true);
        setOtherTyping(isOtherTyping);
      }
    });

    return () => { unsub(); unsubTyping(); };
  }, [db, activeChatId, user]);

  // 4. LOGIKA KEDAULATAN: Filter & Metadata
  const filteredChats = useMemo(() => {
    let list = chats.map(c => {
      const otherId = c.participants?.find((p: string) => p !== user?.uid);
      return {
        ...c,
        title: c.participantNames?.[otherId] || "Warga Siau",
        photo: c.participantPhotos?.[otherId] || "",
        otherId
      };
    });

    if (activeCategory !== 'all') list = list.filter(c => c.type === activeCategory);
    if (search) list = list.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

    return list.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
  }, [chats, activeCategory, search, user]);

  const activeChatData = useMemo(() => filteredChats.find(c => c.id === activeChatId), [filteredChats, activeChatId]);

  // 5. ACTIONS: Navigation & Interaction
  const handleSelectChat = (id: string) => setActiveChatId(id);
  const handleCloseChat = () => { setActiveChatId(null); setMessage(''); setReplyTo(null); setEditingMsg(null); };
  const handleExitCenter = () => setView('home');

  const handleTyping = (isTyping: boolean) => {
    if (!db || !activeChatId || !user) return;
    setDoc(doc(db, 'chats', activeChatId), { typing: { [user.uid]: isTyping } }, { merge: true }).catch(() => {});
  };

  const handleSendMessage = async () => {
    const finalMsg = message.trim();
    if (!finalMsg || !user || !db || !activeChatId || sending) return;
    setSending(true);

    const currentReply = replyTo;
    const isEdit = !!editingMsg;

    setMessage('');
    setReplyTo(null);
    setEditingMsg(null);
    handleTyping(false);

    try {
      if (isEdit) {
        await updateDoc(doc(db, 'chats', activeChatId, 'messages', editingMsg.id), { text: finalMsg, isEdited: true, updatedAt: serverTimestamp() });
      } else {
        await updateDoc(doc(db, 'chats', activeChatId), { lastMessage: finalMsg, lastMessageSenderId: user.uid, lastMessageStatus: 'sent', updatedAt: serverTimestamp() });
        const msgRef = doc(collection(db, 'chats', activeChatId, 'messages'));
        await setDoc(msgRef, {
          id: msgRef.id, senderId: user.uid, senderName: myProfile?.fullName || 'Warga', text: finalMsg,
          createdAt: serverTimestamp(), status: 'sent',
          replyTo: currentReply ? { text: currentReply.text, senderName: currentReply.senderName } : null,
          reactions: {}
        });
      }
    } finally { setSending(false); }
  };

  const handleReactMessage = (mid: string, emoji: string) => {
    if (!db || !activeChatId || !user) return;
    updateDoc(doc(db, 'chats', activeChatId, 'messages', mid), { [`reactions.${user.uid}`]: emoji });
  };

  const handleDeleteMessage = (mid: string) => {
    if (!db || !activeChatId) return;
    deleteDoc(doc(db, 'chats', activeChatId, 'messages', mid));
  };

  return {
    user, chats: filteredChats, messages, message, setMessage, activeChatId, activeChatData, search, setSearch,
    activeCategory, setActiveCategory, sending, handleSelectChat, handleCloseChat, handleExitCenter,
    scrollRef, inputRef, handleSendMessage, chatsLoading, messagesLoading, otherTyping,
    replyTo, setReplyTo, editingMsg, setEditingMsg, handleReactMessage, handleDeleteMessage, handleTyping,
    myProfile
  };
}
