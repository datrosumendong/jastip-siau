'use server';
/**
 * @fileOverview File ini mengimplementasikan alur Genkit bagi administrator untuk menghasilkan ringkasan dan wawasan
 * dari transaksi keuangan dan data aktivitas kurir menggunakan perintah bahasa alami.
 *
 * - generateAdminFinancialInsights - Fungsi yang memicu alur AI untuk menghasilkan wawasan keuangan.
 * - AdminFinancialInsightGeneratorInput - Tipe input untuk fungsi generateAdminFinancialInsights.
 * - AdminFinancialInsightGeneratorOutput - Tipe return untuk fungsi generateAdminFinancialInsights.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AdminFinancialInsightGeneratorInputSchema = z.object({
  transactions: z.array(z.object({
    id: z.string().describe('ID transaksi unik.'),
    amount: z.number().describe('Jumlah transaksi.'),
    type: z.enum(['order', 'fee', 'payout', 'other']).describe('Jenis transaksi.'),
    date: z.string().describe('Tanggal transaksi dalam format YYYY-MM-DD.'),
    userId: z.string().optional().describe('ID pengguna.'),
    courierId: z.string().optional().describe('ID kurir.'),
    description: z.string().optional().describe('Deskripsi singkat transaksi.'),
  })).describe('Array catatan transaksi keuangan.'),
  courierActivity: z.array(z.object({
    courierId: z.string().describe('ID unik kurir.'),
    status: z.enum(['online', 'offline', 'busy']).describe('Status kurir saat ini.'),
    ordersCompleted: z.number().describe('Jumlah pesanan selesai.'),
    hoursOnline: z.number().describe('Total jam online.'),
    lastOnline: z.string().optional().describe('Timestamp terakhir.'),
  })).describe('Array catatan aktivitas kurir.'),
  adminPrompt: z.string().describe('Perintah spesifik dari pimpinan admin.'),
});
export type AdminFinancialInsightGeneratorInput = z.infer<typeof AdminFinancialInsightGeneratorInputSchema>;

const AdminFinancialInsightGeneratorOutputSchema = z.object({
  summary: z.string().describe('Ringkasan singkat indikator kinerja utama.'),
  insights: z.array(z.string()).describe('Daftar wawasan utama berbasis data.'),
  recommendations: z.array(z.string()).describe('Rekomendasi taktis untuk pimpinan.'),
});
export type AdminFinancialInsightGeneratorOutput = z.infer<typeof AdminFinancialInsightGeneratorOutputSchema>;

export async function generateAdminFinancialInsights(input: AdminFinancialInsightGeneratorInput): Promise<AdminFinancialInsightGeneratorOutput> {
  return adminFinancialInsightGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adminFinancialInsightPrompt',
  input: { schema: AdminFinancialInsightGeneratorInputSchema },
  output: { schema: AdminFinancialInsightGeneratorOutputSchema },
  prompt: `Anda adalah Analis Strategis Utama untuk JASTIP SIAU.
Tugas Anda adalah membedah data transaksi dan aktivitas mitra untuk memberikan kesimpulan yang tajam bagi pimpinan.

INSTRUKSI KHUSUS:
1. Jika data transaksi kosong, berikan strategi untuk memancing minat warga menggunakan Jastip Siau.
2. Analisis performa kurir: identifikasi siapa yang paling siaga dan berikan saran apresiasi.
3. Bandingkan pilar Logistik (Kurir) dengan pilar Produksi (UMKM). Mana yang lebih mendominasi omzet?
4. Gunakan Bahasa Indonesia yang sangat profesional, memotivasi, dan berwibawa.

---
PERINTAH PIMPINAN: {{{adminPrompt}}}
---

BERKAS TRANSAKSI:
{{#if transactions}}
{{#each transactions}}
- REF: {{{id}}} | RP {{{amount}}} | Tgl: {{{date}}} | Catatan: {{{description}}}
{{/each}}
{{else}}
(DATABASE TRANSAKSI KOSONG)
{{/if}}

---

STATUS RADAR KURIR:
{{#if courierActivity}}
{{#each courierActivity}}
- ID: {{{courierId}}} | Status: {{{status}}} | Selesai: {{{ordersCompleted}}} Amanah
{{/each}}
{{else}}
(TIDAK ADA KURIR TERDETEKSI)
{{/if}}

Berikan hasil analisis Anda dalam format JSON sesuai skema output secara absolut.`
});

const adminFinancialInsightGeneratorFlow = ai.defineFlow(
  {
    name: 'adminFinancialInsightGeneratorFlow',
    inputSchema: AdminFinancialInsightGeneratorInputSchema,
    outputSchema: AdminFinancialInsightGeneratorOutputSchema,
  },
  async (input) => {
    try {
      /**
       * SOP V110: Eksekusi Radar AI
       * Menggunakan Gemini 1.5 Flash untuk kedaulatan akses mutlak (Anti-403).
       */
      const { output } = await prompt(input);
      if (!output) throw new Error("Gagal mendapatkan respons dari pangkalan AI.");
      return output;
    } catch (error) {
      // Transparansi Galat: Menyiarkan kegagalan ke konsol secara absolut untuk audit Pimpinan.
      console.error("[AI RADAR CRITICAL ERROR]:", error);
      throw error;
    }
  }
);
