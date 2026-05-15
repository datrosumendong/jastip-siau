
"use client";

/**
 * REDIRECTOR: Neutralize Legacy Complaints List Route
 * SOP: Mengalihkan kedaulatan ke member_complaints-list-view.tsx.
 */

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function NeutralizeLegacyComplaintsList() {
  const router = useRouter();
  useEffect(() => { router.replace('/'); }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
    </div>
  );
}
