'use server';

/**
 * @fileOverview Generates food categories with corresponding images using AI.
 *
 * - generateCategories - A function that generates a list of food categories with AI-generated images.
 * - CategoryOutput - The output type for a single category.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorySuggestionSchema = z.object({
  name: z.string().describe('The name of the food category in Spanish (e.g., "Tapas Españolas").'),
  slug: z.string().describe('A URL-friendly slug for the category (e.g., "tapas-espanolas").'),
  imageHint: z.string().describe('A short, 2-word hint in English for generating an image (e.g., "spanish tapas").'),
});

const CategoriesOutputSchema = z.array(CategorySuggestionSchema);

const CategoryOutputSchema = z.object({
    name: z.string(),
    slug: z.string(),
    imageUrl: z.string(),
    imageHint: z.string(),
});
export type CategoryOutput = z.infer<typeof CategoryOutputSchema>;


const generateCategoriesPrompt = ai.definePrompt({
    name: 'generateCategoriesPrompt',
    input: { schema: z.undefined() },
    output: { schema: CategoriesOutputSchema },
    prompt: `Genera una lista de 4 categorías de comida española diversas y atractivas. Para cada categoría, proporciona un nombre en español, un slug amigable para URL y una pista de 2 palabras en inglés para generar una imagen.

Ejemplo de formato de salida:
[
  { "name": "Tapas Clásicas", "slug": "tapas-clasicas", "imageHint": "spanish tapas" },
  { "name": "Paellas y Arroces", "slug": "paellas-arroces", "imageHint": "seafood paella" }
]

La salida DEBE ser un array JSON válido.`,
});


const generateCategoriesFlow = ai.defineFlow(
  {
    name: 'generateCategoriesFlow',
    inputSchema: z.undefined(),
    outputSchema: z.array(CategoryOutputSchema),
  },
  async () => {
    const { output: categorySuggestions } = await generateCategoriesPrompt();
    if (!categorySuggestions) {
        throw new Error('Could not generate category suggestions.');
    }

    const imageGenerationPromises = categorySuggestions.map(async (category) => {
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: `A vibrant, photorealistic, and appetizing photo representing the spanish food category: "${category.name}". The photo should be beautiful and look professionally taken. Image hint: ${category.imageHint}`,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });

        return {
            ...category,
            imageUrl: media?.url ?? `https://placehold.co/400x400.png`,
        };
    });

    const categoriesWithImages = await Promise.all(imageGenerationPromises);
    return categoriesWithImages;
  }
);

export async function generateCategories(): Promise<CategoryOutput[]> {
    return generateCategoriesFlow();
}
