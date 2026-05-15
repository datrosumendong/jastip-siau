"use client";

/**
 * CONTROLLER: Admin User Management (REAL-TIME SOVEREIGN ENGINE)
 * SOP: Integrasi onSnapshot murni untuk sinkronisasi database absolut.
 * FIX: Menjamin poin peringkat Mitra Hero bertahta di Vault Independen saat sengketa lunas.
 * ADD: Push Notification saat Admin memulihkan akses Member (V310).
 */

import { useState, useMemo, useEffect } from "react";
import { useFirestore, useUser } from "@/firebase";
import { 
  collection, doc, updateDoc, deleteDoc, serverTimestamp, 
  getDocs, query, where, setDoc, writeBatch, getDoc, 
  limit, increment, onSnapshot, addDoc 
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export function useAdminUserController() {
  const { user: currentUser } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<any[]>([]);
  const [allDebts, setAllDebts] = useState<any[]>([]);
  const [viewerProfile, setViewerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedUserDebts, setSelectedUserDebts] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInitiatingChat, setIsInitiatingChat] = useState(false);

  // 1. DATA MODEL: Real-time Users Stream
  useEffect(() => {
    if (!db) return;
    setLoading(true);
    const q = query(collection(db, "users"), limit(1000));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setUsers(list);
      setLoading(false);
    }, (err) => {
      console.error("User Radar Error:", err);
      setLoading(false);
    });
    return () => unsub();
  }, [db]);

  // 2. DATA MODEL: Real-time Debts Stream
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "debts"), where("status", "==", "unpaid"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setAllDebts(list);
    });
    return () => unsub();
  }, [db]);

  // 3. DATA MODEL: Viewer Profile Stream
  useEffect(() => {
    if (!db || !currentUser) return;
    const unsub = onSnapshot(doc(db, "users", currentUser.uid), (snap) => {
      if (snap.exists()) setViewerProfile(snap.data());
    });
    return () => unsub();
  }, [db, currentUser]);

  // 4. LOGIKA KEDAULATAN: Filter Pencarian Klien (Index-Free)
  const filteredUsers = useMemo(() => {
    const s = search.toLowerCase().trim();
    const list = [...users].sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    if (!s) return list;
    return list.filter(u => 
      (u.fullName || "").toLowerCase().includes(s) || 
      (u.email || "").toLowerCase().includes(s) ||
      (u.username || "").toLowerCase().includes(s) ||
      u.id.toLowerCase().includes(s)
    );
  }, [users, search]);

  /**
   * ACTION: handleResolveDebt (SOP ADMIN INTERVENTION)
   * Pelunasan paksa oleh Admin tetap menjamin kedaulatan poin peringkat Mitra.
   */
  const handleResolveDebt = async (debtId: string, userId: string) => {
    if (!db) return;
    try {
      const batch = writeBatch(db);
      const dSnap = await getDoc(doc(db, 'debts', debtId));
      if (!dSnap.exists()) return;
      const d = dSnap.data();

      // 1. SOP VAULT RANKING: Tambah Poin Hero ke Kurir
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const rankId = `courier_${d.courierId}_${year}_${month}`;
      
      batch.set(doc(db, 'monthly_rankings', rankId), {
        userId: d.courierId, 
        userName: d.courierName || "Mitra Kurir", 
        role: 'courier',
        orderCount: increment(1), 
        year, month, updatedAt: serverTimestamp()
      }, { merge: true });

      // 2. Sinkronisasi Pesanan
      batch.update(doc(db, 'orders', d.orderId), { 
        status: 'completed', 
        isReportedUnpaid: false, 
        isRanked: true, 
        updatedAt: serverTimestamp() 
      });

      // 3. Update Status Piutang
      batch.update(doc(db, 'debts', debtId), { status: 'paid', updatedAt: serverTimestamp() });

      // 4. Buka Blokir Akses Member
      const otherUnpaid = allDebts.filter(deb => deb.userId === userId && deb.status === 'unpaid' && deb.id !== debtId);
      if (otherUnpaid.length === 0) {
         batch.update(doc(db, 'users', userId), { hasActiveDebt: false });
         
         // PUSH NOTIFICATION: AKSES DIPULIHKAN (V310)
         const notifRef = doc(collection(db, 'notifications'));
         batch.set(notifRef, {
           userId: userId,
           title: "✅ AKSES DIPULIHKAN",
           message: "Admin telah memverifikasi pelunasan Anda. Akses pemesanan kini aktif kembali.",
           type: 'system', createdAt: serverTimestamp(), isOpened: false
         });
      }

      await batch.commit();
      toast({ title: "Lunas & Peringkat Terdata", description: "Poin Hero telah diamankan di Vault." });
      setSelectedUserDebts(null);
    } catch (e) { 
      console.error("Admin Resolve Error:", e);
      toast({ variant: "destructive", title: "Gagal Sinkronisasi" });
    }
  };

  const handleRoleChange = async (userId: string, currentRole: string, newRole: string) => {
    if (!db) return;
    setUpdatingId(userId);
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole, updatedAt: serverTimestamp() });
      toast({ title: "Otoritas Diperbarui", description: `User kini bertahta sebagai ${newRole.toUpperCase()}.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal Mengubah Otoritas" });
    } finally { setUpdatingId(null); }
  };

  const handleChatWithUser = async (targetUser: any) => {
    if (!currentUser || !db || isInitiatingChat) return;
    setIsInitiatingChat(true);
    const targetId = targetUser.id || targetUser.uid;

    try {
      const q = query(collection(db, 'chats'), where('type', '==', 'cht_private'), where('participants', 'array-contains', currentUser.uid));
      const snap = await getDocs(q);
      const existing = snap.docs.find(d => d.data().participants?.includes(targetId));

      if (existing) {
        setIsInitiatingChat(false);
        return existing.id;
      } else {
        const newChatRef = doc(collection(db, 'chats'));
        await setDoc(newChatRef, {
          id: newChatRef.id, type: 'cht_private', participants: [currentUser.uid, targetId].sort(),
          participantNames: { [currentUser.uid]: viewerProfile?.fullName || "Admin", [targetId]: targetUser.fullName },
          participantPhotos: { [currentUser.uid]: viewerProfile?.imageUrl || "", [targetId]: targetUser.imageUrl || "" },
          lastMessage: "Memulai sesi administratif...", lastMessageSenderId: currentUser.uid,
          lastMessageStatus: 'read', updatedAt: serverTimestamp(), createdAt: serverTimestamp()
        });
        setIsInitiatingChat(false);
        return newChatRef.id;
      }
    } catch (e) {
      setIsInitiatingChat(false);
      return null;
    }
  };

  const handleDeleteUser = async () => {
    if (!db || !userToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "users", userToDelete.id));
      toast({ title: "Akun Dimusnahkan" });
      setUserToDelete(null);
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal Menghapus" });
    } finally { setIsDeleting(false); }
  };

  return { 
    users: filteredUsers, 
    loading, 
    allDebts, 
    currentUser, 
    viewerProfile, 
    search, 
    setSearch, 
    updatingId, 
    selectedUserDebts, 
    setSelectedUserDebts, 
    userToDelete, 
    setUserToDelete, 
    isDeleting, 
    isInitiatingChat, 
    handleRoleChange, 
    handleResolveDebt, 
    handleChatWithUser,
    handleDeleteUser
  };
}
