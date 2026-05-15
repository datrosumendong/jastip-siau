"use client";

import { useState, useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, writeBatch, query, orderBy, where, getDocs, limit } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

/**
 * CONTROLLER: Admin Monitoring Order (V540 REFINED)
 * Logika pengawasan seluruh transaksi logistik Siau.
 * FIX: Menjamin ulasan warga (Testimonials) & Poin Ranking tetap bertahta permanen meskipun order dihapus.
 */
export function useAdminOrdersController() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedOrderForSanction, setSelectedOrderForSanction] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const ordersQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "orders"), orderBy("createdAt", sortOrder === 'newest' ? 'desc' : 'asc'));
  }, [db, sortOrder]);

  const { data: rawOrders, loading } = useCollection(ordersQuery, true);

  const filteredOrders = useMemo(() => {
    if (!rawOrders) return [];
    const s = search.toLowerCase().trim();
    if (!s) return rawOrders;
    return rawOrders.filter(o => 
      (o.userName || "").toLowerCase().includes(s) || 
      (o.id || "").toLowerCase().includes(s)
    );
  }, [rawOrders, search]);

  const toggleSelect = (id: string) => 
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const selectAll = (checked: boolean) => 
    setSelectedIds(checked ? filteredOrders.map(o => o.id) : []);

  /**
   * ACTION: executeBulkDelete (SOP V540)
   * Pemusnahan atomik untuk membersihkan pangkalan data tanpa merusak reputasi mitra.
   */
  const executeBulkDelete = async () => {
    if (!db || selectedIds.length === 0 || isDeleting) return;
    setIsDeleting(true);
    try {
      for (const orderId of selectedIds) {
        const batch = writeBatch(db);
        
        // 1. Musnahkan Order Saja (Testimoni dikecualikan demi Kedaulatan Reputasi)
        batch.delete(doc(db, 'orders', orderId));

        // 2. Musnahkan Jalur Chat & Pesan
        const chatQuery = query(collection(db, 'chats'), where('orderId', '==', orderId), limit(5));
        const chatSnap = await getDocs(chatQuery);

        for (const chatDoc of chatSnap.docs) {
          const chatId = chatDoc.id;
          const msgsSnap = await getDocs(collection(db, 'chats', chatId, 'messages'));
          msgsSnap.forEach(m => batch.delete(m.ref));
          batch.delete(chatDoc.ref);
        }
        
        await batch.commit();
      }
      
      toast({ title: "Radar Bersih", description: `${selectedIds.length} data order dimusnahkan. Testimoni warga aman di Vault.` });
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
    } catch (e) {
      console.error("Deep Purge Failure:", e);
      toast({ variant: "destructive", title: "Gagal Pemusnahan" });
    } finally { 
      setIsDeleting(false); 
    }
  };

  const applySanction = async () => {
    if (!db || !selectedOrderForSanction) return;
    await addDoc(collection(db, 'complaints'), {
      orderId: selectedOrderForSanction.id, 
      userId: selectedOrderForSanction.userId, 
      userName: selectedOrderForSanction.userName,
      reason: "Audit Admin: Monitoring operasional kurir terdeteksi memerlukan investigasi.", 
      status: 'open', 
      type: 'admin_sanction',
      courierId: selectedOrderForSanction.courierId, 
      courierName: selectedOrderForSanction.courierName,
      createdAt: serverTimestamp(), 
      updatedAt: serverTimestamp()
    });
    toast({ title: "Investigasi Dimulai" });
    setSelectedOrderForSanction(null);
  };

  return {
    orders: filteredOrders,
    loading,
    search,
    setSearch,
    sortOrder,
    setSortOrder,
    selectedIds,
    toggleSelect,
    selectAll,
    selectedOrderForSanction,
    setSelectedOrderForSanction,
    isDeleting,
    showBulkDeleteConfirm,
    setShowBulkDeleteConfirm,
    executeBulkDelete,
    applySanction
  };
}
