
"use client";

/**
 * CONTROLLER: Partner Verification (cURL Style)
 * Mentransfer data dari 'applications' koleksi ke View Verifikasi.
 */

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useDoc } from '@/firebase';
import { collection, doc, updateDoc, serverTimestamp, addDoc, query, orderBy, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function useAdminApplicationController() {
  const db = useFirestore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const appsQuery = useMemo(() => (db ? query(collection(db, 'applications'), orderBy('createdAt', 'desc')) : null), [db]);
  const { data: rawApps, loading } = useCollection(appsQuery);

  const recruitmentRef = useMemo(() => (db ? doc(db, 'settings', 'recruitment') : null), [db]);
  const { data: recruitment } = useDoc(recruitmentRef);

  const filteredApps = useMemo(() => {
    if (!rawApps) return [];
    const s = search.toLowerCase().trim();
    if (!s) return rawApps;
    return rawApps.filter((a: any) => 
      a.userName?.toLowerCase().includes(s) || a.ktpName?.toLowerCase().includes(s)
    );
  }, [rawApps, search]);

  const handleToggleRecruitment = async () => {
    if (!db) return;
    const newState = !recruitment?.isOpen;
    await setDoc(doc(db, 'settings', 'recruitment'), { isOpen: newState, updatedAt: serverTimestamp() }, { merge: true });
    toast({ title: newState ? "Rekrutmen Dibuka" : "Rekrutmen Ditutup" });
  };

  const handleDecide = async (app: any, status: 'approved' | 'rejected') => {
    if (!db) return;
    setIsUpdating(app.id);
    try {
      await updateDoc(doc(db, 'applications', app.id), { status, updatedAt: serverTimestamp() });
      if (status === 'approved') {
        // Mapping kolom role sesuai backend.json
        await updateDoc(doc(db, 'users', app.userId), { role: app.type, updatedAt: serverTimestamp() });
      }
      await addDoc(collection(db, 'notifications'), { 
        userId: app.userId, 
        title: status === 'approved' ? "🎉 Berhasil" : "Laporan", 
        message: status === 'approved' ? `Anda kini mitra ${app.type.toUpperCase()}.` : "Lamaran ditolak Admin.", 
        type: 'application_result', 
        createdAt: serverTimestamp() 
      });
      toast({ title: "Tersimpan" });
      setSelectedApp(null);
    } finally { setIsUpdating(null); }
  };

  return { apps: filteredApps, loading, recruitment, search, setSearch, selectedApp, setSelectedApp, isUpdating, handleToggleRecruitment, handleDecide };
}
