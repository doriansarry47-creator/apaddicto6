import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExerciseSchema } from "@shared/schema";
import type { 
  Exercise, 
  InsertExercise, 
  CustomSession, 
  InsertCustomSession,
  SessionElement,
  InsertSessionElement,
  PatientSession,
  User
} from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Edit, Activity, Filter, Clock, Target, Users, Play, Settings, Send, Eye, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAdminAutoRefresh } from "@/hooks/useAutoRefresh";
import { apiRequest } from "@/lib/queryClient";
import { EnhancedSessionBuilder } from "@/components/enhanced-session-builder";
import { AdvancedSessionBuilder } from "@/components/advanced-session-builder";

type ExerciseFormData = InsertExercise;
type SessionFormData = InsertCustomSession;

import { 
  EXERCISE_CATEGORIES, 
  SESSION_CATEGORIES, 
  DIFFICULTY_LEVELS, 
  SESSION_STATUSES,
  getCategoryByValue,
  getDifficultyByValue,
  getStatusByValue
} from "@shared/constants.ts";

export default function ManageExercisesSessions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("exercises");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);

  // Actualisation automatique des données admin
  useAdminAutoRefresh(true);

  // Queries
  const { data: exercises, isLoading: isLoadingExercises, refetch: refetchExercises } = useQuery<Exercise[]>({
    queryKey: ["admin", "exercises"],
    queryFn: async () => apiRequest("GET", "/api/exercises").then(res => res.json()),
    initialData: [],
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Actualisation automatique toutes les 30 secondes
  });

  const { data: sessions, isLoading: isLoadingSessions, refetch: refetchSessions } = useQuery<CustomSession[]>({
    queryKey: ["admin", "sessions"],
    queryFn: async () => apiRequest("GET", "/api/sessions").then(res => res.json()),
    initialData: [],
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Actualisation automatique toutes les 30 secondes
  });

  const { data: patients, isLoading: isLoadingPatients, error: patientsError } = useQuery<User[]>({
    queryKey: ["admin", "patients"],
    queryFn: async () => {
      console.log('Fetching patients...');
      const response = await apiRequest("GET", "/api/admin/patients");
      const data = await response.json();
      console.log('Patients data:', data);
      return data;
    },
    initialData: [],
    retry: 3,
  });

  const { data: patientSessions, isLoading: isLoadingPatientSessions } = useQuery<PatientSession[]>({
    queryKey: ["admin", "patient-sessions"],
    queryFn: async () => apiRequest("GET", "/api/admin/patient-sessions").then(res => res.json()),
    initialData: [],
  });

  // Form setup for exercises
  const exerciseForm = useForm<ExerciseFormData>({
    resolver: zodResolver(insertExerciseSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "craving_reduction",
      difficulty: "beginner",
      duration: 15,
      instructions: "",
      benefits: "",
      imageUrl: "",
      videoUrl: "",
      mediaUrl: "",
      tags: [],
      variable1: "",
      variable2: "",
      variable3: "",
      isActive: true,
    },
  });

  // Mutations pour exercices
  const createExerciseMutation = useMutation({
    mutationFn: async (newExercise: ExerciseFormData) => {
      const response = await apiRequest("POST", "/api/exercises", newExercise);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "exercises"] });
      toast({
        title: "Exercice créé",
        description: "L'exercice a été ajouté avec succès à la bibliothèque.",
      });
      exerciseForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer l'exercice",
        variant: "destructive",
      });
    },
  });

  const updateExerciseMutation = useMutation({
    mutationFn: async ({ id, exercise }: { id: string; exercise: Partial<ExerciseFormData> }) => {
      const response = await apiRequest("PUT", `/api/exercises/${id}`, exercise);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "exercises"] });
      toast({
        title: "Exercice modifié",
        description: "L'exercice a été mis à jour avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier l'exercice",
        variant: "destructive",
      });
    },
  });

  const deleteExerciseMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/exercises/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "exercises"] });
      toast({
        title: "Exercice supprimé",
        description: "L'exercice a été supprimé de la bibliothèque.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'exercice",
        variant: "destructive",
      });
    },
  });

  // Mutations pour séances
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      const response = await apiRequest("POST", "/api/sessions", sessionData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Impossible de créer la séance");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sessions"] });
      toast({
        title: "Séance créée",
        description: "La séance a été créée avec succès.",
      });
      // Retourner les données pour que les composants puissent les utiliser
      return data;
    },
    onError: (error: any) => {
      console.error('Error creating session:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la séance",
        variant: "destructive"
      });
    },
  });

  // Mutation pour publier une séance
  const publishSessionMutation = useMutation({
    mutationFn: async ({ sessionId, patientIds }: { sessionId: string; patientIds: string[] }) => {
      const response = await apiRequest("POST", `/api/sessions/${sessionId}/publish`, { patientIds });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sessions"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "patient-sessions"] });
      toast({
        title: "Séance publiée",
        description: "La séance a été assignée aux patients sélectionnés.",
      });
      setSelectedPatients([]);
      setSelectedSessionId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de publier la séance",
        variant: "destructive",
      });
    },
  });

  // Mutation pour assigner un exercice individuel
  const assignExerciseMutation = useMutation({
    mutationFn: async ({ exerciseId, patientIds }: { exerciseId: string; patientIds: string[] }) => {
      // Créer une séance temporaire avec cet exercice
      const sessionData = {
        title: `Exercice: ${exercises.find(e => e.id === exerciseId)?.title || 'Exercice'}`,
        description: `Séance individuelle créée automatiquement pour l'exercice`,
        category: 'maintenance',
        difficulty: exercises.find(e => e.id === exerciseId)?.difficulty || 'beginner',
        exercises: [{
          exerciseId: exerciseId,
          title: exercises.find(e => e.id === exerciseId)?.title || 'Exercice',
          duration: (exercises.find(e => e.id === exerciseId)?.duration || 15) * 60, // Convert to seconds
          repetitions: 1,
          restTime: 60,
          isOptional: false,
          order: 0
        }],
        isPublic: false,
        status: 'published'
      };
      
      // Créer la séance
      const sessionResponse = await apiRequest("POST", "/api/sessions", sessionData);
      const session = await sessionResponse.json();
      
      // Publier la séance aux patients
      const publishResponse = await apiRequest("POST", `/api/sessions/${session.id}/publish`, { patientIds });
      return publishResponse.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sessions"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "patient-sessions"] });
      toast({
        title: "Exercice assigné",
        description: "L'exercice a été assigné aux patients sélectionnés.",
      });
      setSelectedPatients([]);
      setSelectedSessionId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'assigner l'exercice",
        variant: "destructive",
      });
    },
  });

  // Filtrage des exercices
  const filteredExercises = exercises?.filter(exercise => {
    const matchesCategory = categoryFilter === "all" || exercise.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === "all" || exercise.difficulty === difficultyFilter;
    return matchesCategory && matchesDifficulty;
  }) || [];

  // Filtrage des séances
  const filteredSessions = sessions || [];

  // Handlers
  const onSubmitExercise: SubmitHandler<ExerciseFormData> = (data) => {
    createExerciseMutation.mutate(data);
  };

  const handlePublishSession = () => {
    if (!selectedSessionId || selectedPatients.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une séance et au moins un patient",
        variant: "destructive",
      });
      return;
    }

    publishSessionMutation.mutate({
      sessionId: selectedSessionId,
      patientIds: selectedPatients,
    });
  };

  const handleAssignExercise = (exerciseId: string) => {
    if (!exerciseId || selectedPatients.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un patient",
        variant: "destructive",
      });
      return;
    }

    assignExerciseMutation.mutate({
      exerciseId,
      patientIds: selectedPatients,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    return getDifficultyByValue(difficulty).color;
  };

  const getCategoryIcon = (category: string) => {
    return getCategoryByValue(category).icon;
  };

  const getStatusColor = (status: string) => {
    return getStatusByValue(status, SESSION_STATUSES).color;
  };

  return (
    <div className="container max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestion des Exercices & Séances</h1>
          <p className="text-muted-foreground">
            Créez et gérez la bibliothèque d'exercices et les séances personnalisées pour vos patients
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => {
              refetchExercises();
              refetchSessions();
            }}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-full grid-cols-5 max-w-4xl">
            <TabsTrigger value="exercises">
              <Activity className="h-4 w-4 mr-2" />
              Exercices ({filteredExercises.length})
            </TabsTrigger>
            <TabsTrigger value="sessions">
              <Target className="h-4 w-4 mr-2" />
              Séances ({filteredSessions.length})
            </TabsTrigger>
            <TabsTrigger value="session-builder">
              <Plus className="h-4 w-4 mr-2" />
              Créer une Séance
            </TabsTrigger>
            <TabsTrigger value="advanced-builder">
              <Settings className="h-4 w-4 mr-2" />
              Protocoles Avancés
            </TabsTrigger>
            <TabsTrigger value="patient-assignments">
              <Users className="h-4 w-4 mr-2" />
              Assignations
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Onglet Exercices */}
        <TabsContent value="exercises" className="space-y-6">
          <div className="flex gap-4 items-center">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-64">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer par catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {EXERCISE_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par difficulté" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les niveaux</SelectItem>
                {DIFFICULTY_LEVELS.map(level => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulaire de création d'exercice */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Nouvel Exercice
                </CardTitle>
                <CardDescription>
                  Ajoutez un exercice à la bibliothèque
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={exerciseForm.handleSubmit(onSubmitExercise)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Titre *</Label>
                      <Input
                        id="title"
                        {...exerciseForm.register("title")}
                        placeholder="Nom de l'exercice"
                      />
                      {exerciseForm.formState.errors.title && (
                        <p className="text-sm text-red-500 mt-1">
                          {exerciseForm.formState.errors.title.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="duration">Durée (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        max="180"
                        {...exerciseForm.register("duration", { valueAsNumber: true })}
                        placeholder="15"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...exerciseForm.register("description")}
                      placeholder="Description détaillée de l'exercice"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Catégorie *</Label>
                      <Select 
                        value={exerciseForm.watch("category")} 
                        onValueChange={(value) => exerciseForm.setValue("category", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXERCISE_CATEGORIES.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.icon} {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="difficulty">Difficulté</Label>
                      <Select 
                        value={exerciseForm.watch("difficulty")} 
                        onValueChange={(value) => exerciseForm.setValue("difficulty", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Niveau de difficulté" />
                        </SelectTrigger>
                        <SelectContent>
                          {DIFFICULTY_LEVELS.map(level => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="instructions">Instructions</Label>
                    <Textarea
                      id="instructions"
                      {...exerciseForm.register("instructions")}
                      placeholder="Instructions étape par étape pour réaliser l'exercice"
                      rows={4}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createExerciseMutation.isPending}
                  >
                    {createExerciseMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Création...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Créer l'exercice
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Liste des exercices */}
            <Card>
              <CardHeader>
                <CardTitle>Bibliothèque d'Exercices</CardTitle>
                <CardDescription>
                  {filteredExercises.length} exercice(s) dans la bibliothèque
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {isLoadingExercises ? (
                    <p className="text-center text-muted-foreground py-4">Chargement...</p>
                  ) : filteredExercises.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Aucun exercice trouvé
                    </p>
                  ) : (
                    filteredExercises.map((exercise) => (
                      <div key={exercise.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{exercise.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {exercise.description?.slice(0, 100)}...
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge className={getDifficultyColor(exercise.difficulty || 'beginner')}>
                              {getDifficultyByValue(exercise.difficulty || 'beginner').label}
                            </Badge>
                            <Badge variant="outline">
                              {getCategoryByValue(exercise.category).icon} 
                              {getCategoryByValue(exercise.category).label}
                            </Badge>
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              {exercise.duration || 15}min
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => setSelectedSessionId(exercise.id)}
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Assigner
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Assigner l'exercice aux patients</DialogTitle>
                                <DialogDescription>
                                  Sélectionnez les patients qui recevront cet exercice comme séance individuelle
                                </DialogDescription>
                              </DialogHeader>
                              {patients.length > 0 ? (
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                  {patients.filter(p => p.role === 'patient').map((patient) => (
                                    <div key={patient.id} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`exercise-${exercise.id}-patient-${patient.id}`}
                                        checked={selectedPatients.includes(patient.id)}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            setSelectedPatients([...selectedPatients, patient.id]);
                                          } else {
                                            setSelectedPatients(selectedPatients.filter(id => id !== patient.id));
                                          }
                                        }}
                                      />
                                      <Label htmlFor={`exercise-${exercise.id}-patient-${patient.id}`} className="flex-1 cursor-pointer">
                                        <div className="text-sm font-medium">{patient.firstName} {patient.lastName}</div>
                                        <div className="text-xs text-muted-foreground">{patient.email}</div>
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4 text-muted-foreground">
                                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                  <p>Aucun patient disponible</p>
                                  <p className="text-xs">Ajoutez des patients pour pouvoir assigner des exercices</p>
                                </div>
                              )}
                              <div className="flex justify-end gap-2 pt-4">
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setSelectedSessionId(null);
                                    setSelectedPatients([]);
                                  }}
                                >
                                  Annuler
                                </Button>
                                <Button 
                                  onClick={() => handleAssignExercise(exercise.id)}
                                  disabled={selectedPatients.length === 0}
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Assigner ({selectedPatients.length})
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer l'exercice</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer cet exercice ? Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteExerciseMutation.mutate(exercise.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Séances */}
        <TabsContent value="sessions" className="space-y-6">
          <div className="grid gap-4">
            {isLoadingSessions ? (
              <p className="text-center text-muted-foreground py-8">Chargement des séances...</p>
            ) : filteredSessions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Aucune séance créée pour le moment
                  </p>
                  <Button 
                    className="mt-4"
                    onClick={() => setActiveTab("session-builder")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Créer ma première séance
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredSessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{session.title}</h3>
                          <Badge className={getStatusColor(session.status || 'draft')}>
                            {session.status || 'draft'}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{session.description}</p>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">
                            {getCategoryByValue(session.category, SESSION_CATEGORIES).icon} {getCategoryByValue(session.category, SESSION_CATEGORIES).label}
                          </Badge>
                          <Badge className={getDifficultyColor(session.difficulty || 'beginner')}>
                            {getDifficultyByValue(session.difficulty || 'beginner').label}
                          </Badge>
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            {Math.round((session.totalDuration || 0) / 60)}min
                          </Badge>
                          {session.tags && session.tags.length > 0 && (
                            <div className="flex gap-1">
                              {session.tags.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {session.tags.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{session.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              onClick={() => setSelectedSessionId(session.id)}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Assigner
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assigner la séance aux patients</DialogTitle>
                              <DialogDescription>
                                Sélectionnez les patients qui recevront cette séance
                              </DialogDescription>
                            </DialogHeader>
                            <div className="text-xs text-muted-foreground mb-2">
                              {isLoadingPatients ? 'Chargement...' : 
                               patientsError ? 'Erreur de chargement' :
                               `${patients.filter(p => p.role === 'patient').length} patient(s) disponible(s)`}
                            </div>
                            {patients.filter(p => p.role === 'patient').length > 0 ? (
                              <div className="space-y-3 max-h-64 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                                {isLoadingPatients ? (
                                  <div className="flex items-center justify-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                    <span className="ml-2 text-sm text-muted-foreground">Chargement des patients...</span>
                                  </div>
                                ) : patients.filter(p => p.role === 'patient').map((patient) => (
                                  <div key={patient.id} className="flex items-center space-x-3 p-2 bg-white rounded border hover:bg-gray-50 transition-colors">
                                    <Checkbox
                                      id={`session-patient-${patient.id}`}
                                      checked={selectedPatients.includes(patient.id)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedPatients([...selectedPatients, patient.id]);
                                        } else {
                                          setSelectedPatients(selectedPatients.filter(id => id !== patient.id));
                                        }
                                      }}
                                    />
                                    <Label htmlFor={`session-patient-${patient.id}`} className="flex-1 cursor-pointer">
                                      <div className="text-sm font-medium">{patient.firstName} {patient.lastName}</div>
                                      <div className="text-xs text-muted-foreground">{patient.email}</div>
                                    </Label>
                                  </div>
                                ))}
                                {patientsError && (
                                  <div className="text-center py-4 text-red-600">
                                    <p className="text-sm">Erreur lors du chargement des patients</p>
                                    <p className="text-xs">{patientsError.message}</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p className="font-medium">Aucun patient disponible</p>
                                <p className="text-sm">Ajoutez des patients pour pouvoir assigner des séances</p>
                              </div>
                            )}
                            <div className="flex justify-end gap-2 pt-4">
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setSelectedSessionId(null);
                                  setSelectedPatients([]);
                                }}
                              >
                                Annuler
                              </Button>
                              <Button 
                                onClick={handlePublishSession}
                                disabled={selectedPatients.length === 0}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Assigner ({selectedPatients.length})
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Onglet Créateur de Séances */}
        <TabsContent value="session-builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Créateur de Séances Avancé</CardTitle>
              <CardDescription>
                Construisez des séances personnalisées en combinant plusieurs exercices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedSessionBuilder
                exercises={exercises || []}
                onSave={async (sessionData) => {
                  return new Promise((resolve, reject) => {
                    createSessionMutation.mutate(sessionData, {
                      onSuccess: (data) => {
                        refetchSessions(); // Forcer le rechargement des séances
                        resolve(data);
                      },
                      onError: (error) => reject(error)
                    });
                  });
                }}
                onPublish={async (sessionId, patientIds) => {
                  return new Promise((resolve, reject) => {
                    publishSessionMutation.mutate({ sessionId, patientIds }, {
                      onSuccess: (data) => {
                        refetchSessions(); // Forcer le rechargement des séances
                        resolve(data);
                      },
                      onError: (error) => reject(error)
                    });
                  });
                }}
                patients={patients || []}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Constructeur Avancé avec Protocoles */}
        <TabsContent value="advanced-builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Créateur de Séances avec Protocoles</CardTitle>
              <CardDescription>
                Créez des séances avancées avec HIIT, TABATA, HICT, EMOM, AMRAP et plus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdvancedSessionBuilder
                exercises={exercises || []}
                onSave={async (sessionData: any) => {
                  return new Promise((resolve, reject) => {
                    createSessionMutation.mutate(sessionData, {
                      onSuccess: (data) => {
                        refetchSessions(); // Forcer le rechargement des séances
                        resolve(data);
                      },
                      onError: (error) => reject(error)
                    });
                  });
                }}
                onPublish={async (sessionId, patientIds) => {
                  return new Promise((resolve, reject) => {
                    publishSessionMutation.mutate({ sessionId, patientIds }, {
                      onSuccess: (data) => {
                        refetchSessions(); // Forcer le rechargement des séances
                        resolve(data);
                      },
                      onError: (error) => reject(error)
                    });
                  });
                }}
                patients={patients || []}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Assignations Patients */}
        <TabsContent value="patient-assignments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Suivi des Assignations</CardTitle>
              <CardDescription>
                Visualisez les séances assignées et leur progression
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoadingPatientSessions ? (
                  <p className="text-center text-muted-foreground py-8">Chargement...</p>
                ) : patientSessions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune séance assignée pour le moment
                  </p>
                ) : (
                  patientSessions.map((patientSession) => (
                    <div key={patientSession.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">
                            Patient: {patientSession.patient ? `${patientSession.patient.firstName} ${patientSession.patient.lastName}` : 'Utilisateur inconnu'}
                          </h4>
                          <Badge className={
                            patientSession.status === 'done' ? 'bg-green-100 text-green-800' :
                            patientSession.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {patientSession.status === 'done' ? 'Terminée' :
                             patientSession.status === 'assigned' ? 'En cours' : 'Ignorée'}
                          </Badge>
                        </div>
                        {patientSession.session && (
                          <p className="text-sm font-medium text-gray-700">
                            Séance: {patientSession.session.title}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mb-2">
                          Assignée le {new Date(patientSession.assignedAt).toLocaleDateString('fr-FR')}
                        </p>
                        {patientSession.completedAt && (
                          <p className="text-sm text-green-600">
                            Terminée le {new Date(patientSession.completedAt).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                        {patientSession.feedback && (
                          <p className="text-sm italic mt-2">"{patientSession.feedback}"</p>
                        )}
                      </div>
                      <div className="text-right">
                        {patientSession.status === 'done' ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : patientSession.status === 'assigned' ? (
                          <Clock className="h-6 w-6 text-blue-600" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}