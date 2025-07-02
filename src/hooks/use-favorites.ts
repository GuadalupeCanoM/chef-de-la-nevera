
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe';
import { useAuth } from './use-auth';
import { db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';

export interface Folder {
    id: string;
    name: string;
}

// Maps recipe name (unique) to folder id. folderId can be null.
export type RecipeFolderMap = Record<string, string | null>;

interface AppData {
    folders: Folder[];
    recipeFolderMap: RecipeFolderMap;
}

export function useFavorites() {
    const { user, loading: authLoading } = useAuth();
    const [favorites, setFavorites] = useState<GenerateRecipeOutput[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [recipeFolderMap, setRecipeFolderMap] = useState<RecipeFolderMap>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) {
            setLoading(true);
            return;
        }

        if (user) {
            const favoritesUnsub = onSnapshot(collection(db, 'users', user.uid, 'favorites'), 
                (snapshot) => {
                    const favs = snapshot.docs.map(doc => doc.data() as GenerateRecipeOutput);
                    setFavorites(favs);
                    setLoading(false);
                }, 
                (error) => {
                    console.error("Error fetching favorites:", error);
                    setLoading(false);
                }
            );

            const appDataUnsub = onSnapshot(doc(db, 'users', user.uid, 'appData', 'data'), 
                (doc) => {
                    const data = doc.data() as AppData | undefined;
                    setFolders(data?.folders || []);
                    setRecipeFolderMap(data?.recipeFolderMap || {});
                },
                (error) => {
                    console.error("Error fetching app data:", error);
                }
            );

            return () => {
                favoritesUnsub();
                appDataUnsub();
            };
        } else {
            // User is logged out, clear all data
            setFavorites([]);
            setFolders([]);
            setRecipeFolderMap({});
            setLoading(false);
        }
    }, [user, authLoading]);

    const saveAppData = useCallback(async (dataToSave: Partial<AppData>) => {
        if (!user) return;
        const appDataRef = doc(db, 'users', user.uid, 'appData', 'data');
        // Use current state for parts that are not provided
        const fullData = {
            folders: dataToSave.folders !== undefined ? dataToSave.folders : folders,
            recipeFolderMap: dataToSave.recipeFolderMap !== undefined ? dataToSave.recipeFolderMap : recipeFolderMap,
        };
        await setDoc(appDataRef, fullData, { merge: true });
    }, [user, folders, recipeFolderMap]);

    const addFavorite = useCallback(async (recipe: GenerateRecipeOutput) => {
        if (!user) return;
        const favRef = doc(db, 'users', user.uid, 'favorites', recipe.recipeName);
        await setDoc(favRef, recipe);
    }, [user]);

    const removeFavorite = useCallback(async (recipeName: string) => {
        if (!user) return;
        const favRef = doc(db, 'users', user.uid, 'favorites', recipeName);
        await deleteDoc(favRef);
        // Also remove it from any folder
        const newMap = { ...recipeFolderMap };
        if (newMap[recipeName]) {
            delete newMap[recipeName];
            await saveAppData({ recipeFolderMap: newMap });
        }
    }, [user, recipeFolderMap, saveAppData]);

    const updateFavorite = useCallback(async (recipeName: string, updatedData: Partial<GenerateRecipeOutput>) => {
        if (!user) return;
        const favRef = doc(db, 'users', user.uid, 'favorites', recipeName);
        await setDoc(favRef, updatedData, { merge: true });
    }, [user]);

    const isFavorite = useCallback((recipeName: string) => {
        return favorites.some(fav => fav.recipeName === recipeName);
    }, [favorites]);

    const createFolder = useCallback(async (folderName: string) => {
        if (!user || folders.some(f => f.name === folderName)) return;
        const newFolder: Folder = { id: `folder-${Date.now()}`, name: folderName };
        const updatedFolders = [...folders, newFolder];
        await saveAppData({ folders: updatedFolders });
    }, [user, folders, saveAppData]);

    const deleteFolder = useCallback(async (folderId: string) => {
        if (!user) return;
        const updatedFolders = folders.filter(f => f.id !== folderId);
        const updatedMap = { ...recipeFolderMap };
        Object.keys(updatedMap).forEach(recipeName => {
            if (updatedMap[recipeName] === folderId) {
                updatedMap[recipeName] = null; // Move recipes to uncategorized
            }
        });
        await saveAppData({ folders: updatedFolders, recipeFolderMap: updatedMap });
    }, [user, folders, recipeFolderMap, saveAppData]);

    const moveRecipeToFolder = useCallback(async (recipeName: string, folderId: string | null) => {
        if (!user) return;
        const updatedMap = { ...recipeFolderMap, [recipeName]: folderId };
        await saveAppData({ recipeFolderMap: updatedMap });
    }, [user, recipeFolderMap, saveAppData]);

    return { 
        favorites, 
        folders, 
        recipeFolderMap, 
        loading: authLoading || loading, 
        addFavorite, 
        removeFavorite, 
        isFavorite, 
        createFolder, 
        moveRecipeToFolder, 
        deleteFolder, 
        updateFavorite 
    };
}
