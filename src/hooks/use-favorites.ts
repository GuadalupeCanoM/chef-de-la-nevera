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

    const _saveState = useCallback((newFavorites: GenerateRecipeOutput[], newFolders: Folder[], newMap: RecipeFolderMap) => {
        try {
            const dataToStore = JSON.stringify({
                favorites: newFavorites,
                folders: newFolders,
                recipeFolderMap: newMap
            });
            localStorage.setItem(FAVORITES_KEY, dataToStore);
            setFavorites(newFavorites);
            setFolders(newFolders);
            setRecipeFolderMap(newMap);
        } catch (error) {
            console.error("Failed to save favorites to localStorage", error);
        }
    }, []);

    const updateFavorite = useCallback((recipeName: string, updatedData: Partial<GenerateRecipeOutput>) => {
        const newFavorites = favorites.map(fav => 
            fav.recipeName === recipeName ? { ...fav, ...updatedData } : fav
        );
        _saveState(newFavorites, folders, recipeFolderMap);
    }, [favorites, folders, recipeFolderMap, _saveState]);

    const addFavorite = useCallback((recipe: GenerateRecipeOutput) => {
        if (favorites.some(f => f.recipeName === recipe.recipeName)) return;

        const newFavorites = [...favorites, recipe];
        const newMap = { ...recipeFolderMap, [recipe.recipeName]: null };
        _saveState(newFavorites, folders, newMap);
    }, [favorites, folders, recipeFolderMap, _saveState]);

    const removeFavorite = useCallback((recipeName: string) => {
        const newFavorites = favorites.filter(fav => fav.recipeName !== recipeName);
        const newFolders = [...folders];
        const newMap = { ...recipeFolderMap };
        delete newMap[recipeName];
        _saveState(newFavorites, newFolders, newMap);
    }, [favorites, folders, recipeFolderMap, _saveState]);

    const isFavorite = useCallback((recipeName: string) => {
        return favorites.some(fav => fav.recipeName === recipeName);
    }, [favorites]);

    const createFolder = useCallback((folderName: string) => {
        if (folders.some(f => f.name === folderName)) return;

        const newFolder: Folder = {
            id: `folder-${Date.now()}`,
            name: folderName,
        };
        const newFolders = [...folders, newFolder];
        _saveState(favorites, newFolders, recipeFolderMap);
    }, [folders, favorites, recipeFolderMap, _saveState]);

    const moveRecipeToFolder = useCallback((recipeName: string, folderId: string | null) => {
        const newMap = { ...recipeFolderMap, [recipeName]: folderId };
        _saveState(favorites, folders, newMap);
    }, [favorites, folders, recipeFolderMap, _saveState]);
    
    const deleteFolder = useCallback((folderId: string) => {
        const newFolders = folders.filter(f => f.id !== folderId);
        const newMap = { ...recipeFolderMap };
        Object.keys(newMap).forEach(recipeName => {
            if (newMap[recipeName] === folderId) {
                newMap[recipeName] = null;
            }
        });
        _saveState(favorites, newFolders, newMap);
    }, [favorites, folders, recipeFolderMap, _saveState]);

    return { favorites, folders, recipeFolderMap, addFavorite, removeFavorite, isFavorite, createFolder, moveRecipeToFolder, deleteFolder, updateFavorite };
}
