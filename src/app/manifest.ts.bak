import { MetadataRoute } from 'next'
import { PlaceHolderImages } from '@/lib/placeholder-images'

/**
 * MANIFEST DIGITAL: JASTIP SIAU (SOP FULLSCREEN SUPREMACY V9000)
 * @fileOverview Berkas identitas kedaulatan PWA imersif.
 * SOP: Penegakan kedaulatan fullscreen untuk pengalaman APK murni.
 */

export default function manifest(): MetadataRoute.Manifest {
  const ss1 = PlaceHolderImages.find(img => img.id === 'pwa-screenshot-1');
  const ss2 = PlaceHolderImages.find(img => img.id === 'pwa-screenshot-2');
  const ss3 = PlaceHolderImages.find(img => img.id === 'pwa-screenshot-3');
  const ss4 = PlaceHolderImages.find(img => img.id === 'pwa-screenshot-4');
  const ss5 = PlaceHolderImages.find(img => img.id === 'pwa-screenshot-5');
  const ss6 = PlaceHolderImages.find(img => img.id === 'pwa-screenshot-6');
  const ss7 = PlaceHolderImages.find(img => img.id === 'pwa-screenshot-7');
  const ss8 = PlaceHolderImages.find(img => img.id === 'pwa-screenshot-8');

  return {
    name: 'JASTIP SIAU - Jasa Titip Terpercaya',
    short_name: 'JastipSiau',
    description: 'Pusat Logistik dan Ekonomi Digital Kepulauan Siau. Layanan Jasa Titip Barang Aman, Cepat, dan Transparan.',
    id: 'com.jastipsiau.app',
    start_url: '/?utm_source=pwa',
    scope: '/',
    /**
     * SOP FULLSCREEN: Menghilangkan seluruh UI sistem (Status Bar & Nav Bar).
     * Mendukung tampilan murni APK di seluruh HP Android.
     */
    display: 'fullscreen',
    display_override: ['fullscreen', 'standalone', 'window-controls-overlay', 'minimal-ui'],
    background_color: '#ffffff',
    theme_color: '#1768B3',
    orientation: 'portrait',
    lang: 'id',
    dir: 'ltr',
    categories: ['shopping', 'business', 'lifestyle', 'social', 'productivity'],
    prefer_related_applications: false,
    
    icons: [
      {
        src: 'https://placehold.co/192x192/1768B3/white?text=JS',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: 'https://placehold.co/512x512/1768B3/white?text=Jastip+Siau',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
    ],

    screenshots: [
      {
        src: ss1?.imageUrl || 'https://picsum.photos/seed/jastip1/1080/1920',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Dashboard Utama Jastip Siau'
      },
      {
        src: ss2?.imageUrl || 'https://picsum.photos/seed/jastip2/1080/1920',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Siau Connect: Radar Sosial'
      },
      {
        src: ss3?.imageUrl || 'https://picsum.photos/seed/jastip3/1080/1920',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Pasar Digital UMKM Siau'
      },
      {
        src: ss4?.imageUrl || 'https://picsum.photos/seed/jastip4/1920/1080',
        sizes: '1920x1080',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Panel Kendali Pimpinan Siau'
      }
    ],

    shortcuts: [
      {
        name: 'Siau Connect',
        short_name: 'Connect',
        url: '/?view=community',
        icons: [{ src: 'https://placehold.co/96x96/1768B3/white?text=Connect', sizes: '96x96' }]
      },
      {
        name: 'Pesanan Saya',
        short_name: 'Orders',
        url: '/?view=orders',
        icons: [{ src: 'https://placehold.co/96x96/1768B3/white?text=Orders', sizes: '96x96' }]
      }
    ]
  }
}
