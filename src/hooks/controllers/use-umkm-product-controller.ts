
"use client";

/**
 * @fileOverview CONTROLLER: UMKM Product Management (SOP INTEGRITAS MUTLAK)
 * SOP: Chain Deletion Sovereignty - Menghapus produk secara otomatis memusnahkan postingan di Siau Connect.
 * FIX: Menjamin umkmWhatsapp tertanam secara fisik di postingan katalog (V260).
 */

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { 
  collection, query, where, addDoc, deleteDoc, doc, 
  serverTimestamp, updateDoc, getDocs, writeBatch 
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function useUmkmProductController() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', description: '', imageUrl: '' });

  const [productToDelete, setProductToDelete] = useState<any>(null);

  const userRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: profile } = useDoc(userRef, true);

  const productsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'products'), where('umkmId', '==', user.uid));
  }, [db, user]);

  const { data: products = [], loading } = useCollection(productsQuery, true);

  const handleImageInput = (file: File) => {
    if (!file) return;
    setIsCompressing(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 800; 
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let sX = 0, sY = 0, sW = img.width, sH = img.height;
        if (img.width > img.height) {
          sW = img.height;
          sX = (img.width - img.height) / 2;
        } else {
          sH = img.width;
          sY = (img.height - img.width) / 2;
        }

        ctx.drawImage(img, sX, sY, sW, sH, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/webp', 0.7);
        setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
        setIsCompressing(false);
      };
    };
  };

  const handleSaveProduct = async () => {
    if (!db || !user || !formData.name || !formData.price) return;
    setSubmitting(true);
    
    const storeDisplayName = profile?.storeName || profile?.fullName || "Toko UMKM";
    const shopWhatsapp = profile?.whatsapp || "";
    
    const productData = {
      umkmId: user.uid, 
      umkmName: storeDisplayName,
      name: formData.name, 
      price: parseFloat(formData.price),
      description: formData.description, 
      imageUrl: formData.imageUrl,
      isAvailable: true, 
      updatedAt: serverTimestamp()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), productData);
        toast({ title: "Katalog Diperbarui" });
      } else {
        const productRef = await addDoc(collection(db, 'products'), { 
          ...productData, 
          createdAt: serverTimestamp() 
        });

        // 2. SOP AUTO-POSTING: Kirim ke Siau Connect (Sinkronisasi Sosial)
        // FIX: Menyertakan umkmWhatsapp agar order via feed komunitas bisa memicu WA ke toko
        await addDoc(collection(db, 'posts'), {
          userId: user.uid,
          userName: storeDisplayName,
          userPhoto: profile?.imageUrl || "",
          userRole: "umkm",
          umkmWhatsapp: shopWhatsapp, // KUNCI KEDAULATAN NOTIFIKASI
          type: 'catalog', 
          productId: productRef.id,
          productName: formData.name,
          productPrice: parseFloat(formData.price),
          productDescription: formData.description,
          umkmId: user.uid,
          umkmName: storeDisplayName,
          storeName: storeDisplayName,
          content: `🎉 BARU DI ETALASE! "${formData.name}" sekarang tersedia bagi warga Siau. Silakan diorder langsung lewat tombol di bawah ini! 🙏✨`,
          imageUrl: formData.imageUrl,
          likes: [],
          isHidden: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        toast({ title: "Etalase & Feed Terupdate" });
      }

      setIsInputOpen(false); 
      setEditingId(null);
      setFormData({ name: '', price: '', description: '', imageUrl: '' });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Gagal Menyimpan" });
    } finally { 
      setSubmitting(false); 
    }
  };

  const executeDelete = async () => {
    if (!db || !user || !productToDelete || submitting) return;
    setSubmitting(true);
    
    try {
      const batch = writeBatch(db);
      const targetId = productToDelete.id;

      batch.delete(doc(db, 'products', targetId));

      const postsQ = query(collection(db, 'posts'), where('productId', '==', targetId));
      const postsSnap = await getDocs(postsQ);
      postsSnap.forEach((postDoc) => {
        batch.delete(postDoc.ref);
      });

      await batch.commit();
      toast({ title: "Produk & Feed Dimusnahkan" });
    } catch (e) {
      console.error("Chain Deletion Failure:", e);
      toast({ title: "Gagal Sinkronisasi", variant: "destructive" });
    } finally {
      setSubmitting(false);
      setProductToDelete(null);
    }
  };

  return { 
    products, 
    loading, 
    isInputOpen, 
    setIsInputOpen, 
    submitting, 
    editingId, 
    setEditingId, 
    isCompressing, 
    formData, 
    setFormData, 
    handleSaveProduct,
    handleImageInput,
    productToDelete,
    setProductToDelete,
    executeDelete
  };
}
