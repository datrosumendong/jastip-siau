/**
 * @fileOverview ATOMIC LIB: Khusus untuk kompresi citra client-side (MAHAKARYA REFINED).
 * SOP IKHLAS: Menjamin kedaulatan dokumen Firestore < 1MB dengan kompresi WebP agresif.
 */

export async function compressImage(file: File, maxDimension: number = 400, quality: number = 0.5): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // LOGIKA RESIZING: Kunci dimensi maksimal untuk efisiensi absolut
        if (width > height) {
          if (width > maxDimension) {
            height *= maxDimension / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width *= maxDimension / height;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Gagal menginisialisasi Canvas Context"));
          return;
        }

        // Penajaman citra sederhana
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // OUTPUT WEBP: Format paling berdaulat untuk penghematan data
        const dataUrl = canvas.toDataURL('image/webp', quality);
        
        // Final Guard: Jika masih terlalu besar (sangat jarang terjadi dengan 400px), turunkan kualitas lagi
        if (dataUrl.length > 800000) {
           resolve(canvas.toDataURL('image/webp', 0.2));
        } else {
           resolve(dataUrl);
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Menghapus fungsi lama untuk menghindari redundansi library.
 */
export const compressImageToWebP = compressImage;
