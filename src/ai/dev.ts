import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-missing-ingredients.ts';
import '@/ai/flows/generate-recipe.ts';
import '@/ai/flows/identify-ingredients-flow.ts';
import '@/ai/flows/suggest-search-terms.ts';
import '@/ai/flows/generate-recipe-image.ts';
