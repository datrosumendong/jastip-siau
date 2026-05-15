'use server';
/**
 * @fileOverview AI Calculator untuk menentukan harga jual UMKM Siau agar tidak rugi.
 * 
 * - calculateProductPrice - Fungsi untuk memicu hitungan AI berbasis modal dan margin.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PricingInputSchema = z.object({
  productName: z.string().describe('Nama produk yang akan dihitung harganya.'),
  materials: z.array(z.object({
    name: z.string().describe('Nama bahan baku.'),
    packPrice: z.number().describe('Harga beli per pak/grosir (misal: Harga 1 lusin atau 1 bal).'),
    qtyPerPack: z.number().describe('Jumlah isi di dalam satu pak tersebut (misal: 12, 50, atau 1000 untuk gram).'),
    usagePerPorsi: z.number().describe('Jumlah yang digunakan untuk satu porsi produk (misal: 1 cup, atau 100 untuk 100 gram).')
  })).describe('Daftar bahan baku dengan rincian isi per pak untuk akurasi HPP.'),
  productionCost: z.number().describe('Biaya produksi tambahan per porsi seperti tenaga kerja, listrik, atau kemasan.'),
  targetProfitPercent: z.number().describe('Persentase keuntungan yang diinginkan (misal 20 untuk 20%).'),
});

const PricingOutputSchema = z.object({
  cogs: z.number().describe('Total Harga Pokok Penjualan (HPP) / Modal dasar per porsi.'),
  suggestedPrice: z.number().describe('Harga jual yang disarankan untuk mendapatkan untung.'),
  profitAmount: z.number().describe('Jumlah keuntungan bersih per porsi produk.'),
  breakdown: z.string().describe('Penjelasan rincian biaya per unit dalam Bahasa Indonesia.'),
  tips: z.string().describe('Saran strategi agar produk lebih bersaing di pasar Siau.'),
});

export type PricingInput = z.infer<typeof PricingInputSchema>;
export type PricingOutput = z.infer<typeof PricingOutputSchema>;

export async function calculateProductPrice(input: PricingInput): Promise<PricingOutput> {
  return pricingCalculatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'pricingCalculatorPrompt',
  input: { schema: PricingInputSchema },
  output: { schema: PricingOutputSchema },
  prompt: `Anda adalah Konsultan Strategi Bisnis UMKM untuk "JASTIP SIAU". 
Tugas Anda adalah membantu pedagang lokal menghitung harga jual yang tepat agar TIDAK RUGI.

DATA PRODUK:
- Nama: {{{productName}}}
- Biaya Operasional/Porsi: Rp{{{productionCost}}}
- Target Untung: {{{targetProfitPercent}}}%

BAHAN BAKU (GROSIR):
{{#each materials}}
- {{{name}}}: Harga Pak Rp{{{packPrice}}} / Isi {{{qtyPerPack}}} Unit. (Pemakaian: {{{usagePerPorsi}}} Unit)
{{/each}}

INSTRUKSI KALKULASI (WAJIB):
1. Hitung biaya per unit untuk setiap bahan: (Harga Pak / Isi Pak) * Pemakaian.
2. Jumlahkan seluruh biaya bahan unit + Biaya Operasional untuk mendapatkan HPP (COGS).
3. Hitung harga jual final agar mendapatkan untung bersih sesuai target {{{targetProfitPercent}}}%.
4. Berikan rincian kalkulasi yang sangat transparan (Sebutkan harga modal per biji/gram).
5. Berikan tips singkat cara meningkatkan nilai jual produk tersebut di Siau.
6. Gunakan Bahasa Indonesia yang ramah, profesional, dan memotivasi.`
});

const pricingCalculatorFlow = ai.defineFlow(
  {
    name: 'pricingCalculatorFlow',
    inputSchema: PricingInputSchema,
    outputSchema: PricingOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
