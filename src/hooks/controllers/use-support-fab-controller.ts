
"use client";

/**
 * CONTROLLER: Support FAB (EXCLUSIVE ADMIN DISCOVERY)
 * SOP: Mencari atau menciptakan jalur bantuan resmi dengan type: 'cht_admin'.
 * FIX: Navigasi diarahkan mutlak ke 'chat_view'.
 */

import { useState } from 'react';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp, query, collection, where, limit, getDocs } from 'firebase/firestore';
import { useView } from '@/context/view-context';

export function useSupportFabController() {
  const { user } = useUser();
  const db = useFirestore();
  const { setView, isNotifDrawerOpen, isProfilePanelOpen, currentView, forceUnlockUI } = useView();
  const [loading, setLoading] = useState(false);

  const { data: profile } = useDoc(user && db ? doc(db, 'users', user.uid) : null, true);

  const isVisible = !!profile && profile.role !== 'admin' && !isNotifDrawerOpen && !isProfilePanelOpen && !['chat_view', 'order_chat', 'member_complaint_detail'].includes(currentView);

  const handleContactAdmin = async () => {
    if (!user || !db || !profile || loading) return;
    setLoading(true);
    forceUnlockUI();

    try {
      const q = query(
        collection(db, 'chats'),
        where('type', '==', 'cht_admin'),
        where('participants', 'array-contains', user.uid),
        limit(1)
      );
      
      const snap = await getDocs(q);

      if (!snap.empty) {
        setView('chat_view', { id: snap.docs[0].id });
      } else {
        const adminQuery = query(collection(db, 'users'), where('role', '==', 'admin'), limit(1));
        const adminSnap = await getDocs(adminQuery);
        
        let adminUid = 'SYSTEM_ADMIN_NOTIF';
        let adminName = 'Pusat Bantuan Jastip';
        let adminPhoto = '';

        if (!adminSnap.empty) {
          const adminDoc = adminSnap.docs[0];
          adminUid = adminDoc.id;
          adminName = adminDoc.data().fullName || 'Admin Jastip';
          adminPhoto = adminDoc.data().imageUrl || '';
        }

        const newChatRef = doc(collection(db, 'chats'));
        await setDoc(newChatRef, {
          id: newChatRef.id,
          type: 'cht_admin', 
          participants: [user.uid, adminUid].sort(),
          participantNames: { 
            [user.uid]: profile.fullName || "Warga", 
            [adminUid]: adminName 
          },
          participantPhotos: { 
            [user.uid]: profile.imageUrl || "", 
            [adminUid]: adminPhoto 
          },
          lastMessage: "Memulai sesi bantuan resmi...",
          lastMessageSenderId: user.uid,
          lastMessageStatus: 'read',
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });

        setView('chat_view', { id: newChatRef.id });
      }
    } catch (e) {
      console.error("Support Discovery Error:", e);
    } finally {
      setLoading(false);
      setTimeout(forceUnlockUI, 150);
    }
  };

  return { isVisible, loading, handleContactAdmin };
}
