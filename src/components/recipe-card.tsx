'use client';

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { GenerateRecipeOutput } from "@/ai/flows/generate-recipe";
import { Clock, Leaf, ListOrdered, HeartPulse, PlusCircle, Utensils, Heart, Search } from "lucide-react";
import { Badge } from "./ui/badge";
import { useFavorites } from "@/hooks/use-favorites";
import { Button } from "./ui/button";

interface RecipeCardProps {
    recipe: GenerateRecipeOutput;
    onGenerateWithSuggestions?: (ingredients: string[]) => void;
}

export function RecipeCard({ recipe, onGenerateWithSuggestions }: RecipeCardProps) {
    const { addFavorite, removeFavorite, isFavorite } = useFavorites();
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
    
    const isFav = isFavorite(recipe.recipeName);

    const parseList = (list: string) => list.split(/\n-? ?/).filter(item => item.trim() !== "");
    const parseInstructions = (list: string) => (list || '').split(/\n/).map(item => item.trim().replace(/^\d+\.?\s*/, '')).filter(Boolean);

    const handleFavoriteClick = () => {
        if (isFav) {
            removeFavorite(recipe.recipeName);
        } else {
            addFavorite(recipe);
        }
    };
    
    const handleToggleIngredient = (ingredient: string) => {
        const trimmedIngredient = ingredient.trim();
        setSelectedIngredients(prev => 
            prev.includes(trimmedIngredient)
                ? prev.filter(i => i !== trimmedIngredient)
                : [...prev, trimmedIngredient]
        );
    };

    const handleSearchWithSelected = () => {
        if (onGenerateWithSuggestions && selectedIngredients.length > 0) {
            onGenerateWithSuggestions(selectedIngredients);
        }
    };
    
    return (
        <Card className="animate-in fade-in-50 duration-500 overflow-hidden">
            <div className="relative w-full aspect-video">
                <Image
                    src={recipe.imageUrl || 'https://placehold.co/600x400.png'}
                    alt={`Image of ${recipe.recipeName}`}
                    fill
                    className="object-cover"
                    data-ai-hint={recipe.imageHint}
                />
            </div>
            <CardHeader>
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <CardTitle className="text-2xl font-headline flex items-center gap-2"><Utensils className="h-6 w-6 text-primary" /> {recipe.recipeName}</CardTitle>
                        <CardDescription className="flex items-center gap-2 pt-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{recipe.estimatedCookingTime}</span>
                        </CardDescription>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={handleFavoriteClick} 
                            aria-label={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
                            className="text-destructive hover:bg-destructive/10 rounded-full flex-shrink-0"
                        >
                            <Heart className="h-6 w-6 transition-all" fill={isFav ? 'currentColor' : 'transparent'} />
                        </Button>
                        <span className="text-xs text-muted-foreground mt-1">
                            {isFav ? 'En favoritos' : 'Agregar a favoritos'}
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <Separator />
                <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Leaf className="h-5 w-5 text-primary"/> Ingredientes</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {parseList(recipe.ingredientsList).map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>
                <Separator />
                 <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><ListOrdered className="h-5 w-5 text-primary"/> Instrucciones</h3>
                    <ol className="list-decimal list-inside space-y-3">
                        {parseInstructions(recipe.instructions).map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ol>
                </div>
                <Separator />
                <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><HeartPulse className="h-5 w-5 text-primary"/> Información Nutricional</h3>
                     <p className="text-muted-foreground">{recipe.nutritionalInformation}</p>
                </div>
            </CardContent>
            <CardFooter>
                 <div className="w-full">
                    <h3 className="text-md font-semibold mb-3 flex items-center gap-2"><PlusCircle className="h-5 w-5 text-accent"/> Sugerencias</h3>
                    <div className="flex flex-wrap gap-2">
                        {recipe.additionalSuggestedIngredients.split(',').map((item, index) => {
                            const trimmedItem = item.trim();
                            if (!trimmedItem) return null;
                            const isSelected = selectedIngredients.includes(trimmedItem);
                           
                           return onGenerateWithSuggestions ? (
                                <Button 
                                    key={index} 
                                    variant={isSelected ? "secondary" : "outline"}
                                    size="sm" 
                                    onClick={() => handleToggleIngredient(trimmedItem)}
                                    className="h-auto py-1 px-3 text-accent-foreground border-accent hover:bg-accent/10 data-[state=selected]:bg-accent"
                                >
                                    {trimmedItem}
                                </Button>
                           ) : (
                                <Badge key={index} variant="outline" className="text-accent-foreground border-accent">{trimmedItem}</Badge>
                           )
                        })}
                    </div>
                    {onGenerateWithSuggestions && (
                        <Button 
                            onClick={handleSearchWithSelected}
                            disabled={selectedIngredients.length === 0}
                            className="w-full mt-4"
                        >
                            <Search className="mr-2 h-4 w-4" />
                            Buscar receta con ingredientes seleccionados
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    )
}
