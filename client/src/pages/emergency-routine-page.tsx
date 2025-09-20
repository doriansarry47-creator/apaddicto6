import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthQuery } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Exercise as APIExercise } from "@shared/schema";

interface RoutineExercise {
  id: string;
  exerciseId: string;
  title: string;
  duration: number;
  repetitions?: number;
  restTime?: number;
  intensity?: 'low' | 'medium' | 'high';
  notes?: string;
  order: number;
}

interface EmergencyRoutine {
  id: string;
  userId: string;
  name: string;
  description?: string;
  totalDuration: number;
  exercises: RoutineExercise[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function EmergencyRoutinePage() {
  const [, setLocation] = useLocation();
  const { data: authenticatedUser, isLoading: userLoading } = useAuthQuery();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedRoutine, setSelectedRoutine] = useState<EmergencyRoutine | null>(null);
  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false);
  const [routineName, setRoutineName] = useState("");
  const [routineDescription, setRoutineDescription] = useState("");
  const [currentExercises, setCurrentExercises] = useState<RoutineExercise[]>([]);
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);

  // Récupération des routines existantes
  const { data: routines = [], isLoading: routinesLoading } = useQuery<EmergencyRoutine[]>({
    queryKey: ["/api/emergency-routines"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/emergency-routines");
      return response.json();
    },
    enabled: !!authenticatedUser,
  });

  // Récupération des exercices disponibles
  const { data: availableExercises = [], isLoading: exercisesLoading } = useQuery<APIExercise[]>({
    queryKey: ["/api/exercises"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/exercises");
      return response.json();
    },
    enabled: !!authenticatedUser,
  });

  // Mutation pour sauvegarder une routine
  const saveRoutineMutation = useMutation({
    mutationFn: async (routine: Omit<EmergencyRoutine, "id" | "createdAt" | "updatedAt">) => {
      const response = await apiRequest("POST", "/api/emergency-routines", routine);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Routine sauvegardée",
        description: "Votre routine d'urgence a été créée avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/emergency-routines"] });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la routine. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  // Mutation pour supprimer une routine
  const deleteRoutineMutation = useMutation({
    mutationFn: async (routineId: string) => {
      const response = await apiRequest("DELETE", `/api/emergency-routines/${routineId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Routine supprimée",
        description: "La routine a été supprimée avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/emergency-routines"] });
      setSelectedRoutine(null);
    },
  });

  const resetForm = () => {
    setIsCreatingRoutine(false);
    setRoutineName("");
    setRoutineDescription("");
    setCurrentExercises([]);
    setShowExerciseLibrary(false);
  };

  const addExerciseToRoutine = (exercise: APIExercise) => {
    const newRoutineExercise: RoutineExercise = {
      id: `temp-${Date.now()}`,
      exerciseId: exercise.id,
      title: exercise.title,
      duration: exercise.duration || 5,
      repetitions: 1,
      restTime: 30,
      intensity: 'medium',
      order: currentExercises.length,
    };
    setCurrentExercises([...currentExercises, newRoutineExercise]);
    setShowExerciseLibrary(false);
  };

  const removeExerciseFromRoutine = (exerciseId: string) => {
    setCurrentExercises(currentExercises.filter(ex => ex.id !== exerciseId));
  };

  const updateExerciseSettings = (exerciseId: string, settings: Partial<RoutineExercise>) => {
    setCurrentExercises(currentExercises.map(ex => 
      ex.id === exerciseId ? { ...ex, ...settings } : ex
    ));
  };

  const moveExercise = (exerciseId: string, direction: 'up' | 'down') => {
    const currentIndex = currentExercises.findIndex(ex => ex.id === exerciseId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === currentExercises.length - 1)
    ) {
      return;
    }

    const newExercises = [...currentExercises];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newExercises[currentIndex], newExercises[targetIndex]] = [newExercises[targetIndex], newExercises[currentIndex]];
    
    // Mettre à jour les ordres
    newExercises.forEach((ex, index) => {
      ex.order = index;
    });
    
    setCurrentExercises(newExercises);
  };

  const calculateTotalDuration = () => {
    return currentExercises.reduce((total, ex) => {
      return total + (ex.duration * (ex.repetitions || 1)) + (ex.restTime || 0);
    }, 0);
  };

  const saveCurrentRoutine = () => {
    if (!routineName.trim() || currentExercises.length === 0) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez renseigner un nom et ajouter au moins un exercice.",
        variant: "destructive",
      });
      return;
    }

    const routine: Omit<EmergencyRoutine, "id" | "createdAt" | "updatedAt"> = {
      userId: authenticatedUser!.id,
      name: routineName.trim(),
      description: routineDescription.trim() || undefined,
      totalDuration: calculateTotalDuration(),
      exercises: currentExercises,
      isDefault: routines.length === 0, // Première routine devient par défaut
    };

    saveRoutineMutation.mutate(routine);
  };

  const startRoutine = (routine: EmergencyRoutine) => {
    if (routine.exercises.length === 0) {
      toast({
        title: "Routine vide",
        description: "Cette routine ne contient aucun exercice.",
        variant: "destructive",
      });
      return;
    }

    // Démarrer avec le premier exercice de la routine
    const firstExercise = routine.exercises[0];
    toast({
      title: "Routine démarrée",
      description: `Démarrage de "${routine.name}" avec ${routine.exercises.length} exercices.`,
    });
    
    // Rediriger vers le premier exercice avec les paramètres de la routine
    setLocation(`/exercise/${firstExercise.exerciseId}?routine=${routine.id}&step=0`);
  };

  if (userLoading || routinesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!authenticatedUser) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-bold text-destructive mb-4">Accès non autorisé</h2>
            <p className="text-muted-foreground">Veuillez vous connecter pour gérer vos routines d'urgence.</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        {/* Page Header */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-destructive mb-2">
                Routines d'Urgence Personnalisées
              </h1>
              <p className="text-muted-foreground">
                Créez et gérez vos propres séquences d'exercices pour les moments de craving intense.
              </p>
            </div>
            <Button
              onClick={() => setLocation("/exercises")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <span className="material-icons text-sm">arrow_back</span>
              Retour
            </Button>
          </div>
        </section>

        {/* Existing Routines */}
        {routines.length > 0 && (
          <section className="mb-8">
            <Card className="shadow-material">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="material-icons mr-2 text-primary">fitness_center</span>
                  Vos Routines d'Urgence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {routines.map((routine) => (
                    <Card key={routine.id} className="border-2 border-border hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-foreground">{routine.name}</h3>
                            {routine.isDefault && (
                              <Badge variant="secondary" className="text-xs mt-1">Par défaut</Badge>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(routine.totalDuration / 60)} min
                          </Badge>
                        </div>
                        
                        {routine.description && (
                          <p className="text-sm text-muted-foreground mb-3">{routine.description}</p>
                        )}
                        
                        <div className="text-xs text-muted-foreground mb-4">
                          {routine.exercises.length} exercice{routine.exercises.length > 1 ? 's' : ''}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => startRoutine(routine)}
                            size="sm"
                            className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            <span className="material-icons text-sm mr-1">play_arrow</span>
                            Démarrer
                          </Button>
                          <Button
                            onClick={() => setSelectedRoutine(routine)}
                            variant="outline"
                            size="sm"
                          >
                            <span className="material-icons text-sm">edit</span>
                          </Button>
                          <Button
                            onClick={() => deleteRoutineMutation.mutate(routine.id)}
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <span className="material-icons text-sm">delete</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Create New Routine Button */}
        {!isCreatingRoutine && (
          <section className="mb-8">
            <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
              <CardContent className="p-8 text-center">
                <span className="material-icons text-6xl text-primary mb-4">add_circle_outline</span>
                <h3 className="text-xl font-medium text-foreground mb-2">Créer une Nouvelle Routine</h3>
                <p className="text-muted-foreground mb-4">
                  Personnalisez votre propre séquence d'exercices pour les urgences.
                </p>
                <Button onClick={() => setIsCreatingRoutine(true)} className="bg-primary text-primary-foreground">
                  <span className="material-icons mr-2">add</span>
                  Nouvelle Routine
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Routine Creation Form */}
        {isCreatingRoutine && (
          <section className="mb-8">
            <Card className="shadow-material border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="material-icons mr-2 text-primary">edit</span>
                  Créer une Routine d'Urgence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="routineName">Nom de la routine *</Label>
                    <Input
                      id="routineName"
                      value={routineName}
                      onChange={(e) => setRoutineName(e.target.value)}
                      placeholder="Ex: Routine SOS 3 minutes"
                    />
                  </div>
                  <div>
                    <Label htmlFor="routineDescription">Description (optionnel)</Label>
                    <Input
                      id="routineDescription"
                      value={routineDescription}
                      onChange={(e) => setRoutineDescription(e.target.value)}
                      placeholder="Ex: Pour les cravings très intenses"
                    />
                  </div>
                </div>

                {/* Exercise Library */}
                {!showExerciseLibrary && (
                  <div>
                    <Button
                      onClick={() => setShowExerciseLibrary(true)}
                      variant="outline"
                      className="w-full"
                    >
                      <span className="material-icons mr-2">add</span>
                      Ajouter un Exercice
                    </Button>
                  </div>
                )}

                {/* Exercise Selection */}
                {showExerciseLibrary && (
                  <Card className="border-secondary/20 bg-secondary/5">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Bibliothèque d'Exercices</CardTitle>
                        <Button
                          onClick={() => setShowExerciseLibrary(false)}
                          variant="ghost"
                          size="sm"
                        >
                          <span className="material-icons">close</span>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {availableExercises.map((exercise) => (
                          <Card
                            key={exercise.id}
                            className="cursor-pointer hover:border-primary/50 transition-colors"
                            onClick={() => addExerciseToRoutine(exercise)}
                          >
                            <CardContent className="p-3">
                              <h4 className="font-medium text-sm text-foreground mb-1">{exercise.title}</h4>
                              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                {exercise.description}
                              </p>
                              <div className="flex justify-between items-center text-xs">
                                <Badge variant="outline" className="text-xs">
                                  {exercise.category}
                                </Badge>
                                <span className="text-muted-foreground">
                                  {exercise.duration || 5} min
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Current Exercises in Routine */}
                {currentExercises.length > 0 && (
                  <Card className="border-warning/20 bg-warning/5">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <span className="material-icons mr-2">playlist_play</span>
                        Exercices de la Routine ({calculateTotalDuration()} sec total)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {currentExercises.map((exercise, index) => (
                        <Card key={exercise.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                                  <h4 className="font-medium text-foreground">{exercise.title}</h4>
                                </div>
                              </div>
                              
                              <div className="flex gap-1">
                                <Button
                                  onClick={() => moveExercise(exercise.id, 'up')}
                                  variant="ghost"
                                  size="sm"
                                  disabled={index === 0}
                                >
                                  <span className="material-icons text-sm">keyboard_arrow_up</span>
                                </Button>
                                <Button
                                  onClick={() => moveExercise(exercise.id, 'down')}
                                  variant="ghost"
                                  size="sm"
                                  disabled={index === currentExercises.length - 1}
                                >
                                  <span className="material-icons text-sm">keyboard_arrow_down</span>
                                </Button>
                                <Button
                                  onClick={() => removeExerciseFromRoutine(exercise.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                >
                                  <span className="material-icons text-sm">delete</span>
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div>
                                <Label htmlFor={`duration-${exercise.id}`} className="text-xs">Durée (sec)</Label>
                                <Input
                                  id={`duration-${exercise.id}`}
                                  type="number"
                                  value={exercise.duration}
                                  onChange={(e) => updateExerciseSettings(exercise.id, {
                                    duration: Number(e.target.value)
                                  })}
                                  min="5"
                                  max="300"
                                  className="text-xs"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`repetitions-${exercise.id}`} className="text-xs">Répétitions</Label>
                                <Input
                                  id={`repetitions-${exercise.id}`}
                                  type="number"
                                  value={exercise.repetitions || 1}
                                  onChange={(e) => updateExerciseSettings(exercise.id, {
                                    repetitions: Number(e.target.value)
                                  })}
                                  min="1"
                                  max="10"
                                  className="text-xs"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`rest-${exercise.id}`} className="text-xs">Repos (sec)</Label>
                                <Input
                                  id={`rest-${exercise.id}`}
                                  type="number"
                                  value={exercise.restTime || 0}
                                  onChange={(e) => updateExerciseSettings(exercise.id, {
                                    restTime: Number(e.target.value)
                                  })}
                                  min="0"
                                  max="120"
                                  className="text-xs"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`intensity-${exercise.id}`} className="text-xs">Intensité</Label>
                                <Select
                                  value={exercise.intensity || 'medium'}
                                  onValueChange={(value) => updateExerciseSettings(exercise.id, {
                                    intensity: value as 'low' | 'medium' | 'high'
                                  })}
                                >
                                  <SelectTrigger className="text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Faible</SelectItem>
                                    <SelectItem value="medium">Moyenne</SelectItem>
                                    <SelectItem value="high">Élevée</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={saveCurrentRoutine}
                    disabled={!routineName.trim() || currentExercises.length === 0 || saveRoutineMutation.isPending}
                    className="flex-1"
                  >
                    {saveRoutineMutation.isPending ? "Sauvegarde..." : "Sauvegarder la Routine"}
                  </Button>
                  <Button
                    onClick={resetForm}
                    variant="outline"
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Usage Instructions */}
        <section className="mb-8">
          <Card className="shadow-material">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="material-icons mr-2 text-info">help_outline</span>
                Comment utiliser les Routines d'Urgence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium text-foreground mb-2">🎯 Principes de base</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Créez des routines courtes (3-10 minutes)</li>
                    <li>• Alternez exercices de respiration et physiques</li>
                    <li>• Adaptez l'intensité à votre état émotionnel</li>
                    <li>• Testez vos routines en situation calme d'abord</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">⚡ En situation d'urgence</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Choisissez votre routine par défaut rapidement</li>
                    <li>• Suivez la séquence sans sauter d'étapes</li>
                    <li>• Concentrez-vous sur chaque exercice</li>
                    <li>• Évaluez votre état après la routine</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}