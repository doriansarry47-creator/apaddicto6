import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Edit, 
  Save, 
  X, 
  Play, 
  Clock, 
  Target, 
  Activity, 
  Users, 
  ChevronUp, 
  ChevronDown, 
  GripVertical, 
  Settings,
  Heart,
  Zap,
  Flame
} from 'lucide-react';
import { toast } from 'sonner';

// Types
interface Exercise {
  id: number;
  name: string;
  type: string;
  duration: number;
  difficulty: string;
  description: string;
  instructions: string;
  benefits: string[];
  targetMuscles: string[];
}

interface ExerciseVariation {
  id: number;
  exerciseId: number;
  variationType: 'simplification' | 'complexification';
  name: string;
  description: string;
  instructions: string;
  benefits: string[];
  difficulty: string;
}

interface SessionExercise {
  id: string; // Unique ID for session
  exerciseId?: number; // Reference to library exercise
  isCustom: boolean;
  name: string;
  type: string;
  duration: number;
  repetitions?: number;
  sets?: number;
  restTime?: number;
  intensity: number; // 1-10 scale
  notes?: string;
  variationId?: number; // Reference to exercise variation
  customInstructions?: string;
}

interface UserSession {
  id?: number;
  name: string;
  description: string;
  exercises: SessionExercise[];
  duration: number;
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
  tags: string[];
  isPublic: boolean;
}

interface PatientSessionEditorProps {
  session?: UserSession;
  onSave: (session: UserSession) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function PatientSessionEditor({ session, onSave, onCancel, isEditing = false }: PatientSessionEditorProps) {
  // State
  const [currentSession, setCurrentSession] = useState<UserSession>({
    name: '',
    description: '',
    exercises: [],
    duration: 0,
    difficulty: 'débutant',
    tags: [],
    isPublic: false,
    ...session
  });

  const [libraryExercises, setLibraryExercises] = useState<Exercise[]>([]);
  const [exerciseVariations, setExerciseVariations] = useState<ExerciseVariation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomExerciseDialog, setShowCustomExerciseDialog] = useState(false);
  const [editingExercise, setEditingExercise] = useState<SessionExercise | null>(null);
  const [newTag, setNewTag] = useState('');

  // Custom Exercise Form State
  const [customExercise, setCustomExercise] = useState({
    name: '',
    type: 'strength',
    duration: 5,
    repetitions: 10,
    sets: 3,
    restTime: 60,
    intensity: 5,
    notes: '',
    customInstructions: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadLibraryExercises();
    loadExerciseVariations();
  }, []);

  // Calculate total session duration
  useEffect(() => {
    const totalDuration = currentSession.exercises.reduce((total, exercise) => {
      const exerciseDuration = exercise.duration || 5;
      const restDuration = exercise.restTime || 0;
      const sets = exercise.sets || 1;
      return total + (exerciseDuration * sets) + (restDuration * (sets - 1));
    }, 0);
    
    setCurrentSession(prev => ({
      ...prev,
      duration: Math.ceil(totalDuration / 60) // Convert to minutes
    }));
  }, [currentSession.exercises]);

