"use client";

/**
 * CONTROLLER: Profile Management (MAHAKARYA MVC REFINED V390)
 * SOP: Menangani sinkronisasi identitas dan kendali privasi warga.
 * FIX: Menjamin penyimpanan flags privasi menggunakan nilai boolean eksplisit.
 */

import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { differenceInYears } from 'date-fns';
import { compressImage } from '@/lib/image-utils';
import { cleanWhatsAppNumber } from '@/lib/whatsapp';

export function useProfileController() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [locating, setLocating] = useState(false);

  const userDocRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: profile, loading: profileLoading } = useDoc(userDocRef, true);

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    whatsapp: '',
    address: '',
    imageUrl: '',
    bio: '',
    birthDate: '',
    gender: '',
    latitude: 0,
    longitude: 0,
    // Sovereignty Privacy Flags (Standard Boolean)
    showWhatsapp: true,
    showAddress: true,
    showAge: true,
    showGender: true,
    privateChat: false,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        fullName: profile.fullName || '',
        whatsapp: profile.whatsapp || '',
        address: profile.address || '',
        imageUrl: profile.imageUrl || '',
        bio: profile.bio || '',
        birthDate: profile.birthDate || '',
        gender: profile.gender || '',
        latitude: profile.latitude || -2.5489,
        longitude: profile.longitude || 118.0149,
        showWhatsapp: profile.showWhatsapp === true,
        showAddress: profile.showAddress === true,
        showAge: profile.showAge === true,
        showGender: profile.showGender === true,
        privateChat: profile.privateChat === true,
      });
    }
  }, [profile]);

  const handleImageChange = async (file: File) => {
    if (!file) return;
    setIsCompressing(true);
    try {
      const base64 = await compressImage(file, 400); 
      setFormData(prev => ({ ...prev, imageUrl: base64 }));
    } catch (err) {
      toast({ variant: "destructive", title: "Gagal kompresi" });
    } finally { setIsCompressing(false); }
  };

  const handleSave = async () => {
    if (!userDocRef || !user || !db) return;
    setLoading(true);
    
    const newUsername = formData.username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');

    if (newUsername && newUsername !== profile?.username) {
      const registryRef = doc(db, 'usernames', newUsername);
      const registrySnap = await getDoc(registryRef);
      if (registrySnap.exists() && registrySnap.data().uid !== user.uid) {
        toast({ title: "Username Terpakai", variant: "destructive" });
        setLoading(false);
        return;
      }
      await setDoc(registryRef, { uid: user.uid });
    }

    const sanitizedWA = cleanWhatsAppNumber(formData.whatsapp);
    const age = formData.birthDate ? differenceInYears(new Date(), new Date(formData.birthDate)) : profile?.age || 0;
    
    try {
      // SOP: Simpan flags privasi secara eksplisit boolean
      await setDoc(userDocRef, { 
        ...formData, 
        username: newUsername,
        whatsapp: sanitizedWA,
        age: age, 
        showWhatsapp: Boolean(formData.showWhatsapp),
        showAddress: Boolean(formData.showAddress),
        showAge: Boolean(formData.showAge),
        showGender: Boolean(formData.showGender),
        privateChat: Boolean(formData.privateChat),
        updatedAt: serverTimestamp() 
      }, { merge: true });
      toast({ title: "Identitas Disimpan" });
    } catch (err) {
      toast({ title: "Gagal Menyimpan", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleGetGPS = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setFormData(prev => ({ ...prev, latitude: p.coords.latitude, longitude: p.coords.longitude }));
        setLocating(false);
        toast({ title: "GPS Terkunci" });
      },
      () => setLocating(false)
    );
  };

  return { profile, profileLoading, user, formData, setFormData, loading, isCompressing, locating, handleImageChange, handleSave, handleGetGPS };
}
