'use server';

/**
 * @fileOverview Suggests search terms for recipes based on user input.
 *
 * - suggestSearchTerms - A function that provides search suggestions.
 * - SuggestSearchTermsInput - The input type for the suggestSearchTerms function.
 * - SuggestSearchTermsOutput - The return type for the suggestSearchTerms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSearchTermsInputSchema = z.object({
  query: z
    .string()
    .describe('The partial search query from the user in Spanish.'),
});
export type SuggestSearchTermsInput = z.infer<typeof SuggestSearchTermsInputSchema>;


const SuggestSearchTermsOutputSchema = z.object({
    suggestions: z.array(z.string()).describe('A list of 5 relevant search suggestions in Spanish.'),
});
export type SuggestSearchTermsOutput = z.infer<typeof SuggestSearchTermsOutputSchema>;


const prompt = ai.definePrompt({
  name: 'suggestSearchTermsPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: SuggestSearchTermsInputSchema},
  output: {schema: SuggestSearchTermsOutputSchema},
  prompt: `Eres un asistente útil para una aplicación de recetas. Basado en la consulta de búsqueda parcial del usuario, proporciona 5 sugerencias de búsqueda relevantes. Las sugerencias pueden ser nombres de recetas o ingredientes. La consulta está en español. Proporciona las sugerencias en español.

Consulta del usuario: {{{query}}}

La salida debe estar en formato JSON.`,
});

const suggestSearchTermsFlow = ai.defineFlow(
  {
    name: 'suggestSearchTermsFlow',
    inputSchema: SuggestSearchTermsInputSchema,
    outputSchema: SuggestSearchTermsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


export async function suggestSearchTerms(
  input: SuggestSearchTermsInput
): Promise<SuggestSearchTermsOutput> {
  return suggestSearchTermsFlow(input);
}
