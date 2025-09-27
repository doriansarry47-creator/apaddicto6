import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Exercise } from "@shared/schema";

interface ExerciseVariation {
  id: string;
  exerciseId: string;
  type: 'simplification' | 'complexification';
  title: string;
  description: string;
  instructions: string;
  duration?: number;
  difficultyModifier: number;
}

interface SessionExercise {
  id: string;
  exerciseId: string;
  title: string;
  description: string;
  duration: number;
  repetitions: number;
  restTime: number;
  intensity: 'low' | 'medium' | 'high';
  order: number;
  selectedVariation?: ExerciseVariation;
}

interface SessionModifierProps {
  sessionId?: string;
  exercises: SessionExercise[];
  onSave: (modifiedExercises: SessionExercise[]) => void;
  onCancel: () => void;
}

export function SessionModifier({ sessionId, exercises, onSave, onCancel }: SessionModifierProps) {
  const [modifiedExercises, setModifiedExercises] = useState<SessionExercise[]>(exercises);
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupération des exercices disponibles
  const { data: availableExercises = [] } = useQuery<Exercise[]>({
    queryKey: ['/api/exercises'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/exercises');
      return response.json();
    }
  });

  // Récupération des variations d'exercices
  const { data: exerciseVariations = [] } = useQuery<ExerciseVariation[]>({
    queryKey: ['/api/exercise-variations'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/exercise-variations');
        return response.json();
      } catch (error) {
        // Si l'endpoint n'existe pas, retourner un tableau vide
        return [];
      }
    }
  });

  const addExercise = (exercise: Exercise) => {
    const newExercise: SessionExercise = {
      id: `temp-${Date.now()}`,
      exerciseId: exercise.id,
      title: exercise.title,
      description: exercise.description || '',
      duration: exercise.duration || 5,
      repetitions: 1,
      restTime: 30,
      intensity: 'medium',
      order: modifiedExercises.length
    };
    
    setModifiedExercises([...modifiedExercises, newExercise]);
    setShowExerciseLibrary(false);
  };

  const removeExercise = (exerciseId: string) => {
    const filtered = modifiedExercises.filter(ex => ex.id !== exerciseId);
    // Réajuster les ordres
    const reordered = filtered.map((ex, index) => ({ ...ex, order: index }));
    setModifiedExercises(reordered);
  };

  const moveExercise = (exerciseId: string, direction: 'up' | 'down') => {
    const currentIndex = modifiedExercises.findIndex(ex => ex.id === exerciseId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === modifiedExercises.length - 1)
    ) {
      return;
    }

    const newExercises = [...modifiedExercises];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newExercises[currentIndex], newExercises[targetIndex]] = [newExercises[targetIndex], newExercises[currentIndex]];
    
    // Mettre à jour les ordres
    newExercises.forEach((ex, index) => {
      ex.order = index;
    });
    
    setModifiedExercises(newExercises);
  };

  const updateExercise = (exerciseId: string, updates: Partial<SessionExercise>) => {
    setModifiedExercises(prev => 
      prev.map(ex => ex.id === exerciseId ? { ...ex, ...updates } : ex)
    );
  };

  const selectVariation = (exerciseId: string, variation: ExerciseVariation | null) => {
    updateExercise(exerciseId, { selectedVariation: variation || undefined });
  };

  const getVariationsForExercise = (exerciseId: string) => {
    return exerciseVariations.filter(v => v.exerciseId === exerciseId);
  };

  const getTotalDuration = () => {
    return modifiedExercises.reduce((total, ex) => {
      const exerciseDuration = ex.selectedVariation?.duration || ex.duration;
      return total + (exerciseDuration * ex.repetitions) + ex.restTime;
    }, 0);
  };

  const handleSave = () => {
    if (modifiedExercises.length === 0) {
      toast({
        title: "Erreur",
        description: "Ajoutez au moins un exercice à la séance.",
        variant: "destructive"
      });
      return;
    }

    onSave(modifiedExercises);
    toast({
      title: "Séance modifiée",
      description: "Vos modifications ont été sauvegardées avec succès."
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium text-foreground mb-2">Modifier la Séance</h2>
              <p className="text-sm text-muted-foreground">
                Durée totale : {Math.round(getTotalDuration() / 60)} minutes • {modifiedExercises.length} exercice{modifiedExercises.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="bg-primary text-primary-foreground">
                Sauvegarder
              </Button>
              <Button onClick={onCancel} variant="outline">
                Annuler
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise List */}
      <div className="space-y-4">
        {modifiedExercises.map((exercise, index) => (
          <Card key={exercise.id} className="border">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                    <CardTitle className="text-lg">{exercise.title}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">{exercise.description}</p>
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
                    disabled={index === modifiedExercises.length - 1}
                  >
                    <span className="material-icons text-sm">keyboard_arrow_down</span>
                  </Button>
                  <Button
                    onClick={() => removeExercise(exercise.id)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <span className="material-icons text-sm">delete</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Variation Selection */}
              {getVariationsForExercise(exercise.exerciseId).length > 0 && (
                <div className="mb-4">
                  <Label className="text-sm font-medium">Variation de l'exercice</Label>
                  <Select
                    value={exercise.selectedVariation?.id || 'original'}
                    onValueChange={(value) => {
                      const variation = value === 'original' ? null : 
                        getVariationsForExercise(exercise.exerciseId).find(v => v.id === value);
                      selectVariation(exercise.id, variation || null);
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">Version originale</SelectItem>
                      {getVariationsForExercise(exercise.exerciseId).map(variation => (
                        <SelectItem key={variation.id} value={variation.id}>
                          {variation.title} ({variation.type === 'simplification' ? 'Plus facile' : 'Plus difficile'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {exercise.selectedVariation && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {exercise.selectedVariation.description}
                    </p>
                  )}
                </div>
              )}

              {/* Exercise Parameters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label htmlFor={`duration-${exercise.id}`} className="text-xs">
                    Durée (minutes)
                  </Label>
                  <Input
                    id={`duration-${exercise.id}`}
                    type="number"
                    value={exercise.selectedVariation?.duration || exercise.duration}
                    onChange={(e) => updateExercise(exercise.id, {
                      duration: Number(e.target.value)
                    })}
                    min="1"
                    max="60"
                    className="text-xs"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`repetitions-${exercise.id}`} className="text-xs">
                    Répétitions
                  </Label>
                  <Input
                    id={`repetitions-${exercise.id}`}
                    type="number"
                    value={exercise.repetitions}
                    onChange={(e) => updateExercise(exercise.id, {
                      repetitions: Number(e.target.value)
                    })}
                    min="1"
                    max="10"
                    className="text-xs"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`rest-${exercise.id}`} className="text-xs">
                    Repos (sec)
                  </Label>
                  <Input
                    id={`rest-${exercise.id}`}
                    type="number"
                    value={exercise.restTime}
                    onChange={(e) => updateExercise(exercise.id, {
                      restTime: Number(e.target.value)
                    })}
                    min="0"
                    max="300"
                    className="text-xs"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`intensity-${exercise.id}`} className="text-xs">
                    Intensité
                  </Label>
                  <Select
                    value={exercise.intensity}
                    onValueChange={(value: 'low' | 'medium' | 'high') =>
                      updateExercise(exercise.id, { intensity: value })
                    }
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
      </div>

      {/* Add Exercise */}
      {!showExerciseLibrary ? (
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="p-8 text-center">
            <Button
              onClick={() => setShowExerciseLibrary(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <span className="material-icons">add</span>
              Ajouter un Exercice
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Bibliothèque d'Exercices</CardTitle>
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
                  onClick={() => addExercise(exercise)}
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
    </div>
  );
}