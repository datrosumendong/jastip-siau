"use client";

/**
 * CONTROLLER: Logika Order Baru (SOP V15.500 - NOTIF SYNC)
 * SOP: Penegakan Notifikasi ke Toko (Pure UMKM) atau Kurir (Bebas/Multi).
 */

import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { collection, doc, setDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { calculateGPSDistance } from '@/lib/geo';
import { openWhatsAppChat } from '@/lib/whatsapp';
import { useView } from '@/context/view-context';

export function useNewOrderController() {
  const { setView, viewData } = useView();
  const courierId = viewData?.courierId;
  
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [items, setItems] = useState<string[]>(['']);
  const [notes, setNotes] = useState('');
  const [catalogItemsCount, setCatalogItemsCount] = useState(0); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  
  const [customAddress, setCustomAddress] = useState('');
  const [customLat, setCustomLat] = useState(0);
  const [customLng, setCustomLng] = useState(0);
  const [umkmData, setUmkmData] = useState<any>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('pending_umkm_order');
      if (saved) {
        const data = JSON.parse(saved);
        setUmkmData(data);
        const formattedItems = data.items.map((it: any) => `${it.name} (${it.quantity}x)`);
        setItems(formattedItems);
        setCatalogItemsCount(formattedItems.length);
      }
    } catch (e) {}
  }, []);

  const courierRef = useMemo(() => (db && courierId ? doc(db, 'users', courierId) : null), [db, courierId]);
  const { data: courierProfile, loading: loadingCourier } = useDoc(courierRef, true);
  
  const userProfileRef = useMemo(() => (db && user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: userProfile } = useDoc(userProfileRef, true);

  const handleAddItem = () => setItems([...items, '']);
  const handleRemoveItem = (index: number) => {
    if (index < catalogItemsCount) {
      toast({ title: "Gagal", description: "Hapus item katalog di keranjang.", variant: "destructive" });
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };
  
  const handleItemChange = (index: number, val: string) => {
    if (index < catalogItemsCount) return;
    const next = [...items];
    next[index] = val;
    setItems(next);
  };

  const handleOrder = async () => {
    if (!db || !user || !courierId || !userProfile) return;
    
    const validItems = items.filter(item => item.trim() !== '');
    if (validItems.length === 0) {
      toast({ title: "Daftar Kosong", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const finalLat = useCustomAddress ? customLat : (userProfile?.latitude || 0);
    const finalLng = useCustomAddress ? customLng : (userProfile?.longitude || 0);

    try {
      const orderDocRef = doc(collection(db, 'orders'));
      const orderId = orderDocRef.id;
      const chatId = `order_${orderId}`;

      const cLat = courierProfile?.latitude || 0;
      const cLng = courierProfile?.longitude || 0;
      const extraItemsCount = validItems.length - catalogItemsCount;
      const isPureUmkm = !!umkmData?.umkmId && !umkmData?.isMultiStore && extraItemsCount === 0;

      let distance = 0;
      if (isPureUmkm && umkmData?.shopLat && cLat) {
        const d1 = calculateGPSDistance(cLat, cLng, umkmData.shopLat, umkmData.shopLng);
        const d2 = calculateGPSDistance(umkmData.shopLat, umkmData.shopLng, finalLat, finalLng);
        distance = parseFloat((d1 + d2).toFixed(2));
      } else if (cLat && finalLat) {
        distance = calculateGPSDistance(cLat, cLng, finalLat, finalLng);
      }

      const finalItemDetails = validItems.map((itemStr, i) => {
        if (i < catalogItemsCount && umkmData?.items?.[i]) {
          return { ...umkmData.items[i], isManual: false };
        }
        return { name: itemStr, quantity: 1, isManual: true, price: 0 };
      });

      const orderData = {
        id: orderId, chatId, userId: user.uid, userName: userProfile.fullName,
        userWhatsapp: userProfile.whatsapp, userPhoto: userProfile.imageUrl || "",
        memberAddress: useCustomAddress ? customAddress : (userProfile.address || ""),
        destLat: finalLat, destLng: finalLng, courierId,
        courierName: courierProfile.fullName, courierWhatsapp: courierProfile.whatsapp,
        courierPhoto: courierProfile.imageUrl || "", courierLat: cLat, courierLng: cLng,
        isPureUmkm, isMultiStore: umkmData?.isMultiStore || false,
        umkmId: umkmData?.isMultiStore ? 'MULTI' : (umkmData?.umkmId || null),
        umkmName: umkmData?.isMultiStore ? 'MULTI TOKO' : (umkmData?.umkmName || null),
        umkmWhatsapp: umkmData?.umkmWhatsapp || "", shopLat: umkmData?.shopLat || 0, shopLng: umkmData?.shopLng || 0,
        targetShops: umkmData?.targetShops || [], items: validItems, notes: notes.trim(), 
        itemDetails: finalItemDetails, itemStatus: validItems.reduce((acc: any, _, i) => { acc[i] = 'available'; return acc; }, {}),
        distance, status: 'pending', itemPrice: umkmData?.totalAmount || 0, serviceFee: 0, totalAmount: umkmData?.totalAmount || 0,
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      };

      await setDoc(orderDocRef, orderData);

      // RADAR NOTIFIKASI BARU (SOP V15.500)
      const targetNotifId = isPureUmkm ? orderData.umkmId : courierId;
      if (targetNotifId) {
        await addDoc(collection(db, 'notifications'), {
          userId: targetNotifId, 
          title: "📢 Pesanan Baru",
          message: `${userProfile.fullName} mengirim amanah belanja.`,
          type: 'order', 
          targetId: orderId, 
          senderPhoto: userProfile.imageUrl || "", 
          createdAt: serverTimestamp(),
          isOpened: false
        });
      }

      await setDoc(doc(db, 'chats', chatId), {
        id: chatId, type: 'cht_order', orderId, participants: [user.uid, courierId].filter(id => !!id),
        participantNames: { [user.uid]: userProfile.fullName, [courierId]: courierProfile.fullName },
        participantPhotos: { [user.uid]: userProfile.imageUrl || '', [courierId]: courierProfile.imageUrl || '' },
        lastMessage: "Sinyal Radar Terhubung.", updatedAt: serverTimestamp(), createdAt: serverTimestamp()
      });

      const itemsList = validItems.map(it => `• ${it}`).join('\n');
      const ketText = notes.trim() ? `\n📝 *KETERANGAN*: ${notes.trim()}` : "";
      
      if (isPureUmkm && orderData.umkmId && orderData.umkmWhatsapp) {
        const waMsg = `📢 *ORDER BARU MASUK - JASTIP SIAU* 🛍️\n\nHalo *${orderData.umkmName}* 👋,\nAda pesanan masuk dari warga *${orderData.userName}* via kurir *${orderData.courierName}*.\n\n📦 *DAFTAR PESANAN*:\n${itemsList}${ketText}\n\n📍 *SOP*: Mohon segera konfirmasi ketersediaan stok di aplikasi Jastip Siau. 🙏✨`;
        openWhatsAppChat(orderData.umkmWhatsapp, waMsg);
      } else if (orderData.courierWhatsapp) {
        const waMsg = `📢 *ORDER BARU - JASTIP SIAU* 🛵\n\nHalo *${orderData.courierName}* 👋,\nAda pesanan baru dari *${orderData.userName}*.\n\n📦 *DAFTAR TITIPAN*:\n${itemsList}${ketText}\n\n📍 *STATUS*: Mohon periksa aplikasi Jastip Siau sekarang. 🙏✨`;
        openWhatsAppChat(orderData.courierWhatsapp, waMsg);
      }

      toast({ title: "Amanah Terkirim" });
      sessionStorage.removeItem('pending_umkm_order');
      setView('orders');
    } catch (e: any) {
      setIsSubmitting(false);
      toast({ title: "Gagal", variant: "destructive" });
    }
  };

  return {
    items, notes, setNotes, courierProfile, loadingCourier, userProfile,
    catalogItemsCount, isSubmitting, useCustomAddress, setUseCustomAddress,
    customAddress, setCustomAddress, customLat, customLng,
    handleAddItem, handleRemoveItem, handleItemChange, handleOrder, setView,
    setCustomLat, setCustomLng, umkmData
  };
}