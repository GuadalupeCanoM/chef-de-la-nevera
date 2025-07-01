"use server";

import { generateRecipe, type GenerateRecipeOutput } from "@/ai/flows/generate-recipe";

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
