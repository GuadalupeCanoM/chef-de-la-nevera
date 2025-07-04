'use server';

/**
 * @fileOverview Generates recipes based on a list of ingredients and other criteria.
 *
 * - generateRecipe - A function that generates recipe suggestions.
 * - GenerateRecipeInput - The input type for the generateRecipe function.
 * - GenerateRecipeOutput - The return type for the generateRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { generateImageForRecipe } from './generate-recipe-image';

const GenerateRecipeInputSchema = z.object({
  ingredients: z
    .string()
    .optional()
    .describe('A comma-separated list of ingredients available.'),
  category: z
    .string()
    .optional()
    .describe('The category of the recipe to generate (e.g., "Postres", "Ensaladas").'),
  cuisine: z
    .string()
    .optional()
    .describe('The cuisine or country of the recipe to generate (e.g., "Italiana", "Mexicana").'),
  vegetarian: z.boolean().optional().describe('Whether the recipe should be vegetarian.'),
  glutenFree: z.boolean().optional().describe('Whether the recipe should be gluten-free.'),
  airFryer: z.boolean().optional().describe('Whether the recipe should be for an air fryer.'),
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
  imageHint: z
    .string()
    .describe(
      'A short, 2-word hint in English for generating an image of the recipe (e.g., "chicken curry").'
    ),
  imageUrl: z.string().describe('A URL for an image of the recipe.'),
});

export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

export async function generateRecipe(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  return generateRecipeFlow(input);
}

const generateRecipePrompt = ai.definePrompt({
  name: 'generateRecipePrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: GenerateRecipeInputSchema},
  output: {schema: GenerateRecipeOutputSchema.omit({ imageUrl: true })},
  prompt: `Eres un chef de gran talento. Genera una receta de cocina. La receta completa, incluyendo todos los campos del JSON, debe estar en español. La receta debe incluir instrucciones paso a paso, donde cada paso es un elemento en una lista numerada y separada por un salto de línea (ej: "1. Picar la cebolla.\\n2. Sofreír el ajo."), una lista de ingredientes con cantidades, el tiempo de cocción estimado y una pista de 2 palabras en inglés para generar una imagen de la receta. Sugiere ingredientes adicionales que podrían mejorar la receta.

{{#if cuisine}}
La receta DEBE ser de la cocina {{{cuisine}}}.
{{else}}
Genera una receta de cualquier cocina del mundo.
{{/if}}

{{#if category}}
La receta DEBE pertenecer a la categoría: {{{category}}}.
{{/if}}
{{#if ingredients}}
La receta debe basarse en los siguientes ingredientes: {{{ingredients}}}
{{/if}}

Es OBLIGATORIO que la receta se base en los ingredientes o en la categoría proporcionada.

{{#if vegetarian}}
La receta DEBE ser vegetariana. No incluyas carne, pollo o pescado.
{{/if}}
{{#if glutenFree}}
La receta DEBE ser sin gluten. No incluyas ingredientes que contengan gluten como trigo, cebada o centeno.
{{/if}}
{{#if airFryer}}
La receta DEBE ser para una freidora de aire (air fryer).
{{/if}}

La salida debe ser en formato JSON. El JSON debe incluir las claves recipeName, ingredientsList, instructions, estimatedCookingTime, additionalSuggestedIngredients, nutritionalInformation y imageHint. Todo el texto en los valores del JSON debe estar en español.`,
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

    const imageUrl = await generateImageForRecipe(recipeDetails.imageHint || recipeDetails.recipeName);

    return {
        ...recipeDetails,
        imageUrl,
    };
  }
);
