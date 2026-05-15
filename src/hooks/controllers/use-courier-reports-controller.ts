"use client";

/**
 * @fileOverview CONTROLLER: Courier Financial Reports (SOP VAULT AUDIT V760)
 * SOP: Audit Lintas Periode berbasis koleksi 'financial_history' (Snapshot Permanen).
 * FIX: Memastikan seluruh kalkulasi menggunakan Number() untuk membasmi nilai 0.
 */

import { useMemo, useState } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { getYear, getMonth, getDate } from 'date-fns';

export function useCourierReportsController() {
  const { user } = useUser();
  const db = useFirestore();

  // 1. STATE KEDAULATAN FILTER
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<string>(getYear(now).toString());
  const [selectedMonth, setSelectedMonth] = useState<string>((getMonth(now) + 1).toString());
  const [selectedDay, setSelectedDay] = useState<string>(getDate(now).toString());

  // 2. DATA ACCESS (MODEL): Mengambil dari Vault Keuangan Kurir (Independen dari Order)
  const historyQuery = useMemo(() => {
    if (!db || !user) return null;
    // SOP: Mengambil log permanen yang sudah di-snapshot secara numerik (V760)
    return query(
      collection(db, 'users', user.uid, 'financial_history'), 
      limit(1000) 
    );
  }, [db, user]);

  const { data: rawHistory = [], loading } = useCollection(historyQuery, true);

  // 3. LOGIKA FILTERING & SUMMATION (SOP NUMERIK V760)
  const stats = useMemo(() => {
    const yearNum = parseInt(selectedYear);
    const monthNum = parseInt(selectedMonth);
    const dayNum = parseInt(selectedDay);

    const filteredList = rawHistory.filter(h => {
      const recordDate = h.createdAt?.seconds ? new Date(h.createdAt.seconds * 1000) : null;
      if (!recordDate) return false;

      const matchYear = getYear(recordDate) === yearNum;
      const matchMonth = (getMonth(recordDate) + 1) === monthNum;
      const matchDay = dayNum === 0 || getDate(recordDate) === dayNum;

      return matchYear && matchMonth && matchDay;
    }).sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

    return {
      filteredOrders: filteredList,
      // FIX V760: Paksa konversi Number() untuk membasmi "Isi 0"
      income: filteredList.reduce((acc, curr) => acc + (Number(curr.serviceFee) || 0), 0),
      capital: filteredList.reduce((acc, curr) => acc + (Number(curr.itemPrice) || 0), 0),
      count: filteredList.length
    };
  }, [rawHistory, selectedYear, selectedMonth, selectedDay]);

  // KONSTANTA OPSI FILTER
  const years = ["2024", "2025", "2026"];
  const months = [
    { id: "1", name: "Januari" }, { id: "2", name: "Februari" }, { id: "3", name: "Maret" },
    { id: "4", name: "April" }, { id: "5", name: "Mei" }, { id: "6", name: "Juni" },
    { id: "7", name: "Juli" }, { id: "8", name: "Agustus" }, { id: "9", name: "September" },
    { id: "10", name: "Oktober" }, { id: "11", name: "November" }, { id: "12", name: "Desember" }
  ];
  
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

  return { 
    ...stats,
    loading,
    selectedYear, setSelectedYear,
    selectedMonth, setSelectedMonth,
    selectedDay, setSelectedDay,
    years, months, days
  };
}