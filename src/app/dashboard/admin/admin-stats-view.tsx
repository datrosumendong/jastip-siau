"use client";

/**
 * REDIRECTOR: Neutralize Redundant Subfolder View
 * SOP: Pangkalan View utama bertahta di src/app/dashboard/admin-stats-view.tsx.
 */

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function NeutralizeRedundantAdminStats() {
  const router = useRouter();
  useEffect(() => { router.replace('/'); }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
    </div>
  );
}
