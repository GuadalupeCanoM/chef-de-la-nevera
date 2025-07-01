import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-missing-ingredients.ts';
import '@/ai/flows/generate-recipe.ts';