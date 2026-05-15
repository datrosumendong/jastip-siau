import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * CONFIG: Genkit Kedaulatan AI
 * SOP: Menggunakan model Gemini 1.5 Flash secara kaku untuk stabilitas kedaulatan akses (Anti-403).
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash',
});
