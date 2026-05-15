
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

/**
 * COMPONENT: Global Error Dispatcher (MVC Controller)
 * Menangani error keamanan secara cerdas untuk mencegah "1 Issue" pill yang mengganggu.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: any) => {
      const errorMessage = error?.message || error?.toString() || '';
      const errorCode = error?.code || error?.context?.code || '';
      const path = error?.context?.path || '';
      
      // ABAIKAN ERROR TRANSIEN JARINGAN & PROSES PENGHAPUSAN
      const isTransientError = 
        errorMessage.includes('Could not reach Cloud Firestore backend') || 
        errorMessage.includes('Backend didn\'t respond') ||
        errorCode === 'unavailable' ||
        errorCode === 'deadline-exceeded' ||
        errorCode === 'cancelled';

      if (isTransientError) return; 

      // SINKRONISASI LOG: Abaikan toast untuk koleksi yang sering dihapus secara real-time
      const isFilteredError = 
        path.includes('testimonials') || 
        path.includes('orders') || 
        path.includes('posts') ||
        path.includes('chats') ||
        path.includes('notifications'); // SOP: Cegah error visual saat notif dihapus

      if (!isFilteredError) {
        toast({
          variant: 'destructive',
          title: 'Otorisasi Dibatasi',
          description: 'Akses data ini memerlukan izin resmi dari server.',
        });
      }
    };

    errorEmitter.on('permission-error', handleError);
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}
