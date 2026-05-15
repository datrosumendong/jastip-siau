"use client";

/**
 * CONTROLLER: Kurir Operations Handler (SOP V15.500 - NOTIF SYNC)
 * SOP: Penegakan Notifikasi & Sinyal WA Konfirmasi Lunas.
 */

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { 
  collection, query, where, updateDoc, doc, serverTimestamp, 
  writeBatch, getDocs, increment, addDoc, limit, getDoc
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { openWhatsAppChat } from '@/lib/whatsapp';

export function useCourierController() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [orderToBlacklist, setOrderToBlacklist] = useState<any>(null);
  
  const [rejectingOrder, setRejectingOrder] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");

  const userDocRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: profile } = useDoc(userDocRef, true);
  
  const isOnline = !!profile?.isOnline;

  const ordersQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'orders'), where('courierId', '==', user.uid));
  }, [db, user]);

  const { data: rawOrders, loading } = useCollection(ordersQuery, true);

  const activeOrders = useMemo(() => {
    if (!rawOrders) return [];
    return rawOrders.filter(o => !['completed', 'cancelled'].includes(o.status))
      .sort((a: any, b: any) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
  }, [rawOrders]);

  const handleStartShopping = async (order: any) => {
    if (!db || !user || updatingId) return;
    setUpdatingId(order.id);
    
    try {
      const orderRef = doc(db, 'orders', order.id);
      const batch = writeBatch(db);

      batch.update(orderRef, {
        status: 'shopping',
        startShoppingLat: profile?.latitude || 0,
        startShoppingLng: profile?.longitude || 0,
        updatedAt: serverTimestamp()
      });

      batch.set(doc(collection(db, 'notifications')), {
        userId: order.userId,
        title: "🛍️ Kurir Mulai Belanja",
        message: `Kurir ${profile?.fullName} sudah di lokasi belanja.`,
        type: 'order',
        targetId: order.id,
        senderPhoto: profile?.imageUrl || "",
        createdAt: serverTimestamp(),
        isOpened: false
      });

      if (order.userWhatsapp) {
        const waMsg = `🛍️ *PROSES BELANJA DIMULAI* 🛵\n\nHalo *${order.userName}* 👋,\nSaya sudah mulai memproses belanjaan Anda saat ini. Mohon pantau radar di aplikasi Jastip Siau. 🙏✨`;
        openWhatsAppChat(order.userWhatsapp, waMsg);
      }

      await batch.commit();
      toast({ title: "Status: Shopping" });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal Sinkronisasi" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusUpdate = async (order: any, nextStatus: string, cancelReason?: string) => {
    if (!db || !user || updatingId) return;
    setUpdatingId(order.id);
    
    try {
      const orderRef = doc(db, 'orders', order.id);
      const batch = writeBatch(db);

      if (nextStatus === 'confirmed') {
        batch.update(orderRef, { status: 'confirmed', updatedAt: serverTimestamp() });
        batch.set(doc(collection(db, 'notifications')), {
          userId: order.userId, title: "✅ Amanah Diterima",
          message: `Kurir ${profile?.fullName} telah menerima pesanan Anda.`,
          type: 'order', targetId: order.id, senderPhoto: profile?.imageUrl || "", createdAt: serverTimestamp(), isOpened: false
        });

        const itemsList = order.items?.map((it: string) => `• ${it}`).join('\n') || '-';
        const ketText = order.notes ? `\n📝 *KETERANGAN*: ${order.notes}` : "";

        if (order.umkmId && order.umkmWhatsapp && order.status === 'shop_accepted') {
           const waStoreMsg = `🛵 *KURIR SIAGA - JASTIP SIAU* 🛒\n\nHalo *${order.umkmName}*,\nKurir *${profile?.fullName}* telah MENERIMA pesanan *${order.userName}*.\n\n📍 *SOP*: Mohon segera siapkan produknya. Klik tombol "Produk Siap" di aplikasi jika sudah selesai agar kurir bisa menjemput. 🙏✨`;
           openWhatsAppChat(order.umkmWhatsapp, waStoreMsg);
        } else if (order.userWhatsapp) {
           const waMsg = `📢 *KONFIRMASI TERIMA AMANAH - JASTIP SIAU* 🛵\n\nHalo *${order.userName}* 👋,\nSaya *${profile?.fullName}* telah MENERIMA pesanan Anda:\n\n📦 *DAFTAR TITIPAN*:\n${itemsList}${ketText}\n\n📍 *STATUS*: Saya segera memproses pesanan Anda. Mohon pantau radar di aplikasi. 🙏✨`;
           openWhatsAppChat(order.userWhatsapp, waMsg);
        }

        await batch.commit();
        toast({ title: "Amanah Diterima" });
      }
      else if (nextStatus === 'delivered') {
        batch.update(orderRef, { status: 'delivered', updatedAt: serverTimestamp() });
        batch.set(doc(collection(db, 'notifications')), {
          userId: order.userId, title: "🛵 Kurir Sudah Sampai",
          message: "Amanah sudah tiba di lokasi pengantaran. Mohon temui kurir kami.",
          type: 'order', targetId: order.id, senderPhoto: profile?.imageUrl || "", createdAt: serverTimestamp(), isOpened: false
        });
        await batch.commit();
        toast({ title: "Tiba di Lokasi" });
      }
      else if (nextStatus === 'completed') {
        if (order.isReportedUnpaid) {
           batch.update(doc(db, 'users', order.userId), { hasActiveDebt: false });
           const debtQuery = query(collection(db, 'debts'), where('orderId', '==', order.id), where('status', '==', 'unpaid'), limit(1));
           const dSnap = await getDocs(debtQuery);
           if (!dSnap.empty) batch.update(dSnap.docs[0].ref, { status: 'paid', updatedAt: serverTimestamp() });

           // NOTIFIKASI AMNESTI (V15.500)
           batch.set(doc(collection(db, 'notifications')), {
             userId: order.userId,
             title: "✅ AKSES DIPULIHKAN",
             message: "Amanah pembayaran telah diverifikasi kurir. Akses belanja Anda kembali aktif.",
             type: 'system', createdAt: serverTimestamp(), isOpened: false
           });
        }

        batch.update(orderRef, { status: 'completed', isReportedUnpaid: false, updatedAt: serverTimestamp() });

        const now = new Date();
        const rankId = `courier_${user.uid}_${now.getFullYear()}_${now.getMonth() + 1}`;
        batch.set(doc(db, 'monthly_rankings', rankId), {
          userId: user.uid, userName: profile?.fullName, userPhoto: profile?.imageUrl || "",
          role: 'courier', orderCount: increment(1), year: now.getFullYear(), month: now.getMonth() + 1, updatedAt: serverTimestamp()
        }, { merge: true });

        const historyRef = doc(collection(db, 'users', user.uid, 'financial_history'));
        batch.set(historyRef, {
          orderId: order.id, amount: Number(order.totalAmount) || 0,
          serviceFee: Number(order.serviceFee) || 0, itemPrice: Number(order.itemPrice) || 0,
          userName: order.userName, category: 'income', createdAt: serverTimestamp()
        });

        const chatId = order.chatId || `order_${order.id}`;
        batch.delete(doc(db, 'chats', chatId));

        await batch.commit();
        toast({ title: "Amanah Selesai & Lunas" });
      } 
      else if (nextStatus === 'cancelled') {
        batch.update(orderRef, { status: 'cancelled', cancelReason: cancelReason || "Dibatalkan.", updatedAt: serverTimestamp() });
        
        // NOTIFIKASI BATAL (V15.500)
        batch.set(doc(collection(db, 'notifications')), {
          userId: order.userId, title: "❌ Pesanan Dibatalkan",
          message: `Maaf, pesanan Anda dibatalkan: ${cancelReason || 'Kendala Teknis'}.`,
          type: 'order', targetId: order.id, createdAt: serverTimestamp(), isOpened: false
        });

        if (order.userWhatsapp) {
           const waMsg = `❌ *BATAL - JASTIP SIAU* 🛍️\n\nMaaf Kak *${order.userName}* 👋,\nMohon maaf pesanan Kakak tidak dapat saya proses saat ini.\n\n📝 *ALASAN*: ${cancelReason || "Kendala teknis kurir."}\n🙏✨`;
           openWhatsAppChat(order.userWhatsapp, waMsg);
        }

        await batch.commit();
        toast({ title: "Dibatalkan" });
      } 
      else {
        await updateDoc(orderRef, { status: nextStatus, updatedAt: serverTimestamp() });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal Update" });
    } finally { setUpdatingId(null); }
  };

  const handleReportUnpaid = async () => {
    if (!db || !orderToBlacklist || !user) return;
    setUpdatingId(orderToBlacklist.id);
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'orders', orderToBlacklist.id), { isReportedUnpaid: true, updatedAt: serverTimestamp() });
      batch.update(doc(db, 'users', orderToBlacklist.userId), { hasActiveDebt: true, updatedAt: serverTimestamp() });
      
      const debtRef = doc(collection(db, 'debts'));
      batch.set(debtRef, { 
        orderId: orderToBlacklist.id, userId: orderToBlacklist.userId, courierId: user.uid, 
        courierName: profile?.fullName || "Kurir", amount: orderToBlacklist.totalAmount, 
        status: 'unpaid', createdAt: serverTimestamp() 
      });

      batch.set(doc(collection(db, 'notifications')), {
        userId: orderToBlacklist.userId, title: "🚨 AKUN DITANGGUHKAN",
        message: "Akses pemesanan Anda diblokir sementara karena laporan gagal bayar.",
        type: 'system', createdAt: serverTimestamp(), isOpened: false
      });

      await batch.commit();
      toast({ title: "Sanksi Aktif" });
      setOrderToBlacklist(null);
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal" });
    } finally { setUpdatingId(null); }
  };

  const toggleOnline = (checked: boolean) => {
    if (!userDocRef || !db) return;
    updateDoc(userDocRef, { isOnline: checked, updatedAt: serverTimestamp() });
    toast({ title: checked ? "SIAGA ONLINE" : "STATUS OFFLINE" });
  };

  return { 
    activeOrders, profile, isOnline, loading, updatingId, 
    orderToBlacklist, setOrderToBlacklist, 
    rejectingOrder, setRejectingOrder, rejectReason, setRejectReason,
    handleStatusUpdate, handleStartShopping, handleReportUnpaid, toggleOnline,
    handleCourierReject: (order: any) => setRejectingOrder(order),
    submitCourierReject: () => {
       if (!rejectingOrder || !rejectReason) return;
       handleStatusUpdate(rejectingOrder, 'cancelled', `Kurir Menolak: ${rejectReason}`);
       setRejectingOrder(null);
    }
  };
}