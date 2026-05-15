
"use client";

/**
 * REDIRECTOR: Neutralize Legacy Chat Route
 * SOP: Memusnahkan akses rute fisik untuk menjamin kedaulatan SPA.
 */

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function NeutralizeLegacyChat() {
  const router = useRouter();
  useEffect(() => { router.replace('/'); }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
    </div>
  );
}
