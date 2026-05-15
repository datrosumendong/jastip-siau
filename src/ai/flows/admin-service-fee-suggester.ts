'use server';
/**
 * @fileOverview An AI agent that suggests optimal service fees for delivery routes based on JASTIP SIAU rules.
 *
 * - suggestServiceFee - A function that handles the service fee suggestion process.
 * - AdminServiceFeeSuggesterInput - The input type for the suggestServiceFee function.
 * - AdminServiceFeeSuggesterOutput - The return type for the suggestServiceFee function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdminServiceFeeSuggesterInputSchema = z.object({
  distance: z.number().describe('The distance of the delivery route in kilometers.'),
  potentialTraffic:
    z.enum(['low', 'medium', 'high', 'very high']).describe('The expected traffic congestion for the delivery route.'),
  configurableParameters:
    z.string().optional().describe('Additional parameters like "NORMAL" or "EKSTRA" category and other factors.'),
});
export type AdminServiceFeeSuggesterInput = z.infer<typeof AdminServiceFeeSuggesterInputSchema>;

const AdminServiceFeeSuggesterOutputSchema = z.object({
  suggestedFee: z.number().describe('The optimal suggested service fee in local currency (Rupiah).'),
  justification: z.string().describe('A brief explanation for the suggested service fee based on the rules.'),
});
export type AdminServiceFeeSuggesterOutput = z.infer<typeof AdminServiceFeeSuggesterOutputSchema>;

export async function suggestServiceFee(
  input: AdminServiceFeeSuggesterInput
): Promise<AdminServiceFeeSuggesterOutput> {
  return adminServiceFeeSuggesterFlow(input);
}

const adminServiceFeeSuggesterPrompt = ai.definePrompt({
  name: 'adminServiceFeeSuggesterPrompt',
  input: {schema: AdminServiceFeeSuggesterInputSchema},
  output: {schema: AdminServiceFeeSuggesterOutputSchema},
  prompt: `You are an expert logistics strategist for "JASTIP SIAU". 
Your goal is to suggest an optimal service fee based on the following NEW PRICING RULES.

ATURAN TARIF DASAR (WAJIB):
1. Paket NORMAL: Rp10.000 / KM
2. Paket EKSTRA: Rp15.000 / KM

KETENTUAN TAMBAHAN:
- Jarak minimal dihitung 1 KM (jika < 1KM tetap dihitung 1KM).
- Tambahkan biaya tambahan 10-20% jika tingkat kemacetan (Traffic) adalah HIGH atau VERY HIGH.
- Analisis catatan tambahan untuk menentukan apakah ada faktor "Urgent" yang membenarkan harga ke batas atas.

PARAMETER SAAT INI:
- Jarak: {{{distance}}} KM
- Kemacetan: {{{potentialTraffic}}}
- Catatan/Kategori: {{{configurableParameters}}}

Hasilkan saran biaya total (Service Fee saja) dalam Rupiah dan berikan rincian kalkulasinya (Jarak x Tarif + Bonus Traffic jika ada) dalam Bahasa Indonesia yang profesional.
`,
});

const adminServiceFeeSuggesterFlow = ai.defineFlow(
  {
    name: 'adminServiceFeeSuggesterFlow',
    inputSchema: AdminServiceFeeSuggesterInputSchema,
    outputSchema: AdminServiceFeeSuggesterOutputSchema,
  },
  async input => {
    const {output} = await adminServiceFeeSuggesterPrompt(input);
    return output!;
  }
);
