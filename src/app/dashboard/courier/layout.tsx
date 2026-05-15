
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";

export default function CourierLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const checkAccess = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const snap = await getDoc(userDocRef);
        
        if (snap.exists()) {
          const role = snap.data().role;
          // Kurir, Admin, dan Owner diizinkan masuk ke panel kurir
          if (role === "courier" || role === "owner" || role === "admin") {
            setIsAuthorized(true);
          } else {
            // Hanya redirect jika peran dipastikan bukan kurir/owner/admin
            setIsAuthorized(false);
            router.push("/dashboard/orders");
          }
        } else {
          setIsAuthorized(false);
          router.push("/dashboard/orders");
        }
      } catch (err) {
        console.error("Courier authorization check failed:", err);
      }
    };

    checkAccess();
  }, [user, authLoading, db, router]);

  if (authLoading || isAuthorized === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Otorisasi Kurir...</p>
      </div>
    );
  }

  if (!user || isAuthorized === false) return null;

  return <div className="max-w-full overflow-x-hidden h-full flex flex-col">{children}</div>;
}
