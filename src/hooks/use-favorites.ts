'use client';

import { useState, useEffect, useCallback } from 'react';
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe';

const FAVORITES_KEY = 'favoriteRecipes';

export function useFavorites() {
    const [favorites, setFavorites] = useState<GenerateRecipeOutput[]>([]);

    useEffect(() => {
        try {
            const storedFavorites = localStorage.getItem(FAVORITES_KEY);
            if (storedFavorites) {
                setFavorites(JSON.parse(storedFavorites));
            }
        } catch (error) {
            console.error("Failed to load favorites from localStorage", error);
            setFavorites([]);
        }
    }, []);

    const saveFavorites = (newFavorites: GenerateRecipeOutput[]) => {
        try {
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
            setFavorites(newFavorites);
        } catch (error) {
            console.error("Failed to save favorites to localStorage", error);
        }
    };

    const addFavorite = useCallback((recipe: GenerateRecipeOutput) => {
        const newFavorites = [...favorites, recipe];
        saveFavorites(newFavorites);
    }, [favorites]);

    const removeFavorite = useCallback((recipeName: string) => {
        const newFavorites = favorites.filter(fav => fav.recipeName !== recipeName);
        saveFavorites(newFavorites);
    }, [favorites]);

    const isFavorite = useCallback((recipeName: string) => {
        return favorites.some(fav => fav.recipeName === recipeName);
    }, [favorites]);

    return { favorites, addFavorite, removeFavorite, isFavorite };
}
