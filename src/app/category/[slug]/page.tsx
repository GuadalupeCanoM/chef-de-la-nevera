'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home, Search } from 'lucide-react';
import { RecipeCard } from '@/components/recipe-card';
import { RecipeSkeleton } from '@/components/recipe-skeleton';
import { createRecipesByCategory } from '@/app/actions';
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe';
import { Card } from '@/components/ui/card';

const getTitleFromSlug = (slug: string) => {
    if (!slug) return "";
    return decodeURIComponent(slug).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
    const [recipes, setRecipes] = useState<GenerateRecipeOutput[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const { slug } = params;
    const categoryName = useMemo(() => getTitleFromSlug(slug), [slug]);

    useEffect(() => {
        if (!categoryName) return;
        
        const fetchRecipes = async () => {
            setIsLoading(true);
            setRecipes([]);
            const result = await createRecipesByCategory(categoryName);
            if (result.error) {
                console.error(result.error);
            } else if (result.recipes) {
                setRecipes(result.recipes);
            }
            setIsLoading(false);
        };
        fetchRecipes();
    }, [categoryName]);

    const filteredRecipes = useMemo(() => {
        return recipes.filter(recipe =>
            recipe.recipeName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [recipes, searchTerm]);

    const handleGenerateWithSuggestions = (ingredients: string[]) => {
        const ingredientsQuery = encodeURIComponent(ingredients.join(', '));
        router.push(`/?ingredients=${ingredientsQuery}`);
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-4 md:p-8">
            <main className="w-full max-w-5xl">
                <header className="flex justify-between items-center w-full mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold font-headline capitalize">
                        {categoryName}
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

                <div className="relative mb-8">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder={`Buscar en recetas de ${categoryName}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <RecipeSkeleton />
                        <RecipeSkeleton />
                        <RecipeSkeleton />
                    </div>
                ) : filteredRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRecipes.map((recipe, index) => (
                            <RecipeCard key={index} recipe={recipe} onGenerateWithSuggestions={handleGenerateWithSuggestions} />
                        ))}
                    </div>
                ) : (
                    <Card className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg mt-16">
                        <h2 className="text-xl font-semibold text-foreground">No se encontraron recetas</h2>
                        <p className="mt-2">No pudimos generar recetas para esta categoría en este momento.</p>
                         <Button onClick={() => window.location.reload()} className="mt-4">
                            Intentar de nuevo
                        </Button>
                    </Card>
                )}
            </main>
        </div>
    );
}
