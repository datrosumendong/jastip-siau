'use client';

/**
 * THE ENGINE: Firebase Singleton Orchestrator (ANTI-CA9 MASTER V1000)
 * SOP: Memasangkan pangkalan Messaging ke dalam Singleton Engine untuk kedaulatan sinyal.
 * FIX: Menjamin inisialisasi tunggal pada sisi klien untuk membasmi bug hidrasi.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getMessaging, Messaging, isSupported } from 'firebase/messaging';
import { firebaseConfig } from './config';

interface FirebaseInstance {
  app: FirebaseApp;
  db: Firestore;
  auth: Auth;
  messaging: Messaging | null;
}

const ENGINE_KEY = '__JASTIP_SIAU_SURE_ENGINE__';

export function initializeFirebase(): FirebaseInstance {
  if (typeof window === 'undefined') {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    return { app, db: getFirestore(app), auth: getAuth(app), messaging: null };
  }

  const G = window as any;

  if (G[ENGINE_KEY]) {
    return G[ENGINE_KEY];
  }

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);
  const auth = getAuth(app);
  
  let messagingInstance: Messaging | null = null;
  
  // KEDAULATAN MESSAGING: Inisialisasi asinkron untuk pendaftaran radar browser
  isSupported().then(supported => {
    if (supported) {
      messagingInstance = getMessaging(app);
      if (G[ENGINE_KEY]) G[ENGINE_KEY].messaging = messagingInstance;
    }
  }).catch(() => {});

  const instance = { app, db, auth, messaging: messagingInstance };
  G[ENGINE_KEY] = instance;

  return instance;
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';