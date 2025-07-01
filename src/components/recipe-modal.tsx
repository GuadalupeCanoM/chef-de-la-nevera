
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
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
                 <ScrollArea className="max-h-[90vh]">
                    <div className="p-6">
                        <RecipeCard recipe={recipe} onGenerateWithSuggestions={handleGenerateWithSuggestions} />
                    </div>
                 </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
