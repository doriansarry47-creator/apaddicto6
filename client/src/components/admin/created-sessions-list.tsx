import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  Send, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  Archive, 
  Clock, 
  Target,
  Filter,
  Search,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getCategoryByValue, 
  getDifficultyByValue, 
  getProtocolByValue,
  SESSION_CATEGORIES 
} from "@shared/constants";

interface SessionExercise {
  id: string;
  exerciseId: string;
  title: string;
  duration: number;
  repetitions: number;
  sets: number;
  restTime: number;
  order: number;
}

interface CreatedSession {
  id: string;
  title: string;
  description: string;
  category: string;
  protocol: string;
  protocolConfig: any;
  totalDuration: number;
  difficulty: string;
  status: string;
  exercises: SessionExercise[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  assignedCount?: number; // nombre de patients assignés
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface CreatedSessionsListProps {
  sessions: CreatedSession[];
  patients: Patient[];
  onAssign: (sessionId: string, patientIds: string[]) => Promise<void>;
  onEdit: (sessionId: string) => void;
  onDelete: (sessionId: string) => Promise<void>;
  onDuplicate: (sessionId: string) => Promise<void>;
  onArchive: (sessionId: string) => Promise<void>;
  onRefresh: () => void;
}

export function CreatedSessionsList({
  sessions,
  patients,
  onAssign,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
  onRefresh
}: CreatedSessionsListProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [protocolFilter, setProtocolFilter] = useState("all");
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");

  // Filtrer les séances
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || session.category === categoryFilter;
    const matchesProtocol = protocolFilter === "all" || session.protocol === protocolFilter;
    
    return matchesSearch && matchesCategory && matchesProtocol;
  });

  // Filtrer les patients
  const filteredPatients = patients.filter(patient => {
    const searchTerm = patientSearch.toLowerCase();
    return (
      patient.firstName.toLowerCase().includes(searchTerm) ||
      patient.lastName.toLowerCase().includes(searchTerm) ||
      patient.email.toLowerCase().includes(searchTerm)
    );
  });

  const handleOpenAssignDialog = (sessionId: string) => {
    setSelectedSession(sessionId);
    setSelectedPatients([]);
    setPatientSearch("");
    setAssignDialogOpen(true);
  };

  const handleAssignSession = async () => {
    if (!selectedSession || selectedPatients.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un patient",
        variant: "destructive"
      });
      return;
    }

    setIsAssigning(true);
    try {
      await onAssign(selectedSession, selectedPatients);
      
      const session = sessions.find(s => s.id === selectedSession);
      const patientNames = selectedPatients.map(id => {
        const patient = patients.find(p => p.id === id);
        return patient ? `${patient.firstName} ${patient.lastName}` : '';
      }).filter(Boolean).join(', ');

      toast({
        title: "✅ Séance assignée avec succès",
        description: `"${session?.title}" assignée à ${patientNames}`,
      });

      setAssignDialogOpen(false);
      setSelectedSession(null);
      setSelectedPatients([]);
      onRefresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'assigner la séance",
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}min ${secs}s` : `${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* En-tête et filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une séance..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">Toutes catégories</option>
            {SESSION_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          
          <select
            value={protocolFilter}
            onChange={(e) => setProtocolFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">Tous protocoles</option>
            <option value="standard">Standard</option>
            <option value="hiit">HIIT</option>
            <option value="tabata">TABATA</option>
            <option value="hict">HICT</option>
            <option value="emom">EMOM</option>
            <option value="e2mom">E2MOM</option>
            <option value="amrap">AMRAP</option>
          </select>
        </div>
      </div>

      {/* Liste des séances */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSessions.map((session) => {
          const category = getCategoryByValue(session.category, SESSION_CATEGORIES);
          const difficulty = getDifficultyByValue(session.difficulty);
          const protocol = getProtocolByValue(session.protocol);

          return (
            <Card key={session.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{session.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {session.description}
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge className={category.color}>
                    {category.icon} {category.label}
                  </Badge>
                  <Badge className={protocol.color}>
                    {protocol.icon} {protocol.label}
                  </Badge>
                  <Badge className={difficulty.color}>
                    {difficulty.label}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Informations */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDuration(session.totalDuration || 0)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span>{session.exercises?.length || 0} exercices</span>
                  </div>
                  {session.assignedCount !== undefined && (
                    <div className="flex items-center gap-2 col-span-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{session.assignedCount} patient(s) assigné(s)</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {session.tags && session.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {session.tags.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {session.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{session.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    onClick={() => handleOpenAssignDialog(session.id)}
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Assigner
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(session.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDuplicate(session.id)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(session.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredSessions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucune séance trouvée</p>
        </div>
      )}

      {/* Dialog d'assignation */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assigner la séance à des patients</DialogTitle>
            <DialogDescription>
              Sélectionnez les patients qui recevront cette séance
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Recherche de patients */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Bouton Tout sélectionner */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllPatients}
              >
                {selectedPatients.length === filteredPatients.length ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Tout désélectionner
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Tout sélectionner
                  </>
                )}
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedPatients.length} patient(s) sélectionné(s)
              </span>
            </div>

            {/* Liste des patients */}
            <ScrollArea className="h-[300px] border rounded-lg p-4">
              {filteredPatients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun patient trouvé
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => togglePatientSelection(patient.id)}
                    >
                      <Checkbox
                        checked={selectedPatients.includes(patient.id)}
                        onCheckedChange={() => togglePatientSelection(patient.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {patient.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {selectedPatients.length === 0 && (
              <Alert>
                <AlertDescription>
                  Veuillez sélectionner au moins un patient pour assigner la séance
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
              disabled={isAssigning}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAssignSession}
              disabled={selectedPatients.length === 0 || isAssigning}
            >
              {isAssigning ? "Assignation..." : `Assigner à ${selectedPatients.length} patient(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
