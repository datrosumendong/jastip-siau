"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, CalendarDays, Loader2, ArrowLeft, Receipt, Wallet, Clock } from 'lucide-react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { formatIDR } from '@/lib/currency';

export default function CourierReportsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const ordersQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'orders'), where('courierId', '==', user.uid), where('status', 'in', ['completed', 'delivered']));
  }, [db, user]);

  const { data: rawOrders, loading } = useCollection(ordersQuery);

  const todayOrders = useMemo(() => {
    if (!rawOrders) return [];
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;
    return rawOrders.filter(o => (o.updatedAt?.seconds || 0) >= startOfToday).sort((a: any, b: any) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
  }, [rawOrders]);

  const stats = useMemo(() => {
    return todayOrders.reduce((acc, curr) => ({
      income: acc.income + (curr.serviceFee || 0),
      capital: acc.capital + (curr.itemPrice || 0),
      count: acc.count + 1
    }), { income: 0, capital: 0, count: 0 });
  }, [todayOrders]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4 max-w-full pb-20 px-1 flex flex-col h-full bg-[#F8FAFC]">
      <header className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-primary/10 shadow-sm shrink-0">
        <Button onClick={() => router.back()} variant="ghost" size="icon" className="h-8 w-8 text-primary"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-black text-primary uppercase tracking-tight truncate">Laporan Harian</h1>
          <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Reset Otomatis 00.00</p>
        </div>
        <div className="flex items-center gap-1 bg-primary/5 px-2 py-1 rounded-lg"><Clock className="h-3 w-3 text-primary" /><span className="text-[9px] font-black text-primary uppercase">{format(new Date(), 'dd MMM')}</span></div>
      </header>

      <div className="grid grid-cols-2 gap-3 shrink-0">
        <Card className="border-none shadow-md bg-gradient-to-br from-green-600 to-green-500 text-white p-4 space-y-4">
           <div className="flex items-center gap-1.5 opacity-90"><TrendingUp className="h-3 w-3" /><span className="text-[8px] font-black uppercase tracking-widest">Gaji Jasa</span></div>
           <div><h3 className="text-lg font-black">{formatIDR(stats.income)}</h3><p className="text-[7px] font-black uppercase opacity-80">{stats.count} Sukses</p></div>
        </Card>
        <Card className="border-none shadow-md bg-gradient-to-br from-blue-600 to-blue-500 text-white p-4 space-y-4">
           <div className="flex items-center gap-1.5 opacity-90"><Wallet className="h-3 w-3" /><span className="text-[8px] font-black uppercase tracking-widest">Modal Putar</span></div>
           <div><h3 className="text-lg font-black">{formatIDR(stats.capital)}</h3><p className="text-[7px] font-black uppercase opacity-80">Total Talangan</p></div>
        </Card>
      </div>

      <Card className="border-primary/5 shadow-sm overflow-hidden rounded-2xl bg-white flex-1 flex flex-col min-h-0">
        <CardHeader className="p-4 border-b bg-muted/5 flex flex-row items-center justify-between shrink-0">
          <CardTitle className="text-[9px] font-black uppercase text-primary flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5" /> Transaksi Hari Ini</CardTitle>
          <Badge className="bg-green-100 text-green-700 border-none text-[8px] font-black uppercase px-2 py-0.5">Live</Badge>
        </CardHeader>
        <ScrollArea className="flex-1">
          <div className="divide-y divide-primary/5">
            {todayOrders.length === 0 ? (
              <div className="p-16 text-center opacity-30 flex flex-col items-center"><Receipt className="h-8 w-8 mb-2" /><p className="text-[9px] font-black uppercase">Belum ada data.</p></div>
            ) : (
              todayOrders.map((order: any) => (
                <div key={order.id} className="p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5"><h4 className="text-[11px] font-black text-primary uppercase truncate">{order.userName}</h4><span className="text-[10px] font-black text-green-600">+{formatIDR(order.serviceFee || 0)}</span></div>
                    <div className="flex justify-between items-end text-[8px] font-black text-muted-foreground uppercase"><span>Selesai: {format(new Date(order.updatedAt?.seconds * 1000), 'HH:mm')}</span><span className="italic">Modal: {formatIDR(order.itemPrice || 0)}</span></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
