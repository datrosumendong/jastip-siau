
"use client";

/**
 * ARCHITECTURE: MASTER DISPATCHER (Gateway Sovereign V133)
 * SOP: Eliminasi Splash Screen Ganda. Hanya menggunakan sinyal transparan siluman.
 * FIX: Membasmi visual session check berulang demi kedaulatan navigasi instan.
 */

import { useUser, useFirestore, useDoc } from "@/firebase";
import { useMemo, useEffect, Suspense, lazy, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { doc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useView } from "@/context/view-context";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

const DashboardSPA = lazy(() => import("@/app/dashboard-spa-view"));

function MasterDispatcherContent() {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { currentView, refreshKey } = useView();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const userRef = useMemo(() => (user && db ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: profile, loading: profileLoading } = useDoc(userRef, true);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (authLoading || profileLoading || !user || !profile) return;
    const currentSlug = slug as string;
    const myUsername = profile.username;
    if (myUsername && currentSlug === user.uid) {
      const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : "";
      router.replace(`/${myUsername}${queryStr}`);
    }
  }, [user, authLoading, profile, profileLoading, slug, router, searchParams]);

  if (!mounted || authLoading || !user) {
    return <DispatcherLoading />;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="bg-[#F8FAFC] max-w-full flex flex-col h-svh relative overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 relative overflow-hidden bg-inherit flex flex-col min-h-0">
          {(profileLoading && !profile) ? (
            <div className="flex-1 flex items-center justify-center">
               <Loader2 className="h-6 w-6 animate-spin text-primary opacity-10" />
            </div>
          ) : ( 
            <div className="flex-1 w-full h-full relative overflow-hidden bg-inherit">
               <DashboardSPA key={`${currentView}-${refreshKey}`} />
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function MasterDispatcherPage() {
  return (
    <Suspense fallback={<DispatcherLoading />}>
      <MasterDispatcherContent />
    </Suspense>
  );
}

/**
 * COMPONENT: DispatcherLoading (SILUMAN SPINNER)
 * SOP: Visual transparan tanpa branding berat untuk kesan instan.
 */
function DispatcherLoading() {
  return (
    <div className="h-svh w-full flex items-center justify-center bg-[#F8FAFC]">
       <Loader2 className="h-6 w-6 animate-spin text-primary opacity-5" />
    </div>
  );
}
