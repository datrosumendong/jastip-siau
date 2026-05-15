"use client";

/**
 * CONTROLLER: Courier Unpaid Logic (VAULT RANKING REFINED V765)
 * SOP: Pelunasan sengketa menambah poin peringkat kurir dan MENCATAT sejarah keuangan permanen.
 * FIX: Menjamin laba jasa dari sengketa lunas tetap bertahta di laporan keuangan.
 * ADD: Pemulihan blokir member otomatis & Notifikasi Akses Dipulihkan (SOP V765).
 */

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser, useDoc } from '@/firebase';
import { 
  collection, query, where, doc, serverTimestamp, 
  getDocs, limit, writeBatch, increment, addDoc, getDoc 
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function useCourierUnpaidController() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const userDocRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: profile } = useDoc(userDocRef, true);

  const unpaidOrdersQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'orders'), where('courierId', '==', user.uid), where('isReportedUnpaid', '==', true));
  }, [db, user]);

  const { data: rawUnpaid, loading } = useCollection(unpaidOrdersQuery, true);

  const unpaidOrders = useMemo(() => {
    if (!rawUnpaid) return [];
    return rawUnpaid.filter(o => !['completed', 'cancelled'].includes(o.status));
  }, [rawUnpaid]);

  /**
   * ACTION: handleResolve (SOP V765 - AMNESTY ENGINE)
   * Menangani pelunasan sengketa dengan audit blokir otomatis.
   */
  const handleResolve = async (order: any) => {
    if (!db || !user || updatingId) return;
    setUpdatingId(order.id);
    
    try {
      const batch = writeBatch(db);
      const orderRef = doc(db, 'orders', order.id);
      const memberRef = doc(db, 'users', order.userId);
      
      // 1. SOP VAULT RANKING: Amankan Poin Kurir (Rank Hero)
      if (!order.isRanked) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const rankId = `courier_${user.uid}_${year}_${month}`;
        
        batch.set(doc(db, 'monthly_rankings', rankId), {
          userId: user.uid, 
          userName: profile?.fullName || "Mitra Kurir", 
          userPhoto: profile?.imageUrl || "",
          role: 'courier', 
          orderCount: increment(1), 
          year, month, updatedAt: serverTimestamp()
        }, { merge: true });

        batch.update(orderRef, { isRanked: true });
      }

      // 2. Update Status Pesanan ke Selesai
      batch.update(orderRef, { status: 'completed', isReportedUnpaid: false, updatedAt: serverTimestamp() });
      
      // 3. Update Status Piutang (Koleksi Debts)
      const debtQuery = query(collection(db, 'debts'), where('orderId', '==', order.id), where('status', '==', 'unpaid'), limit(1));
      const debtSnap = await getDocs(debtQuery);
      if (!debtSnap.empty) batch.update(debtSnap.docs[0].ref, { status: 'paid', updatedAt: serverTimestamp() });

      // 4. SOP AMNESTI OTOMATIS: Audit Sisa Tunggakan Member secara Fisik
      const allUserDebtsQ = query(collection(db, 'debts'), where('userId', '==', order.userId), where('status', '==', 'unpaid'));
      const allUserDebtsSnap = await getDocs(allUserDebtsQ);
      
      // Filter sisa tunggakan yang bukan milik order ini
      const remainingUnpaid = allUserDebtsSnap.docs.filter(d => d.data().orderId !== order.id);
      
      if (remainingUnpaid.length === 0) {
        // Pemulihan kedaulatan akses member secara absolut jika tidak ada hutang lain
        batch.update(memberRef, { hasActiveDebt: false, updatedAt: serverTimestamp() });
        
        // Kirim sinyal kabar baik ke HP Member
        batch.set(doc(collection(db, 'notifications')), {
          userId: order.userId,
          title: "✅ AKSES DIPULIHKAN",
          message: "Amanah pembayaran telah terverifikasi. Fitur belanja Anda kembali aktif. Terima kasih!",
          type: 'system',
          isOpened: false,
          createdAt: serverTimestamp()
        });
      }

      // 5. SOP FINANCIAL VAULT: Catat Pendapatan Jasa Permanen
      const historyRef = doc(collection(db, 'users', user.uid, 'financial_history'));
      batch.set(historyRef, {
        orderId: order.id,
        amount: Number(order.totalAmount) || 0,
        serviceFee: Number(order.serviceFee) || 0,
        itemPrice: Number(order.itemPrice) || 0,
        userName: order.userName,
        description: `Pelunasan Sanksi: ${order.id.slice(-6)}`,
        category: 'income',
        createdAt: serverTimestamp()
      });

      // 6. SOP CHAT PURGE: Musnahkan jalur sengketa karena sengketa telah tuntas
      const chatId = order.chatId || `order_${order.id}`;
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const msgsSnap = await getDocs(messagesRef);
      msgsSnap.forEach(m => batch.delete(m.ref));
      batch.delete(doc(db, 'chats', chatId));

      await batch.commit();
      toast({ title: "Amnesti Berhasil", description: "Blokir member dibuka & Peringkat tersimpan." });
    } catch (e) {
      console.error("[AMNESTY ERROR]:", e);
      toast({ title: "Gagal Eksekusi Amnesti", variant: "destructive" });
    } finally { setUpdatingId(null); }
  };

  return { unpaidOrders, loading, updatingId, handleResolve };
}
