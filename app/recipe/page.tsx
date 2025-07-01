'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { RecipeCard } from '@/components/recipe-card';
import { RecipeSkeleton } from '@/components/recipe-skeleton';
import { Home, AlertTriangle } from 'lucide-react';
import { createRecipe } from '@/app/actions';
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function RecipePageComponent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [recipe, setRecipe] = useState<GenerateRecipeOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const ingredients = searchParams.get('ingredients');
    const vegetarian = searchParams.get('vegetarian') === 'true';
    const glutenFree = searchParams.get('glutenFree') === 'true';
    const airFryer = searchParams.get('airFryer') === 'true';

    useEffect(() => {
        if (!ingredients) {
            setError("No se proporcionaron ingredientes para generar una receta.");
            setIsLoading(false);
            return;
        }

        const fetchRecipe = async () => {
            setIsLoading(true);
            setRecipe(null);
            setError(null);

            const result = await createRecipe(ingredients, vegetarian, glutenFree, airFryer);
            if (result.error) {
                setError(result.error);
            } else {
                setRecipe(result.recipe);
            }
            setIsLoading(false);
        };

        fetchRecipe();
    }, [ingredients, vegetarian, glutenFree, airFryer]);
    
    const handleGenerateWithSuggestions = (newIngredients: string[]) => {
        const params = new URLSearchParams();
        params.set('ingredients', newIngredients.join(', '));
        if (vegetarian) params.set('vegetarian', 'true');
        if (glutenFree) params.set('glutenFree', 'true');
        if (airFryer) params.set('airFryer', 'true');
        
        router.push(`/recipe?${params.toString()}`);
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-4 md:p-8">
            <main className="w-full max-w-2xl">
                 <header className="flex justify-between items-center w-full mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold font-headline">
                        Tu Receta Generada
                    </h1>
                    <nav>
                        <Link href="/" passHref>
                            <Button variant="ghost">
                                <Home className="mr-2" />
                                Inicio
                            </Button>
                        </Link>
                    </nav>
                </header>

                <div>
                    {isLoading && <RecipeSkeleton />}
                    {error && !isLoading && (
                         <Card>
                            <CardHeader>
                                <CardTitle className="text-destructive flex items-center gap-2">
                                    <AlertTriangle />
                                    Error al generar la receta
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{error}</p>
                                <Link href="/" passHref>
                                    <Button variant="outline" className="mt-4">
                                        Volver al inicio
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                    {recipe && !isLoading && !error && (
                        <RecipeCard recipe={recipe} onGenerateWithSuggestions={handleGenerateWithSuggestions} />
                    )}
                </div>

            </main>
        </div>
    );
}

export default function RecipePage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center min-h-screen p-4 md:p-8">
                <main className="w-full max-w-2xl">
                    <RecipeSkeleton/>
                </main>
            </div>
        }>
            <RecipePageComponent />
        </Suspense>
    )
}
