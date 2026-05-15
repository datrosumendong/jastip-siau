/**
 * @fileOverview ATOMIC LIB: Khusus untuk standarisasi nomor dan API WhatsApp.
 * SOP V15.300: Restorasi kedaulatan window.open untuk stabilitas navigasi lintas aplikasi.
 */

export function cleanWhatsAppNumber(num: string): string {
  if (!num) return '';
  let clean = num.replace(/\D/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1);
  }
  if (clean.startsWith('8') && clean.length >= 9 && clean.length <= 13) {
    clean = '62' + clean;
  }
  if (clean.startsWith('620')) {
    clean = '62' + clean.slice(3);
  }
  return clean.length < 11 ? clean : clean;
}

/**
 * ACTION: openWhatsAppChat (SOP V15.300)
 * Menggunakan window.open untuk memicu Deep Link WhatsApp secara eksternal.
 */
export function openWhatsAppChat(phone: string, message: string): void {
  const cleanPhone = cleanWhatsAppNumber(phone);
  if (!cleanPhone) return;
  
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  
  if (typeof window !== 'undefined') {
    /**
     * SOP STABILITAS NAVIGASI:
     * Menggunakan _blank menjamin aplikasi WhatsApp terbuka secara mandiri
     * tanpa merusak context aplikasi Jastip Siau yang sedang aktif.
     */
    window.open(url, '_blank');
  }
}

/**
 * ACTION: shareToWhatsApp (SOP V15.300)
 */
export function shareToWhatsApp(message: string): void {
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
}
