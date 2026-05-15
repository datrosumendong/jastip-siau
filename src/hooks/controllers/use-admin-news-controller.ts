
"use client";

/**
 * @fileOverview CONTROLLER: Admin News Editor (SIAU MASTER REDAKSI V25.000)
 * SOP: Menangani mutlak kedaulatan penulisan berita dengan sistem CMS Blog.
 * FIX: Penambahan field isHeadline untuk kendali radar berita warga.
 */

import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { 
  collection, addDoc, serverTimestamp, doc, 
  updateDoc, deleteDoc, query, orderBy, limit, onSnapshot 
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { compressImage } from '@/lib/image-utils';

export function useAdminNewsController() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isInputOpen, setIsInputOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'info',
    imageUrl: '',
    labels: [] as string[],
    isHeadline: false
  });

  const [currentLabel, setCurrentLabel] = useState("");

  const userRef = useMemo(() => (user && db ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: myProfile } = useDoc(userRef, true);

  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      setNewsList(snap.docs.map(d => ({ ...d.data(), id: d.id })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [db]);

  const handleImageInput = async (file: File) => {
    if (!file) return;
    setIsCompressing(true);
    try {
      const base64 = await compressImage(file, 1200, 0.7); 
      setFormData(prev => ({ ...prev, imageUrl: base64 }));
      toast({ title: "Citra Redaksi Siap" });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal memproses gambar" });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleAddLabel = () => {
    if (!currentLabel.trim()) return;
    const cleanLabel = currentLabel.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    if (cleanLabel && !formData.labels.includes(cleanLabel)) {
      setFormData(prev => ({ ...prev, labels: [...(prev.labels || []), cleanLabel] }));
    }
    setCurrentLabel("");
  };

  const handleRemoveLabel = (label: string) => {
    setFormData(prev => ({ ...prev, labels: (prev.labels || []).filter(l => l !== label) }));
  };

  const handleSaveNews = async () => {
    if (!db || !user || !formData.title || !formData.content) return;
    setSubmitting(true);

    const newsData = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      category: formData.category,
      imageUrl: formData.imageUrl,
      labels: formData.labels || [],
      isHeadline: Boolean(formData.isHeadline),
      authorId: user.uid,
      authorName: myProfile?.fullName || "Admin Developer",
      authorRole: myProfile?.role || "admin",
      updatedAt: serverTimestamp()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'news', editingId), newsData);
        toast({ title: "Arsip Diperbarui" });
      } else {
        const newsRef = await addDoc(collection(db, 'news'), {
          ...newsData,
          createdAt: serverTimestamp()
        });

        await addDoc(collection(db, 'notifications'), {
          userId: 'SYSTEM_BROADCAST',
          title: newsData.isHeadline ? "🔥 HEADLINE JASTIP SIAU" : "🗞️ Kabar Developer",
          message: formData.title,
          type: 'news',
          targetId: newsRef.id,
          createdAt: serverTimestamp(),
          isOpened: false
        });

        toast({ title: "Siaran Terbit" });
      }
      setIsInputOpen(false);
      setEditingId(null);
      setFormData({ title: '', content: '', category: 'info', imageUrl: '', labels: [], isHeadline: false });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'news', id));
      toast({ title: "Dimusnahkan" });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal" });
    }
  };

  return {
    newsList, loading, isInputOpen, setIsInputOpen, 
    submitting, editingId, setEditingId, 
    isCompressing, formData, setFormData,
    currentLabel, setCurrentLabel,
    handleImageInput, handleSaveNews, handleDeleteNews, handleAddLabel, handleRemoveLabel
  };
}
