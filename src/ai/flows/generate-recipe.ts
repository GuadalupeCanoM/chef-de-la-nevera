'use server';

/**
 * @fileOverview Generates Spanish recipes based on a list of ingredients.
 *
 * - generateRecipe - A function that generates recipe suggestions.
 * - GenerateRecipeInput - The input type for the generateRecipe function.
 * - GenerateRecipeOutput - The return type for the generateRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipeInputSchema = z.object({
  ingredients: z
    .string()
    .describe('A comma-separated list of ingredients available.'),
});

export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;

const GenerateRecipeOutputSchema = z.object({
  recipeName: z.string().describe('The name of the generated recipe.'),
  ingredientsList: z
    .string()
    .describe(
      'A list of ingredients required for the recipe, including quantities.'
    ),
  instructions: z.string().describe('Step-by-step instructions for the recipe.'),
  estimatedCookingTime: z
    .string()
    .describe('The estimated cooking time for the recipe.'),
  additionalSuggestedIngredients: z
    .string()
    .describe(
      'A comma-separated list of ingredients that could enhance the recipe.'
    ),
  nutritionalInformation: z
    .string()
    .describe('Basic nutritional information for the recipe.'),
});

export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

export async function generateRecipe(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  return generateRecipeFlow(input);
}

const generateRecipePrompt = ai.definePrompt({
  name: 'generateRecipePrompt',
  input: {schema: GenerateRecipeInputSchema},
  output: {schema: GenerateRecipeOutputSchema},
  prompt: `You are a highly skilled Spanish chef. Generate a traditional Spanish recipe based on the ingredients provided. The recipe should include step-by-step instructions, a list of ingredients with quantities, and the estimated cooking time. Suggest additional ingredients that could enhance the recipe.

Ingredients: {{{ingredients}}}



Output the recipe in JSON format. The JSON must include the keys recipeName, ingredientsList, instructions, estimatedCookingTime, additionalSuggestedIngredients and nutritionalInformation.
`,
});

const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFlow',
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: GenerateRecipeOutputSchema,
  },
  async input => {
    const {output} = await generateRecipePrompt(input);
    return output!;
  }
);
