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
  imageUrl: z.string().describe('A data URI of an image of the recipe.'),
});

export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

export async function generateRecipe(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  return generateRecipeFlow(input);
}

const generateRecipePrompt = ai.definePrompt({
  name: 'generateRecipePrompt',
  input: {schema: GenerateRecipeInputSchema},
  output: {schema: GenerateRecipeOutputSchema.omit({ imageUrl: true })},
  prompt: `Eres un chef español de gran talento. Genera una receta tradicional española basada en los ingredientes proporcionados. La receta completa, incluyendo todos los campos del JSON, debe estar en español. La receta debe incluir instrucciones paso a paso, una lista de ingredientes con cantidades y el tiempo de cocción estimado. Sugiere ingredientes adicionales que podrían mejorar la receta.

Ingredientes: {{{ingredients}}}

La salida debe ser en formato JSON. El JSON debe incluir las claves recipeName, ingredientsList, instructions, estimatedCookingTime, additionalSuggestedIngredients y nutritionalInformation. Todo el texto en los valores del JSON debe estar en español.`,
});

const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFlow',
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: GenerateRecipeOutputSchema,
  },
  async input => {
    const {output: recipeDetails} = await generateRecipePrompt(input);
    if (!recipeDetails) {
        throw new Error('Could not generate recipe');
    }

    const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `A photorealistic, appetizing photo of a freshly prepared dish of ${recipeDetails.recipeName}, ready to be served.`,
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    return {
        ...recipeDetails,
        imageUrl: media?.url ?? '',
    };
  }
);
