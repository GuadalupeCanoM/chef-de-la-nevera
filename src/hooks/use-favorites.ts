'use client';

import { useState, useEffect, useCallback } from 'react';
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe';

const FAVORITES_KEY = 'favoriteRecipes_v2';

export interface Folder {
    id: string;
    name: string;
}

// Maps recipe name (unique) to folder id. folderId can be null.
export type RecipeFolderMap = Record<string, string | null>;

export function useFavorites() {
    const [favorites, setFavorites] = useState<GenerateRecipeOutput[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [recipeFolderMap, setRecipeFolderMap] = useState<RecipeFolderMap>({});

    // Load initial state from localStorage
    useEffect(() => {
        try {
            const storedData = localStorage.getItem(FAVORITES_KEY);
            if (storedData) {
                const { favorites, folders, recipeFolderMap } = JSON.parse(storedData);
                setFavorites(favorites || []);
                setFolders(folders || []);
                setRecipeFolderMap(recipeFolderMap || {});
            }
        } catch (error) {
            console.error("Failed to load favorites from localStorage", error);
        }
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        try {
            const dataToStore = JSON.stringify({
                favorites,
                folders,
                recipeFolderMap
            });
            localStorage.setItem(FAVORITES_KEY, dataToStore);
        } catch (error) {
            console.error("Failed to save favorites to localStorage", error);
        }
    }, [favorites, folders, recipeFolderMap]);


    const updateFavorite = useCallback((recipeName: string, updatedData: Partial<GenerateRecipeOutput>) => {
        setFavorites(currentFavorites =>
            currentFavorites.map(fav =>
                fav.recipeName === recipeName ? { ...fav, ...updatedData } : fav
            )
        );
    }, []);

    const addFavorite = useCallback((recipe: GenerateRecipeOutput) => {
        setFavorites(currentFavorites => {
            if (currentFavorites.some(f => f.recipeName === recipe.recipeName)) {
                return currentFavorites;
            }
            return [...currentFavorites, recipe];
        });
        setRecipeFolderMap(currentMap => ({ ...currentMap, [recipe.recipeName]: null }));
    }, []);

    const removeFavorite = useCallback((recipeName: string) => {
        setFavorites(currentFavorites => currentFavorites.filter(fav => fav.recipeName !== recipeName));
        setRecipeFolderMap(currentMap => {
            const newMap = { ...currentMap };
            delete newMap[recipeName];
            return newMap;
        });
    }, []);

    const isFavorite = useCallback((recipeName: string) => {
        return favorites.some(fav => fav.recipeName === recipeName);
    }, [favorites]);

    const createFolder = useCallback((folderName: string) => {
        setFolders(currentFolders => {
             if (currentFolders.some(f => f.name === folderName)) {
                return currentFolders;
             }
             const newFolder: Folder = {
                id: `folder-${Date.now()}`,
                name: folderName,
            };
            return [...currentFolders, newFolder];
        });
    }, []);

    const moveRecipeToFolder = useCallback((recipeName: string, folderId: string | null) => {
        setRecipeFolderMap(currentMap => ({
            ...currentMap,
            [recipeName]: folderId,
        }));
    }, []);
    
    const deleteFolder = useCallback((folderId: string) => {
        setFolders(currentFolders => currentFolders.filter(f => f.id !== folderId));
        setRecipeFolderMap(currentMap => {
            const newMap = { ...currentMap };
            Object.keys(newMap).forEach(recipeName => {
                if (newMap[recipeName] === folderId) {
                    newMap[recipeName] = null;
                }
            });
            return newMap;
        });
    }, []);

    return { favorites, folders, recipeFolderMap, addFavorite, removeFavorite, isFavorite, createFolder, moveRecipeToFolder, deleteFolder, updateFavorite };
}
