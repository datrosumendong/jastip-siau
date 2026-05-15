"use client";

/**
 * REDIRECTOR: Neutralize Physical Route (SOP V33.000)
 * SOP: Mengalihkan akses ke View SPA untuk menjamin stabilitas Singleton Firestore.
 */

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function NeutralizeShopSettings() {
  const router = useRouter();
  useEffect(() => { router.replace('/?view=umkm_settings'); }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
      <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
    </div>
  );
}
