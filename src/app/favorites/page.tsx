'use client';

import { useState } from 'react';
import { useFavorites } from '@/hooks/use-favorites';
import { RecipeCard } from '@/components/recipe-card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home, BookHeart, Search } from 'lucide-react';

export default function FavoritesPage() {
    const { favorites } = useFavorites();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredFavorites = favorites.filter(recipe =>
        recipe.recipeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

                {favorites.length > 0 && (
                    <div className="relative mb-8">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Buscar en tus recetas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                )}

                {favorites.length > 0 ? (
                    filteredFavorites.length > 0 ? (
                        <div className="space-y-8">
                            {filteredFavorites.map((recipe, index) => (
                                <RecipeCard key={index} recipe={recipe} />
                            ))}
                        </div>
                    ) : (
                         <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                            <Search className="w-12 h-12 mx-auto mb-4 text-primary/70" />
                            <h2 className="text-xl font-semibold text-foreground">No se han encontrado resultados.</h2>
                            <p className="mt-2">Prueba a buscar con otras palabras.</p>
                        </div>
                    )
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
