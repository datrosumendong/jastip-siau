
"use client";

/**
 * @fileOverview CONTROLLER: Admin Radar Komando (SOVEREIGN SIGNAL MASTER V5)
 * SOP: Penegakan kedaulatan siaran melalui satu jalur instruksi tunggal.
 * FIX: Menggunakan tipe khusus 'broadcast_radar' untuk menjamin akurasi pendaratan link.
 */

import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { doc, onSnapshot, serverTimestamp, collection, addDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function useAdminAutoNotifController() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Terminal Input Tunggal untuk instruksi strategis pimpinan
  const [broadcastMessage, setBroadcastMessage] = useState("");
  
  // Konfigurasi otomatis tetap bertahta di latar belakang untuk stabilitas sistem
  const [config, setConfig] = useState({
    morning: { enabled: true, message: "" },
    noon: { enabled: true, message: "" },
    evening: { enabled: true, message: "" }
  });

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, 'settings', 'auto_notif'), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as any;
        setConfig(data);
        // Default message mengambil dari referensi slot terdekat jika kosong
        if (!broadcastMessage) {
           const hour = new Date().getHours();
           if (hour < 11) setBroadcastMessage(data.morning?.message || "");
           else if (hour < 16) setBroadcastMessage(data.noon?.message || "");
           else setBroadcastMessage(data.evening?.message || "");
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, [db]);

  /**
   * ACTION: handleBroadcastNow (SOP COMMANDER STRIKE V5)
   * Menembakkan sinyal 'broadcast_radar' ke seluruh pangkalan warga.
   */
  const handleBroadcastNow = async () => {
    const finalMsg = broadcastMessage.trim();
    if (!db || !user || isPublishing || !finalMsg) return;
    
    setIsPublishing(true);
    try {
      /**
       * SOP PENYIARAN KOLEKTIF:
       * 1. Menggunakan tipe 'broadcast_radar' untuk memicu logika pendaratan akurat di frontend.
       * 2. userId 'SYSTEM_BROADCAST' memicu mesin Cloud Functions menembakkan Multicast.
       */
      await addDoc(collection(db, 'notifications'), {
        userId: 'SYSTEM_BROADCAST',
        title: "📡 RADAR KOMANDO SIAU",
        message: finalMsg,
        type: 'broadcast_radar', // Tipe khusus untuk kedaulatan link
        targetId: 'home', // Instruksi umum mendarat di pangkalan utama
        isOpened: false,
        createdAt: serverTimestamp()
      });

      toast({ 
        title: "SINYAL TERPANCAR!", 
        description: "Komando pimpinan sedang menyebar ke seluruh HP warga." 
      });
      
    } catch (e) {
      toast({ variant: "destructive", title: "Kegagalan Sinyal" });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUpdateConfig = async (newConfig: any) => {
    if (!db) return;
    try {
      await setDoc(doc(db, 'settings', 'auto_notif'), {
        ...newConfig,
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast({ title: "Otomatisasi Disimpan" });
    } catch (e) {}
  };

  return {
    config,
    broadcastMessage,
    setBroadcastMessage,
    loading,
    isPublishing,
    handleBroadcastNow,
    handleUpdateConfig
  };
}
