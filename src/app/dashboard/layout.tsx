"use client";

/**
 * SECURITY REDIRECTOR: Neutralize Legacy Routes
 * Mengalihkan paksa akses URL fisik /dashboard ke root SPA "/" 
 * untuk mencegah inisialisasi ganda Firestore (Anti-ca9).
 */

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function LegacyDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // SOP: Redireksi instan ke entry point utama SPA
    router.replace('/'); 
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
    </div>
  );
}
