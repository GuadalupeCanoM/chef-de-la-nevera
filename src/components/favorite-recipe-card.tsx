'use client';

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import type { GenerateRecipeOutput } from "@/ai/flows/generate-recipe";
import { RecipeModal } from './recipe-modal';

interface FavoriteRecipeCardProps {
    recipe: GenerateRecipeOutput;
    children?: React.ReactNode;
    onGenerateWithSuggestions?: (ingredients: string[]) => void;
}

export function FavoriteRecipeCard({ recipe, children, onGenerateWithSuggestions }: FavoriteRecipeCardProps) {
    return (
        <RecipeModal recipe={recipe} onGenerateWithSuggestions={onGenerateWithSuggestions}>
            <Card className="flex flex-col overflow-hidden group cursor-pointer h-full transition-all hover:scale-105 hover:shadow-xl">
                <div className="relative w-full aspect-video">
                    <Image
                        src={recipe.imageUrl || 'https://placehold.co/600x400.png'}
                        alt={`Image of ${recipe.recipeName}`}
                        fill
                        className="object-cover"
                        data-ai-hint={recipe.imageHint}
                    />
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
