
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe';

export interface Folder {
    id: string;
    name: string;
}

// Maps recipe name (unique) to folder id. folderId can be null.
export type RecipeFolderMap = Record<string, string | null>;

const getInitialState = <T,>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') {
        return defaultValue;
    }
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`Error reading localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

export function useFavorites() {
    const [favorites, setFavorites] = useState<GenerateRecipeOutput[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [recipeFolderMap, setRecipeFolderMap] = useState<RecipeFolderMap>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // This effect ensures we only read from localStorage on the client
        // and sets loading to false once done.
        setFavorites(getInitialState('favorites', []));
        setFolders(getInitialState('folders', []));
        setRecipeFolderMap(getInitialState('recipeFolderMap', {}));
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!loading) window.localStorage.setItem('favorites', JSON.stringify(favorites));
    }, [favorites, loading]);

    useEffect(() => {
        if (!loading) window.localStorage.setItem('folders', JSON.stringify(folders));
    }, [folders, loading]);

    useEffect(() => {
        if (!loading) window.localStorage.setItem('recipeFolderMap', JSON.stringify(recipeFolderMap));
    }, [recipeFolderMap, loading]);

    const addFavorite = useCallback((recipe: GenerateRecipeOutput) => {
        setFavorites(prev => {
            if (prev.some(fav => fav.recipeName === recipe.recipeName)) {
                return prev;
            }
            return [...prev, recipe];
        });
    }, []);

    const removeFavorite = useCallback((recipeName: string) => {
        setFavorites(prev => prev.filter(fav => fav.recipeName !== recipeName));
        setRecipeFolderMap(prev => {
            const newMap = { ...prev };
            delete newMap[recipeName];
            return newMap;
        });
    }, []);
    
    const updateFavorite = useCallback((recipeName: string, updatedData: Partial<GenerateRecipeOutput>) => {
        setFavorites(prev => prev.map(fav => fav.recipeName === recipeName ? {...fav, ...updatedData} : fav));
    }, []);

    const isFavorite = useCallback((recipeName: string) => {
        return favorites.some(fav => fav.recipeName === recipeName);
    }, [favorites]);

    const createFolder = useCallback((folderName: string) => {
        if (folders.some(f => f.name === folderName)) return;
        const newFolder: Folder = { id: `folder-${Date.now()}`, name: folderName };
        setFolders(prev => [...prev, newFolder]);
    }, [folders]);

    const deleteFolder = useCallback((folderId: string) => {
        setFolders(prev => prev.filter(f => f.id !== folderId));
        setRecipeFolderMap(prev => {
             const newMap = { ...prev };
            Object.keys(newMap).forEach(recipeName => {
                if (newMap[recipeName] === folderId) {
                    newMap[recipeName] = null; // Move recipes to uncategorized
                }
            });
            return newMap;
        });
    }, []);

    const moveRecipeToFolder = useCallback((recipeName: string, folderId: string | null) => {
        setRecipeFolderMap(prev => ({ ...prev, [recipeName]: folderId }));
    }, []);

    return { 
        favorites, 
        folders, 
        recipeFolderMap, 
        loading, 
        addFavorite, 
        removeFavorite, 
        isFavorite, 
        createFolder, 
        moveRecipeToFolder, 
        deleteFolder, 
        updateFavorite 
    };
}
