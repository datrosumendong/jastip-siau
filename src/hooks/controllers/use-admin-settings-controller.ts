
"use client";

/**
 * CONTROLLER: Admin Settings Handler (MVC)
 * Menangani pembaruan informasi kontak resmi dan titik GPS kantor Jastip Siau.
 */

import { useState, useEffect, useMemo } from 'react';
import { useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function useAdminSettingsController() {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const contactRef = useMemo(() => (db ? doc(db, 'settings', 'contact') : null), [db]);
  const { data: contact, loading: contactLoading } = useDoc(contactRef, true);

  const [formData, setFormData] = useState({
    whatsapp: '',
    email: '',
    address: '',
    latitude: 2.7482,
    longitude: 125.4056
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        whatsapp: contact.whatsapp || '082293110414',
        email: contact.email || 'dsumendong@gmail.com',
        address: contact.address || '',
        latitude: contact.latitude || 2.7482,
        longitude: contact.longitude || 125.4056
      });
    }
  }, [contact]);

  const handleGetGPS = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
        setLocating(false);
        toast({ title: "GPS Terkunci" });
      },
      () => setLocating(false)
    );
  };

  const handleSave = async () => {
    if (!db) return;
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'contact'), {
        ...formData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast({ title: "Info Diperbarui", description: "Halaman SOP kini menampilkan data terbaru." });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    locating,
    contactLoading,
    handleSave,
    handleGetGPS
  };
}
