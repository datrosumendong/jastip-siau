
'use server';
/**
 * @fileOverview AI Moderator untuk memindai konten negatif di Siau Connect.
 * 
 * - moderateContent - Fungsi untuk memvalidasi keamanan konten.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ContentModeratorInputSchema = z.object({
  text: z.string().describe('Teks postingan atau komentar yang akan diperiksa.'),
});

const ContentModeratorOutputSchema = z.object({
  isSafe: z.boolean().describe('Apakah konten ini aman untuk publik Siau?'),
  reason: z.string().describe('Alasan jika konten dianggap melanggar (dalam Bahasa Indonesia).'),
  severity: z.enum(['low', 'medium', 'high']).describe('Tingkat keparahan pelanggaran.'),
});

export type ContentModeratorInput = z.infer<typeof ContentModeratorInputSchema>;
export type ContentModeratorOutput = z.infer<typeof ContentModeratorOutputSchema>;

export async function moderateContent(input: ContentModeratorInput): Promise<ContentModeratorOutput> {
  return contentModeratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contentModeratorPrompt',
  input: { schema: ContentModeratorInputSchema },
  output: { schema: ContentModeratorOutputSchema },
  prompt: `Anda adalah AI Penjaga Keharmonisan di platform "JASTIP SIAU". 
Tugas Anda adalah memindai teks untuk mendeteksi ujaran kebencian, kata-kata kasar, penghinaan, atau konten yang merusak moral warga Siau.

Berikut adalah daftar kata terlarang (Forbidden Words) yang sangat dilarang:
kode, sukimai, pendo, lolo, laso, kuda cuki, babi mami, cukimai, suainenge.

TEKS YANG DIPERIKSA:
"""
{{{text}}}
"""

KRITERIA:
1. Jika mengandung kata di daftar atas, isSafe = false.
2. Jika mengandung makian umum atau penghinaan personal, isSafe = false.
3. Berikan alasan yang sopan dalam Bahasa Indonesia.
4. Tetapkan severity: HIGH jika mengandung kata terlarang di atas, MEDIUM jika makian umum, LOW jika hanya spam.`
});

const contentModeratorFlow = ai.defineFlow(
  {
    name: 'contentModeratorFlow',
    inputSchema: ContentModeratorInputSchema,
    outputSchema: ContentModeratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
