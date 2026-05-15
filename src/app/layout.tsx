
'use client';

import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';
import { NetworkStatus } from '@/components/NetworkStatus';
import { useEffect, useRef, Suspense } from 'react';
import { requestNotificationPermission, onMessageListener } from '@/firebase/messaging';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { ViewProvider, useView } from '@/context/view-context';

/**
 * ROOT LAYOUT: JASTIP SIAU (SOP TITANIUM RADAR V1000)
 * @fileOverview Memasangkan pangkalan radar pada gerbang utama aplikasi.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <title>JASTIP SIAU</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
        <meta name="theme-color" content="#1768B3" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-body antialiased bg-background overflow-hidden">
        <FirebaseClientProvider>
          <Suspense fallback={null}>
            <ViewProvider>
              <GlobalCommandCenter>{children}</GlobalCommandCenter>
              <Toaster />
              <NetworkStatus />
            </ViewProvider>
          </Suspense>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

function GlobalCommandCenter({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { toast } = useToast();
  const { viewData } = useView();
  const receiveAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // SOP: Sinyal Audio Jastip Siau Premium Alert
    receiveAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
    receiveAudio.current.volume = 0.5;
  }, []);

  useEffect(() => {
    if (user) {
      // PENDAFTARAN RADAR UTAMA (V1000)
      requestNotificationPermission(user.uid);
    }

    const unsubscribe = onMessageListener((payload) => {
      console.log('[Radar V1000] Sinyal Foreground:', payload);
      
      // 1. BUNYIKAN SINYAL AUDIO
      if (receiveAudio.current) {
        receiveAudio.current.currentTime = 0;
        receiveAudio.current.play().catch(() => {});
      }
      
      /**
       * 2. SOP FILTER TOAST (FOREGROUND)
       * Jika pimpinan sedang membuka chat/order yang sama, jangan tampilkan toast redundan.
       */
      const payloadTag = payload.data?.tag || payload.data?.targetId;
      const currentViewId = viewData?.id || viewData?.orderId || viewData?.complaintId;
      
      if (currentViewId !== payloadTag) {
        toast({
          title: payload.data?.title || "JASTIP SIAU",
          description: payload.data?.message || "Informasi baru diterima.",
          duration: 5000, 
        });
      }
    });

    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, [user, toast, viewData]);

  return <>{children}</>;
}
