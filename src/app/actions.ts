"use server";

import { generateRecipe, type GenerateRecipeOutput } from "@/ai/flows/generate-recipe";
import { identifyIngredients } from "@/ai/flows/identify-ingredients-flow";
import { generateCategories, type CategoryOutput } from "@/ai/flows/generate-categories";


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

export async function createRecipesByCategory(
    category: string
): Promise<{ recipes: GenerateRecipeOutput[] | null; error: string | null; }> {
    if (!category) {
        return { recipes: null, error: "Por favor, proporciona una categoría." };
    }

    try {
        // Generamos 3 recetas para la categoría
        const recipePromises = Array.from({ length: 3 }).map(() =>
            generateRecipe({ category })
        );
        
        const recipes = await Promise.all(recipePromises);
        return { recipes, error: null };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "Ha ocurrido un error desconocido.";
        return { recipes: null, error: `No se pudieron generar las recetas: ${errorMessage}` };
    }
}

export async function searchRecipesByQuery(
    query: string
): Promise<{ recipes: GenerateRecipeOutput[] | null; error: string | null; }> {
    if (!query) {
        return { recipes: null, error: "Por favor, introduce un término de búsqueda." };
    }

    try {
        // Generamos 3 recetas para la búsqueda. Usamos el query como si fueran ingredientes.
        const recipePromises = Array.from({ length: 3 }).map(() =>
            generateRecipe({ ingredients: query })
        );
        const recipes = await Promise.all(recipePromises);
        return { recipes, error: null };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "Ha ocurrido un error desconocido.";
        return { recipes: null, error: `No se pudieron buscar las recetas: ${errorMessage}` };
    }
}

export async function getAiCategories(): Promise<{ categories: CategoryOutput[] | null; error: string | null; }> {
    try {
        const categories = await generateCategories();
        return { categories, error: null };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "Ha ocurrido un error desconocido.";
        return { categories: null, error: `No se pudieron generar las categorías: ${errorMessage}` };
    }
}
