
'use client';

/**
 * CONTROLLER: Notifications Real-time Handler (SOP DEEP PURGE V13.300)
 * SOP: Penegakan kedaulatan pendaratan dinamis untuk membasmi galat 'link salah'.
 * FIX: Menjamin pendaratan 'broadcast_radar' tetap di pangkalan utama (Home).
 */

import { useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { doc, writeBatch, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useView } from '@/context/view-context';
import { useNotifications } from '@/hooks/use-notifications';

export function useNotificationsController() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const { setView, forceUnlockUI } = useView();

  const { notifications, profile, loading } = useNotifications();

  const [deleting, setDeleting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = (checked: boolean) => {
    setSelectedIds(checked ? notifications.map(n => n.id) : []);
  };

  const handleDeleteSelected = async () => {
    if (!db || selectedIds.length === 0 || deleting) return;
    setDeleting(true);
    try {
      const batch = writeBatch(db);
      selectedIds.forEach((id) => {
        batch.delete(doc(db, 'notifications', id));
      });
      await batch.commit();
      setSelectedIds([]);
      toast({ title: "Radar Dibersihkan" });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal" });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!db || notifications.length === 0 || deleting) return;
    setDeleting(true);
    try {
      const batch = writeBatch(db);
      notifications.forEach(n => {
        batch.delete(doc(db, 'notifications', n.id));
      });
      await batch.commit();
      toast({ title: "Radar Dikosongkan" });
    } finally { setDeleting(false); }
  };

  const handleDeleteSingle = async (id: string) => {
    if (!db || deleting) return;
    try {
      await deleteDoc(doc(db, 'notifications', id));
      toast({ title: "Sinyal Dimusnahkan" });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal" });
    }
  };

  /**
   * ACTION: handleOpenNotification (SOP NAVIGATION SUPREMACY)
   * Menjamin pendaratan akurat tanpa tergantung pada link statis dari server.
   */
  const handleOpenNotification = async (n: any) => {
    if (!db || !user || isValidating) return;
    
    const targetId = n.targetId;
    const type = n.type || '';
    const isStaff = profile?.role === 'admin' || profile?.role === 'owner';
    
    setIsValidating(true);
    forceUnlockUI(); 

    try {
      if (!n.isOpened) {
        const batch = writeBatch(db);
        const relatedUnread = notifications.filter(notif => 
          !notif.isOpened && 
          (notif.targetId === targetId || (notif.id === n.id && !notif.targetId))
        );
        
        relatedUnread.forEach(notif => {
          batch.update(doc(db, 'notifications', notif.id), { 
            isOpened: true, 
            openedAt: serverTimestamp() 
          });
        });
        
        await batch.commit().catch(() => {});
      }

      // RADAR PENDARATAN BERDAULAT
      if (!targetId || type === 'system' || type === 'broadcast_radar') {
        setView('home');
        return;
      }

      const chatTypes = ['chat', 'cht_private', 'cht_toko', 'cht_admin', 'cht_order', 'order_chat', 'chat_reaction'];
      const orderTypes = ['order', 'umkm_order'];
      const complaintTypes = ['complaint', 'admin_sanction', 'payment_issue', 'admin_complaint'];

      if (type === 'news') {
        setView('news', { postId: targetId });
      }
      else if (chatTypes.some(t => type.includes(t))) {
        setView('chat_view', { id: targetId });
      } 
      else if (orderTypes.some(t => type.includes(t))) {
        setView('order_detail', { id: targetId });
      } 
      else if (complaintTypes.some(t => type.includes(t))) {
        if (isStaff) setView('admin_complaint_detail', { id: targetId });
        else setView('member_complaint_detail', { id: targetId });
      } 
      else if (type.includes('post')) {
        setView('community', { postId: targetId });
      }
      else {
        setView('home');
      }
    } catch (e) {
      setView('home');
    } finally {
      setIsValidating(false);
      setTimeout(forceUnlockUI, 200);
    }
  };

  return {
    notifications,
    loading,
    selectedIds,
    deleting,
    isValidating, 
    handleOpenNotification,
    handleDeleteSingle,
    handleDeleteAll,
    toggleSelect,
    selectAll,
    handleDeleteSelected
  };
}
