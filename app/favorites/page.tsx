
'use client';

import { useState, useMemo } from 'react';
import { useFavorites } from '@/hooks/use-favorites';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home, BookHeart, Search, FolderPlus, Trash2, MoreHorizontal, Folder as FolderIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { FavoriteRecipeCard } from '@/components/favorite-recipe-card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';

export default function FavoritesPage() {
    const { favorites, folders, recipeFolderMap, createFolder, deleteFolder, moveRecipeToFolder, removeFavorite } = useFavorites();
    const [searchTerm, setSearchTerm] = useState('');
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const router = useRouter();

    const handleGenerateWithSuggestions = (ingredients: string[]) => {
        const params = new URLSearchParams();
        params.set('ingredients', ingredients.join(', '));
        router.push(`/?${params.toString()}`);
    };

    const handleCreateFolder = () => {
        if (newFolderName.trim()) {
            createFolder(newFolderName.trim());
            setNewFolderName('');
            setIsCreateFolderOpen(false);
        }
    };

    const filteredFavorites = useMemo(() => {
        return favorites.filter(recipe =>
            recipe.recipeName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [favorites, searchTerm]);

    const recipesByFolderId = useMemo(() => {
        const byFolder: Record<string, typeof filteredFavorites> = {};
        
        const uncategorized = filteredFavorites.filter(recipe => {
            const folderId = recipeFolderMap[recipe.recipeName];
            return !folderId;
        });
        byFolder['uncategorized'] = uncategorized;

        folders.forEach(folder => {
            byFolder[folder.id] = filteredFavorites.filter(recipe => {
                 const folderId = recipeFolderMap[recipe.recipeName];
                return folderId === folder.id;
            });
        });

        return byFolder;
    }, [filteredFavorites, folders, recipeFolderMap]);

    const renderRecipe = (recipe: any) => (
         <FavoriteRecipeCard key={recipe.recipeName} recipe={recipe} onGenerateWithSuggestions={handleGenerateWithSuggestions}>
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
        </FavoriteRecipeCard>
    );

    return (
        <div className="flex flex-col items-center min-h-screen p-4 md:p-8">
            <main className="w-full max-w-5xl">
                 <header className="flex justify-between items-center w-full mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold font-headline flex items-center gap-3">
                        <BookHeart className="w-10 h-10 text-primary" />
                        Recetas Favoritas
                    </h1>
                    <nav className="flex items-center gap-2">
                        <ThemeToggle />
                        <Link href="/" passHref>
                            <Button variant="ghost">
                                <Home className="mr-2" />
                                Inicio
                            </Button>
                        </Link>
                    </nav>
                </header>

                {favorites.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Buscar en todas las recetas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full sm:w-auto">
                                    <FolderPlus className="mr-2 h-5 w-5" />
                                    Crear Carpeta
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Crear nueva carpeta</DialogTitle>
                                    <DialogDescription>
                                        Dale un nombre a tu nueva carpeta para organizar tus recetas.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <Label htmlFor="folder-name">Nombre de la carpeta</Label>
                                    <Input
                                        id="folder-name"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        placeholder="Ej: Postres, Cenas rápidas..."
                                    />
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>Cancelar</Button>
                                    <Button onClick={handleCreateFolder}>Crear</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}

                {favorites.length > 0 ? (
                    <Accordion type="multiple" defaultValue={['uncategorized', ...folders.map(f => f.id)]} className="w-full space-y-4">
                        <AccordionItem value="uncategorized">
                            <AccordionTrigger className="text-xl font-semibold px-4 py-3 bg-card rounded-t-lg border">Recetas sin clasificar ({recipesByFolderId['uncategorized']?.length || 0})</AccordionTrigger>
                            <AccordionContent className="p-4 border border-t-0 rounded-b-lg">
                                {recipesByFolderId['uncategorized']?.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {recipesByFolderId['uncategorized'].map(renderRecipe)}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-center py-4">No hay recetas sin clasificar.</p>
                                )}
                            </AccordionContent>
                        </AccordionItem>

                        {folders.map(folder => (
                             <AccordionItem value={folder.id} key={folder.id}>
                                <AccordionTrigger className="text-xl font-semibold px-4 py-3 bg-card rounded-t-lg border flex justify-between w-full">
                                    <span>{folder.name} ({recipesByFolderId[folder.id]?.length || 0})</span>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <span 
                                                role="button"
                                                aria-label={`Eliminar carpeta ${folder.name}`}
                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 w-8 text-destructive hover:bg-destructive/10 transition-colors" 
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </span>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Estás seguro de que quieres eliminar la carpeta "{folder.name}"?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta acción no se puede deshacer. Las recetas de esta carpeta se moverán a "Recetas sin clasificar".
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => deleteFolder(folder.id)}>Eliminar</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 border border-t-0 rounded-b-lg">
                                    {recipesByFolderId[folder.id]?.length > 0 ? (
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                            {recipesByFolderId[folder.id].map(renderRecipe)}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-center py-4">Esta carpeta está vacía.</p>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
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
