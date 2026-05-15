"use client";

/**
 * CONTROLLER: Admin Apps (Audit Pelamar)
 * Logika verifikasi calon kurir dan UMKM warga Siau.
 */

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useDoc } from '@/firebase';
import { collection, doc, updateDoc, serverTimestamp, addDoc, query, orderBy, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function useAdminAppsController() {
  const db = useFirestore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const appsQuery = useMemo(() => (db ? query(collection(db, 'applications'), orderBy('createdAt', 'desc')) : null), [db]);
  const { data: rawApps, loading } = useCollection(appsQuery, true);

  const recruitmentRef = useMemo(() => (db ? doc(db, 'settings', 'recruitment') : null), [db]);
  const { data: recruitment } = useDoc(recruitmentRef, true);

  const filteredApps = useMemo(() => {
    if (!rawApps) return [];
    const s = search.toLowerCase().trim();
    if (!s) return rawApps;
    return rawApps.filter((a: any) => 
      (a.userName || "").toLowerCase().includes(s) || (a.ktpName || "").toLowerCase().includes(s)
    );
  }, [rawApps, search]);

  const handleToggleRecruitment = async () => {
    if (!db) return;
    const newState = !recruitment?.isOpen;
    await setDoc(doc(db, 'settings', 'recruitment'), { isOpen: newState, updatedAt: serverTimestamp() }, { merge: true });
    toast({ title: newState ? "Rekrutmen Dibuka" : "Rekrutmen Ditutup" });
  };

  const handleDecide = async (app: any, status: 'approved' | 'rejected') => {
    if (!db || isUpdating) return;
    setIsUpdating(app.id);
    try {
      await updateDoc(doc(db, 'applications', app.id), { status, updatedAt: serverTimestamp() });
      if (status === 'approved') {
        await updateDoc(doc(db, 'users', app.userId), { role: app.type, updatedAt: serverTimestamp() });
      }
      await addDoc(collection(db, 'notifications'), { 
        userId: app.userId, 
        title: status === 'approved' ? "🚀 Lamaran Disetujui" : "Audit Berkas Selesai", 
        message: status === 'approved' ? `Selamat! Anda resmi menjadi mitra ${app.type.toUpperCase()} Jastip Siau.` : "Maaf, lamaran Anda belum memenuhi kriteria kami saat ini.", 
        type: 'application_result', 
        createdAt: serverTimestamp() 
      });
      toast({ title: "Status Disimpan" });
      setSelectedApp(null);
    } finally { setIsUpdating(null); }
  };

  return { 
    apps: filteredApps, loading, recruitment, search, setSearch, 
    selectedApp, setSelectedApp, isUpdating, 
    handleToggleRecruitment, handleDecide 
  };
}
