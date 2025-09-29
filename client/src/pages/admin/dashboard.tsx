import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { Users, Activity, BookOpen, TrendingUp, AlertCircle, Calendar } from "lucide-react";

interface AdminStats {
  totalPatients: number;
  activePatients: number;
  totalExercises: number;
  totalSessions: number;
  totalCravings: number;
  totalContent: number;
  recentActivity: {
    newUsers: number;
    completedSessions: number;
    cravingEntries: number;
  };
}

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => apiRequest('/api/admin/stats') as Promise<AdminStats>,
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Tableau de Bord Administrateur</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble des statistiques et gestion de l'application
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))
        ) : stats ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Patients Totaux</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPatients}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activePatients} actifs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessions Complétées</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSessions}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalExercises} exercices disponibles
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contenu Éducatif</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalContent}</div>
                <p className="text-xs text-muted-foreground">
                  Articles et ressources
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entrées de Craving</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCravings}</div>
                <p className="text-xs text-muted-foreground">
                  Au total enregistrées
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="col-span-full text-center p-8 text-muted-foreground">
            Erreur lors du chargement des statistiques
          </div>
        )}
      </div>

      {/* Activité récente */}
      {stats && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Activité des 7 derniers jours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Nouveaux patients</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  +{stats.recentActivity.newUsers}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sessions complétées</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {stats.recentActivity.completedSessions}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cravings enregistrés</span>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  {stats.recentActivity.cravingEntries}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Menu de gestion */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="material-icons mr-2">edit_note</span>
              Gestion du Contenu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Créer, modifier et gérer les exercices et articles psycho-éducatifs.
            </p>
            <div className="flex flex-col space-y-2">
              <Link to="/admin/manage-exercises-sessions">
                <Button variant="outline" className="w-full">
                  <span className="material-icons mr-2">fitness_center</span>
                  Exercices & Séances
                </Button>
              </Link>
              <Link to="/admin/manage-content">
                <Button variant="outline" className="w-full">
                  <span className="material-icons mr-2">article</span>
                  Contenu Éducatif
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="material-icons mr-2">people</span>
              Gestion des Utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Voir les comptes patients, temps d'inactivité et gérer les suppressions.
            </p>
            <Link to="/admin/manage-users">
              <Button className="w-full">
                <span className="material-icons mr-2">manage_accounts</span>
                Gérer les Utilisateurs
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <span className="material-icons mr-2">description</span>
              Rapports Professionnels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Créer et gérer des rapports de progression pour vos patients.
            </p>
            <Link to="/admin/professional-reports">
              <Button className="w-full bg-primary">
                <span className="material-icons mr-2">assessment</span>
                Gérer les Rapports
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="material-icons mr-2">perm_media</span>
              Gestion des Médias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Ajouter des images et vidéos pour les exercices.
            </p>
            <Link to="/admin/manage-media">
              <Button variant="outline" className="w-full">
                <span className="material-icons mr-2">cloud_upload</span>
                Gérer les Médias
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="material-icons mr-2">bug_report</span>
              Debug & Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Diagnostiquer les problèmes de permissions et tester l'accès admin.
            </p>
            <Link to="/admin/debug">
              <Button variant="destructive" className="w-full">
                <span className="material-icons mr-2">settings</span>
                Debug Admin
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
