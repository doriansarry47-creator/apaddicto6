import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { ExerciseCard } from "@/components/exercise-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import type { Exercise as APIExercise } from "@shared/schema";

// Types pour la compatibilité avec le composant ExerciseCard existant
interface Exercise {
  id: string;
  title: string;
  description: string;
  category: 'cardio' | 'strength' | 'flexibility' | 'mindfulness' | 'relaxation' | 'craving_reduction' | 'energy_boost' | 'emotion_management' | 'general';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  intensity: 'gentle' | 'moderate' | 'dynamic';
  type: 'physical' | 'breathing' | 'relaxation' | 'emergency';
  imageUrl: string;
  instructions: string[];
  benefits: string[];
}

// Mappages des catégories API vers les catégories frontend - correspondance directe et variantes
const categoryMapping: Record<string, keyof typeof categories> = {
  // Correspondance directe avec les catégories de l'admin
  'cardio': 'cardio',
  'strength': 'strength',
  'renforcement': 'strength', // Variante française
  'flexibility': 'flexibility',
  'etirement': 'flexibility', // Variante française
  'mindfulness': 'mindfulness',
  'relaxation': 'relaxation',
  'respiration': 'respiration',
  'meditation': 'meditation',
  'debutant': 'debutant'
};

// Fonction pour convertir les exercices API en format frontend
const convertAPIExerciseToFrontend = (apiExercise: APIExercise): Exercise => {
  const mappedCategory = categoryMapping[apiExercise.category] || apiExercise.category as Exercise['category'];
  
  return {
    id: apiExercise.id,
    title: apiExercise.title,
    description: apiExercise.description || '',
    category: mappedCategory,
    level: (apiExercise.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
    duration: apiExercise.duration || 10,
    intensity: 'moderate', // Valeur par défaut, pourrait être déterminée par la durée/catégorie
    type: ['mindfulness', 'respiration', 'meditation'].includes(apiExercise.category) ? 'breathing' : 
          ['flexibility', 'relaxation'].includes(apiExercise.category) ? 'relaxation' :
          'physical',
    imageUrl: apiExercise.imageUrl || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: apiExercise.instructions ? apiExercise.instructions.split('\n').filter(Boolean) : [],
    benefits: apiExercise.benefits ? apiExercise.benefits.split('\n').filter(Boolean) : []
  };
};

// Catégories et niveaux pour l'interface utilisateur - alignées avec l'admin
const categories = {
  cardio: 'Cardio Training',
  strength: 'Renforcement Musculaire',
  flexibility: 'Étirement & Flexibilité',
  mindfulness: 'Pleine Conscience & Méditation',
  relaxation: 'Relaxation',
  respiration: 'Exercices de Respiration',
  meditation: 'Méditation',
  debutant: 'Exercices Débutant'
} as const;

const levels = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire', 
  advanced: 'Avancé',
  all_levels: 'Tous niveaux'
} as const;

export default function LibraryExercises() {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof categories | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<keyof typeof levels | 'all'>('all');

  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupération des exercices depuis l'API
  const { data: apiExercises, isLoading, error, refetch: refetchExercises } = useQuery<APIExercise[]>({
    queryKey: ['exercises'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/exercises');
      return response.json();
    },
    initialData: [],
    staleTime: 0, // Forcer le refetch
    cacheTime: 300000, // 5 minutes de cache
  });

  // Conversion des exercices API vers le format frontend
  const apiConvertedExercises = apiExercises.map(convertAPIExerciseToFrontend);
  const exercises = apiConvertedExercises;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    if (category && categories[category as keyof typeof categories]) {
      setSelectedCategory(category as keyof typeof categories);
    }
  }, [location.search]);

  // Rafraîchir les exercices quand on arrive sur la page
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['exercises'] });
  }, [queryClient]);

  const filteredExercises = exercises.filter((exercise) => {
    const categoryMatch = selectedCategory === 'all' || exercise.category === selectedCategory;
    const levelMatch = selectedLevel === 'all' || exercise.level === selectedLevel;
    return categoryMatch && levelMatch;
  });

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des exercices...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4 text-destructive">Erreur de chargement</h2>
            <p className="text-muted-foreground mb-6">Impossible de charger les exercices.</p>
            <Button onClick={() => refetchExercises()}>Réessayer</Button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold text-foreground mb-2">Bibliothèque d'Exercices</h1>
              <p className="text-muted-foreground">Découvrez notre catalogue complet d'exercices</p>
            </div>
            <Button
              onClick={() => refetchExercises()}
              variant="outline"
              size="sm"
            >
              Rafraîchir
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger 
              value="all" 
              onClick={() => {
                setSelectedCategory('all');
                setSelectedLevel('all');
              }}
            >
              Tous ({exercises.length})
            </TabsTrigger>
            <TabsTrigger 
              value="favorites" 
              onClick={() => {
                setSelectedCategory('all');
                setSelectedLevel('all');
              }}
            >
              Favoris
            </TabsTrigger>
            <TabsTrigger 
              value="new" 
              onClick={() => {
                setSelectedLevel('beginner');
                setSelectedCategory('all');
              }}
            >
              Débutant
            </TabsTrigger>
            <TabsTrigger 
              value="recent" 
              onClick={() => {
                setSelectedLevel('all');
                setSelectedCategory('all');
              }}
            >
              Récents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Filtres */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant={selectedCategory === 'all' ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory('all')}
                    >
                      Toutes catégories
                    </Badge>
                    {Object.entries(categories).map(([key, label]) => (
                      <Badge 
                        key={key}
                        variant={selectedCategory === key ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory(key as keyof typeof categories)}
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant={selectedLevel === 'all' ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedLevel('all')}
                    >
                      Tous niveaux
                    </Badge>
                    {Object.entries(levels).map(([key, label]) => (
                      <Badge 
                        key={key}
                        variant={selectedLevel === key ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setSelectedLevel(key as keyof typeof levels)}
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Liste des exercices */}
            {filteredExercises.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">Aucun exercice trouvé</h3>
                  <p className="text-muted-foreground mb-4">
                    Aucun exercice ne correspond à vos critères de recherche.
                  </p>
                  <Button 
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedLevel('all');
                    }}
                    variant="outline"
                  >
                    Voir tous les exercices
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExercises.map((exercise) => (
                  <ExerciseCard 
                    key={exercise.id} 
                    exercise={exercise} 
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tabs pour favoris, nouveaux et récents peuvent avoir un contenu similaire */}
          <TabsContent value="favorites">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExercises.filter(ex => ex.category === 'relaxation' || ex.category === 'respiration').map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="new">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExercises.filter(ex => ex.level === 'beginner').map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExercises.slice(0, 6).map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}