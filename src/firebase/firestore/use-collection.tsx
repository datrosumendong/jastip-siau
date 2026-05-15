'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  Query, 
  onSnapshot, 
  QuerySnapshot, 
  DocumentData,
  FirestoreError
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

/**
 * THE GATEWAY: Real-time Collection Hook (STARE STREAM VERSION)
 * SOP: Flicker-Free Loading - Mencegah visual berkedip saat sinkronisasi rutin.
 * @param query Objek kueri Firestore
 * @param silent Jika true, error izin tidak akan memicu listener global
 */
export function useCollection<T = DocumentData>(query: Query<T> | null, silent: boolean = false) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const lastQueryRef = useRef<string>("");

  useEffect(() => {
    if (!query) {
      setData([]);
      setLoading(false);
      return;
    }

    // Hanya set loading true jika kueri (path/string) benar-benar berubah
    // untuk mencegah flicker saat data masuk secara asinkron.
    const queryKey = query.toString();
    if (lastQueryRef.current !== queryKey) {
      setLoading(true);
      lastQueryRef.current = queryKey;
    }

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const items = snapshot.docs.map((doc) => ({ 
          ...doc.data(), 
          id: doc.id 
        } as T));
        
        setData(items);
        setLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        if (err.code === 'permission-denied') {
          if (!silent) {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: 'collection_query',
              operation: 'list',
            }));
          }
        } else {
          console.warn(`[Firestore Collection Error]: ${err.message}`);
        }
        
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query, silent]); 

  return { data, loading, error };
}
