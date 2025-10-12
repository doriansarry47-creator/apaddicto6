import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar,
  Star,
  MessageSquare,
  Filter,
  Tag,
  Activity,
  Target,
  Timer,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  SESSION_CATEGORIES, 
  DIFFICULTY_LEVELS, 
  PATIENT_SESSION_STATUSES,
  getCategoryByValue,
  getDifficultyByValue,
  getStatusByValue
} from "@shared/constants";

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

interface PatientSessionsProps {
  sessions: PatientSession[];
  onCompleteSession: (sessionId: string, feedback: string, effort: number, duration: number) => Promise<void>;
  onSkipSession: (sessionId: string) => Promise<void>;
  onRefresh: () => void;
}

export function PatientSessions({ 
  sessions, 
  onCompleteSession, 
  onSkipSession, 
  onRefresh 
}: PatientSessionsProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("assigned");
  const [feedbackDialog, setFeedbackDialog] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [effort, setEffort] = useState([5]);
  const [duration, setDuration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagFilter, setTagFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Filtrer les séances par statut
  const assignedSessions = sessions.filter(s => s.status === 'assigned');
  const completedSessions = sessions.filter(s => s.status === 'done');
  const skippedSessions = sessions.filter(s => s.status === 'skipped');

  // Obtenir tous les tags et catégories uniques
  const allTags = [...new Set(sessions.flatMap(s => s.session.tags))];
  const allCategories = [...new Set(sessions.map(s => s.session.category))];

  // Filtrage par tags et catégories
  const filterSessions = (sessionsList: PatientSession[]) => {
    return sessionsList.filter(session => {
      const matchesTag = tagFilter === "all" || session.session.tags.includes(tagFilter);
      const matchesCategory = categoryFilter === "all" || session.session.category === categoryFilter;
      return matchesTag && matchesCategory;
    });
  };

  const handleCompleteSession = async () => {
    if (!feedbackDialog) return;
    
    const durationNum = duration ? parseInt(duration) : 0;
    
    if (durationNum <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez indiquer la durée de votre séance",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onCompleteSession(feedbackDialog, feedback, effort[0], durationNum);
      
      toast({
        title: "Séance terminée !",
        description: "Votre feedback a été enregistré avec succès"
      });
      
      // Reset form
      setFeedbackDialog(null);
      setFeedback("");
      setEffort([5]);
      setDuration("");
      onRefresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'enregistrement",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipSession = async (sessionId: string) => {
    try {
      await onSkipSession(sessionId);
      toast({
        title: "Séance ignorée",
        description: "La séance a été marquée comme ignorée"
      });
      onRefresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'action",
        variant: "destructive"
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    return getDifficultyByValue(difficulty).color;
  };

  const getCategoryIcon = (category: string) => {
    const categoryInfo = SESSION_CATEGORIES.find(cat => cat.value === category);
    return categoryInfo ? categoryInfo.icon : '📋';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'assigned':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'skipped':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const SessionCard = ({ session, showActions = false }: { session: PatientSession; showActions?: boolean }) => (
    <Card key={session.id} className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            {getStatusIcon(session.status)}
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{session.session.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{session.session.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={getDifficultyColor(session.session.difficulty)}>
                  {getDifficultyByValue(session.session.difficulty).label}
                </Badge>
                <Badge variant="outline">
                  {getCategoryIcon(session.session.category)} {session.session.category}
                </Badge>
                <Badge variant="outline">
                  <Timer className="h-3 w-3 mr-1" />
                  {Math.round(session.session.totalDuration / 60)}min
                </Badge>
              </div>

              {session.session.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {session.session.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {session.session.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{session.session.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right text-sm text-muted-foreground">
            <div className="flex items-center mb-1">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(session.assignedAt).toLocaleDateString('fr-FR')}
            </div>
            {session.completedAt && (
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Terminée le {new Date(session.completedAt).toLocaleDateString('fr-FR')}
              </div>
            )}
          </div>
        </div>

        {session.status === 'done' && (session.feedback || session.effort) && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
            <h4 className="font-medium text-green-800 text-sm mb-2">Votre retour d'expérience :</h4>
            {session.effort && (
              <div className="flex items-center mb-2">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm text-green-700">Effort ressenti : {session.effort}/10</span>
              </div>
            )}
            {session.duration && (
              <div className="flex items-center mb-2">
                <Clock className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-sm text-green-700">Durée réalisée : {session.duration} minutes</span>
              </div>
            )}
            {session.feedback && (
              <p className="text-sm text-green-700 italic">"{session.feedback}"</p>
            )}
          </div>
        )}

        {showActions && session.status === 'assigned' && (
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex-1" onClick={() => setFeedbackDialog(session.id)}>
                  <Play className="h-4 w-4 mr-2" />
                  Commencer la séance
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Finaliser la séance</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{session.session.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Comment s'est passée votre séance ?
                    </p>
                  </div>

                  <div>
                    <Label>Durée réelle (minutes) *</Label>
                    <Input
                      type="number"
                      min="1"
                      max="300"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="Combien de temps avez-vous pratiqué ?"
                    />
                  </div>

                  <div>
                    <Label>Effort ressenti : {effort[0]}/10</Label>
                    <Slider
                      value={effort}
                      onValueChange={setEffort}
                      max={10}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Très facile</span>
                      <span>Très difficile</span>
                    </div>
                  </div>

                  <div>
                    <Label>Commentaire (optionnel)</Label>
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Partagez votre ressenti, vos difficultés ou réussites..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleCompleteSession}
                      disabled={isSubmitting || !duration}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Terminer la séance
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="outline" 
              onClick={() => handleSkipSession(session.id)}
              className="px-3"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Statistiques rapides
  const totalAssigned = assignedSessions.length;
  const totalCompleted = completedSessions.length;
  const averageEffort = completedSessions.length > 0 
    ? (completedSessions.reduce((sum, s) => sum + (s.effort || 0), 0) / completedSessions.filter(s => s.effort).length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes Séances</h1>
          <p className="text-muted-foreground">
            Suivez vos exercices personnalisés et partagez vos retours
          </p>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">À réaliser</p>
                <p className="text-2xl font-bold">{totalAssigned}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Terminées</p>
                <p className="text-2xl font-bold">{totalCompleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Effort moyen</p>
                <p className="text-2xl font-bold">{averageEffort}/10</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assigned">
            À réaliser ({assignedSessions.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Terminées ({completedSessions.length})
          </TabsTrigger>
          <TabsTrigger value="skipped">
            Ignorées ({skippedSessions.length})
          </TabsTrigger>
        </TabsList>

        {/* Filtres */}
        <div className="flex gap-3 py-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {allCategories.map(category => (
                <SelectItem key={category} value={category}>
                  {getCategoryIcon(category)} {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {allTags.length > 0 && (
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-48">
                <Tag className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les tags</SelectItem>
                {allTags.map(tag => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <TabsContent value="assigned" className="space-y-4">
          {filterSessions(assignedSessions).length > 0 ? (
            filterSessions(assignedSessions).map(session => (
              <SessionCard key={session.id} session={session} showActions={true} />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {assignedSessions.length === 0 
                    ? "Aucune séance assignée pour le moment"
                    : "Aucune séance ne correspond aux filtres sélectionnés"
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {filterSessions(completedSessions).length > 0 ? (
            filterSessions(completedSessions).map(session => (
              <SessionCard key={session.id} session={session} />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Aucune séance terminée pour le moment
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="skipped" className="space-y-4">
          {filterSessions(skippedSessions).length > 0 ? (
            filterSessions(skippedSessions).map(session => (
              <SessionCard key={session.id} session={session} />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Aucune séance ignorée
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}