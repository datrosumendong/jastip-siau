
'use client';

import { useEffect, useState } from 'react';
import { 
  DocumentReference, 
  onSnapshot, 
  DocumentSnapshot, 
  DocumentData,
  FirestoreError
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

/**
 * Hook untuk memantau satu dokumen Firestore secara real-time.
 * @param ref Referensi dokumen
 * @param silent Jika true, error izin akses tidak akan memicu listener error global (pop-up)
 */
export function useDoc<T = DocumentData>(ref: DocumentReference<T> | null, silent: boolean = false) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      ref,
      (snapshot: DocumentSnapshot<T>) => {
        setData(snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } : null);
        setLoading(false);
      },
      async (err: FirestoreError) => {
        // Hanya kirim ke error emitter jika ini benar-benar masalah izin akses (Security Rules)
        if (err.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: ref.path,
            operation: 'get',
          });
          
          if (!silent) {
            errorEmitter.emit('permission-error', permissionError);
          }
        } else {
          // Log galat lain ke konsol
          console.warn(`[Firestore Document]: ${err.message} (${err.code})`);
        }
        
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ref, silent]);

  return { data, loading, error };
}
