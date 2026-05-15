 # JASTIP SIAU - Mahakarya Arsitektur Premium (V650)

Selamat datang di pusat pengembangan sistem Jastip Siau. Aplikasi ini dibangun dengan disiplin arsitektur **Modified MVC (Model-View-Controller)** yang dioptimalkan untuk stabilitas singleton, kedaulatan sinyal, dan performa real-time.

## 🛠️ Teknologi Utama (The Arsenal)
*   **Next.js 15**: Arsitektur App Router untuk performa SSR kasta tinggi.
*   **Firebase Engine**: Autentikasi dan Firestore Real-time untuk sinyal instan.
*   **Tailwind CSS**: Desain UI yang lincah, modern, dan sangat responsif.
*   **ShadCN UI**: Koleksi komponen visual dengan estetika premium.
*   **Google Genkit**: Mesin kecerdasan buatan (AI) untuk asisten strategis pimpinan.

## 🏁 Memulai Pengembangan
1.  Pastikan `Node.js` v18+ telah bertahta di pangkalan lokal.
2.  Jalankan perintah `npm install` untuk memasang seluruh modul tempur.
3.  Pastikan file `.env` berisi Kunci API Firebase dan Gemini yang berdaulat.
4.  Jalankan `npm run dev` untuk menyalakan mesin di port `9002`.
5.  Akses kedaulatan melalui [http://localhost:9002](http://localhost:9002).

---

## 🏛️ Struktur Arsitektur (The Bastion)

### 1. MODEL (The Engine) - `src/firebase/`
*   **Peran**: Mengelola koneksi tunggal ke basis data, autentikasi, dan sinyal radar (FCM).
*   **Integritas**: Menggunakan pola *Singleton Engine* (Anti-ca9) untuk mencegah galat inisialisasi ganda.

### 2. CONTROLLER (The Logic) - `src/hooks/controllers/`
*   **Peran**: Menangani seluruh logika bisnis, koordinasi WhatsApp, dan mutasi status atomik.

### 3. VIEW (The Presentation) - `src/app/dashboard/`
*   **Peran**: Menangani presentasi visual murni (Pure UI) menggunakan ShadCN UI dan Tailwind CSS.

---

## 🛡️ SOVEREIGN ORDER LIFECYCLE (PROTOKOL V650)
*Dilarang keras merubah urutan kaku di bawah ini karena merupakan landasan operasional platform.*

### A. Inisiasi Sinyal (The First Strike)
1.  **Jalur UMKM**: Member Order -> Sinyal WA & Notif ditembakkan pertama ke **TOKO**. Item terkunci sesuai katalog.
2.  **Jalur Bebas**: Member Order -> Sinyal WA & Notif ditembakkan langsung ke **KURIR**.

### B. Koordinasi 3 Arah (The Triad Synergy)
1.  **Veto Toko**: Kurir dilarang melihat tombol "Terima" sebelum Toko menyetujui ketersediaan stok (`shop_accepted`).
2.  **Handover**: Toko Setuju -> Kurir Konfirmasi -> WA ke Toko: "Kurir Siap, Siapkan Produk".
3.  **Ready-to-Pickup**: Toko klik "Produk Siap" -> WA ke Kurir: "Jemput Pesanan".
4.  **Action Terminal**: Kurir Jemput -> Input Harga Nota -> WA ke Member detail tagihan & jasa.

### C. Penegakan Sanksi & Hukum (The Gavel)
1.  **Arrival**: Kurir Tiba -> WA ke Member.
2.  **Final Execution**:
    *   **LUNAS**: Status `completed` -> Poin Ranking Kurir (+1) & Member (+1) bertambah di Vault Independen.
    *   **GAGAL BAYAR**: Kurir lapor sanksi -> Status `isReportedUnpaid` -> **Lockdown Akses Member** (Blokir pemesanan otomatis).

### D. Vault Reputasi & Purge System
1.  **Peringkat**: Bertahta di koleksi `monthly_rankings`. Kebal dari penghapusan data order operasional.
2.  **Testimoni**: Member submit ulasan -> Poin ranking member instan -> Teks ulasan masuk antrean moderasi (`isApproved: false`).
3.  **Chat Purge**: Status `completed` atau `cancelled` memicu penghapusan berantai (Recursive Deletion) pada log pesan dan dokumen chat. Jalur sengketa tetap ada sampai lunas.

---
© 2024 Jastip Siau. Melayani dengan integritas di Bumi Karangetang.