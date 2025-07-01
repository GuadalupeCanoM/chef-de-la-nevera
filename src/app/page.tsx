'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChefHat, Sparkles, BookHeart, Wind, Camera, Search, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { identifyIngredientsFromImage, getSearchSuggestions, createRecipe } from '@/app/actions';
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe';
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

function HomeComponent() {
  const [recipe, setRecipe] = useState<GenerateRecipeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredients: "",
      vegetarian: false,
      glutenFree: false,
      airFryer: false,
    },
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (searchTerm.trim()) {
          router.push(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
          setSuggestions([]);
      }
  };
  
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchTerm.trim().length < 2) {
                setSuggestions([]);
                return;
            }

            setIsSuggesting(true);
            const result = await getSearchSuggestions(searchTerm);
            if (result.suggestions) {
                setSuggestions(result.suggestions);
            }
            setIsSuggesting(false);
        };

        const handler = setTimeout(() => {
            fetchSuggestions();
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setSuggestions([]);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchContainerRef]);

  useEffect(() => {
    const ingredientsFromQuery = searchParams.get('ingredients');
    if (ingredientsFromQuery) {
        form.setValue('ingredients', decodeURIComponent(ingredientsFromQuery));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [searchParams, form]);
  
  useEffect(() => {
    async function getCameraPermission() {
      if (!isCameraDialogOpen) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Acceso a la cámara denegado',
          description: 'Por favor, activa los permisos de cámara en tu navegador.',
        });
      }
    }

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraDialogOpen, toast]);

  async function handleAnalyzeIngredients() {
    if (!videoRef.current || !canvasRef.current || !hasCameraPermission) return;

    setIsScanning(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if(context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUri = canvas.toDataURL('image/jpeg');

      try {
        const result = await identifyIngredientsFromImage(imageDataUri);
        if (result.error) {
          toast({ variant: "destructive", title: "Error al analizar", description: result.error });
        } else if (result.ingredients) {
          const currentIngredients = form.getValues('ingredients');
          form.setValue('ingredients', [currentIngredients, result.ingredients].filter(Boolean).join(', '));
          toast({ title: "¡Ingredientes añadidos!", description: "Hemos añadido los ingredientes de la imagen." });
          setIsCameraDialogOpen(false);
        }
      } catch (error) {
         toast({ variant: "destructive", title: "Error inesperado", description: "No se pudieron identificar los ingredientes." });
      }
    }

    setIsScanning(false);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setRecipe(null);
    setError(null);

    // Give a moment for the state to update before scrolling
    setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    const result = await createRecipe(values.ingredients, values.vegetarian, values.glutenFree, values.airFryer);

    if (result.error) {
        setError(result.error);
    } else {
        setRecipe(result.recipe);
    }
    setIsLoading(false);
  }

  const handleGenerateWithSuggestions = (newIngredients: string[]) => {
    form.setValue('ingredients', newIngredients.join(', '));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Trigger form submission
    form.handleSubmit(onSubmit)();
  };

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

        <div className="mb-8 relative" ref={searchContainerRef}>
            <form onSubmit={handleSearch} className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Buscar recetas por nombre o ingredientes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    autoComplete="off"
                />
            </form>
            {(isSuggesting || suggestions.length > 0) && (
                <Card className="absolute top-full mt-2 w-full z-10 shadow-lg">
                    <CardContent className="p-2">
                        {isSuggesting && !suggestions.length ? (
                            <p className="p-2 text-sm text-muted-foreground">Buscando sugerencias...</p>
                        ) : (
                            <ul className="space-y-1">
                                {suggestions.map((suggestion) => (
                                    <li key={suggestion}>
                                        <button
                                            className="w-full text-left p-2 rounded-md text-sm hover:bg-accent"
                                            onClick={() => {
                                                setSearchTerm(suggestion);
                                                setSuggestions([]);
                                                router.push(`/search?query=${encodeURIComponent(suggestion.trim())}`);
                                            }}
                                        >
                                            {suggestion}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Tus Ingredientes</CardTitle>
              <Dialog open={isCameraDialogOpen} onOpenChange={setIsCameraDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Camera className="h-5 w-5" />
                    <span className="sr-only">Escanear con la cámara</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px]">
                  <DialogHeader>
                    <DialogTitle>Escanear ingredientes</DialogTitle>
                    <DialogDescription>
                      Apunta con la cámara al interior de tu nevera. Cuando tengas una buena vista, pulsa "Analizar Ingredientes".
                    </DialogDescription>
                  </DialogHeader>
                  <div className="relative">
                    <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                    <canvas ref={canvasRef} className="hidden" />
                    {hasCameraPermission === false && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                        <Alert variant="destructive" className="w-auto">
                           <AlertTitle>Cámara no disponible</AlertTitle>
                           <AlertDescription>Por favor, concede permisos de cámara en tu navegador.</AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCameraDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleAnalyzeIngredients} disabled={isScanning || hasCameraPermission === false}>
                      {isScanning ? (
                        <>
                          <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                          Analizando...
                        </>
                      ) : (
                        <>
                          <Camera className="mr-2 h-4 w-4" />
                          Analizar Ingredientes
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <CardDescription>
              ¿No sabes qué cocinar? Escribe los ingredientes que tienes o usa la cámara para escanear tu nevera.
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
                  {isLoading ? (
                    <>
                        <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                        Generando...
                    </>
                  ) : (
                    <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generar Receta
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div ref={resultsRef} className="mt-8 w-full">
            {isLoading && <RecipeSkeleton />}
            {error && !isLoading && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-destructive flex items-center gap-2">
                            <AlertTriangle />
                            Error al generar la receta
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{error}</p>
                        <Button variant="outline" className="mt-4" onClick={() => form.handleSubmit(onSubmit)()}>
                            Intentar de nuevo
                        </Button>
                    </CardContent>
                </Card>
            )}
            {recipe && !isLoading && !error && (
                <RecipeCard recipe={recipe} onGenerateWithSuggestions={handleGenerateWithSuggestions} />
            )}
        </div>
      </main>
    </div>
  );
}

export default function Home() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <HomeComponent />
        </Suspense>
    )
}
