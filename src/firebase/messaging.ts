'use client';

/**
 * FIREBASE MESSAGING: DUTA BESAR RADAR V1000 TITANIUM
 * SOP: Penegakan Registrasi Service Worker & Sinkronisasi Domain Aktif.
 * FIX: Memastikan VAPID Key pimpinan bertahta secara kaku.
 */

import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from './index';

export async function requestNotificationPermission(userId: string) {
  if (typeof window === 'undefined') return;

  try {
    const messagingSupported = await isSupported();
    if (!messagingSupported) return;

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const { app, db } = initializeFirebase();
      const messaging = getMessaging(app);
      
      /**
       * REGISTRASI RADAR FISIK
       * Menjamin Service Worker bertahta di root domain (/).
       * SOP V1000: Menjamin pendaftaran ulang jika ada pembaruan skrip.
       */
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });
      
      await navigator.serviceWorker.ready;

      // KUNCI VAPID PIMPINAN: BDOs4X8...
      const VAPID_KEY = 'BDOs4X8n43Lb1IQw4c6Fo_oEdPOacqvVWbRt9bEz2xWreLTi6OR85EKlfavJyjjFM3fyq1eM1xc7kiI_NNI73Qc'; 

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      });

      if (token) {
        const userRef = doc(db, 'users', userId);
        /**
         * SOP DYNAMIC ORIGIN
         * Mencatat Domain aktif agar Link Notifikasi pimpinan tidak pernah nyasar.
         */
        await updateDoc(userRef, { 
          fcmToken: token,
          lastTokenUpdate: serverTimestamp(),
          activeRadarDomain: window.location.origin
        });
        console.log('[Radar V1000] Sinyal Terkunci:', token);
      }
    }
  } catch (error) {
    console.warn('[Radar V1000] Kegagalan Sinyal:', error);
  }
}

export function onMessageListener(callback: (payload: any) => void) {
  if (typeof window === 'undefined') return null;
  try {
    const { app } = initializeFirebase();
    const messaging = getMessaging(app);
    return onMessage(messaging, (payload) => {
      console.log('[Radar V1000] Sinyal Foreground:', payload);
      callback(payload);
    });
  } catch (e) {
    return null;
  }
}
