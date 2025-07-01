'use server';

/**
 * @fileOverview Generates an image for a recipe based on a hint.
 *
 * - generateImageForRecipe - A function that generates an image URL.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageInputSchema = z.object({
  imageHint: z
    .string()
    .describe(
      'A short, 2-word hint in English for generating an image of the recipe (e.g., "paella seafood").'
    ),
});

const GenerateImageOutputSchema = z.object({
    imageUrl: z.string().describe('A URL for an image of the recipe.'),
});

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async ({ imageHint }) => {
    let imageUrl = `https://placehold.co/600x400.png`; // Default placeholder

    if (!imageHint) {
        return { imageUrl };
    }

    try {
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `a delicious professional photo of ${imageHint}, spanish cuisine style`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });
      if (media?.url) {
        imageUrl = media.url;
      }
    } catch (e) {
      console.error("Image generation failed, using placeholder.", e);
    }
    
    return { imageUrl };
  }
);

export async function generateImageForRecipe(imageHint: string): Promise<string> {
    if (!imageHint) {
        return `https://placehold.co/600x400.png`;
    }
    const result = await generateImageFlow({ imageHint });
    return result.imageUrl;
}
