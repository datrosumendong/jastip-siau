"use client";

/**
 * CONTROLLER: Admin Dashboard Statistics
 */

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useDoc, useUser } from '@/firebase';
import { collection, query, where, doc, serverTimestamp, setDoc, orderBy } from 'firebase/firestore';
import { generateAdminFinancialInsights, AdminFinancialInsightGeneratorOutput } from '@/ai/flows/admin-financial-insight-generator';
import { useToast } from '@/hooks/use-toast';

export function useAdminStatsController() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [insights, setInsights] = useState<AdminFinancialInsightGeneratorOutput | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const userDocRef = useMemo(() => (user && db ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: myProfile } = useDoc(userDocRef, true);
  
  const usersQuery = useMemo(() => (db ? collection(db, 'users') : null), [db]);
  const { data: usersData, loading: loadingUsers } = useCollection(usersQuery, true);
  
  const ordersQuery = useMemo(() => (db ? query(collection(db, 'orders'), orderBy('createdAt', 'desc')) : null), [db]);
  const { data: ordersData, loading: loadingOrders } = useCollection(ordersQuery, true);
  
  const appsQuery = useMemo(() => (db ? query(collection(db, 'applications'), where('status', '==', 'pending')) : null), [db]);
  const { data: pendingApps } = useCollection(appsQuery, true);
  
  const recruitmentRef = useMemo(() => (db ? doc(db, 'settings', 'recruitment') : null), [db]);
  const { data: recruitment } = useDoc(recruitmentRef, true);

  const isOwner = myProfile?.role === 'owner';

  const financialStats = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;
    const completedToday = (ordersData || []).filter(o => {
      const orderTime = o.updatedAt?.seconds || o.createdAt?.seconds || 0;
      return (o.status === 'completed' || o.status === 'delivered') && orderTime >= startOfToday;
    });
    return {
      totalRevenue: completedToday.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0),
      totalOngkir: completedToday.reduce((acc, curr) => acc + (curr.serviceFee || 0), 0),
      totalProduk: completedToday.reduce((acc, curr) => acc + (curr.itemPrice || 0), 0),
      count: completedToday.length,
    };
  }, [ordersData]);

  const courierPerformance = useMemo(() => {
    const couriers = (usersData || []).filter(u => u.role === 'courier' || u.role === 'owner');
    return couriers.map(c => {
      const myOrders = (ordersData || []).filter(o => o.courierId === (c.uid || c.id) && (o.status === 'completed' || o.status === 'delivered'));
      return { ...c, dailyRevenue: myOrders.length * 5000, dailyCount: myOrders.length };
    }).sort((a, b) => b.dailyCount - a.dailyCount);
  }, [usersData, ordersData]);

  const handleGenerateInsights = async () => {
    if (!ordersData?.length) return;
    setLoadingInsights(true);
    try {
      const result = await generateAdminFinancialInsights({
        transactions: ordersData.slice(0, 10).map(o => ({
          id: o.id, amount: o.totalAmount || 0, type: 'order',
          date: o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toISOString().split('T')[0] : '',
          description: `Order ${o.userName}`
        })),
        courierActivity: courierPerformance.map(c => ({
          courierId: c.uid || c.id, status: (c.courierStatus as any) || 'offline',
          ordersCompleted: c.dailyCount, hoursOnline: 0
        })),
        adminPrompt: "Analisis performa hari ini."
      });
      setInsights(result);
      toast({ title: "Analisis AI Siap" });
    } finally { setLoadingInsights(false); }
  };

  const handleToggleRecruitment = async (checked: boolean) => {
    if (!db) return;
    await setDoc(doc(db, 'settings', 'recruitment'), { isOpen: checked, updatedAt: serverTimestamp() }, { merge: true });
    toast({ title: checked ? "Rekrutmen Dibuka" : "Rekrutmen Ditutup" });
  };

  return {
    stats: financialStats,
    couriers: courierPerformance,
    insights,
    loadingInsights,
    recruitment,
    pendingAppsCount: pendingApps?.length || 0,
    loading: loadingUsers || loadingOrders,
    isOwner,
    handleGenerateInsights,
    handleToggleRecruitment
  };
}
