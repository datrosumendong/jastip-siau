'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

/**
 * PROVIDER: Firebase Client (MVC Gateway)
 * SOP: Memastikan inisialisasi Firebase dilakukan secara stabil dan aman dari galat hidrasi.
 * REVISI: Menggunakan pola Singleton Guard untuk mencegah double-init di React Strict Mode.
 */
export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  // Mengambil instance dari Singleton Engine
  const firebase = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider app={firebase.app} db={firebase.db} auth={firebase.auth}>
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
