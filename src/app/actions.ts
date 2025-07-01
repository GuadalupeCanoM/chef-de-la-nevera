"use server";

import { generateRecipe, type GenerateRecipeOutput } from "@/ai/flows/generate-recipe";
import { identifyIngredients } from "@/ai/flows/identify-ingredients-flow";
import { suggestSearchTerms } from "@/ai/flows/suggest-search-terms";
import { generateImageForRecipe as generateImageForRecipeFlow } from "@/ai/flows/generate-recipe-image";


export async function createRecipe(
    ingredients: string,
    vegetarian?: boolean,
    glutenFree?: boolean,
    airFryer?: boolean
): Promise<{ recipe: GenerateRecipeOutput | null; error: string | null; }> {
    if (!ingredients) {
        return { recipe: null, error: "Por favor, introduce algunos ingredientes." };
    }

    try {
        const recipe = await generateRecipe({ ingredients, vegetarian, glutenFree, airFryer });
        return { recipe, error: null };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "Ha ocurrido un error desconocido.";
        return { recipe: null, error: `No se pudo generar la receta: ${errorMessage}` };
    }
}

export async function identifyIngredientsFromImage(
    imageDataUri: string
): Promise<{ ingredients: string | null; error: string | null; }> {
    if (!imageDataUri) {
        return { ingredients: null, error: "No se ha proporcionado ninguna imagen." };
    }

    try {
        const result = await identifyIngredients({ imageDataUri });
        return { ingredients: result.ingredients, error: null };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "Ha ocurrido un error desconocido.";
        return { ingredients: null, error: `No se pudieron identificar los ingredientes: ${errorMessage}` };
    }
}

export async function searchRecipesByQuery(
    query: string
): Promise<{ recipes: GenerateRecipeOutput[] | null; error: string | null; }> {
    if (!query) {
        return { recipes: null, error: "Por favor, introduce un término de búsqueda." };
    }

    try {
        const recipePromises: Promise<GenerateRecipeOutput>[] = [];
        // Generate 3 recipes in parallel
        for (let i = 0; i < 3; i++) {
            recipePromises.push(generateRecipe({ ingredients: query }));
        }
        const recipes = await Promise.all(recipePromises);
        return { recipes, error: null };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "Ha ocurrido un error desconocido.";
        return { recipes: null, error: `No se pudieron buscar las recetas: ${errorMessage}` };
    }
}

export async function createRecipesByCategory(
    category: string
): Promise<{ recipes: GenerateRecipeOutput[] | null; error: string | null; }> {
    if (!category) {
        return { recipes: null, error: "Por favor, introduce una categoría." };
    }

    try {
        const recipePromises: Promise<GenerateRecipeOutput>[] = [];
        // Generate 4 recipes in parallel
        for (let i = 0; i < 4; i++) {
            recipePromises.push(generateRecipe({ category }));
        }
        const recipes = await Promise.all(recipePromises);
        return { recipes, error: null };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "Ha ocurrido un error desconocido.";
        return { recipes: null, error: `No se pudieron generar las recetas para la categoría: ${errorMessage}` };
    }
}


export async function getSearchSuggestions(
    query: string
): Promise<{ suggestions: string[] | null; error: string | null; }> {
    if (!query || query.length < 2) {
        return { suggestions: [], error: null };
    }

    try {
        const result = await suggestSearchTerms({ query });
        return { suggestions: result.suggestions, error: null };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "Ha ocurrido un error desconocido.";
        return { suggestions: null, error: `No se pudieron obtener sugerencias: ${errorMessage}` };
    }
}

export async function generateRecipeImage(
    imageHint: string
): Promise<{ imageUrl: string | null; error: string | null }> {
    if (!imageHint) {
        return { imageUrl: null, error: "No image hint provided." };
    }

    try {
        const imageUrl = await generateImageForRecipeFlow(imageHint);
        return { imageUrl, error: null };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        return { imageUrl: null, error: `Failed to generate image: ${errorMessage}` };
    }
}
