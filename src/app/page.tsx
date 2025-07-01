'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChefHat, Sparkles, BookHeart, Wind } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/hooks/use-toast';
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe';
import { createRecipe } from './actions';
import { RecipeCard } from '@/components/recipe-card';
import { RecipeSkeleton } from '@/components/recipe-skeleton';

const formSchema = z.object({
  ingredients: z.string().min(10, {
    message: "Por favor, introduce al menos un ingrediente (mínimo 10 caracteres).",
  }),
  vegetarian: z.boolean().default(false).optional(),
  glutenFree: z.boolean().default(false).optional(),
  airFryer: z.boolean().default(false).optional(),
});

export default function Home() {
  const [recipe, setRecipe] = useState<GenerateRecipeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredients: "",
      vegetarian: false,
      glutenFree: false,
      airFryer: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setRecipe(null);
    try {
      const result = await createRecipe(values.ingredients, values.vegetarian, values.glutenFree, values.airFryer);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error al generar la receta",
          description: result.error,
        });
      } else {
        setRecipe(result.recipe);
      }
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error inesperado",
        description: "Ha ocurrido un problema. Por favor, inténtalo de nuevo más tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleGenerateWithSuggestions = async (ingredients: string[]) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const joinedIngredients = ingredients.join(', ');
    form.setValue('ingredients', joinedIngredients);
    await onSubmit({ 
      ingredients: joinedIngredients, 
      vegetarian: form.getValues('vegetarian'), 
      glutenFree: form.getValues('glutenFree'),
      airFryer: form.getValues('airFryer'),
    });
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4 md:p-8">
      <main className="w-full max-w-2xl">
        <header className="flex justify-between items-center w-full mb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-headline flex items-center gap-3">
                <ChefHat className="w-10 h-10 text-primary" />
                Cocina con Luprinchef
            </h1>
            <nav>
                <Link href="/favorites" passHref>
                    <Button variant="ghost">
                        <BookHeart className="mr-2" />
                        Favoritos
                    </Button>
                </Link>
            </nav>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Tus Ingredientes</CardTitle>
            <CardDescription>
              ¿No sabes qué cocinar? Escribe los ingredientes que tienes y deja que la magia suceda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="ingredients"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Ingredientes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ej: patatas, huevos, cebolla, aceite de oliva..."
                          className="resize-none"
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormDescription>Opciones dietéticas</FormDescription>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <FormField
                      control={form.control}
                      name="vegetarian"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-medium">
                            Vegetariano
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="glutenFree"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-medium">
                            Sin Gluten
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="airFryer"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                           <FormLabel className="font-medium flex items-center gap-2">
                            <Wind className="w-4 h-4" />
                            Freidora de Aire
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isLoading ? 'Generando receta...' : 'Generar Receta'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-8">
          {isLoading && <RecipeSkeleton />}
          {recipe && !isLoading && <RecipeCard recipe={recipe} onGenerateWithSuggestions={handleGenerateWithSuggestions} />}
        </div>
      </main>
    </div>
  );
}
