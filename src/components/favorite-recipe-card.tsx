'use client';

import { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import type { GenerateRecipeOutput } from "@/ai/flows/generate-recipe";
import { RecipeModal } from './recipe-modal';
import { useFavorites } from '@/hooks/use-favorites';
import { generateRecipeImage } from '@/app/actions';
import { Image as ImageIcon } from 'lucide-react';

interface FavoriteRecipeCardProps {
    recipe: GenerateRecipeOutput;
    children?: React.ReactNode;
    onGenerateWithSuggestions?: (ingredients: string[]) => void;
}

export function FavoriteRecipeCard({ recipe, children, onGenerateWithSuggestions }: FavoriteRecipeCardProps) {
    const { updateFavorite } = useFavorites();
    const [currentImageUrl, setCurrentImageUrl] = useState(recipe.imageUrl);
    const [isLoadingImage, setIsLoadingImage] = useState(false);
    const imageGenAttempted = useRef(false);

    useEffect(() => {
        const isPlaceholder = !currentImageUrl || currentImageUrl.includes('placehold.co');
        if (isPlaceholder && recipe.imageHint && !imageGenAttempted.current) {
            imageGenAttempted.current = true;
            setIsLoadingImage(true);
            generateRecipeImage(recipe.imageHint)
                .then(result => {
                    if (result.imageUrl && !result.error) {
                        setCurrentImageUrl(result.imageUrl);
                        updateFavorite(recipe.recipeName, { imageUrl: result.imageUrl });
                    }
                })
                .finally(() => {
                    setIsLoadingImage(false);
                });
        }
    }, [currentImageUrl, recipe.imageHint, recipe.recipeName, updateFavorite]);

    useEffect(() => {
        setCurrentImageUrl(recipe.imageUrl);
    }, [recipe.imageUrl]);

    return (
        <RecipeModal recipe={{...recipe, imageUrl: currentImageUrl}} onGenerateWithSuggestions={onGenerateWithSuggestions}>
            <Card className="flex flex-col overflow-hidden group cursor-pointer h-full transition-all hover:scale-105 hover:shadow-xl">
                <div className="relative w-full aspect-video">
                    {isLoadingImage ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
                            <ImageIcon className="h-10 w-10 text-muted-foreground animate-pulse" />
                            <p className="text-xs text-muted-foreground mt-2">Generando imagen...</p>
                        </div>
                    ) : (
                        <Image
                            src={currentImageUrl || 'https://placehold.co/600x400.png'}
                            alt={`Image of ${recipe.recipeName}`}
                            fill
                            className="object-cover"
                            data-ai-hint={recipe.imageHint}
                        />
                    )}
                    {children && (
                         <div onClick={(e) => e.stopPropagation()}>
                            {children}
                        </div>
                    )}
                </div>
                <CardContent className="p-3 flex-grow flex items-center">
                    <p className="font-semibold text-sm leading-tight line-clamp-2">{recipe.recipeName}</p>
                </CardContent>
            </Card>
        </RecipeModal>
    );
}
