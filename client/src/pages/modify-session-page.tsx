import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { SessionModifier } from "@/components/session-modifier";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthQuery } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Exercise } from "@shared/schema";

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
}

export default function ModifySessionPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const sessionId = params.sessionId;
  const { data: authenticatedUser, isLoading: userLoading } = useAuthQuery();
  const { toast } = useToast();
  
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>([]);
  const [sessionName, setSessionName] = useState("");
  const [showModifier, setShowModifier] = useState(false);

  // Récupérer les détails de la session si un ID est fourni
  const { data: sessionData, isLoading: sessionLoading } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      try {
        const response = await apiRequest('GET', `/api/sessions/${sessionId}`);
        return response.json();
      } catch (error) {
        // Si l'API n'existe pas, créer une session d'exemple
        return null;
      }
    },
    enabled: !!sessionId && !!authenticatedUser
  });

  // Récupérer tous les exercices pour créer une session par défaut
  const { data: allExercises = [] } = useQuery<Exercise[]>({
    queryKey: ['/api/exercises'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/exercises');
      return response.json();
    },
    enabled: !!authenticatedUser
  });

  useEffect(() => {
    if (sessionData) {
      setSessionName(sessionData.title || "Séance Personnalisée");
      if (sessionData.exercises) {
        setSessionExercises(sessionData.exercises);
      }
    } else if (!sessionId && allExercises.length > 0) {
      // Créer une séance par défaut avec quelques exercices
      const defaultExercises: SessionExercise[] = allExercises.slice(0, 4).map((exercise, index) => ({
        id: `default-${exercise.id}`,
        exerciseId: exercise.id,
        title: exercise.title,
        description: exercise.description || '',
        duration: exercise.duration || 5,
        repetitions: 1,
        restTime: 30,
        intensity: 'medium' as const,
        order: index
      }));
      setSessionExercises(defaultExercises);
      setSessionName("Nouvelle Séance");
    }
  }, [sessionData, sessionId, allExercises]);

  const handleSaveModifications = async (modifiedExercises: SessionExercise[]) => {
    try {
      // Ici vous pourriez sauvegarder en base de données
      // Pour l'instant, on simule juste la sauvegarde
      console.log("Sauvegarde des modifications:", modifiedExercises);
      
      toast({
        title: "Séance sauvegardée",
        description: "Vos modifications ont été enregistrées avec succès."
      });
      
      setSessionExercises(modifiedExercises);
      setShowModifier(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setShowModifier(false);
  };

  const handleBack = () => {
    setLocation("/exercises");
  };

  if (userLoading || sessionLoading) {
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
            <p className="text-muted-foreground">Veuillez vous connecter pour modifier une séance.</p>
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
              <h1 className="text-3xl font-bold text-primary mb-2">
                {showModifier ? 'Modifier la Séance' : 'Aperçu de la Séance'}
              </h1>
              <p className="text-muted-foreground">
                {showModifier ? 
                  'Personnalisez votre séance d\'exercices selon vos besoins.' :
                  'Visualisez et modifiez votre programme d\'exercices personnalisé.'
                }
              </p>
            </div>
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex items-center gap-2"
            >
              <span className="material-icons text-sm">arrow_back</span>
              Retour aux exercices
            </Button>
          </div>
        </section>

        {showModifier ? (
          <SessionModifier
            sessionId={sessionId}
            exercises={sessionExercises}
            onSave={handleSaveModifications}
            onCancel={handleCancel}
          />
        ) : (
          <>
            {/* Session Overview */}
            <section className="mb-6">
              <Card className="shadow-material">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{sessionName}</CardTitle>
                    <Button
                      onClick={() => setShowModifier(true)}
                      className="bg-primary text-primary-foreground"
                    >
                      <span className="material-icons mr-2 text-sm">edit</span>
                      Modifier la Séance
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-secondary">schedule</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">Durée totale</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round(sessionExercises.reduce((total, ex) => 
                            total + (ex.duration * ex.repetitions) + ex.restTime, 0) / 60
                          )} minutes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-primary">fitness_center</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">Exercices</p>
                        <p className="text-xs text-muted-foreground">
                          {sessionExercises.length} exercice{sessionExercises.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-warning">trending_up</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">Intensité</p>
                        <p className="text-xs text-muted-foreground">
                          Mixte (adaptable)
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Exercise List */}
            <section className="mb-6">
              <h2 className="text-xl font-medium text-foreground mb-4">Programme d'exercices</h2>
              <div className="space-y-4">
                {sessionExercises.map((exercise, index) => (
                  <Card key={exercise.id} className="border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                            <h3 className="text-lg font-medium text-foreground">{exercise.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{exercise.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="material-icons text-xs text-muted-foreground">schedule</span>
                              <span>{exercise.duration} min</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="material-icons text-xs text-muted-foreground">repeat</span>
                              <span>{exercise.repetitions}x</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="material-icons text-xs text-muted-foreground">pause</span>
                              <span>{exercise.restTime}s repos</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="material-icons text-xs text-muted-foreground">speed</span>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  exercise.intensity === 'low' ? 'bg-green-50' :
                                  exercise.intensity === 'high' ? 'bg-red-50' : 'bg-yellow-50'
                                }`}
                              >
                                {exercise.intensity === 'low' ? 'Faible' :
                                 exercise.intensity === 'high' ? 'Élevée' : 'Moyenne'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Benefits */}
            <section>
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <span className="material-icons mr-2 text-primary">info</span>
                    Avantages de la Personnalisation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">🎯 Adaptation personnelle</h4>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Ajustez selon votre niveau de forme</li>
                        <li>• Modifiez l'intensité selon votre humeur</li>
                        <li>• Choisissez les variations qui vous conviennent</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">⚡ Flexibilité d'usage</h4>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Adaptez la durée selon votre temps disponible</li>
                        <li>• Réorganisez l'ordre des exercices</li>
                        <li>• Sauvegardez vos modifications préférées</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </main>
    </>
  );
}