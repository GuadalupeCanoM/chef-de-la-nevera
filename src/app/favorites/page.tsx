'use client';

import { useFavorites } from '@/hooks/use-favorites';
import { RecipeCard } from '@/components/recipe-card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, BookHeart } from 'lucide-react';

export default function FavoritesPage() {
    const { favorites } = useFavorites();

    return (
        <div className="flex flex-col items-center min-h-screen p-4 md:p-8">
            <main className="w-full max-w-2xl">
                 <header className="flex justify-between items-center w-full mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold font-headline flex items-center gap-3">
                        <BookHeart className="w-10 h-10 text-primary" />
                        Recetas Favoritas
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

                {favorites.length > 0 ? (
                    <div className="space-y-8">
                        {favorites.map((recipe, index) => (
                            <RecipeCard key={index} recipe={recipe} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg mt-16">
                        <BookHeart className="w-12 h-12 mx-auto mb-4 text-primary/70" />
                        <h2 className="text-xl font-semibold text-foreground">No tienes recetas favoritas guardadas.</h2>
                        <p className="mt-2">Cuando generes una receta que te guste, haz clic en el corazón para guardarla aquí.</p>
                         <Link href="/" passHref className='mt-6 inline-block'>
                            <Button>
                                Crear mi primera receta
                            </Button>
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
