"use client";

/**
 * @fileOverview CONTROLLER: Admin Testimonial Moderator (SOP VAULT REFINED V600)
 * SOP: Mengelola antrean moderasi dan pemusnahan ulasan secara fisik.
 * FIX: Mencabut confirm() browser yang sering terblokir dan menggantinya dengan UI-driven deletion.
 */

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc, serverTimestamp, onSnapshot, query, limit } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function useAdminTestimonialController() {
  const db = useFirestore();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const [pending, setPending] = useState<any[]>([]);
  const [approved, setApproved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;

    const q = query(collection(db, 'testimonials'), limit(500));
    
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      
      // SOP: Pisahkan antrean moderasi secara real-time berdasarkan status kedaulatan
      const pList = all.filter((t: any) => t.status === 'pending' || (t.isApproved === false && t.status !== 'rejected'))
        .sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        
      const aList = all.filter((t: any) => t.status === 'approved' || t.isApproved === true)
        .sort((a: any, b: any) => (b.approvedAt?.seconds || b.createdAt?.seconds || 0) - (a.approvedAt?.seconds || b.createdAt?.seconds || 0));
      
      setPending(pList);
      setApproved(aList);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });

    return () => unsub();
  }, [db]);

  /**
   * ACTION: handleApprove (SOP PUBLISH)
   */
  const handleApprove = async (id: string) => {
    if (!db || updatingId) return;
    setUpdatingId(id);
    try {
      await updateDoc(doc(db, 'testimonials', id), { 
        status: 'approved',
        isApproved: true, 
        approvedAt: serverTimestamp() 
      });
      toast({ title: "Amanah Dipublikasikan" });
    } finally { setUpdatingId(null); }
  };

  /**
   * ACTION: handleReject (SOP REJECT)
   */
  const handleReject = async (id: string) => {
    if (!db || updatingId) return;
    setUpdatingId(id);
    try {
      await updateDoc(doc(db, 'testimonials', id), { 
        status: 'rejected',
        isApproved: false,
        rejectedAt: serverTimestamp()
      });
      toast({ title: "Ulasan Ditolak" });
    } finally { setUpdatingId(null); }
  };

  /**
   * ACTION: handleFinalDelete (SOP DEEP PURGE)
   * Eksekusi pemusnahan fisik ulasan dari database.
   */
  const handleFinalDelete = async (id: string) => {
    if (!db || updatingId) return;
    setUpdatingId(id);
    try {
      await deleteDoc(doc(db, 'testimonials', id));
      toast({ title: "Ulasan Dimusnahkan", description: "Data dihapus permanen dari Vault." });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal Eksekusi" });
    } finally { setUpdatingId(null); }
  };

  return {
    pending,
    approved,
    loading,
    updatingId,
    handleApprove,
    handleReject,
    handleFinalDelete
  };
}
