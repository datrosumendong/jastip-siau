
'use server';
/**
 * @fileOverview AI Assistant untuk membantu Admin menjawab komplain pelanggan dengan memeriksa data pesanan.
 * 
 * - generateComplaintResponse - Fungsi untuk memicu AI menghasilkan jawaban resolusi berbasis data pesanan.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ComplaintAIInputSchema = z.object({
  complaintReason: z.string().describe('Alasan awal komplain diajukan'),
  userName: z.string().describe('Nama pelanggan yang melapor'),
  orderData: z.object({
    id: z.string(),
    items: z.array(z.string()),
    totalAmount: z.number(),
    serviceFee: z.number(),
    itemPrice: z.number(),
    status: z.string(),
    courierName: z.string().optional(),
    distance: z.number().optional(),
    createdAt: z.string().optional(),
  }).describe('Data teknis pesanan untuk referensi AI'),
  chatHistory: z.array(z.object({
    senderName: z.string(),
    text: z.string(),
  })).describe('Riwayat percakapan terakhir'),
});

const ComplaintAIOutputSchema = z.object({
  suggestedResponse: z.string().describe('Saran jawaban dari AI untuk Admin'),
});

export type ComplaintAIInput = z.infer<typeof ComplaintAIInputSchema>;
export type ComplaintAIOutput = z.infer<typeof ComplaintAIOutputSchema>;

export async function generateComplaintResponse(input: ComplaintAIInput): Promise<ComplaintAIOutput> {
  return complaintAIFlow(input);
}

const complaintPrompt = ai.definePrompt({
  name: 'complaintAIPrompt',
  input: { schema: ComplaintAIInputSchema },
  output: { schema: ComplaintAIOutputSchema },
  prompt: `Anda adalah perwakilan resmi dari Tim Admin Resolusi Konflik di "JASTIP SIAU". 
Tugas Anda adalah membalas pesan komplain pelanggan sebagai manusia yang sangat sopan, profesional, dan berbasis DATA FAKTUAL.

PENTING: Jangan pernah menyebut diri Anda sebagai AI, asisten virtual, atau program. Bicaralah seolah-olah Anda adalah Admin manusia yang sedang mengetik pesan bantuan.

DATA PELAPOR:
- Nama: {{{userName}}}
- Alasan Laporan: "{{{complaintReason}}}"

REFERENSI DATA PESANAN (GUNAKAN INI SEBAGAI FAKTA):
- Order ID: {{{orderData.id}}}
- Status Saat Ini: {{{orderData.status}}}
- Daftar Barang: {{#each orderData.items}}{{{this}}}, {{/each}}
- Total Belanja: Rp{{{orderData.itemPrice}}}
- Biaya Jasa Jastip: Rp{{{orderData.serviceFee}}}
- Total Bayar: Rp{{{orderData.totalAmount}}}
- Kurir Pelaksana: {{{orderData.courierName}}}
- Jarak Antar: {{{orderData.distance}}} KM

RIWAYAT CHAT TERAKHIR:
{{#each chatHistory}}
- {{{senderName}}}: {{{text}}}
{{/each}}

INSTRUKSI KHUSUS:
1. Gunakan fakta dari DATA PESANAN di atas dalam jawaban Anda (misal: menyebutkan nama kurir atau rincian harga jika relevan).
2. Jika pelanggan bertanya soal harga, jelaskan rincian belanjanya secara sopan.
3. Gunakan Bahasa Indonesia yang ramah, profesional, dan menunjukkan empati tinggi.
4. Hindari bahasa yang kaku seperti robot. Awali dengan permohonan maaf atas ketidaknyamanan yang terjadi.
5. Hasilkan 1-2 paragraf jawaban yang siap dikirim langsung atas nama Admin.`
});

const complaintAIFlow = ai.defineFlow(
  {
    name: 'complaintAIFlow',
    inputSchema: ComplaintAIInputSchema,
    outputSchema: ComplaintAIOutputSchema,
  },
  async (input) => {
    const { output } = await complaintPrompt(input);
    return output!;
  }
);
