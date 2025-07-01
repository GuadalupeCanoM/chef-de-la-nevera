'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import type { GenerateRecipeOutput } from "@/ai/flows/generate-recipe";
import { RecipeModal } from './recipe-modal';
import { generateRecipeImage } from '@/app/actions';
import { Skeleton } from './ui/skeleton';

interface FavoriteRecipeCardProps {
    recipe: GenerateRecipeOutput;
    children?: React.ReactNode;
    onGenerateWithSuggestions?: (ingredients: string[]) => void;
}

export function FavoriteRecipeCard({ recipe, children, onGenerateWithSuggestions }: FavoriteRecipeCardProps) {
    const [currentRecipe, setCurrentRecipe] = useState(recipe);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const isPlaceholder = (url: string) => url?.includes('placehold.co');

        if ((!currentRecipe.imageUrl || isPlaceholder(currentRecipe.imageUrl)) && currentRecipe.imageHint) {
            const fetchImage = async () => {
                setIsLoading(true);
                const result = await generateRecipeImage(currentRecipe.imageHint);
                if (result.imageUrl) {
                    setCurrentRecipe(prev => ({ ...prev, imageUrl: result.imageUrl! }));
                }
                setIsLoading(false);
            };
            fetchImage();
        }
    }, [currentRecipe.imageUrl, currentRecipe.imageHint]);

    return (
        <RecipeModal recipe={currentRecipe} onGenerateWithSuggestions={onGenerateWithSuggestions}>
            <Card className="flex flex-col overflow-hidden group cursor-pointer h-full transition-all hover:scale-105 hover:shadow-xl">
                <div className="relative w-full aspect-video">
                    {isLoading ? (
                        <Skeleton className="w-full h-full" />
                    ) : (
                        <Image
                            src={currentRecipe.imageUrl || 'https://placehold.co/600x400.png'}
                            alt={`Image of ${currentRecipe.recipeName}`}
                            fill
                            className="object-cover"
                            data-ai-hint={currentRecipe.imageHint}
                        />
                    )}
                    {children && (
                         <div onClick={(e) => e.stopPropagation()}>
                            {children}
                        </div>
                    )}
                </div>
                <CardContent className="p-3 flex-grow flex items-center">
                    <p className="font-semibold text-sm leading-tight line-clamp-2">{currentRecipe.recipeName}</p>
                </CardContent>
            </Card>
        </RecipeModal>
    );
}
