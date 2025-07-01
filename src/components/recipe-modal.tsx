
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RecipeCard } from './recipe-card';
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe';

interface RecipeModalProps {
    recipe: GenerateRecipeOutput;
    children: React.ReactNode;
    onGenerateWithSuggestions?: (ingredients: string[]) => void;
}

export function RecipeModal({ recipe, children, onGenerateWithSuggestions }: RecipeModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleGenerateWithSuggestions = (ingredients: string[]) => {
        if (onGenerateWithSuggestions) {
            onGenerateWithSuggestions(ingredients);
            setIsOpen(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-3xl p-0">
                 <DialogHeader className="sr-only">
                    <DialogTitle>{recipe.recipeName}</DialogTitle>
                    <DialogDescription>
                        Receta detallada de {recipe.recipeName}. Tiempo de cocción: {recipe.estimatedCookingTime}.
                    </DialogDescription>
                 </DialogHeader>
                 <ScrollArea className="max-h-[90vh]">
                    <div className="p-6">
                        <RecipeCard recipe={recipe} onGenerateWithSuggestions={handleGenerateWithSuggestions} />
                    </div>
                 </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
