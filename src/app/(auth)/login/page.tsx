
"use client";

/**
 * REDIRECTOR: SPA Murni
 */

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function RedirectToRoot() {
  const router = useRouter();
  useEffect(() => { router.replace('/'); }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
    </div>
  );
}
