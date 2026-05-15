"use client";

/**
 * CONTROLLER: Logika Riwayat Pesanan Member (SOP V530 REFINED)
 * SOP: Penegakan peringkat Warga Teladan saat memberi ulasan.
 * FIX: Testimoni dikirim ke Vault Independen dengan status 'pending'.
 */

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { 
  collection, query, where, doc, updateDoc, 
  serverTimestamp, setDoc, writeBatch, increment 
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function useMemberOrderController() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [testiMessage, setTestiMessage] = useState('');
  const [testiRating, setTestiRating] = useState(5);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const userRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: profile } = useDoc(userRef, true);

  const ordersQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'orders'), where('userId', '==', user.uid));
  }, [db, user]);

  const { data: rawOrders = [], loading } = useCollection(ordersQuery, true);

  const orders = useMemo(() => {
    return [...rawOrders].sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [rawOrders]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAll = (v: any) => {
    setSelectedIds(v ? orders.map((o: any) => o.id) : []);
  };

  const executeDelete = async () => {
    if (!db || selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      const batch = writeBatch(db);
      selectedIds.forEach(id => {
        batch.delete(doc(db, 'orders', id));
      });
      await batch.commit();
      toast({ title: "Riwayat Dibersihkan" });
      setSelectedIds([]);
      setShowDeleteConfirm(false);
    } finally { setIsDeleting(false); }
  };

  /**
   * ACTION: handleSendTestimonial (SOP VAULT INDEPENDEN)
   * Menanamkan data ulasan ke koleksi 'testimonials' secara mandiri.
   */
  const handleSendTestimonial = async () => {
    if (!db || !user || !selectedOrder || !testiMessage.trim()) return;
    
    setIsSubmitting(true);
    const batch = writeBatch(db);
    
    // 1. VAULT TESTIMONI: Bertahta di database khusus dengan status PENDING
    const testiRef = doc(db, 'testimonials', selectedOrder.id);
    batch.set(testiRef, {
      id: selectedOrder.id, 
      userId: user.uid, 
      userName: profile?.fullName || 'Warga Siau', 
      userPhoto: profile?.imageUrl || '',
      message: testiMessage.trim(), 
      rating: testiRating, 
      status: 'pending', // SOP: Status eksplisit untuk audit admin
      isApproved: false, 
      createdAt: serverTimestamp(),
      courierId: selectedOrder.courierId, 
      courierName: selectedOrder.courierName,
      courierPhoto: selectedOrder.courierPhoto || ''
    });

    // 2. FLAG OPERASIONAL: Menandai order di tabel order
    batch.update(doc(db, 'orders', selectedOrder.id), { hasTestimonial: true });

    // 3. RANKING VAULT
    const now = new Date();
    const memberRankId = `member_${user.uid}_${now.getFullYear()}_${now.getMonth() + 1}`;
    batch.set(doc(db, 'monthly_rankings', memberRankId), {
      userId: user.uid, userName: profile?.fullName, userPhoto: profile?.imageUrl || "",
      role: 'member', orderCount: increment(1), year: now.getFullYear(), month: now.getMonth() + 1, updatedAt: serverTimestamp()
    }, { merge: true });

    try {
      await batch.commit();
      toast({ title: "Apresiasi Terkirim", description: "Ulasan kini masuk antrean moderasi Admin." });
      setIsDialogOpen(false);
      setTestiMessage('');
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal Mengirim" });
    } finally { setIsSubmitting(false); }
  };

  return { 
    orders, loading, testiMessage, setTestiMessage, testiRating, setTestiRating, 
    selectedOrder, setSelectedOrder, isSubmitting, isDialogOpen, setIsDialogOpen, 
    handleSendTestimonial, selectedIds, toggleSelect, selectAll, 
    showDeleteConfirm, setShowDeleteConfirm, isDeleting, executeDelete
  };
}