  const loadLibraryExercises = async () => {
    try {
      const response = await fetch('/api/exercises');
      if (response.ok) {
        const exercises = await response.json();
        setLibraryExercises(exercises);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
      toast.error('Erreur lors du chargement des exercices');
    }
  };

  const loadExerciseVariations = async () => {
    try {
      const response = await fetch('/api/exercise-variations');
      if (response.ok) {
        const variations = await response.json();
        setExerciseVariations(variations);
      }
    } catch (error) {
      console.error('Error loading variations:', error);
    }
  };

  const handleAddLibraryExercise = (exercise: Exercise) => {
    const newSessionExercise: SessionExercise = {
      id: `exercise_${Date.now()}_${Math.random()}`,
      exerciseId: exercise.id,
      isCustom: false,
      name: exercise.name,
      type: exercise.type,
      duration: exercise.duration,
      repetitions: 10,
      sets: 1,
      restTime: 60,
      intensity: 5,
      notes: ''
    };

    setCurrentSession(prev => ({
      ...prev,
      exercises: [...prev.exercises, newSessionExercise]
    }));

    toast.success(`Exercice "${exercise.name}" ajouté à votre session`);
  };

  const handleCreateCustomExercise = () => {
    const newSessionExercise: SessionExercise = {
      id: `custom_${Date.now()}_${Math.random()}`,
      isCustom: true,
      name: customExercise.name,
      type: customExercise.type,
      duration: customExercise.duration,
      repetitions: customExercise.repetitions,
      sets: customExercise.sets,
      restTime: customExercise.restTime,
      intensity: customExercise.intensity,
      notes: customExercise.notes,
      customInstructions: customExercise.customInstructions
    };

    setCurrentSession(prev => ({
      ...prev,
      exercises: [...prev.exercises, newSessionExercise]
    }));

    // Reset form
    setCustomExercise({
      name: '',
      type: 'strength',
      duration: 5,
      repetitions: 10,
      sets: 3,
      restTime: 60,
      intensity: 5,
      notes: '',
      customInstructions: ''
    });

    setShowCustomExerciseDialog(false);
    toast.success(`Exercice personnalisé "${newSessionExercise.name}" créé`);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setCurrentSession(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.id !== exerciseId)
    }));
    toast.success('Exercice supprimé de la session');
  };

  const handleDuplicateExercise = (exercise: SessionExercise) => {
    const duplicatedExercise: SessionExercise = {
      ...exercise,
      id: `copy_${Date.now()}_${Math.random()}`,
      name: `${exercise.name} (copie)`
    };

    const exerciseIndex = currentSession.exercises.findIndex(ex => ex.id === exercise.id);
    const newExercises = [...currentSession.exercises];
    newExercises.splice(exerciseIndex + 1, 0, duplicatedExercise);

    setCurrentSession(prev => ({
      ...prev,
      exercises: newExercises
    }));

    toast.success('Exercice dupliqué');
  };

  const handleMoveExercise = (exerciseId: string, direction: 'up' | 'down') => {
    const exercises = [...currentSession.exercises];
    const index = exercises.findIndex(ex => ex.id === exerciseId);
    
    if (direction === 'up' && index > 0) {
      [exercises[index], exercises[index - 1]] = [exercises[index - 1], exercises[index]];
    } else if (direction === 'down' && index < exercises.length - 1) {
      [exercises[index], exercises[index + 1]] = [exercises[index + 1], exercises[index]];
    }

    setCurrentSession(prev => ({
      ...prev,
      exercises
    }));
  };

  const handleEditExercise = (exercise: SessionExercise, updates: Partial<SessionExercise>) => {
    setCurrentSession(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => 
        ex.id === exercise.id ? { ...ex, ...updates } : ex
      )
    }));
  };

  const handleApplyVariation = (exerciseId: string, variationId: number) => {
    const variation = exerciseVariations.find(v => v.id === variationId);
    if (!variation) return;

    setCurrentSession(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => 
        ex.id === exerciseId 
          ? { 
              ...ex, 
              variationId,
              name: variation.name,
              difficulty: variation.difficulty,
              customInstructions: variation.instructions
            }
          : ex
      )
    }));

    toast.success(`Variation "${variation.name}" appliquée`);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !currentSession.tags.includes(newTag.trim())) {
      setCurrentSession(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setCurrentSession(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSaveSession = async () => {
    if (!currentSession.name.trim()) {
      toast.error('Veuillez donner un nom à votre session');
      return;
    }

    if (currentSession.exercises.length === 0) {
      toast.error('Ajoutez au moins un exercice à votre session');
      return;
    }

    setIsLoading(true);
    try {
      onSave(currentSession);
      toast.success(isEditing ? 'Session modifiée avec succès' : 'Session créée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'débutant': return 'bg-green-100 text-green-800 border-green-300';
      case 'intermédiaire': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'avancé': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getIntensityIcon = (intensity: number) => {
    if (intensity <= 3) return <Heart className="h-4 w-4 text-green-600" />;
    if (intensity <= 6) return <Zap className="h-4 w-4 text-yellow-600" />;
    return <Flame className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {isEditing ? 'Modifier la session' : 'Créer une nouvelle session'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="session-name">Nom de la session *</Label>
              <Input
                id="session-name"
                value={currentSession.name}
                onChange={(e) => setCurrentSession(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ma session personnalisée"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-difficulty">Niveau de difficulté</Label>
              <Select 
                value={currentSession.difficulty} 
                onValueChange={(value: 'débutant' | 'intermédiaire' | 'avancé') => 
                  setCurrentSession(prev => ({ ...prev, difficulty: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="débutant">Débutant</SelectItem>
                  <SelectItem value="intermédiaire">Intermédiaire</SelectItem>
                  <SelectItem value="avancé">Avancé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-description">Description</Label>
            <Textarea
              id="session-description"
              value={currentSession.description}
              onChange={(e) => setCurrentSession(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez votre session d'entraînement..."
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {currentSession.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Ajouter un tag..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="flex-1"
              />
              <Button onClick={handleAddTag} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Session Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                <Activity className="h-4 w-4" />
                Exercices
              </div>
              <div className="text-lg font-semibold">{currentSession.exercises.length}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                Durée estimée
              </div>
              <div className="text-lg font-semibold">{currentSession.duration} min</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                <Target className="h-4 w-4" />
                Niveau
              </div>
              <Badge className={getDifficultyColor(currentSession.difficulty)}>
                {currentSession.difficulty}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Management */}
      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="library">Bibliothèque d'exercices</TabsTrigger>
          <TabsTrigger value="session">Ma session ({currentSession.exercises.length})</TabsTrigger>
        </TabsList>

        {/* Exercise Library Tab */}
        <TabsContent value="library" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Ajouter des exercices
                <Button
                  onClick={() => setShowCustomExerciseDialog(true)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Exercice personnalisé
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {libraryExercises.map(exercise => (
                  <Card key={exercise.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{exercise.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {exercise.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{exercise.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {exercise.duration} min
                          </span>
                          <Badge className={getDifficultyColor(exercise.difficulty)} variant="outline">
                            {exercise.difficulty}
                          </Badge>
                        </div>
                        <Button 
                          onClick={() => handleAddLibraryExercise(exercise)}
                          className="w-full" 
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {libraryExercises.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun exercice disponible dans la bibliothèque</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Current Session Tab */}
        <TabsContent value="session" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exercices de votre session</CardTitle>
            </CardHeader>
            <CardContent>
              {currentSession.exercises.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun exercice dans votre session</p>
                  <p className="text-sm">Ajoutez des exercices depuis la bibliothèque ou créez des exercices personnalisés</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentSession.exercises.map((exercise, index) => (
                    <Card key={exercise.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </span>
                              <h4 className="font-medium">{exercise.name}</h4>
                              {exercise.isCustom && (
                                <Badge variant="secondary" className="text-xs">Personnalisé</Badge>
                              )}
                              {exercise.variationId && (
                                <Badge variant="outline" className="text-xs">Variation</Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                              <div>
                                <Label className="text-xs">Durée</Label>
                                <Input
                                  type="number"
                                  value={exercise.duration}
                                  onChange={(e) => handleEditExercise(exercise, { duration: parseInt(e.target.value) || 0 })}
                                  className="h-8"
                                  min="1"
                                />
                              </div>
                              {exercise.type !== 'cardio' && (
                                <>
                                  <div>
                                    <Label className="text-xs">Répétitions</Label>
                                    <Input
                                      type="number"
                                      value={exercise.repetitions || 0}
                                      onChange={(e) => handleEditExercise(exercise, { repetitions: parseInt(e.target.value) || 0 })}
                                      className="h-8"
                                      min="1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Séries</Label>
                                    <Input
                                      type="number"
                                      value={exercise.sets || 1}
                                      onChange={(e) => handleEditExercise(exercise, { sets: parseInt(e.target.value) || 1 })}
                                      className="h-8"
                                      min="1"
                                    />
                                  </div>
                                </>
                              )}
                              <div>
                                <Label className="text-xs">Repos (sec)</Label>
                                <Input
                                  type="number"
                                  value={exercise.restTime || 0}
                                  onChange={(e) => handleEditExercise(exercise, { restTime: parseInt(e.target.value) || 0 })}
                                  className="h-8"
                                  min="0"
                                />
                              </div>
                            </div>

                            <div className="mb-3">
                              <Label className="text-xs mb-2 block">
                                Intensité: {exercise.intensity}/10 {getIntensityIcon(exercise.intensity)}
                              </Label>
                              <Slider
                                value={[exercise.intensity]}
                                onValueChange={([value]) => handleEditExercise(exercise, { intensity: value })}
                                min={1}
                                max={10}
                                step={1}
                                className="w-full"
                              />
                            </div>

                            {exercise.notes && (
                              <div className="mb-2">
                                <Label className="text-xs">Notes personnelles</Label>
                                <Textarea
                                  value={exercise.notes}
                                  onChange={(e) => handleEditExercise(exercise, { notes: e.target.value })}
                                  className="h-20 text-sm"
                                  placeholder="Ajoutez vos notes..."
                                />
                              </div>
                            )}

                            {/* Exercise Variations */}
                            {!exercise.isCustom && exercise.exerciseId && (
                              <div className="mt-3 pt-3 border-t">
                                <Label className="text-xs mb-2 block">Variations disponibles</Label>
                                <div className="flex flex-wrap gap-2">
                                  {exerciseVariations
                                    .filter(v => v.exerciseId === exercise.exerciseId)
                                    .map(variation => (
                                      <Button
                                        key={variation.id}
                                        onClick={() => handleApplyVariation(exercise.id, variation.id)}
                                        variant={exercise.variationId === variation.id ? "default" : "outline"}
                                        size="sm"
                                        className="text-xs"
                                      >
                                        {variation.name}
                                        <Badge 
                                          variant="secondary" 
                                          className={`ml-1 ${variation.variationType === 'simplification' ? 'bg-green-100' : 'bg-blue-100'}`}
                                        >
                                          {variation.variationType === 'simplification' ? '↓' : '↑'}
                                        </Badge>
                                      </Button>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Exercise Actions */}
                          <div className="flex flex-col gap-1 ml-4">
                            <Button
                              onClick={() => handleMoveExercise(exercise.id, 'up')}
                              disabled={index === 0}
                              variant="ghost"
                              size="sm"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleMoveExercise(exercise.id, 'down')}
                              disabled={index === currentSession.exercises.length - 1}
                              variant="ghost"
                              size="sm"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Separator className="my-1" />
                            <Button
                              onClick={() => handleDuplicateExercise(exercise)}
                              variant="ghost"
                              size="sm"
                              title="Dupliquer"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" title="Supprimer">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer l'exercice</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir supprimer "{exercise.name}" de votre session ?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRemoveExercise(exercise.id)}>
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <Button onClick={onCancel} variant="outline">
          Annuler
        </Button>
        <div className="flex gap-2">
          {currentSession.exercises.length > 0 && (
            <Button variant="outline" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Prévisualiser
            </Button>
          )}
          <Button 
            onClick={handleSaveSession}
            disabled={isLoading || !currentSession.name.trim() || currentSession.exercises.length === 0}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Sauvegarde...' : isEditing ? 'Modifier' : 'Créer la session'}
          </Button>
        </div>
      </div>

      {/* Custom Exercise Dialog */}
      <Dialog open={showCustomExerciseDialog} onOpenChange={setShowCustomExerciseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer un exercice personnalisé</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nom de l'exercice *</Label>
                <Input
                  value={customExercise.name}
                  onChange={(e) => setCustomExercise(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Mon exercice"
                />
              </div>
              <div>
                <Label>Type d'exercice</Label>
                <Select 
                  value={customExercise.type}
                  onValueChange={(value) => setCustomExercise(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength">Force</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="flexibility">Flexibilité</SelectItem>
                    <SelectItem value="balance">Équilibre</SelectItem>
                    <SelectItem value="hiit">HIIT</SelectItem>
                    <SelectItem value="yoga">Yoga</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Durée (minutes)</Label>
                <Input
                  type="number"
                  value={customExercise.duration}
                  onChange={(e) => setCustomExercise(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  min="1"
                />
              </div>
              <div>
                <Label>Répétitions</Label>
                <Input
                  type="number"
                  value={customExercise.repetitions}
                  onChange={(e) => setCustomExercise(prev => ({ ...prev, repetitions: parseInt(e.target.value) || 0 }))}
                  min="1"
                />
              </div>
              <div>
                <Label>Séries</Label>
                <Input
                  type="number"
                  value={customExercise.sets}
                  onChange={(e) => setCustomExercise(prev => ({ ...prev, sets: parseInt(e.target.value) || 0 }))}
                  min="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Temps de repos (secondes)</Label>
                <Input
                  type="number"
                  value={customExercise.restTime}
                  onChange={(e) => setCustomExercise(prev => ({ ...prev, restTime: parseInt(e.target.value) || 0 }))}
                  min="0"
                />
              </div>
              <div>
                <Label>Intensité: {customExercise.intensity}/10</Label>
                <Slider
                  value={[customExercise.intensity]}
                  onValueChange={([value]) => setCustomExercise(prev => ({ ...prev, intensity: value }))}
                  min={1}
                  max={10}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label>Instructions personnalisées</Label>
              <Textarea
                value={customExercise.customInstructions}
                onChange={(e) => setCustomExercise(prev => ({ ...prev, customInstructions: e.target.value }))}
                placeholder="Décrivez comment effectuer cet exercice..."
                rows={4}
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={customExercise.notes}
                onChange={(e) => setCustomExercise(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes additionnelles..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                onClick={() => setShowCustomExerciseDialog(false)} 
                variant="outline"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleCreateCustomExercise}
                disabled={!customExercise.name.trim()}
              >
                Créer l'exercice
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}