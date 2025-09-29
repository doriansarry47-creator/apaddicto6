import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuthQuery } from "@/hooks/use-auth";
import { useTrackingAutoRefresh } from "@/hooks/useAutoRefresh";
import type { CravingEntry, ExerciseSession, BeckAnalysis, UserStats, AntiCravingStrategy } from "@shared/schema";

interface CravingStats {
  average: number;
  trend: number;
}

export default function Tracking() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const queryClient = useQueryClient();
  
  // Récupérer l'utilisateur authentifié
  const { data: authenticatedUser, isLoading: userLoading, error: userError } = useAuthQuery();

  // Actualisation automatique des données de suivi
  useTrackingAutoRefresh(!!authenticatedUser && !userLoading);

  // Fonction pour rafraîchir toutes les données avec gestion d'erreur améliorée
  const refreshAllData = useCallback(async () => {
    if (isRefreshing) return; // Éviter les appels multiples
    
    setIsRefreshing(true);
    try {
      // Invalider et refetch immédiatement pour une synchronisation complète
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/cravings"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/exercise-sessions"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/beck-analyses"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/strategies"] }),
        queryClient.refetchQueries({ queryKey: ["/api/cravings"] }),
        queryClient.refetchQueries({ queryKey: ["/api/strategies"] }),
        queryClient.refetchQueries({ queryKey: ["/api/exercise-sessions"] }),
      ]);
      
      console.log('✅ Toutes les données ont été actualisées avec succès');
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des données:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, queryClient]);

  // Initialisation unique au premier chargement
  useEffect(() => {
    if (authenticatedUser && !hasInitialized) {
      setHasInitialized(true);
      // Déclencher un rafraîchissement initial si les données ne sont pas encore chargées
      refreshAllData();
    }
  }, [authenticatedUser, hasInitialized]);

  const { data: cravingEntries, isLoading: cravingLoading, error: cravingError } = useQuery<CravingEntry[]>({
    queryKey: ["/api/cravings"],
    queryFn: async () => {
      const response = await fetch("/api/cravings?limit=50", {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Erreur API cravings: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!authenticatedUser && !userLoading && !userError,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    onError: (err) => console.error("Erreur de chargement des cravings:", err)
  });

  const { data: cravingStats, isLoading: statsLoading } = useQuery<CravingStats>({
    queryKey: ["/api/dashboard/stats", "cravings"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats", {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard stats: ${response.status}`);
      }
      const data = await response.json();
      return {
        average: data.avgCravingIntensity || 0,
        trend: 0
      };
    },
    enabled: !!authenticatedUser && !userLoading && !userError,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000,
    onError: (err) => console.error("Erreur de chargement des statistiques de craving:", err)
  });

  const { data: exerciseSessions, isLoading: sessionsLoading, error: sessionsError } = useQuery<ExerciseSession[]>({
    queryKey: ["/api/exercise-sessions"],
    queryFn: async () => {
      const response = await fetch("/api/exercise-sessions?limit=30", {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Erreur API exercise-sessions: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!authenticatedUser && !userLoading && !userError,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    onError: (err) => console.error("Erreur de chargement des sessions d'exercices:", err)
  });

  const { data: userStats, isLoading: userStatsLoading } = useQuery<UserStats>({
    queryKey: ["/api/dashboard/stats", "userStats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats", {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch user stats: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!authenticatedUser && !userLoading && !userError,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000,
    onError: (err) => console.error("Erreur de chargement des statistiques utilisateur:", err)
  });

  const { data: beckAnalyses, isLoading: beckLoading, error: beckError } = useQuery<BeckAnalysis[]>({
    queryKey: ["/api/beck-analyses"],
    queryFn: async () => {
      const response = await fetch("/api/beck-analyses?limit=20", {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Erreur API beck-analyses: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!authenticatedUser && !userLoading && !userError,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    onError: (err) => console.error("Erreur de chargement des analyses Beck:", err)
  });

  const { data: antiCravingStrategies, isLoading: strategiesLoading, error: strategiesError } = useQuery<AntiCravingStrategy[]>({
    queryKey: ["/api/strategies"],
    queryFn: async () => {
      const response = await fetch("/api/strategies", {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Erreur API strategies: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!authenticatedUser && !userLoading && !userError,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    onError: (err) => console.error("Erreur de chargement des stratégies anti-craving:", err)
  });

  const isLoading = userLoading || (cravingLoading && !cravingEntries) || (statsLoading && !cravingStats) || 
                    (sessionsLoading && !exerciseSessions) || (userStatsLoading && !userStats) || 
                    (beckLoading && !beckAnalyses) || (strategiesLoading && !antiCravingStrategies);

  // Gestion des erreurs critiques
  if (userError) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-bold text-destructive mb-4">Erreur d'authentification</h2>
            <p className="text-muted-foreground">Veuillez vous reconnecter pour accéder à vos données.</p>
          </div>
        </main>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="space-y-6">
            <div className="h-8 bg-muted rounded w-1/3 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </>
    );
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTriggerColor = (trigger: string) => {
    const colors = {
      'Stress': 'bg-red-100 text-red-800',
      'Ennui': 'bg-yellow-100 text-yellow-800',
      'Solitude': 'bg-blue-100 text-blue-800',
      'Conflit': 'bg-purple-100 text-purple-800',
      'Fatigue': 'bg-gray-100 text-gray-800',
      'Frustration': 'bg-orange-100 text-orange-800'
    };
    return colors[trigger as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Valeurs par défaut sûres avec vérification des données
  const averageCraving = cravingStats?.average ?? 0;
  const cravingTrend = cravingStats?.trend ?? 0;
  const totalExercises = userStats?.exercisesCompleted ?? 0;
  const totalDuration = userStats?.totalDuration ?? 0;
  
  // Assurer que les arrays existent avec des valeurs par défaut
  const safeCravingEntries = cravingEntries ?? [];
  const safeExerciseSessions = exerciseSessions ?? [];
  const safeBeckAnalyses = beckAnalyses ?? [];
  const safeAntiCravingStrategies = antiCravingStrategies ?? [];

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        
        {/* Page Header */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-foreground">Suivi de Votre Progression</h1>
            <Button 
              onClick={refreshAllData}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <span className={`material-icons text-sm ${isRefreshing ? 'animate-spin' : ''}`}>
                {isRefreshing ? 'hourglass_empty' : 'refresh'}
              </span>
              {isRefreshing ? 'Actualisation...' : 'Actualiser'}
            </Button>
          </div>
          <p className="text-muted-foreground">
            Analysez votre évolution et identifiez les patterns qui vous aident.
          </p>
        </section>

        {/* Key Statistics */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-material" data-testid="card-avg-craving">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Craving Moyen</span>
                <span className="material-icons text-primary">psychology</span>
              </div>
              <div className="text-2xl font-bold text-foreground" data-testid="text-avg-craving">
                        {Number(averageCraving).toFixed(1)}/10
              </div>
              <div className="w-full mt-2">
                <Progress value={(averageCraving / 10) * 100} className="h-2" />
              </div>
              <p className={`text-xs mt-2 ${cravingTrend < 0 ? 'text-success' : 'text-warning'}`}>
                {cravingTrend < 0 ? '↓' : '↑'} {Math.abs(cravingTrend).toFixed(1)}% ce mois
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-material" data-testid="card-total-exercises">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Exercices Complétés</span>
                <span className="material-icons text-secondary">fitness_center</span>
              </div>
              <div className="text-2xl font-bold text-foreground" data-testid="text-total-exercises">
                {totalExercises}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(totalDuration / 60)} minutes au total
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-material" data-testid="card-current-streak">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Série Actuelle</span>
                <span className="material-icons text-warning">local_fire_department</span>
              </div>
              <div className="text-2xl font-bold text-foreground" data-testid="text-current-streak">
                {userStats?.currentStreak || 0}
              </div>
              <p className="text-xs text-muted-foreground">jours consécutifs</p>
            </CardContent>
          </Card>

          <Card className="shadow-material" data-testid="card-best-streak">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Meilleure Série</span>
                <span className="material-icons text-destructive">emoji_events</span>
              </div>
              <div className="text-2xl font-bold text-foreground" data-testid="text-best-streak">
                {userStats?.longestStreak || 0}
              </div>
              <p className="text-xs text-muted-foreground">record personnel</p>
            </CardContent>
          </Card>
        </section>

        {/* Summary Dashboard */}
        <section className="mb-8">
          <Card className="shadow-material">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="material-icons mr-2 text-primary">dashboard</span>
                Tableau de Bord - Résumé de Vos Activités
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-2">{safeCravingEntries.length}</div>
                  <div className="text-sm text-muted-foreground">Cravings Enregistrés</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Dernière entrée: {safeCravingEntries.length > 0 ? formatDate(safeCravingEntries[0].createdAt) : 'Aucune'}
                  </div>
                </div>
                <div className="text-center p-4 bg-secondary/10 rounded-lg">
                  <div className="text-2xl font-bold text-secondary mb-2">{userStats?.beckAnalysesCompleted || safeBeckAnalyses.length}</div>
                  <div className="text-sm text-muted-foreground">Analyses Beck</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Dernière analyse: {safeBeckAnalyses.length > 0 ? formatDate(safeBeckAnalyses[0].createdAt) : 'Aucune'}
                  </div>
                </div>
                <div className="text-center p-4 bg-warning/10 rounded-lg">
                  <div className="text-2xl font-bold text-warning mb-2">{safeAntiCravingStrategies.length}</div>
                  <div className="text-sm text-muted-foreground">Stratégies Testées</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {safeAntiCravingStrategies.length > 0 ? (() => {
                      const avg = safeAntiCravingStrategies.reduce((sum, s) => sum + (s.cravingBefore - s.cravingAfter), 0) / safeAntiCravingStrategies.length;
                      return `Efficacité moyenne: ${avg > 0 ? '+' : ''}${avg.toFixed(1)} points`;
                    })() : 'Aucune donnée'} 
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Detailed Tracking */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5" data-testid="tabs-tracking">
            <TabsTrigger value="overview" data-testid="tab-overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="cravings" data-testid="tab-cravings">Cravings</TabsTrigger>
            <TabsTrigger value="exercises" data-testid="tab-exercises">Exercices</TabsTrigger>
            <TabsTrigger value="analyses" data-testid="tab-analyses">Analyses</TabsTrigger>
            <TabsTrigger 
              value="strategies" 
              data-testid="tab-strategies"
            >
              Stratégies
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-material">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="material-icons mr-2 text-primary">history</span>
                    Activités Récentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {safeCravingEntries.length === 0 && safeExerciseSessions.length === 0 && safeBeckAnalyses.length === 0 && safeAntiCravingStrategies.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <span className="material-icons text-6xl mb-4">info</span>
                      <h3 className="text-lg font-medium mb-2">Aucune activité enregistrée</h3>
                      <p className="text-sm">Commencez à utiliser l'application pour voir votre historique ici.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[...safeCravingEntries, ...safeExerciseSessions, ...safeBeckAnalyses, ...safeAntiCravingStrategies]
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 5)
                        .map((activity, index) => (
                          <div key={index} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                            {('intensity' in activity) ? (
                              <span className="material-icons text-primary">psychology</span>
                            ) : ('exerciseTitle' in activity) ? (
                              <span className="material-icons text-secondary">fitness_center</span>
                            ) : ('situation' in activity) ? (
                              <span className="material-icons text-warning">psychology</span>
                            ) : (
                              <span className="material-icons text-info">fitness_center</span>
                            )}
                            <div className="flex-grow">
                              <p className="text-sm font-medium">
                                {('intensity' in activity) ? (
                                  `Craving enregistré (niveau ${activity.intensity})`
                                ) : ('exerciseTitle' in activity) ? (
                                  `Exercice ${activity.exerciseTitle || activity.exerciseId} complété`
                                ) : ('situation' in activity) ? (
                                  `Analyse cognitive`
                                ) : (
                                  `Stratégie testée`
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(activity.createdAt)}
                              </p>
                            </div>
                            {('cravingBefore' in activity && 'cravingAfter' in activity && activity.cravingBefore > activity.cravingAfter) && (
                              <Badge className="bg-success text-success-foreground">
                                -{activity.cravingBefore - activity.cravingAfter}
                              </Badge>
                            )}
                            {('cravingBefore' in activity && 'cravingAfter' in activity && activity.cravingBefore < activity.cravingAfter) && (
                              <Badge variant="destructive">
                                +{activity.cravingAfter - activity.cravingBefore}
                              </Badge>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-material">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="material-icons mr-2 text-success">trending_down</span>
                    Évolution des Cravings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {safeCravingEntries.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Changement moyen (5 dernières entrées)</div>
                        <div className="text-lg font-bold text-success">
                          {(() => {
                            const recent = safeCravingEntries.slice(0, 5);
                            if (recent.length < 2) return 'N/A';
                            const first = recent[recent.length - 1].intensity;
                            const last = recent[0].intensity;
                            const change = last - first;
                            return `${change > 0 ? '+' : ''}${change.toFixed(1)} points`;
                          })()}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Dernières entrées (moyenne)</div>
                        <div className="text-lg font-bold">
                          <span className="font-medium">
                            {(() => {
                              const recent = safeCravingEntries.slice(0, 5);
                              return recent.length > 0 ? (recent.reduce((sum, e) => sum + e.intensity, 0) / recent.length).toFixed(1) : '0.0';
                            })()} / 10
                          </span>
                        </div>
                        <Progress 
                          value={(() => {
                            const recent = safeCravingEntries.slice(0, 5);
                            return recent.length > 0 ? (recent.reduce((sum, e) => sum + e.intensity, 0) / recent.length / 10) * 100 : 0;
                          })()} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <span className="material-icons text-4xl mb-2">show_chart</span>
                      <p>Pas assez de données</p>
                      <p className="text-xs">Enregistrez plus de cravings pour voir votre évolution</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cravings Tab */}
          <TabsContent value="cravings" className="space-y-6">
            <Card className="shadow-material" data-testid="card-craving-history">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="material-icons mr-2 text-primary">timeline</span>
                  Historique des Cravings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {safeCravingEntries.length > 0 ? (
                  <div className="space-y-4">
                    {safeCravingEntries.map((entry: CravingEntry) => (
                      <div key={entry.id} className="border border-border rounded-lg p-4" data-testid={`craving-entry-${entry.id}`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(entry.createdAt)}
                          </span>
                          <div className="flex items-center">
                            <span className="text-sm font-medium mr-2">Intensité:</span>
                            <Badge variant={entry.intensity > 6 ? "destructive" : entry.intensity > 3 ? "secondary" : "default"}>
                              {entry.intensity}/10
                            </Badge>
                          </div>
                        </div>
                        
                        {entry.triggers && entry.triggers.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs font-medium text-muted-foreground">Déclencheurs:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {entry.triggers.map((trigger: string, index: number) => (
                                <Badge key={index} variant="outline" className={getTriggerColor(trigger)}>
                                  {trigger}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {entry.emotions && entry.emotions.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs font-medium text-muted-foreground">Émotions:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {entry.emotions.map((emotion: string, index: number) => (
                                <Badge key={index} variant="outline" className="bg-blue-100 text-blue-800">
                                  {emotion}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {entry.notes && (
                          <p className="text-sm text-foreground mt-2 italic">"{entry.notes}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8" data-testid="empty-cravings">
                    <span className="material-icons text-6xl text-muted-foreground mb-4">psychology</span>
                    <h3 className="text-lg font-medium text-foreground mb-2">Aucun craving enregistré</h3>
                    <p className="text-muted-foreground mb-4">Commencez à suivre vos cravings pour voir votre progression.</p>
                    <div className="bg-info/10 p-4 rounded-lg">
                      <p className="text-sm text-info font-medium mb-2">📊 Pourquoi enregistrer ?</p>
                      <p className="text-xs text-muted-foreground">
                        Le suivi de vos cravings vous aide à identifier les déclencheurs et à mesurer vos progrès au fil du temps.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exercises Tab */}
          <TabsContent value="exercises" className="space-y-6">
            <Card className="shadow-material" data-testid="card-exercise-history">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="material-icons mr-2 text-secondary">fitness_center</span>
                  Historique des Exercices
                </CardTitle>
              </CardHeader>
              <CardContent>
                {safeExerciseSessions.length > 0 ? (
                  <div className="space-y-4">
                    {safeExerciseSessions.map((session: ExerciseSession) => (
                      <div key={session.id} className="border border-border rounded-lg p-4" data-testid={`exercise-session-${session.id}`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(session.createdAt)}
                          </span>
                          <div className="flex items-center space-x-2">
                            {session.completed && (
                              <Badge className="bg-success text-success-foreground">
                                <span className="material-icons text-sm mr-1">check_circle</span>
                                Complété
                              </Badge>
                            )}
                            {session.duration && (
                              <Badge variant="outline">
                                {Math.round(session.duration / 60)} min
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm font-medium text-foreground mb-2">
                          <div className="flex items-center gap-2">
                            <span>Exercice:</span>
                            <span className="font-bold">{session.exerciseTitle || session.exerciseId}</span>
                            {session.exerciseCategory && (
                              <Badge variant="outline" className="text-xs">
                                {session.exerciseCategory}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {session.cravingBefore !== null && session.cravingAfter !== null && (
                          <div className="flex items-center space-x-4 text-sm">
                            <span>Craving avant: <strong>{session.cravingBefore}/10</strong></span>
                            <span className="material-icons text-primary">arrow_forward</span>
                            <span>Craving après: <strong>{session.cravingAfter}/10</strong></span>
                            {session.cravingBefore > session.cravingAfter && (
                              <Badge className="bg-success text-success-foreground">
                                -{session.cravingBefore - session.cravingAfter} points
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8" data-testid="empty-exercises">
                    <span className="material-icons text-6xl text-muted-foreground mb-4">fitness_center</span>
                    <h3 className="text-lg font-medium text-foreground mb-2">Aucun exercice complété</h3>
                    <p className="text-muted-foreground mb-4">Complétez des exercices pour voir votre historique.</p>
                    <div className="bg-info/10 p-4 rounded-lg">
                      <p className="text-sm text-info font-medium mb-2">💪 Les exercices :</p>
                      <p className="text-xs text-muted-foreground">
                        Les exercices thérapeutiques vous aident à développer de nouvelles habitudes et à gérer vos cravings de manière proactive.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Beck Analyses Tab */}
          <TabsContent value="analyses" className="space-y-6">
            <Card className="shadow-material" data-testid="card-beck-history">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="material-icons mr-2 text-primary">psychology</span>
                  Analyses Cognitives (Beck)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {safeBeckAnalyses.length > 0 ? (
                  <div className="space-y-6">
                    {safeBeckAnalyses.map((analysis: BeckAnalysis) => (
                      <div key={analysis.id} className="border border-border rounded-lg p-4" data-testid={`beck-analysis-${analysis.id}`}>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(analysis.createdAt)}
                          </span>
                          {analysis.emotionIntensity && analysis.newIntensity && (
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">Émotion:</span>
                              <Badge variant="outline">{analysis.emotionIntensity}/10</Badge>
                              <span className="material-icons text-sm text-primary">arrow_forward</span>
                              <Badge className="bg-secondary text-secondary-foreground">{analysis.newIntensity}/10</Badge>
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h4 className="font-medium text-foreground mb-1">Situation:</h4>
                            <p className="text-muted-foreground">{analysis.situation}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground mb-1">Pensées automatiques:</h4>
                            <p className="text-muted-foreground">{analysis.automaticThoughts}</p>
                          </div>
                          {analysis.rationalResponse && (
                            <div className="md:col-span-2">
                              <h4 className="font-medium text-foreground mb-1">Réponse rationnelle:</h4>
                              <p className="text-muted-foreground">{analysis.rationalResponse}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8" data-testid="empty-analyses">
                    <span className="material-icons text-6xl text-muted-foreground mb-4">psychology</span>
                    <h3 className="text-lg font-medium text-foreground mb-2">Aucune analyse cognitive</h3>
                    <p className="text-muted-foreground mb-4">Utilisez l'outil d'analyse Beck pour mieux comprendre vos pensées.</p>
                    <div className="bg-info/10 p-4 rounded-lg">
                      <p className="text-sm text-info font-medium mb-2">🧠 L'analyse de Beck :</p>
                      <p className="text-xs text-muted-foreground">
                        Cet outil vous aide à identifier et restructurer les pensées automatiques négatives qui peuvent déclencher vos cravings.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Strategies Tab */}
          <TabsContent value="strategies" className="space-y-6">
            <Card className="shadow-material" data-testid="card-strategies-history">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="material-icons mr-2 text-warning">fitness_center</span>
                  Historique des Stratégies Anti-Craving
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-muted-foreground">
                    {safeAntiCravingStrategies.length} stratégie(s) enregistrée(s)
                  </div>
                  <Button
                    onClick={() => window.location.href = "/strategies"}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    <span className="material-icons text-sm mr-1">add</span>
                    Ajouter
                  </Button>
                </div>
                {safeAntiCravingStrategies.length > 0 ? (
                  <div className="space-y-4">
                    {safeAntiCravingStrategies.map((strategy: AntiCravingStrategy) => (
                      <div key={strategy.id} className="border border-border rounded-lg p-4" data-testid={`strategy-${strategy.id}`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(strategy.createdAt)}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="capitalize">
                              {strategy.context === 'leisure' ? 'Loisirs' : 
                               strategy.context === 'home' ? 'Domicile' : 'Travail'}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {strategy.effort}
                            </Badge>
                            <Badge variant="outline">
                              {strategy.duration} min
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-sm font-medium text-foreground mb-2">
                          {strategy.exercise}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <span>Craving avant: <strong className={`${strategy.cravingBefore > 6 ? 'text-destructive' : strategy.cravingBefore > 3 ? 'text-warning' : 'text-success'}`}>{strategy.cravingBefore}/10</strong></span>
                          <span className="material-icons text-primary">arrow_forward</span>
                          <span>Craving après: <strong className={`${strategy.cravingAfter > 6 ? 'text-destructive' : strategy.cravingAfter > 3 ? 'text-warning' : 'text-success'}`}>{strategy.cravingAfter}/10</strong></span>
                          {strategy.cravingBefore > strategy.cravingAfter && (
                            <Badge className="bg-success text-success-foreground">
                              <span className="material-icons text-sm mr-1">trending_down</span>
                              -{strategy.cravingBefore - strategy.cravingAfter} points
                            </Badge>
                          )}
                          {strategy.cravingBefore === strategy.cravingAfter && (
                            <Badge variant="outline">
                              <span className="material-icons text-sm mr-1">remove</span>
                              Stable
                            </Badge>
                          )}
                          {strategy.cravingBefore < strategy.cravingAfter && (
                            <Badge variant="destructive">
                              <span className="material-icons text-sm mr-1">trending_up</span>
                              +{strategy.cravingAfter - strategy.cravingBefore} points
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8" data-testid="empty-strategies">
                    <span className="material-icons text-6xl text-muted-foreground mb-4">fitness_center</span>
                    <h3 className="text-lg font-medium text-foreground mb-2">Aucune stratégie enregistrée</h3>
                    <p className="text-muted-foreground mb-4">Utilisez la Boîte à Stratégies depuis l'accueil pour commencer à tester vos techniques anti-craving.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
                      <Button 
                        onClick={() => window.location.href = "/strategies"}
                        className="bg-warning text-warning-foreground hover:bg-warning/90"
                      >
                        <span className="material-icons mr-2">psychology</span>
                        Tester Mes Stratégies
                      </Button>
                      <Button 
                        onClick={refreshAllData}
                        variant="outline"
                        disabled={isRefreshing}
                      >
                        <span className={`material-icons mr-2 text-sm ${isRefreshing ? 'animate-spin' : ''}`}>
                          {isRefreshing ? 'hourglass_empty' : 'refresh'}
                        </span>
                        Actualiser
                      </Button>
                    </div>
                    <div className="bg-info/10 p-4 rounded-lg">
                      <p className="text-sm text-info font-medium mb-2">💡 Conseil :</p>
                      <p className="text-xs text-muted-foreground">
                        Testez différentes stratégies dans différents contextes (domicile, travail, loisirs) pour construire votre boîte à outils personnalisée.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}

