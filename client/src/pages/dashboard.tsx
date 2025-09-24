import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Navigation } from "@/components/navigation";
import { CravingEntry } from "@/components/craving-entry";
import { BeckColumn } from "@/components/beck-column";
import { StrategiesBox } from "@/components/strategies-box";
import { GamificationProgress } from "@/components/gamification-progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuthQuery } from "@/hooks/use-auth";
import { useDashboardAutoRefresh } from "@/hooks/useAutoRefresh";
import { apiRequest } from "@/lib/queryClient";
import { getEmergencyExercises } from "@/lib/exercises-data";
import type { User, UserStats, ExerciseSession, AntiCravingStrategy } from "@shared/schema";

interface CravingStats {
  average: number;
  trend: number;
}

export default function Dashboard() {
  const [showEmergencyStrategies, setShowEmergencyStrategies] = useState(false);
  const { toast } = useToast();
  
  // Récupérer l'utilisateur authentifié
  const { data: authenticatedUser, isLoading } = useAuthQuery();

  // Actualisation automatique des données du dashboard
  useDashboardAutoRefresh(!!authenticatedUser);

  const { data: dashboardStats } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Failed to fetch dashboard stats");
      return response.json();
    },
    enabled: !!authenticatedUser,
    initialData: { 
      exercisesCompleted: 0, 
      totalDuration: 0, 
      currentStreak: 0, 
      longestStreak: 0, 
      averageCraving: 0, 
      todayCravingLevel: 0,
      todayCravingCount: 0,
      cravingTrend: 0,
      weeklyProgress: {
        exercisesCompleted: 0,
        beckAnalysesCompleted: 0,
        strategiesUsed: 0,
        totalActivities: 0
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes pour les stats
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true, // Actualiser quand l'utilisateur revient sur la page
    refetchInterval: 5 * 60 * 1000, // Actualiser automatiquement toutes les 5 minutes
  });

  const { data: exerciseSessions } = useQuery<any[]>({
    queryKey: ["exercise-sessions"],
    queryFn: async () => {
      const response = await fetch("/api/exercise-sessions/detailed?limit=5", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Failed to fetch exercise sessions");
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!authenticatedUser,
    initialData: [],
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: antiCravingStrategies } = useQuery<AntiCravingStrategy[]>({
    queryKey: ["/api/strategies"],
    queryFn: async () => {
      const response = await fetch("/api/strategies", {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch strategies: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!authenticatedUser,
    initialData: [],
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Pas besoin de requête séparée pour user, nous avons déjà authenticatedUser
  const user = authenticatedUser;

  const startEmergencyRoutine = () => {
    const emergencyExercises = getEmergencyExercises();
    if (emergencyExercises.length > 0) {
      // Navigate to the first emergency exercise
      window.location.href = `/exercise/${emergencyExercises[0].id}`;
    }
  };

  const todayCravingLevel = dashboardStats?.todayCravingLevel || 0;
  const cravingTrend = dashboardStats?.cravingTrend || 0;
  const exercisesCompleted = dashboardStats?.weeklyProgress?.totalActivities || 0;
  const userLevel = 1; // Par défaut niveau 1, peut être étendu avec la gamification

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        {/* Hero Section - Page d'accueil améliorée */}
        <section className="text-center mb-8 py-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Bienvenue dans Apaddicto
            </h1>
            {user && (
              <div className="mt-4 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
                <p className="text-xl font-medium text-foreground">Bonjour {user.firstName || 'Champion'} ! 👋</p>
                <p className="text-muted-foreground mt-2">Prêt(e) à continuer votre parcours de rétablissement ?</p>
              </div>
            )}
          </div>
        </section>
        
        {/* Dashboard Overview Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Today's Craving Level */}
          <Card className="shadow-material" data-testid="card-craving-level">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-foreground">Niveau de Craving Aujourd'hui</h3>
                <span className="material-icons text-primary">trending_down</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-foreground" data-testid="text-today-craving">
                    {todayCravingLevel > 0 ? Number(todayCravingLevel).toFixed(1) : '0.0'}
                  </span>
                  <span className="text-sm text-muted-foreground">/10</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full craving-slider rounded-full transition-all duration-300" 
                    style={{ width: `${(todayCravingLevel / 10) * 100}%` }}
                    data-testid="progress-craving-level"
                  ></div>
                </div>
                <p className={`text-sm font-medium ${cravingTrend < 0 ? 'text-success' : cravingTrend > 0 ? 'text-warning' : 'text-muted-foreground'}`}>
                  {cravingTrend === 0 ? 
                    (dashboardStats?.todayCravingCount > 0 ? 'Stable par rapport à hier' : 'Aucune donnée aujourd\'hui') : 
                    `${cravingTrend < 0 ? '↓' : '↑'} ${Math.abs(Number(cravingTrend)).toFixed(1)}% depuis hier`
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Progress */}
          <Card className="shadow-material" data-testid="card-weekly-progress">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-foreground">Progrès Cette Semaine</h3>
                <span className="material-icons text-secondary">bar_chart</span>
              </div>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary" data-testid="text-exercises-completed">
                    {exercisesCompleted}
                  </div>
                  <div className="text-sm text-muted-foreground">activités cette semaine</div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                  <span className="px-2 py-1 bg-secondary/10 rounded-full">
                    💪 {dashboardStats?.weeklyProgress?.exercisesCompleted || 0} exercices
                  </span>
                  <span className="px-2 py-1 bg-primary/10 rounded-full">
                    🧠 {dashboardStats?.weeklyProgress?.beckAnalysesCompleted || 0} analyses
                  </span>
                  <span className="px-2 py-1 bg-warning/10 rounded-full">
                    🎯 {dashboardStats?.weeklyProgress?.strategiesUsed || 0} stratégies
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Action */}
          <Card className="bg-gradient-to-br from-destructive to-red-600 shadow-material text-destructive-foreground" data-testid="card-emergency">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Routine d'Urgence</h3>
                <span className="material-icons">emergency</span>
              </div>
              <p className="text-sm mb-4 opacity-90">Ressens-tu un craving intense maintenant?</p>
              <div className="space-y-2">
                <Button 
                  onClick={startEmergencyRoutine}
                  className="w-full bg-white text-destructive font-medium hover:bg-gray-50"
                  data-testid="button-emergency-routine"
                >
                  Démarrer Routine 3 min
                </Button>
                <Button 
                  onClick={() => setShowEmergencyStrategies(!showEmergencyStrategies)}
                  variant="outline"
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                  data-testid="button-show-strategies"
                >
                  {showEmergencyStrategies ? "Masquer" : "Voir Mes Stratégies"} 
                  {antiCravingStrategies && antiCravingStrategies.length > 0 && 
                    ` (${antiCravingStrategies.length})`
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-material" data-testid="card-quick-craving">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="material-icons mr-2 text-primary">psychology</span>
                Enregistrement Rapide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Comment vous sentez-vous maintenant ?
              </p>
              <Button 
                onClick={() => window.location.href = "/craving-entry"}
                className="w-full"
                data-testid="button-toggle-craving"
              >
                Saisir un Craving
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-material" data-testid="card-quick-beck">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="material-icons mr-2 text-secondary">psychology</span>
                Analyse Cognitive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Analysez une situation difficile
              </p>
              <Button 
                onClick={() => window.location.href = "/beck-analysis"}
                variant="secondary"
                className="w-full"
                data-testid="button-toggle-beck"
              >
                Démarrer Analyse Beck
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-material" data-testid="card-quick-strategies">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="material-icons mr-2 text-warning">fitness_center</span>
                Boîte à Stratégies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Testez et évaluez vos stratégies anti-craving
              </p>
              <Button 
                onClick={() => window.location.href = "/strategies"}
                variant="outline"
                className="w-full"
                data-testid="button-toggle-strategies"
              >
                Ouvrir Boîte à Stratégies
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Emergency Strategies Display */}
        {showEmergencyStrategies && (
          <section className="mb-8">
            <Card className="shadow-material border-destructive/20" data-testid="card-emergency-strategies">
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <span className="material-icons mr-2">psychology</span>
                  Vos Stratégies Anti-Craving Éprouvées
                </CardTitle>
              </CardHeader>
              <CardContent>
                {antiCravingStrategies && antiCravingStrategies.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {antiCravingStrategies
                      .filter(strategy => strategy.cravingBefore > strategy.cravingAfter) // Strategies that worked
                      .sort((a, b) => (b.cravingBefore - b.cravingAfter) - (a.cravingBefore - a.cravingAfter)) // Sort by effectiveness
                      .slice(0, 6) // Show top 6 most effective strategies
                      .map((strategy) => (
                        <Card key={strategy.id} className="border-success/20 bg-success/5">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-xs font-medium text-muted-foreground capitalize">
                                {strategy.context === 'leisure' ? 'Loisirs' : 
                                 strategy.context === 'home' ? 'Domicile' : 'Travail'}
                              </span>
                              <div className="flex items-center text-xs text-success">
                                <span className="material-icons text-sm mr-1">trending_down</span>
                                -{strategy.cravingBefore - strategy.cravingAfter}
                              </div>
                            </div>
                            <p className="text-sm font-medium text-foreground mb-2">{strategy.exercise}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{strategy.duration} min • {strategy.effort}</span>
                              <span>{strategy.cravingBefore}/10 → {strategy.cravingAfter}/10</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    {antiCravingStrategies.filter(s => s.cravingBefore > s.cravingAfter).length === 0 && (
                      <div className="col-span-full text-center py-6 text-muted-foreground">
                        <span className="material-icons text-4xl mb-2">psychology</span>
                        <p>Aucune stratégie efficace identifiée pour l'instant</p>
                        <p className="text-xs">Continuez à tester des stratégies pour construire votre boîte à outils</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <span className="material-icons text-6xl mb-4">psychology</span>
                    <h3 className="text-lg font-medium mb-2">Aucune stratégie enregistrée</h3>
                    <p className="text-sm mb-4">Utilisez la Boîte à Stratégies pour commencer à tester vos techniques.</p>
                    <Button 
                      onClick={() => window.location.href = "/strategies"}
                      size="sm"
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Tester vos Stratégies
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}



        {/* Quick Access to Exercises */}
        <section className="mb-8">
          <Card className="shadow-material" data-testid="card-exercise-shortcuts">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="material-icons mr-2 text-primary">fitness_center</span>
                  Exercices Recommandés
                </div>
                <Link to="/exercises" className="text-primary hover:text-primary/80 font-medium text-sm">
                  Voir tout
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/exercises?category=craving" className="w-full">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 w-full" data-testid="button-craving-exercises">
                    <span className="material-icons text-destructive">emergency</span>
                    <div className="text-center">
                      <div className="font-medium">Réduction Craving</div>
                      <div className="text-xs text-muted-foreground">Exercices ciblés</div>
                    </div>
                  </Button>
                </Link>
                
                <Link to="/relaxation-exercises" className="w-full">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 w-full" data-testid="button-breathing-exercises">
                    <span className="material-icons text-secondary">air</span>
                    <div className="text-center">
                      <div className="font-medium">Respiration Interactive</div>
                      <div className="text-xs text-muted-foreground">Techniques guidées</div>
                    </div>
                  </Button>
                </Link>
                
                <Link to="/relaxation-exercises" className="w-full">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 w-full" data-testid="button-relaxation-exercises">
                    <span className="material-icons text-primary">self_improvement</span>
                    <div className="text-center">
                      <div className="font-medium">Relaxation Interactive</div>
                      <div className="text-xs text-muted-foreground">Détente profonde</div>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>



        {/* Recent Activities Section */}
        {exerciseSessions && exerciseSessions.length > 0 && (
          <section className="mb-8">
            <Card className="shadow-material">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="material-icons mr-2 text-secondary">history</span>
                  Dernières Activités
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exerciseSessions.slice(0, 3).map((session: any) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-secondary/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="material-icons text-secondary">fitness_center</span>
                        <div>
                          <div className="font-medium">{session.exerciseTitle || 'Exercice'}</div>
                          <div className="text-xs text-muted-foreground">
                            {session.duration ? `${Math.round(session.duration / 60)} minutes` : ''}
                            {session.cravingBefore !== null && session.cravingAfter !== null && 
                              ` • Craving: ${session.cravingBefore} → ${session.cravingAfter}`
                            }
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(session.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Gamification Progress */}
        {authenticatedUser && <GamificationProgress userId={authenticatedUser.id} />}
      </main>

      {/* Floating Emergency Button */}
      <Button
        onClick={startEmergencyRoutine}
        className="fab bg-destructive text-destructive-foreground w-14 h-14 rounded-full shadow-material-lg hover:shadow-xl transition-all"
        data-testid="button-fab-emergency"
      >
        <span className="material-icons">emergency</span>
      </Button>
    </>
  );
}
