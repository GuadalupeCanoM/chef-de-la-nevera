// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview Suggests missing ingredients for a recipe to improve or complete it.
 *
 * - suggestMissingIngredients - A function that suggests missing ingredients for a given recipe.
 * - SuggestMissingIngredientsInput - The input type for the suggestMissingIngredients function.
 * - SuggestMissingIngredientsOutput - The return type for the suggestMissingIngredients function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMissingIngredientsInputSchema = z.object({
  recipe: z.string().describe('The recipe for which to suggest missing ingredients.'),
  ingredients: z.string().describe('The ingredients currently available.'),
});
export type SuggestMissingIngredientsInput = z.infer<typeof SuggestMissingIngredientsInputSchema>;

const SuggestMissingIngredientsOutputSchema = z.object({
  missingIngredients: z
    .string()
    .describe('A comma-separated list of ingredients that would improve the recipe.'),
});
export type SuggestMissingIngredientsOutput = z.infer<typeof SuggestMissingIngredientsOutputSchema>;

export async function suggestMissingIngredients(input: SuggestMissingIngredientsInput): Promise<SuggestMissingIngredientsOutput> {
  return suggestMissingIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMissingIngredientsPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: SuggestMissingIngredientsInputSchema},
  output: {schema: SuggestMissingIngredientsOutputSchema},
  prompt: `Dada la siguiente receta e ingredientes disponibles, sugiere una breve lista de ingredientes que falten y que mejorarían significativamente o completarían la receta. Los ingredientes deben ser comunes en la cocina típica española. Devuelve una lista separada por comas y en español. No incluyas cantidades.

Receta: {{{recipe}}}

Ingredientes disponibles: {{{ingredients}}}`,
});

const suggestMissingIngredientsFlow = ai.defineFlow(
  {
    name: 'suggestMissingIngredientsFlow',
    inputSchema: SuggestMissingIngredientsInputSchema,
    outputSchema: SuggestMissingIngredientsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
