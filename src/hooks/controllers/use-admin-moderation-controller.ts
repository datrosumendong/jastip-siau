"use client";

/**
 * CONTROLLER: Admin Moderasi Konten
 * SOP: Index-Free Client-side Sorting.
 */

import { useState, useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, updateDoc, serverTimestamp, writeBatch, getDocs, query, where, limit } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function useAdminModerationController() {
  const db = useFirestore();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const postsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'posts'), where('isHidden', '==', true), limit(100));
  }, [db]);

  const { data: rawFlagged = [], loading } = useCollection(postsQuery, true);

  const flaggedPosts = useMemo(() => {
    return [...rawFlagged].sort((a: any, b: any) => (b.reportedAt?.seconds || 0) - (a.reportedAt?.seconds || 0));
  }, [rawFlagged]);

  const handleRestore = async (postId: string) => {
    if (!db) return;
    setUpdatingId(postId);
    try {
      await updateDoc(doc(db, 'posts', postId), { isHidden: false, reportReason: null, updatedAt: serverTimestamp() });
      toast({ title: "Konten Dipulihkan", description: "Postingan kembali tampil di feed publik." });
    } finally { setUpdatingId(null); }
  };

  const handleDelete = async (postId: string) => {
    if (!db || !confirm("Musnahkan postingan ini secara permanen?")) return;
    setUpdatingId(postId);
    try {
      const batch = writeBatch(db);
      const comms = await getDocs(collection(db, 'posts', postId, 'comments'));
      comms.forEach(c => batch.delete(c.ref));
      batch.delete(doc(db, 'posts', postId));
      await batch.commit();
      toast({ title: "Konten Dimusnahkan" });
    } finally { setUpdatingId(null); }
  };

  return { flaggedPosts, loading, updatingId, handleRestore, handleDelete };
}
