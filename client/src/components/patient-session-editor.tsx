import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Clock, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  sessions: PatientSessionWithDetails[];
}

interface PatientSessionWithDetails {
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

interface Session {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  status: 'draft' | 'published' | 'archived';
  totalDuration: number;
  tags: string[];
  createdAt: string;
}

interface PatientSessionEditorProps {
  patients: Patient[];
  sessions: Session[];
  onAssignSession: (sessionId: string, patientIds: string[]) => Promise<void>;
  onRefresh: () => void;
}

export function PatientSessionEditor({ 
  patients, 
  sessions, 
  onAssignSession, 
  onRefresh 
}: PatientSessionEditorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("assign");
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAssigning, setIsAssigning] = useState(false);

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

  // Séances publiées uniquement
  const publishedSessions = sessions.filter(session => session.status === 'published');

  const togglePatientSelection = (patientId: string) => {
    setSelectedPatients(prev => 
      prev.includes(patientId) 
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const selectAllPatients = () => {
    if (selectedPatients.length === filteredPatients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(filteredPatients.map(p => p.id));
    }
  };

  const handleAssignSession = async () => {
    if (!selectedSession) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une séance",
        variant: "destructive"
      });
      return;
    }

    if (selectedPatients.length === 0) {
      toast({
        title: "Erreur", 
        description: "Veuillez sélectionner au moins un patient",
        variant: "destructive"
      });
      return;
    }

    setIsAssigning(true);
    
    try {
      await onAssignSession(selectedSession, selectedPatients);
      
      toast({
        title: "Séance assignée",
        description: `Séance assignée à ${selectedPatients.length} patient(s) avec succès`
      });
      
      setSelectedSession("");
      setSelectedPatients([]);
      onRefresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'assignation de la séance",
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'done':
        return 'Terminée';
      case 'assigned':
        return 'Assignée';
      case 'skipped':
        return 'Ignorée';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'skipped':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Gestion des Assignations de Séances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="assign">Assigner des Séances</TabsTrigger>
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            </TabsList>

            <TabsContent value="assign" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sélection de la séance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sélectionner une Séance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Séance à assigner</Label>
                      <Select value={selectedSession} onValueChange={setSelectedSession}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir une séance publiée" />
                        </SelectTrigger>
                        <SelectContent>
                          {publishedSessions.map(session => (
                            <SelectItem key={session.id} value={session.id}>
                              <div className="flex flex-col">
                                <span>{session.title}</span>
                                <span className="text-xs text-muted-foreground">
                                  {session.category} • {Math.round(session.totalDuration / 60)}min
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedSession && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        {(() => {
                          const session = publishedSessions.find(s => s.id === selectedSession);
                          return session ? (
                            <div className="space-y-2">
                              <h4 className="font-medium">{session.title}</h4>
                              <p className="text-sm text-muted-foreground">{session.description}</p>
                              <div className="flex gap-2">
                                <Badge variant="outline">{session.category}</Badge>
                                <Badge variant="outline">{session.difficulty}</Badge>
                                <Badge variant="outline">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {Math.round(session.totalDuration / 60)}min
                                </Badge>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Sélection des patients */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      Sélectionner les Patients
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={selectAllPatients}
                      >
                        {selectedPatients.length === filteredPatients.length ? "Désélectionner tout" : "Sélectionner tout"}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Filtres */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Rechercher un patient..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous</SelectItem>
                          <SelectItem value="no_sessions">Sans séance</SelectItem>
                          <SelectItem value="assigned">Séances assignées</SelectItem>
                          <SelectItem value="done">Séances terminées</SelectItem>
                          <SelectItem value="skipped">Séances ignorées</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Liste des patients */}
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {filteredPatients.map(patient => (
                        <div
                          key={patient.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedPatients.includes(patient.id) 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:bg-muted/50'
                          }`}
                          onClick={() => togglePatientSelection(patient.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <Checkbox
                                checked={selectedPatients.includes(patient.id)}
                                onChange={() => togglePatientSelection(patient.id)}
                              />
                              <div>
                                <div className="font-medium">
                                  {patient.firstName} {patient.lastName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {patient.email}
                                </div>
                                <div className="flex gap-1 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {patient.sessions.length} séance(s)
                                  </Badge>
                                  {patient.sessions.length > 0 && (
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${getStatusColor(patient.sessions[0]?.status)}`}
                                    >
                                      Dernière: {getStatusLabel(patient.sessions[0]?.status)}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {filteredPatients.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Aucun patient trouvé</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-4">
                      <Button 
                        onClick={handleAssignSession}
                        disabled={isAssigning || !selectedSession || selectedPatients.length === 0}
                        className="w-full"
                      >
                        {isAssigning ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Assignment en cours...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Assigner à {selectedPatients.length} patient(s)
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">{patients.length}</div>
                    <div className="text-sm text-muted-foreground">Patients Total</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {patients.reduce((acc, p) => acc + p.sessions.filter(s => s.status === 'done').length, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Séances Terminées</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-orange-600">
                      {patients.reduce((acc, p) => acc + p.sessions.filter(s => s.status === 'assigned').length, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Séances En Cours</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Détail des Patients et Séances
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {patients.map(patient => (
                      <Card key={patient.id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{patient.firstName} {patient.lastName}</h4>
                            <p className="text-sm text-muted-foreground">{patient.email}</p>
                          </div>
                          <Badge variant="outline">
                            {patient.sessions.length} séance(s)
                          </Badge>
                        </div>
                        
                        {patient.sessions.length > 0 ? (
                          <div className="space-y-2">
                            {patient.sessions.slice(0, 3).map(session => (
                              <div key={session.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(session.status)}
                                  <span className="text-sm">{session.session.title}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge className={getStatusColor(session.status)}>
                                    {getStatusLabel(session.status)}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(session.assignedAt).toLocaleDateString()}
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
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}