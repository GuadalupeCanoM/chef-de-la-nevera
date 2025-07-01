
'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home, Search as SearchIcon } from 'lucide-react';
import { FavoriteRecipeCard } from '@/components/favorite-recipe-card';
import { RecipeSkeleton } from '@/components/recipe-skeleton';
import { searchRecipesByQuery } from '@/app/actions';
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe';
import { Card } from '@/components/ui/card';

function SearchPageComponent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('query') || '';

    const [recipes, setRecipes] = useState<GenerateRecipeOutput[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(query);

    useEffect(() => {
        setSearchTerm(query);
        if (!query) {
            setIsLoading(false);
            setRecipes([]);
            return;
        };
        
        const fetchRecipes = async () => {
            setIsLoading(true);
            setRecipes([]);
            const result = await searchRecipesByQuery(query);
            if (result.error) {
                console.error(result.error);
            } else if (result.recipes) {
                setRecipes(result.recipes);
            }
            setIsLoading(false);
        };
        fetchRecipes();
    }, [query]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
        }
    };
    
    const handleGenerateWithSuggestions = (ingredients: string[]) => {
        const params = new URLSearchParams();
        params.set('ingredients', ingredients.join(', '));
        router.push(`/recipe?${params.toString()}`);
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-4 md:p-8">
            <main className="w-full max-w-5xl">
                <header className="flex justify-between items-center w-full mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold font-headline capitalize">
                       Resultados para "{query}"
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

                <form onSubmit={handleSearch} className="relative mb-8">
                    <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Buscar más recetas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </form>

                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        <RecipeSkeleton />
                        <RecipeSkeleton />
                        <RecipeSkeleton />
                        <RecipeSkeleton />
                    </div>
                ) : recipes.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {recipes.map((recipe, index) => (
                            <FavoriteRecipeCard key={`${recipe.recipeName}-${index}`} recipe={recipe} onGenerateWithSuggestions={handleGenerateWithSuggestions} />
                        ))}
                    </div>
                ) : (
                    <Card className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg mt-16">
                        <h2 className="text-xl font-semibold text-foreground">No se encontraron recetas</h2>
                        <p className="mt-2">No pudimos encontrar recetas para "{query}". Prueba con otra búsqueda.</p>
                         <Button onClick={() => router.push('/')} className="mt-4">
                            Volver al inicio
                        </Button>
                    </Card>
                )}
            </main>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div>Buscando...</div>}>
            <SearchPageComponent />
        </Suspense>
    )
}
