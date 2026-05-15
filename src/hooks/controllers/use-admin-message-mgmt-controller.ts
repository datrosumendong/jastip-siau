"use client";

/**
 * @fileOverview CONTROLLER: Admin Message Forensic Audit (SIAU MASTER TERMINAL V400)
 * SOP: Deep Root Deletion - Memusnahkan Jalur Chat & Log Pesan sampai ke akarnya.
 * PENTING: Vault Testimoni tetap kebal dari proses pembersihan ini.
 */

import { useState, useMemo, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { 
  collection, doc, writeBatch, getDocs, query, 
  onSnapshot, limit, where 
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function useAdminMessageMgmtController() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const [chats, setChats] = useState<any[]>([]);
  const [auditMessages, setAuditMessages] = useState<any[]>([]);
  const [activeAuditId, setActiveAuditId] = useState<string | null>(null);
  
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!db) return;
    setChatsLoading(true);
    const q = query(collection(db, 'chats'), limit(500));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id }))
        .sort((a: any, b: any) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
      setChats(list);
      setChatsLoading(false);
    });
    return () => unsub();
  }, [db]);

  useEffect(() => {
    if (!db || !activeAuditId) { setAuditMessages([]); return; }
    setLoadingMessages(true);
    const q = query(collection(db, 'chats', activeAuditId, 'messages'), limit(500));
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ ...d.data(), id: d.id }))
        .sort((a: any, b: any) => (a.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setAuditMessages(msgs);
      setLoadingMessages(false);
    });
    return () => unsub();
  }, [db, activeAuditId]);

  const filteredChats = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return chats;
    return chats.filter((c: any) => JSON.stringify(c).toLowerCase().includes(s) || c.id.toLowerCase().includes(s));
  }, [chats, search]);

  const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const selectAll = (v: boolean) => setSelectedIds(v ? filteredChats.map((c: any) => c.id) : []);

  /**
   * ACTION: executeDelete (SOP DEEP ROOT PURGE)
   * Memusnahkan jejak percakapan secara fisik dari database.
   */
  const executeDelete = async () => {
    if (!db || selectedIds.length === 0 || isDeleting) return;
    setIsDeleting(true);
    setShowConfirm(false);

    try {
      for (const chatId of selectedIds) {
        const batch = writeBatch(db);
        const chatDoc = chats.find(c => c.id === chatId);
        
        // 1. Musnahkan Order Shadow (Hanya tabel order operasional)
        if (chatDoc?.orderId) {
          batch.delete(doc(db, 'orders', chatDoc.orderId));
        }

        // 2. Musnahkan Log Pesan Anak (Recursive)
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const msgsSnap = await getDocs(messagesRef);
        msgsSnap.forEach(mDoc => batch.delete(mDoc.ref));
        
        // 3. Musnahkan Induk Jalur Chat
        batch.delete(doc(db, 'chats', chatId));
        
        // CATATAN: Testimoni di koleksi 'testimonials' tetap aman karena tidak memiliki relasi fisik penghapusan di sini.
        await batch.commit();
      }

      toast({ title: "Audit Tuntas", description: `${selectedIds.length} Jalur & Log Pesan dimusnahkan secara fisik.` });
      setSelectedIds([]);
      if (activeAuditId && selectedIds.includes(activeAuditId)) setActiveAuditId(null);
    } catch (e: any) {
      toast({ title: "Gagal Eksekusi", variant: "destructive" });
    } finally { setIsDeleting(false); }
  };

  return {
    chats: filteredChats, chatsLoading, auditMessages, loadingMessages,
    activeAuditId, setActiveAuditId, search, setSearch,
    selectedIds, toggleSelect, selectAll, showConfirm, setShowConfirm,
    isDeleting, executeDelete
  };
}