
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/");
      return;
    }

    const checkAccess = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const snap = await getDoc(userDocRef);
        
        if (snap.exists()) {
          const role = snap.data().role;
          if (role === "admin" || role === "owner") {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
            router.push("/");
          }
        } else {
          setIsAuthorized(false);
          router.push("/");
        }
      } catch (err) {
        console.error("Authorization check failed:", err);
      }
    };

    checkAccess();
  }, [user, authLoading, db, router]);

  if (authLoading || isAuthorized === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Otorisasi Admin...</p>
      </div>
    );
  }

  if (!user || isAuthorized === false) return null;

  return <div className="max-w-full overflow-x-hidden">{children}</div>;
}
