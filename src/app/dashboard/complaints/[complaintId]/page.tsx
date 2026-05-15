
"use client";

/**
 * REDIRECTOR: Neutralize Legacy Complaint Detail Route
 * SOP: Seluruh bantuan kini dikelola oleh member_complaint_detail-view.tsx.
 */

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function NeutralizeLegacyComplaint() {
  const router = useRouter();
  useEffect(() => { router.replace('/'); }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
    </div>
  );
}
