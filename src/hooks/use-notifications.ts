
'use client';

/**
 * HOOK: Notification Aggregator (COLLECTIVE ENGINE V5)
 * SOP: Mendukung pengelompokan (grouping) sinyal berdasarkan sumber (targetId).
 */

import { useState, useEffect, useMemo } from 'react';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { collection, query, where, limit, onSnapshot, doc } from 'firebase/firestore';

export function useNotifications() {
  const { user } = useUser();
  const db = useFirestore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const userRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: profile } = useDoc(userRef, true);

  const targetIds = useMemo(() => {
    if (!user || !profile) return [];
    const ids = [user.uid, 'SYSTEM_BROADCAST'];
    if (profile.role === 'admin' || profile.role === 'owner') {
      ids.push('SYSTEM_ADMIN_NOTIF');
    }
    return ids;
  }, [user, profile]);

  useEffect(() => {
    if (!db || targetIds.length === 0) {
      if (!user) setLoading(false);
      return;
    }
    
    setLoading(true);
    const q = query(
      collection(db, 'notifications'),
      where('userId', 'in', targetIds),
      limit(200)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id }))
        .sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      
      setNotifications(list);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });

    return () => unsub();
  }, [db, targetIds, user]);

  /**
   * LOGIKA KOLEKTIF: Mengelompokkan notifikasi berdasarkan targetId (Sumber)
   */
  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: any } = {};
    
    notifications.forEach(n => {
      const gid = n.targetId || n.id; // Fallback ke id jika targetId kosong
      if (!groups[gid]) {
        groups[gid] = {
          ...n,
          count: 1,
          allIds: [n.id],
          hasUnread: !n.isOpened
        };
      } else {
        groups[gid].count += 1;
        groups[gid].allIds.push(n.id);
        if (!n.isOpened) groups[gid].hasUnread = true;
      }
    });

    return Object.values(groups).sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [notifications]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.isOpened).length, [notifications]);

  return { 
    notifications, 
    groupedNotifications,
    unreadCount, 
    loading,
    profile
  };
}
