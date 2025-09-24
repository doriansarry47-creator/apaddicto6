import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EducationalContentAdmin from "./educational-content-admin";
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Clock,
  Target,
  Activity,
  Search,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";

interface DashboardStats {
  totalPatients: number;
  totalSessions: number;
  totalExercises: number;
  completedSessions: number;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  sessions: PatientSession[];
}

interface PatientSession {
  id: string;
  sessionId: string;
  status: 'assigned' | 'done' | 'skipped';
  feedback?: string;
  effort?: number;
  duration?: number;
  assignedAt: string;
  completedAt?: string;
  session: {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    totalDuration: number;
    tags: string[];
  };
}

interface AdminDashboardProps {
  stats: DashboardStats;
  patients: Patient[];
  onRefresh: () => void;
}

export function AdminDashboard({ stats, patients, onRefresh }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calcul des statistiques dérivées
  const totalAssignedSessions = patients.reduce((acc, p) => acc + p.sessions.length, 0);
  const completedSessionsCount = patients.reduce((acc, p) => 
    acc + p.sessions.filter(s => s.status === 'done').length, 0
  );
  const pendingSessionsCount = patients.reduce((acc, p) => 
    acc + p.sessions.filter(s => s.status === 'assigned').length, 0
  );
  const skippedSessionsCount = patients.reduce((acc, p) => 
    acc + p.sessions.filter(s => s.status === 'skipped').length, 0
  );

  const completionRate = totalAssignedSessions > 0 
    ? Math.round((completedSessionsCount / totalAssignedSessions) * 100) 
    : 0;

  // Filtrage des patients
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (statusFilter === "all") return true;
    
    const hasStatus = patient.sessions.some(session => session.status === statusFilter);
    return statusFilter === "no_sessions" ? patient.sessions.length === 0 : hasStatus;
  });

  // Données pour les graphiques simplifiés
  const recentActivity = patients
    .flatMap(patient => 
      patient.sessions
        .filter(session => session.completedAt)
        .map(session => ({
          patientName: `${patient.firstName} ${patient.lastName}`,
          sessionTitle: session.session.title,
          completedAt: session.completedAt,
          status: session.status,
          effort: session.effort,
          duration: session.duration
        }))
    )
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 10);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'assigned':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case 'skipped':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'assigned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'skipped':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'done': return 'Terminée';
      case 'assigned': return 'En cours';
      case 'skipped': return 'Ignorée';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrateur</h1>
          <p className="text-muted-foreground">
            Suivi global des patients et de leurs séances
          </p>
        </div>
        <Button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="patients">Gestion des Patients</TabsTrigger>
          <TabsTrigger value="content">Contenus Éducatifs</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Patients Total</p>
                    <p className="text-2xl font-bold">{stats.totalPatients}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Séances Créées</p>
                    <p className="text-2xl font-bold">{stats.totalSessions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Exercices Disponibles</p>
                    <p className="text-2xl font-bold">{stats.totalExercises}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Taux de Réalisation</p>
                    <p className="text-2xl font-bold">{completionRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistiques des séances */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Séances Terminées</p>
                    <p className="text-3xl font-bold text-green-600">{completedSessionsCount}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Séances En Cours</p>
                    <p className="text-3xl font-bold text-blue-600">{pendingSessionsCount}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Séances Ignorées</p>
                    <p className="text-3xl font-bold text-red-600">{skippedSessionsCount}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activité récente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Activité Récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(activity.status)}
                        <div>
                          <p className="font-medium text-sm">{activity.patientName}</p>
                          <p className="text-xs text-muted-foreground">{activity.sessionTitle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          {activity.effort && (
                            <Badge variant="outline" className="text-xs">
                              Effort: {activity.effort}/10
                            </Badge>
                          )}
                          {activity.duration && (
                            <Badge variant="outline" className="text-xs">
                              {activity.duration}min
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.completedAt!).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Aucune activité récente
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-6">
          {/* Filtres */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un patient..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les patients</SelectItem>
                    <SelectItem value="no_sessions">Sans séance</SelectItem>
                    <SelectItem value="assigned">Séances en cours</SelectItem>
                    <SelectItem value="done">Séances terminées</SelectItem>
                    <SelectItem value="skipped">Séances ignorées</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Liste des patients */}
          <div className="space-y-4">
            {filteredPatients.map(patient => (
              <Card key={patient.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">{patient.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Inscrit le {new Date(patient.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-2">
                        {patient.sessions.length} séance(s)
                      </Badge>
                      {patient.sessions.length > 0 && (
                        <div className="flex gap-1">
                          <Badge className="text-xs bg-green-100 text-green-800 border-green-200">
                            {patient.sessions.filter(s => s.status === 'done').length} terminées
                          </Badge>
                          <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                            {patient.sessions.filter(s => s.status === 'assigned').length} en cours
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {patient.sessions.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Séances récentes:</h4>
                      {patient.sessions.slice(0, 3).map(session => (
                        <div key={session.id} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(session.status)}
                            <span className="text-sm">{session.session.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {session.session.category}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(session.status)}>
                              {getStatusLabel(session.status)}
                            </Badge>
                            {session.effort && (
                              <Badge variant="outline" className="text-xs">
                                Effort: {session.effort}/10
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(session.assignedAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      ))}
                      {patient.sessions.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center">
                          ... et {patient.sessions.length - 3} autre(s)
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Aucune séance assignée
                    </p>
                  )}

                  {/* Feedback récent */}
                  {patient.sessions.some(s => s.feedback) && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <h5 className="text-sm font-medium text-yellow-800 mb-1">Dernier feedback:</h5>
                      <p className="text-sm text-yellow-700">
                        "{patient.sessions.find(s => s.feedback)?.feedback}"
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {filteredPatients.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Aucun patient trouvé pour les critères sélectionnés
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Graphiques et analyses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Répartition des Statuts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                      <span className="text-sm">Terminées</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">{completedSessionsCount}</span>
                      <span className="text-xs text-muted-foreground">
                        ({totalAssignedSessions > 0 ? Math.round((completedSessionsCount / totalAssignedSessions) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                      <span className="text-sm">En cours</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">{pendingSessionsCount}</span>
                      <span className="text-xs text-muted-foreground">
                        ({totalAssignedSessions > 0 ? Math.round((pendingSessionsCount / totalAssignedSessions) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                      <span className="text-sm">Ignorées</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">{skippedSessionsCount}</span>
                      <span className="text-xs text-muted-foreground">
                        ({totalAssignedSessions > 0 ? Math.round((skippedSessionsCount / totalAssignedSessions) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Effort Moyen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    const effortData = patients.flatMap(p => 
                      p.sessions.filter(s => s.effort).map(s => s.effort!)
                    );
                    const averageEffort = effortData.length > 0 
                      ? (effortData.reduce((sum, effort) => sum + effort, 0) / effortData.length).toFixed(1)
                      : '0';
                    
                    return (
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{averageEffort}/10</div>
                        <p className="text-sm text-muted-foreground">
                          Effort moyen ressenti par les patients
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Basé sur {effortData.length} évaluation(s)
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conseils et recommandations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommandations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-sm mb-2">📈 Engagement</h4>
                  <p className="text-xs text-muted-foreground">
                    {completionRate >= 70 
                      ? "Excellent taux de réalisation ! Continuez ainsi."
                      : "Le taux de réalisation pourrait être amélioré. Considérez des séances plus courtes ou des rappels."
                    }
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-sm mb-2">👥 Patients Inactifs</h4>
                  <p className="text-xs text-muted-foreground">
                    {patients.filter(p => p.sessions.length === 0).length} patient(s) sans séance assignée.
                    {patients.filter(p => p.sessions.length === 0).length > 0 && " Pensez à leur assigner des exercices adaptés."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <EducationalContentAdmin />
        </TabsContent>
      </Tabs>
    </div>
  );
}