"use client";

/**
 * @fileOverview CONTROLLER: Chat Viewport Engine (SIAU MASTER V250)
 * SOP: Menangani kedaulatan data percakapan dan radar status TRIPLE-CHECK.
 * SOP: Mark-as-Read Sovereignty - Otomatis menandai pesan terbaca saat aktif.
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { 
  collection, addDoc, serverTimestamp, query, doc, 
  updateDoc, limit, onSnapshot, setDoc, deleteDoc, orderBy, where, getDocs, writeBatch 
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function useChatViewportController(chatId: string) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [editingMsg, setEditingMsg] = useState<any>(null);
  const [otherTyping, setOtherTyping] = useState(false);
  
  const [searchWarga, setSearchWarga] = useState("");
  const [foundUsers, setFoundUsers] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [confirmType, setConfirmType] = useState<'clear' | 'delete' | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isNewChat = !chatId || chatId === 'new';

  const { data: myProfile } = useDoc(user && db ? doc(db, 'users', user.uid) : null, true);
  const { data: chatData, loading: chatLoading } = useDoc(db && !isNewChat ? doc(db, 'chats', chatId) : null, true);

  const otherId = useMemo(() => {
    if (!chatData || !user) return null;
    return chatData.participants?.find((p: string) => p !== user.uid);
  }, [chatData, user]);

  const [otherProfile, setOtherProfile] = useState<any>(null);
  useEffect(() => {
    if (!db || !otherId) {
      setOtherProfile(null);
      return;
    }
    const unsub = onSnapshot(doc(db, 'users', otherId), (snap) => {
      if (snap.exists()) setOtherProfile(snap.data());
    });
    return () => unsub();
  }, [db, otherId]);

  const otherInfo = useMemo(() => {
    if (isNewChat) return { name: 'Cari Warga', photo: '', id: '', role: 'member' };
    return {
      id: otherId,
      name: chatData?.participantNames?.[otherId] || otherProfile?.fullName || 'Warga Siau',
      photo: chatData?.participantPhotos?.[otherId] || otherProfile?.imageUrl || '',
      role: otherProfile?.role || 'member'
    };
  }, [chatData, otherId, otherProfile, isNewChat]);

  const messagesQuery = useMemo(() => {
    if (!db || isNewChat || !chatId) return null;
    return query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(200)
    );
  }, [db, chatId, isNewChat]);

  const { data: messages = [], loading: messagesLoading } = useCollection(messagesQuery, true);

  /**
   * SOP: MARK AS READ SOVEREIGNTY (TRIPLE-CHECK)
   * Mengubah status pesan lawan menjadi 'read' (Centang Biru) saat dibuka.
   */
  useEffect(() => {
    if (!db || !chatId || !user || isNewChat || messages.length === 0) return;

    const unreadFromOther = messages.filter(
      (m) => m.senderId !== user.uid && m.status !== 'read'
    );

    if (unreadFromOther.length > 0) {
      const batch = writeBatch(db);
      unreadFromOther.forEach((m) => {
        batch.update(doc(db, 'chats', chatId, 'messages', m.id), { status: 'read' });
      });
      // SOP: Update pangkalan chat induk
      batch.update(doc(db, 'chats', chatId), { lastMessageStatus: 'read' });
      batch.commit().catch(() => {});
    }
  }, [messages, chatId, user, db, isNewChat]);

  useEffect(() => {
    if (!isNewChat || !db || searchWarga.length < 3) {
      setFoundUsers([]);
      return;
    }
    setIsSearching(true);
    const q = query(collection(db, 'users'), limit(5));
    getDocs(q).then(snap => {
      const list = snap.docs
        .map(d => ({ ...d.data(), id: d.id }))
        .filter((u: any) => 
          u.id !== user?.uid && 
          (u.fullName?.toLowerCase().includes(searchWarga.toLowerCase()) || u.username?.toLowerCase().includes(searchWarga.toLowerCase()))
        );
      setFoundUsers(list);
      setIsSearching(false);
    });
  }, [searchWarga, isNewChat, db, user]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!db || isNewChat || !user || !chatId) return;
    const unsub = onSnapshot(doc(db, 'chats', chatId), (snap) => {
      if (snap.exists()) {
        const typingData = snap.data().typing || {};
        const isOtherTyping = Object.keys(typingData).some(uid => uid !== user?.uid && typingData[uid] === true);
        setOtherTyping(isOtherTyping);
      }
    });
    return () => unsub();
  }, [db, chatId, user, isNewChat]);

  const handleTyping = (isTyping: boolean) => {
    if (!db || isNewChat || !user || !chatId) return;
    setDoc(doc(db, 'chats', chatId), { typing: { [user.uid]: isTyping } }, { merge: true }).catch(() => {});
  };

  const handleSendMessage = async () => {
    const finalMsg = message.trim();
    if (!finalMsg || !user || !db || isNewChat || sending || !chatId) return;
    setSending(true);

    const isEdit = !!editingMsg;
    const currentReply = replyTo;
    
    setMessage('');
    setReplyTo(null);
    setEditingMsg(null);
    handleTyping(false);

    try {
      if (isEdit) {
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

        const msgRef = doc(collection(db, 'chats', chatId, 'messages'));
        await setDoc(msgRef, {
          id: msgRef.id, 
          senderId: user.uid, 
          senderName: myProfile?.fullName || 'User', 
          text: finalMsg,
          createdAt: serverTimestamp(), 
          status: 'sent', // SOP: Initial Sent Status (1 Centang)
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

  const handleReactMessage = async (mid: string, emoji: string) => {
    if (!db || isNewChat || !user || !chatId) return;
    await updateDoc(doc(db, 'chats', chatId, 'messages', mid), { [`reactions.${user.uid}`]: emoji });
    
    const targetMsg = messages.find(m => m.id === mid);
    if (targetMsg && targetMsg.senderId !== user.uid) {
      await addDoc(collection(db, 'notifications'), {
        userId: targetMsg.senderId,
        title: `Tanggapan: ${myProfile?.fullName}`,
        message: `${emoji} pada pesan Anda: "${targetMsg.text?.slice(0, 20)}..."`,
        type: 'chat_reaction',
        targetId: chatId,
        senderId: user.uid,
        senderPhoto: myProfile?.imageUrl || "",
        createdAt: serverTimestamp(),
        isOpened: false
      });
    }
  };

  const handleDeleteMessage = (mid: string) => {
    if (!db || isNewChat || !chatId) return;
    deleteDoc(doc(db, 'chats', chatId, 'messages', mid));
  };

  const handleCreateNewChat = async (targetUser: any) => {
    if (!db || !user || !myProfile) return;
    setSending(true);
    try {
      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', user.uid)
      );
      const snap = await getDocs(q);
      const existing = snap.docs.find(d => {
        const data = d.data();
        return data.type === 'cht_private' && data.participants?.includes(targetUser.id);
      });

      if (existing) {
        return existing.id;
      } else {
        const newChatRef = doc(collection(db, 'chats'));
        const newId = newChatRef.id;
        await setDoc(newChatRef, {
          id: newId,
          type: 'cht_private',
          participants: [user.uid, targetUser.id].sort(),
          participantNames: { [user.uid]: myProfile.fullName, [targetUser.id]: targetUser.fullName },
          participantPhotos: { [user.uid]: myProfile.imageUrl || '', [targetUser.id]: targetUser.imageUrl || '' },
          lastMessage: '', lastMessageSenderId: user.uid, lastMessageStatus: 'read',
          updatedAt: serverTimestamp(), createdAt: serverTimestamp()
        });
        return newId;
      }
    } catch (e) {
      return null;
    } finally { setSending(false); }
  };

  const handleClearChat = async () => {
    if (!db || !chatId || isNewChat || isProcessing) return;
    setIsProcessing(true);
    setConfirmType(null);
    try {
      const batch = writeBatch(db);
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const snap = await getDocs(messagesRef);
      snap.forEach(d => batch.delete(d.ref));
      batch.update(doc(db, 'chats', chatId), { lastMessage: '', updatedAt: serverTimestamp() });
      await batch.commit();
      toast({ title: "Pesan Dimusnahkan" });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal Membersihkan" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteChatChain = async (onComplete: () => void) => {
    if (!db || !chatId || isNewChat || isProcessing) return;
    setIsProcessing(true);
    setConfirmType(null);
    try {
      const batch = writeBatch(db);
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const snap = await getDocs(messagesRef);
      snap.forEach(d => batch.delete(d.ref));
      batch.delete(doc(db, 'chats', chatId));
      await batch.commit();
      toast({ title: "Jalur Chat Dihapus" });
      onComplete();
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal Eksekusi" });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    chatData, messages, user, otherInfo, isNewChat,
    message, setMessage, sending, replyTo, setReplyTo,
    editingMsg, setEditingMsg, otherTyping,
    scrollRef, inputRef, chatLoading, messagesLoading,
    handleSendMessage, handleReactMessage, handleDeleteMessage, handleTyping,
    searchWarga, setSearchWarga, foundUsers, isSearching, handleCreateNewChat,
    myProfile, isProcessing, handleClearChat, handleDeleteChatChain,
    confirmType, setConfirmType
  };
}
