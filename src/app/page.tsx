'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChefHat, Sparkles } from 'lucide-react';

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
});

export default function Home() {
  const [recipe, setRecipe] = useState<GenerateRecipeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredients: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setRecipe(null);
    try {
      const result = await createRecipe(values.ingredients);
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

  return (
    <div className="flex flex-col items-center min-h-screen p-4 md:p-8">
      <main className="w-full max-w-2xl">
        <header className="flex flex-col items-center text-center mb-8">
          <ChefHat className="w-16 h-16 text-primary mb-2" />
          <h1 className="text-4xl md:text-5xl font-bold font-headline">Chef de la Nevera</h1>
          <p className="text-muted-foreground mt-2">¿No sabes qué cocinar? ¡Déjanos ayudarte a crear algo delicioso!</p>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Tus Ingredientes</CardTitle>
            <CardDescription>Escribe los ingredientes que tienes, separados por comas o en líneas nuevas.</CardDescription>
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
                    <FormDescription>Opciones dietéticas (próximamente)</FormDescription>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="vegetarian" disabled />
                            <label
                                htmlFor="vegetarian"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Vegetariano
                            </label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Checkbox id="gluten-free" disabled />
                            <label
                                htmlFor="gluten-free"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Sin Gluten
                            </label>
                        </div>
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
          {recipe && !isLoading && <RecipeCard recipe={recipe} />}
        </div>
      </main>
    </div>
  );
}
