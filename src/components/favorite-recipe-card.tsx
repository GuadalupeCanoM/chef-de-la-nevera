'use client';

import Image from "next/image";
import { useFavorites } from "@/hooks/use-favorites";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "./ui/dropdown-menu";
import { MoreHorizontal, Folder as FolderIcon, Trash2, FolderPlus } from "lucide-react";
import type { GenerateRecipeOutput } from "@/ai/flows/generate-recipe";
import { Separator } from "./ui/separator";

interface FavoriteRecipeCardProps {
    recipe: GenerateRecipeOutput;
}

export function FavoriteRecipeCard({ recipe }: FavoriteRecipeCardProps) {
    const { folders, moveRecipeToFolder, removeFavorite } = useFavorites();

    return (
        <Card className="flex flex-col overflow-hidden group">
            <div className="relative w-full aspect-video">
                <Image
                    src={recipe.imageUrl || 'https://placehold.co/600x400.png'}
                    alt={`Image of ${recipe.recipeName}`}
                    fill
                    className="object-cover"
                    data-ai-hint="recipe food"
                />
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Opciones</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuSub>
                           <DropdownMenuSubTrigger>
                               <FolderIcon className="mr-2 h-4 w-4" />
                                <span>Mover a...</span>
                           </DropdownMenuSubTrigger>
                           <DropdownMenuPortal>
                               <DropdownMenuSubContent>
                                   <DropdownMenuItem onClick={() => moveRecipeToFolder(recipe.recipeName, null)}>
                                        (Sin carpeta)
                                   </DropdownMenuItem>
                                   <Separator />
                                   {folders.map(folder => (
                                        <DropdownMenuItem key={folder.id} onClick={() => moveRecipeToFolder(recipe.recipeName, folder.id)}>
                                            <span>{folder.name}</span>
                                        </DropdownMenuItem>
                                   ))}
                               </DropdownMenuSubContent>
                           </DropdownMenuPortal>
                       </DropdownMenuSub>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => removeFavorite(recipe.recipeName)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Eliminar</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <CardContent className="p-3 flex-grow">
                <p className="font-semibold text-sm leading-tight line-clamp-2">{recipe.recipeName}</p>
            </CardContent>
        </Card>
    );
}