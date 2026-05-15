
"use client";

import { useMemo } from 'react';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { ShoppingCart, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatIDR } from '@/lib/currency';

export function OrderContextBar({ orderId }: { orderId: string }) {
  const db = useFirestore();
  const orderRef = useMemo(() => (db && orderId ? doc(db, 'orders', orderId) : null), [db, orderId]);
  const { data: order, loading } = useDoc(orderRef, true);

  if (loading || !order) return null;

  return (
    <div className="px-4 py-2 bg-primary/5 border-b flex items-center justify-between gap-3 animate-in slide-in-from-top-2">
       <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
             <ShoppingCart className="h-4 w-4" />
          </div>
          <div className="min-w-0">
             <p className="text-[10px] font-black text-primary uppercase truncate leading-none">
               Pesanan: {order.items?.join(', ')}
             </p>
             <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1">
               Status: {order.status} • {formatIDR(order.totalAmount || 0)}
             </p>
          </div>
       </div>
       <Badge variant="outline" className="text-[7px] font-black uppercase border-primary/20 bg-white">REF #{orderId.slice(-6)}</Badge>
    </div>
  );
}
