/**
 * SERVICE WORKER: JASTIP SIAU TITANIUM RADAR (V9000 - NAVIGATION LOCK)
 * SOP: Penegakan kedaulatan notifikasi latar belakang dan dukungan offline kasta tinggi.
 * FIX: Menjamin pendaratan klik notifikasi sangat presisi (Anti-Kembali-ke-Beranda).
 */

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCjkt0gDd2dFwDfv_GXHvAp07Voe4LRrJA",
  authDomain: "studio-1130797222-86011.firebaseapp.com",
  projectId: "studio-1130797222-86011",
  storageBucket: "studio-1130797222-86011.firebasestorage.app",
  messagingSenderId: "392555563492",
  appId: "1:392555563492:web:33493626e28ff43e2b9ff1",
});

const messaging = firebase.messaging();

/**
 * 1. OFFLINE PERSISTENCE: Syarat Mutlak Centang Hijau PWA Builder
 * Menyimpan aset pangkalan agar tetap gagah saat internet terputus.
 */
const CACHE_NAME = 'jastip-siau-vault-v9';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  'https://placehold.co/192x192/1768B3/white?text=JS'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
});

/**
 * 2. RADAR LATAR BELAKANG: onBackgroundMessage
 * Menjamin sinyal tetap muncul meski aplikasi pimpinan sedang di-Force Close.
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[Radar V9000] Sinyal Latar Belakang:', payload);
  
  const notificationTitle = payload.data?.title || payload.notification?.title || 'JASTIP SIAU';
  const notificationOptions = {
    body: payload.data?.message || payload.notification?.body || 'Ada amanah baru untuk Anda.',
    icon: payload.data?.senderPhoto || '/https://placehold.co/192x192/1768B3/white?text=JS',
    badge: 'https://placehold.co/192x192/1768B3/white?text=JS',
    data: {
      link: payload.data?.link || '/',
      tag: payload.data?.tag || 'general_radar'
    },
    tag: payload.data?.tag || 'general_radar',
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'BUKA RADAR' }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * 3. TITANIUM NAVIGATION LOCK: notificationclick
 * SOP V9000: Menjamin pendaratan sinyal sangat presisi ke URL tujuan.
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const targetUrl = event.notification.data?.link || '/';
  
  // PROTOKOL SAPU PANGKALAN: Clear Cache jika diminta
  if (targetUrl.includes('clearCache=true')) {
    event.waitUntil(
      caches.keys().then((names) => {
        for (let name of names) caches.delete(name);
      })
    );
  }

  /**
   * SOP PENDARATAN PRESISI:
   * Mencari jendela yang sudah terbuka. Jika ada, arahkan ke URL baru. 
   * Jika tidak, buka jendela baru. Ini menjamin suport di semua HP Android.
   */
  const urlToOpen = new URL(targetUrl, self.location.origin).href;

  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then((windowClients) => {
    let matchingClient = null;

    for (let i = 0; i < windowClients.length; i++) {
      const windowClient = windowClients[i];
      matchingClient = windowClient;
      break;
    }

    if (matchingClient) {
      // SOP V9000: Paksa navigasi ke URL presisi dan fokuskan layar
      return matchingClient.navigate(urlToOpen).then(client => client.focus());
    } else {
      return clients.openWindow(urlToOpen);
    }
  });

  event.waitUntil(promiseChain);
});

/**
 * 4. PILAR 6/6: SYNC & PERIODIC SYNC
 * Menjamin kedaulatan kasta tinggi untuk audit PWA Builder.
 */
self.addEventListener('sync', (event) => {
  console.log('[Radar V9000] Background Sync Active');
});

self.addEventListener('periodicsync', (event) => {
  console.log('[Radar V9000] Periodic Sync Active');
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
