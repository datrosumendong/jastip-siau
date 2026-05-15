"use client";

/**
 * CONTROLLER: Admin User Management (MVC Logic)
 * Menangani otoritas, role, dan pelunasan tunggakan warga Siau.
 */

import { useState, useMemo } from "react";
import { useCollection, useFirestore, useUser, useDoc } from "@/firebase";
import { collection, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export function useAdminUserMgmtController() {
  const { user: currentUser } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedUserDebts, setSelectedUserDebts] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // DATA ACCESS (MODEL)
  const usersQuery = useMemo(() => (db ? collection(db, "users") : null), [db]);
  const { data: rawUsers, loading } = useCollection(usersQuery, true);

  const debtsQuery = useMemo(() => (db ? collection(db, "debts") : null), [db]);
  const { data: allDebts } = useCollection(debtsQuery, true);

  const viewerDocRef = useMemo(() => (db && currentUser ? doc(db, "users", currentUser.uid) : null), [db, currentUser]);
  const { data: viewerProfile } = useDoc(viewerDocRef, true);

  const filteredUsers = useMemo(() => {
    if (!rawUsers) return [];
    const s = search.toLowerCase().trim();
    const list = [...rawUsers].sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    if (!s) return list;
    return list.filter((u: any) => 
      (u.fullName || "").toLowerCase().includes(s) || 
      (u.email || "").toLowerCase().includes(s) ||
      (u.username || "").toLowerCase().includes(s)
    );
  }, [rawUsers, search]);

  // ACTIONS (MUTATIONS)
  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!db) return;
    setUpdatingId(userId);
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole, updatedAt: serverTimestamp() });
      toast({ title: "Otoritas Diperbarui", description: `User kini menjadi ${newRole.toUpperCase()}.` });
    } finally { setUpdatingId(null); }
  };

  const handleResolveDebt = async (debtId: string, userId: string) => {
    if (!db) return;
    await updateDoc(doc(db, 'debts', debtId), { status: 'paid', updatedAt: serverTimestamp() });
    const userUnpaid = (allDebts || []).filter(d => d.userId === userId && d.status === 'unpaid' && d.id !== debtId);
    if (userUnpaid.length === 0) await updateDoc(doc(db, 'users', userId), { hasActiveDebt: false });
    toast({ title: "Lunas", description: "Akses member telah dipulihkan." });
    setSelectedUserDebts(null);
  };

  const handleDeleteUser = async () => {
    if (!db || !userToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "users", userToDelete.id));
      toast({ title: "User Dihapus", description: "Data telah dibersihkan secara permanen." });
    } finally { setIsDeleting(false); setUserToDelete(null); }
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
    handleRoleChange,
    handleResolveDebt,
    handleDeleteUser
  };
}
