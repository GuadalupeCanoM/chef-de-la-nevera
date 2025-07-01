'use server';

/**
 * @fileOverview Identifies ingredients from an image of a fridge.
 *
 * - identifyIngredients - A function that identifies ingredients from an image.
 * - IdentifyIngredientsInput - The input type for the identifyIngredients function.
 * - IdentifyIngredientsOutput - The return type for the identifyIngredients function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyIngredientsInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image of food items, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyIngredientsInput = z.infer<typeof IdentifyIngredientsInputSchema>;

const IdentifyIngredientsOutputSchema = z.object({
  ingredients: z
    .string()
    .describe('A comma-separated list of identified ingredients in Spanish.'),
});
export type IdentifyIngredientsOutput = z.infer<typeof IdentifyIngredientsOutputSchema>;

export async function identifyIngredients(
  input: IdentifyIngredientsInput
): Promise<IdentifyIngredientsOutput> {
  return identifyIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyIngredientsPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: IdentifyIngredientsInputSchema},
  output: {schema: IdentifyIngredientsOutputSchema},
  prompt: `Eres un experto identificando comida. Analiza la siguiente imagen de un frigorífico y lista todos los ingredientes que veas. Devuelve el resultado como una lista separada por comas en español. Prioriza ingredientes comunes. Por ejemplo: 'huevos, leche, queso, tomates, cebolla'.

Imagen: {{media url=imageDataUri}}`,
});

const identifyIngredientsFlow = ai.defineFlow(
  {
    name: 'identifyIngredientsFlow',
    inputSchema: IdentifyIngredientsInputSchema,
    outputSchema: IdentifyIngredientsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
