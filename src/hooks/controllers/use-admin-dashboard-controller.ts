"use client";

import { useState, useMemo, useEffect } from 'react';
import { useFirestore, useDoc, useUser } from '@/firebase';
import { 
  collection, query, where, doc, serverTimestamp, 
  setDoc, onSnapshot, limit 
} from 'firebase/firestore';
import { generateAdminFinancialInsights, AdminFinancialInsightGeneratorOutput } from '@/ai/flows/admin-financial-insight-generator';
import { useToast } from '@/hooks/use-toast';

/**
 * CONTROLLER: Admin Dashboard Logic (SIAU MASTER COMMAND)
 * SOP: Penegakan Laporan Real-Time & Pemisahan Pilar Kemitraan (Kurir vs UMKM).
 * FIX: Membebaskan kunci AI agar tetap berfungsi meski database order masih minim.
 */
export function useAdminDashboardController() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [insights, setInsights] = useState<AdminFinancialInsightGeneratorOutput | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [pendingApps, setPendingApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. DATA MODEL: Profil Admin
  const userDocRef = useMemo(() => (user && db ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: myProfile } = useDoc(userDocRef, true);
  
  // 2. DATA MODEL: Recruitment State
  const recruitmentRef = useMemo(() => (db ? doc(db, 'settings', 'recruitment') : null), [db]);
  const { data: recruitment } = useDoc(recruitmentRef, true);

  // 3. REAL-TIME RADAR: Sync Orders, Users, Applications & Products
  useEffect(() => {
    if (!db) return;

    const qOrders = query(collection(db, 'orders'), limit(1000));
    const unsubOrders = onSnapshot(qOrders, (snap) => {
      setOrders(snap.docs.map(d => ({ ...d.data(), id: d.id })));
      setLoading(false);
    });

    const qUsers = query(collection(db, 'users'), limit(1000));
    const unsubUsers = onSnapshot(qUsers, (snap) => {
      setUsers(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });

    const qProducts = query(collection(db, 'products'), limit(1000));
    const unsubProducts = onSnapshot(qProducts, (snap) => {
      setProducts(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });

    const qApps = query(collection(db, 'applications'), where('status', '==', 'pending'));
    const unsubApps = onSnapshot(qApps, (snap) => {
      setPendingApps(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });

    return () => {
      unsubOrders();
      unsubUsers();
      unsubProducts();
      unsubApps();
    };
  }, [db]);

  const isOwner = myProfile?.role === 'owner';

  // LOGIKA KEDAULATAN: Kalkulasi Statistik Ekonomi Siau Berdasarkan Pilar
  const stats = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;

    const completedToday = orders.filter(o => {
      const orderTime = o.updatedAt?.seconds || o.createdAt?.seconds || 0;
      return (o.status === 'completed' || o.status === 'delivered') && orderTime >= startOfToday;
    });

    // 1. STATS KURIR (LOGISTIK)
    const couriers = users.filter(u => u.role === 'courier' || u.role === 'owner');
    const totalGajiJasa = completedToday.reduce((acc, curr) => acc + (Number(curr.serviceFee) || 0), 0);

    // 2. STATS UMKM (PRODUKSI)
    const umkms = users.filter(u => u.role === 'umkm');
    const totalOmzetBelanja = completedToday.reduce((acc, curr) => acc + (Number(curr.itemPrice) || 0), 0);
    const totalKatalog = products.length;

    return {
      courierCount: couriers.length,
      onlineCourierCount: couriers.filter(c => c.isOnline === true).length,
      totalGajiJasa,
      umkmCount: umkms.length,
      totalOmzetBelanja,
      totalKatalog,
      count: completedToday.length,
      totalRevenue: completedToday.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0)
    };
  }, [orders, users, products]);

  // LOGIKA KEDAULATAN: Weekly Chart Data
  const weeklyData = useMemo(() => {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const result = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayName = days[d.getDay()];
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 1000;
      const endOfDay = startOfDay + 86400;

      const dailyOrders = orders.filter(o => {
        const t = o.updatedAt?.seconds || o.createdAt?.seconds || 0;
        return (o.status === 'completed' || o.status === 'delivered') && t >= startOfDay && t < endOfDay;
      });

      result.push({
        name: dayName,
        laba: dailyOrders.reduce((acc, curr) => acc + (Number(curr.serviceFee) || 0), 0),
        omzet: dailyOrders.reduce((acc, curr) => acc + (Number(curr.itemPrice) || 0), 0)
      });
    }
    return result;
  }, [orders]);

  // LOGIKA KEDAULATAN: Courier Performance Radar
  const courierPerformance = useMemo(() => {
    const couriersList = users.filter(u => u.role === 'courier' || u.role === 'owner');
    return couriersList.map(c => {
      const uid = c.uid || c.id;
      const myOrders = orders.filter(o => 
        (o.courierId === uid) && 
        (o.status === 'completed' || o.status === 'delivered')
      );
      
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;
      const todayOrders = myOrders.filter(o => (o.updatedAt?.seconds || 0) >= startOfToday);

      return {
        ...c,
        dailyRevenue: todayOrders.reduce((acc, curr) => acc + (Number(curr.serviceFee) || 0), 0),
        dailyCount: todayOrders.length
      };
    }).sort((a, b) => b.dailyCount - a.dailyCount);
  }, [users, orders]);

  // LOGIKA KEDAULATAN: UMKM Performance Radar
  const umkmPerformance = useMemo(() => {
    const umkmsList = users.filter(u => u.role === 'umkm');
    return umkmsList.map(u => {
      const uid = u.uid || u.id;
      const myOrders = orders.filter(o => 
        (o.umkmId === uid) && 
        (o.status === 'completed' || o.status === 'delivered')
      );
      
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;
      const todayOrders = myOrders.filter(o => (o.updatedAt?.seconds || 0) >= startOfToday);

      return {
        ...u,
        dailyRevenue: todayOrders.reduce((acc, curr) => acc + (Number(curr.itemPrice) || 0), 0),
        dailyCount: todayOrders.length
      };
    }).sort((a, b) => b.dailyCount - a.dailyCount);
  }, [users, orders]);

  const handleGenerateInsights = async () => {
    setLoadingInsights(true);
    setInsights(null); // SOP: Reset visual untuk umpan balik instan

    try {
      // 1. Mapping transaksi (Batas 20 untuk efisiensi token)
      const mappedTransactions = orders.slice(0, 20).map(o => ({
        id: o.id, 
        amount: Number(o.totalAmount) || 0, 
        type: 'order' as const,
        date: o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toISOString().split('T')[0] : '',
        userId: o.userId || '',
        courierId: o.courierId || '',
        description: `Order ${o.userName || 'Warga'}`
      }));

      // 2. Mapping aktivitas kurir
      const mappedActivity = courierPerformance.slice(0, 10).map(c => ({
        courierId: String(c.uid || c.id), 
        status: (c.isOnline ? 'online' : 'offline') as 'online' | 'offline' | 'busy',
        ordersCompleted: Number(c.dailyCount) || 0, 
        hoursOnline: 0
      }));

      // 3. Eksekusi Gemini Flow
      const result = await generateAdminFinancialInsights({
        transactions: mappedTransactions,
        courierActivity: mappedActivity,
        adminPrompt: "Analisis performa ekonomi warga antara pilar Logistik Kurir dan pilar Belanja UMKM Siau hari ini. Berikan rekomendasi taktis pimpinan."
      });

      setInsights(result);
      toast({ title: "Analisis Strategis Siap", description: "Wawasan cerdas telah bertahta di dashboard." });
    } catch (e: any) { 
      console.error("AI Analysis Error:", e); 
      toast({ variant: "destructive", title: "Kegagalan Sinyal AI", description: "Gagal memproses data performa." });
    } finally { 
      setLoadingInsights(false); 
    }
  };

  const handleToggleRecruitment = async (checked: boolean) => {
    if (!db) return;
    await setDoc(doc(db, 'settings', 'recruitment'), { isOpen: checked, updatedAt: serverTimestamp() }, { merge: true });
    toast({ 
      title: checked ? "Rekrutmen Dibuka" : "Rekrutmen Ditutup"
    });
  };

  return {
    stats,
    couriers: courierPerformance,
    umkms: umkmPerformance,
    insights,
    weeklyData,
    loadingInsights,
    recruitment,
    pendingAppsCount: pendingApps.length,
    loading,
    isOwner,
    handleGenerateInsights,
    handleToggleRecruitment
  };
}
