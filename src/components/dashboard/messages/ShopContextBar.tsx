"use client";

/**
 * COMPONENT: Shop Context Bar (MAHAKARYA)
 * SOP: Menampilkan profil toko saat chat bertipe 'shop' aktif.
 */

import { useMemo } from 'react';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Store, ShoppingBag, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useView } from '@/context/view-context';
import { cn } from '@/lib/utils';

export function ShopContextBar({ storeId }: { storeId: string }) {
  const db = useFirestore();
  const { setView } = useView();
  
  const shopRef = useMemo(() => (db && storeId ? doc(db, 'users', storeId) : null), [db, storeId]);
  const { data: shop, loading } = useDoc(shopRef, true);

  if (loading || !shop) return null;

  return (
    <div className="px-4 py-2 bg-orange-50/50 border-b flex items-center justify-between gap-3 animate-in slide-in-from-top-2">
       <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center text-white shrink-0 shadow-sm">
             <Store className="h-4 w-4" />
          </div>
          <div className="min-w-0">
             <p className="text-[10px] font-black text-orange-900 uppercase truncate leading-none">
               Etalase: {shop.storeName || shop.fullName}
             </p>
             <div className="flex items-center gap-2 mt-1">
                <Badge className={cn(
                  "text-[6px] h-3.5 px-1.5 font-black uppercase border-none",
                  shop.isStoreOpen !== false ? "bg-green-600 text-white" : "bg-slate-400 text-white"
                )}>
                  {shop.isStoreOpen !== false ? "BUKA" : "ISTIRAHAT"}
                </Badge>
                <span className="text-[7px] font-bold text-orange-700/60 uppercase truncate">{shop.address || "Kepulauan Siau"}</span>
             </div>
          </div>
       </div>
       <Button 
        onClick={() => setView('shop_detail', { storeId })}
        variant="ghost" 
        size="sm" 
        className="h-8 px-3 text-[8px] font-black uppercase bg-white border border-orange-200 text-orange-700 rounded-xl shadow-sm shrink-0 gap-1.5 active:scale-95"
       >
          Belanja <ChevronRight className="h-3 w-3" />
       </Button>
    </div>
  );
}
