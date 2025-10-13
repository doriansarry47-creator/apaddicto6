import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Trash2, 
  Clock, 
  Target, 
  Activity, 
  Zap, 
  BarChart3,
  Copy,
  Shuffle,
  Settings2,
  Play,
  Pause,
  RotateCcw,
  Save,
  Send,
  Download,
  Sparkles,
  MoveUp,
  MoveDown,
  Timer,
  TrendingUp,
  Heart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Types de protocoles
type ProtocolType = 'HIIT' | 'TABATA' | 'HICT' | 'EMOM' | 'E2MOM' | 'DEATH_BY' | 'AMRAP';

// Configuration de protocole
interface ProtocolConfig {
  type: ProtocolType;
  // HIIT
  workDuration?: number; // secondes
  restDuration?: number; // secondes
  rounds?: number;
  // TABATA
  cycles?: number; // 8 par défaut pour TABATA
  // HICT
  repsPerExercise?: number;
  // EMOM/E2MOM
  repsPerMinute?: number;
  totalMinutes?: number;
  interval?: number; // 1 pour EMOM, 2 pour E2MOM
  // AMRAP
  totalDuration?: number; // minutes
  // DEATH BY
  incrementalReps?: boolean;
}

// Bloc d'exercice dans la séance
interface SessionBlock {
  id: string;
  type: 'warmup' | 'work' | 'active_rest' | 'cooldown';
  title: string;
  protocol: ProtocolConfig;
  exercises: SessionExercise[];
  order: number;
  notes?: string;
}

interface SessionExercise {
  id: string;
  exerciseId: string;
  title: string;
  category: string;
  substitutionId?: string; // exercice de substitution
  order: number;
}

interface AdvancedSession {
  id?: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'morning' | 'evening' | 'crisis' | 'maintenance' | 'recovery';
  blocks: SessionBlock[];
  totalDuration: number; // calculé automatiquement
  totalIntensity: number; // calculé automatiquement
  workRestRatio: string; // calculé automatiquement
  tags: string[];
  isPublic: boolean;
  warmupVideo?: string; // lien YouTube
  cooldownNotes?: string;
}

interface Exercise {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  duration: number;
  description?: string;
  videoUrl?: string;
}

interface AdvancedSessionBuilderProps {
  exercises: Exercise[];
  onSave: (session: AdvancedSession) => Promise<void>;
  onPublish?: (sessionId: string, patientIds: string[]) => Promise<void>;
  existingSession?: AdvancedSession;
  patients?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

export function AdvancedSessionBuilder({ 
  exercises, 
  onSave, 
  onPublish,
  existingSession,
  patients = []
}: AdvancedSessionBuilderProps) {
  const { toast } = useToast();

  // État principal de la séance
  const [session, setSession] = useState<AdvancedSession>({
    title: "",
    description: "",
    difficulty: 'beginner',
    category: 'maintenance',
    blocks: [],
    totalDuration: 0,
    totalIntensity: 0,
    workRestRatio: "0:0",
    tags: [],
    isPublic: false
  });

  // États pour la construction
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolType>('HIIT');
  const [currentBlock, setCurrentBlock] = useState<Partial<SessionBlock>>({
    type: 'work',
    title: "",
    exercises: []
  });
  const [protocolConfig, setProtocolConfig] = useState<ProtocolConfig>({
    type: 'HIIT',
    workDuration: 45,
    restDuration: 15,
    rounds: 4
  });

  // États pour la sélection d'exercices
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

  // États pour publication
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);

  // État pour prévisualisation
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (existingSession) {
      setSession(existingSession);
    }
  }, [existingSession]);

  // Calcul automatique des statistiques
  useEffect(() => {
    calculateSessionStats();
  }, [session.blocks]);

  const calculateSessionStats = () => {
    let totalWork = 0;
    let totalRest = 0;
    let totalDuration = 0;

    session.blocks.forEach(block => {
      const config = block.protocol;
      let blockDuration = 0;
      let blockWork = 0;
      let blockRest = 0;

      switch (config.type) {
        case 'HIIT':
          blockWork = (config.workDuration || 45) * (config.rounds || 4) * block.exercises.length;
          blockRest = (config.restDuration || 15) * (config.rounds || 4) * block.exercises.length;
          blockDuration = blockWork + blockRest;
          break;
        
        case 'TABATA':
          blockWork = 20 * (config.cycles || 8) * block.exercises.length;
          blockRest = 10 * (config.cycles || 8) * block.exercises.length;
          blockDuration = blockWork + blockRest;
          break;
        
        case 'HICT':
          // Estimation: 3 secondes par rep
          blockWork = (config.repsPerExercise || 10) * 3 * block.exercises.length;
          blockRest = 30 * block.exercises.length; // repos entre exercices
          blockDuration = blockWork + blockRest;
          break;
        
        case 'EMOM':
        case 'E2MOM':
          const interval = config.type === 'E2MOM' ? 2 : 1;
          blockDuration = (config.totalMinutes || 10) * 60 * interval;
          blockWork = blockDuration * 0.7; // estimation 70% travail
          blockRest = blockDuration * 0.3;
          break;
        
        case 'DEATH_BY':
          const minutes = config.totalMinutes || 10;
          blockDuration = minutes * 60;
          blockWork = blockDuration * 0.75;
          blockRest = blockDuration * 0.25;
          break;
        
        case 'AMRAP':
          blockDuration = (config.totalDuration || 10) * 60;
          blockWork = blockDuration * 0.9; // estimation 90% travail
          blockRest = blockDuration * 0.1;
          break;
      }

      totalWork += blockWork;
      totalRest += blockRest;
      totalDuration += blockDuration;
    });

    const intensity = totalDuration > 0 ? Math.round((totalWork / totalDuration) * 100) : 0;
    const workRestRatio = totalRest > 0 ? `${Math.round(totalWork / totalRest)}:1` : "0:0";

    setSession(prev => ({
      ...prev,
      totalDuration: Math.round(totalDuration / 60), // en minutes
      totalIntensity: intensity,
      workRestRatio
    }));
  };

  // Configuration par défaut selon le protocole
  const getDefaultProtocolConfig = (protocol: ProtocolType): ProtocolConfig => {
    switch (protocol) {
      case 'HIIT':
        return { type: 'HIIT', workDuration: 45, restDuration: 15, rounds: 4 };
      case 'TABATA':
        return { type: 'TABATA', workDuration: 20, restDuration: 10, cycles: 8 };
      case 'HICT':
        return { type: 'HICT', repsPerExercise: 10 };
      case 'EMOM':
        return { type: 'EMOM', repsPerMinute: 10, totalMinutes: 10, interval: 1 };
      case 'E2MOM':
        return { type: 'E2MOM', repsPerMinute: 15, totalMinutes: 10, interval: 2 };
      case 'DEATH_BY':
        return { type: 'DEATH_BY', totalMinutes: 10, incrementalReps: true };
      case 'AMRAP':
        return { type: 'AMRAP', totalDuration: 10 };
      default:
        return { type: 'HIIT', workDuration: 45, restDuration: 15, rounds: 4 };
    }
  };

  // Changer le protocole
  const handleProtocolChange = (protocol: ProtocolType) => {
    setSelectedProtocol(protocol);
    setProtocolConfig(getDefaultProtocolConfig(protocol));
  };

  // Ajouter un exercice au bloc actuel
  const addExerciseToBlock = (exerciseId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    const sessionExercise: SessionExercise = {
      id: `ex-${Date.now()}-${Math.random()}`,
      exerciseId: exercise.id,
      title: exercise.title,
      category: exercise.category,
      order: (currentBlock.exercises?.length || 0)
    };

    setCurrentBlock(prev => ({
      ...prev,
      exercises: [...(prev.exercises || []), sessionExercise]
    }));

    toast({
      title: "Exercice ajouté",
      description: `${exercise.title} ajouté au bloc`
    });
  };

  // Retirer un exercice du bloc
  const removeExerciseFromBlock = (exerciseId: string) => {
    setCurrentBlock(prev => ({
      ...prev,
      exercises: (prev.exercises || []).filter(e => e.id !== exerciseId)
    }));
  };

  // Ajouter le bloc à la séance
  const addBlockToSession = () => {
    if (!currentBlock.title || (currentBlock.exercises?.length || 0) === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter un titre et au moins un exercice au bloc",
        variant: "destructive"
      });
      return;
    }

    const newBlock: SessionBlock = {
      id: `block-${Date.now()}`,
      type: currentBlock.type || 'work',
      title: currentBlock.title || '',
      protocol: { ...protocolConfig },
      exercises: currentBlock.exercises || [],
      order: session.blocks.length,
      notes: currentBlock.notes
    };

    setSession(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));

    // Réinitialiser le bloc actuel
    setCurrentBlock({
      type: 'work',
      title: "",
      exercises: []
    });

    toast({
      title: "Bloc ajouté",
      description: `Bloc "${newBlock.title}" ajouté à la séance`
    });
  };

  // Supprimer un bloc de la séance
  const removeBlock = (blockId: string) => {
    setSession(prev => ({
      ...prev,
      blocks: prev.blocks.filter(b => b.id !== blockId)
    }));
  };

  // Dupliquer un bloc
  const duplicateBlock = (blockId: string) => {
    const block = session.blocks.find(b => b.id === blockId);
    if (!block) return;

    const duplicatedBlock: SessionBlock = {
      ...block,
      id: `block-${Date.now()}`,
      title: `${block.title} (copie)`,
      order: session.blocks.length
    };

    setSession(prev => ({
      ...prev,
      blocks: [...prev.blocks, duplicatedBlock]
    }));

    toast({
      title: "Bloc dupliqué",
      description: `"${block.title}" a été dupliqué`
    });
  };

  // Mélanger les exercices d'un bloc
  const shuffleBlockExercises = (blockId: string) => {
    setSession(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => {
        if (block.id === blockId) {
          const shuffled = [...block.exercises].sort(() => Math.random() - 0.5);
          return { ...block, exercises: shuffled };
        }
        return block;
      })
    }));

    toast({
      title: "Exercices mélangés",
      description: "L'ordre des exercices a été aléatoirement modifié"
    });
  };

  // Déplacer un bloc
  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const index = session.blocks.findIndex(b => b.id === blockId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === session.blocks.length - 1) return;

    const newBlocks = [...session.blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];

    setSession(prev => ({
      ...prev,
      blocks: newBlocks.map((b, i) => ({ ...b, order: i }))
    }));
  };

  // Formater la durée
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}min`;
    return `${mins}min ${secs}s`;
  };

  // Obtenir la description du protocole
  const getProtocolDescription = (config: ProtocolConfig): string => {
    switch (config.type) {
      case 'HIIT':
        return `${config.workDuration}s effort / ${config.restDuration}s repos × ${config.rounds} tours`;
      case 'TABATA':
        return `20s effort / 10s repos × ${config.cycles || 8} séries`;
      case 'HICT':
        return `${config.repsPerExercise} répétitions par exercice`;
      case 'EMOM':
        return `${config.repsPerMinute} reps/minute pendant ${config.totalMinutes}min`;
      case 'E2MOM':
        return `${config.repsPerMinute} reps toutes les 2 minutes pendant ${config.totalMinutes}min`;
      case 'DEATH_BY':
        return `${config.totalMinutes}min avec répétitions progressives`;
      case 'AMRAP':
        return `Maximum de tours en ${config.totalDuration}min`;
      default:
        return '';
    }
  };

  // Sauvegarder la séance
  const handleSave = async () => {
    if (!session.title.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez donner un titre à la séance",
        variant: "destructive"
      });
      return;
    }

    if (session.blocks.length === 0) {
      toast({
        title: "Erreur",
        description: "Ajoutez au moins un bloc à la séance",
        variant: "destructive"
      });
      return;
    }

    try {
      await onSave(session);
      toast({
        title: "Séance sauvegardée",
        description: `"${session.title}" a été sauvegardée avec succès`
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde",
        variant: "destructive"
      });
    }
  };

  // Publier la séance
  const handlePublish = async () => {
    if (!session.id || !onPublish) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord sauvegarder la séance",
        variant: "destructive"
      });
      return;
    }

    try {
      await onPublish(session.id, selectedPatients);
      toast({
        title: "Séance publiée",
        description: selectedPatients.length > 0 
          ? `Assignée à ${selectedPatients.length} patient(s)`
          : "Publiée pour tous les patients"
      });
      setShowPublishModal(false);
      setSelectedPatients([]);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la publication",
        variant: "destructive"
      });
    }
  };

  // Filtrer les exercices
  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || ex.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(exercises.map(e => e.category))];

  // Obtenir l'icône du type de bloc
  const getBlockTypeIcon = (type: SessionBlock['type']) => {
    switch (type) {
      case 'warmup': return '🔥';
      case 'work': return '💪';
      case 'active_rest': return '🌬️';
      case 'cooldown': return '🧘';
      default: return '📋';
    }
  };

  // Obtenir la couleur du protocole
  const getProtocolColor = (type: ProtocolType): string => {
    const colors: Record<ProtocolType, string> = {
      'HIIT': 'bg-red-100 text-red-800 border-red-300',
      'TABATA': 'bg-orange-100 text-orange-800 border-orange-300',
      'HICT': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'EMOM': 'bg-green-100 text-green-800 border-green-300',
      'E2MOM': 'bg-teal-100 text-teal-800 border-teal-300',
      'DEATH_BY': 'bg-purple-100 text-purple-800 border-purple-300',
      'AMRAP': 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-4">
      {/* En-tête avec infos et actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Titre de la séance</Label>
                <Input
                  value={session.title}
                  onChange={(e) => setSession(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: HIIT Full Body Intense"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Difficulté</Label>
                <Select
                  value={session.difficulty}
                  onValueChange={(value: any) => setSession(prev => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Débutant</SelectItem>
                    <SelectItem value="intermediate">Intermédiaire</SelectItem>
                    <SelectItem value="advanced">Avancé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Catégorie</Label>
                <Select
                  value={session.category}
                  onValueChange={(value: any) => setSession(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Matinale</SelectItem>
                    <SelectItem value="evening">Soir</SelectItem>
                    <SelectItem value="crisis">Crise</SelectItem>
                    <SelectItem value="maintenance">Entretien</SelectItem>
                    <SelectItem value="recovery">Récupération</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="ml-4 flex gap-2">
              <Button onClick={handleSave} variant="default">
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
              {onPublish && session.id && (
                <Button onClick={() => setShowPublishModal(true)} className="bg-green-600 hover:bg-green-700">
                  <Send className="h-4 w-4 mr-2" />
                  Publier
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interface 3 colonnes */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* COLONNE GAUCHE - Bibliothèque d'exercices */}
        <Card className="col-span-3 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Bibliothèque
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0 space-y-3">
            <div className="space-y-2">
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="space-y-2 pr-4">
                {filteredExercises.map(exercise => (
                  <div
                    key={exercise.id}
                    className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => addExerciseToBlock(exercise.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{exercise.title}</span>
                      <Plus className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{exercise.category}</Badge>
                      <Badge variant="outline" className="text-xs">{exercise.duration}min</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* COLONNE CENTRE - Constructeur */}
        <Card className="col-span-6 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Constructeur de Séance
              </div>
              <Badge variant="outline" className="text-sm">
                {session.blocks.length} blocs
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <Tabs defaultValue="builder" className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="builder">Construire</TabsTrigger>
                <TabsTrigger value="blocks">Blocs ({session.blocks.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="builder" className="flex-1 min-h-0 mt-4">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-4">
                    {/* Sélection du protocole */}
                    <div>
                      <Label className="text-base font-semibold mb-3 block">1. Choisir le protocole</Label>
                      <RadioGroup value={selectedProtocol} onValueChange={(v) => handleProtocolChange(v as ProtocolType)}>
                        <div className="grid grid-cols-2 gap-2">
                          {(['HIIT', 'TABATA', 'HICT', 'EMOM', 'E2MOM', 'DEATH_BY', 'AMRAP'] as ProtocolType[]).map(protocol => (
                            <div key={protocol} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-accent cursor-pointer">
                              <RadioGroupItem value={protocol} id={protocol} />
                              <Label htmlFor={protocol} className="cursor-pointer flex-1 font-medium">
                                {protocol.replace('_', ' ')}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    <Separator />

                    {/* Configuration du protocole */}
                    <div>
                      <Label className="text-base font-semibold mb-3 block">2. Configurer les paramètres</Label>
                      <div className="p-4 border rounded-lg bg-accent/50 space-y-3">
                        {selectedProtocol === 'HIIT' && (
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <Label>Effort (sec)</Label>
                              <Input
                                type="number"
                                value={protocolConfig.workDuration}
                                onChange={(e) => setProtocolConfig(prev => ({ ...prev, workDuration: Number(e.target.value) }))}
                                min="5"
                                max="300"
                              />
                            </div>
                            <div>
                              <Label>Repos (sec)</Label>
                              <Input
                                type="number"
                                value={protocolConfig.restDuration}
                                onChange={(e) => setProtocolConfig(prev => ({ ...prev, restDuration: Number(e.target.value) }))}
                                min="5"
                                max="180"
                              />
                            </div>
                            <div>
                              <Label>Tours</Label>
                              <Input
                                type="number"
                                value={protocolConfig.rounds}
                                onChange={(e) => setProtocolConfig(prev => ({ ...prev, rounds: Number(e.target.value) }))}
                                min="1"
                                max="20"
                              />
                            </div>
                          </div>
                        )}

                        {selectedProtocol === 'TABATA' && (
                          <div>
                            <Label>Nombre de cycles (défaut: 8)</Label>
                            <Input
                              type="number"
                              value={protocolConfig.cycles || 8}
                              onChange={(e) => setProtocolConfig(prev => ({ ...prev, cycles: Number(e.target.value) }))}
                              min="4"
                              max="16"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              20s effort / 10s repos × {protocolConfig.cycles || 8} = {((protocolConfig.cycles || 8) * 30) / 60}min
                            </p>
                          </div>
                        )}

                        {selectedProtocol === 'HICT' && (
                          <div>
                            <Label>Répétitions par exercice</Label>
                            <Input
                              type="number"
                              value={protocolConfig.repsPerExercise}
                              onChange={(e) => setProtocolConfig(prev => ({ ...prev, repsPerExercise: Number(e.target.value) }))}
                              min="5"
                              max="50"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Mode chronomètre - Objectif: le plus vite possible
                            </p>
                          </div>
                        )}

                        {(selectedProtocol === 'EMOM' || selectedProtocol === 'E2MOM') && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Reps/{selectedProtocol === 'E2MOM' ? '2 ' : ''}minute</Label>
                              <Input
                                type="number"
                                value={protocolConfig.repsPerMinute}
                                onChange={(e) => setProtocolConfig(prev => ({ ...prev, repsPerMinute: Number(e.target.value) }))}
                                min="5"
                                max="50"
                              />
                            </div>
                            <div>
                              <Label>Durée totale (min)</Label>
                              <Input
                                type="number"
                                value={protocolConfig.totalMinutes}
                                onChange={(e) => setProtocolConfig(prev => ({ ...prev, totalMinutes: Number(e.target.value) }))}
                                min="5"
                                max="60"
                              />
                            </div>
                          </div>
                        )}

                        {selectedProtocol === 'DEATH_BY' && (
                          <div>
                            <Label>Durée totale (minutes)</Label>
                            <Input
                              type="number"
                              value={protocolConfig.totalMinutes}
                              onChange={(e) => setProtocolConfig(prev => ({ ...prev, totalMinutes: Number(e.target.value) }))}
                              min="5"
                              max="30"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Minute 1: 1 rep, Minute 2: 2 reps, etc.
                            </p>
                          </div>
                        )}

                        {selectedProtocol === 'AMRAP' && (
                          <div>
                            <Label>Durée totale (minutes)</Label>
                            <Input
                              type="number"
                              value={protocolConfig.totalDuration}
                              onChange={(e) => setProtocolConfig(prev => ({ ...prev, totalDuration: Number(e.target.value) }))}
                              min="5"
                              max="60"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Faire le maximum de tours dans le temps imparti
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Configuration du bloc */}
                    <div>
                      <Label className="text-base font-semibold mb-3 block">3. Configurer le bloc</Label>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Titre du bloc</Label>
                            <Input
                              value={currentBlock.title || ""}
                              onChange={(e) => setCurrentBlock(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Ex: Travail principal"
                            />
                          </div>
                          <div>
                            <Label>Type de bloc</Label>
                            <Select
                              value={currentBlock.type}
                              onValueChange={(value: any) => setCurrentBlock(prev => ({ ...prev, type: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="warmup">🔥 Échauffement</SelectItem>
                                <SelectItem value="work">💪 Travail</SelectItem>
                                <SelectItem value="active_rest">🌬️ Repos actif</SelectItem>
                                <SelectItem value="cooldown">🧘 Retour au calme</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label>Exercices du bloc ({currentBlock.exercises?.length || 0})</Label>
                          {currentBlock.exercises && currentBlock.exercises.length > 0 ? (
                            <div className="mt-2 space-y-2">
                              {currentBlock.exercises.map((ex) => (
                                <div key={ex.id} className="flex items-center justify-between p-2 border rounded-lg">
                                  <span className="text-sm font-medium">{ex.title}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeExerciseFromBlock(ex.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground mt-2 p-4 border rounded-lg text-center">
                              Sélectionnez des exercices dans la bibliothèque
                            </p>
                          )}
                        </div>

                        <div>
                          <Label>Notes (optionnel)</Label>
                          <Textarea
                            value={currentBlock.notes || ""}
                            onChange={(e) => setCurrentBlock(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Instructions spécifiques pour ce bloc..."
                            rows={2}
                          />
                        </div>

                        <Button onClick={addBlockToSession} className="w-full" size="lg">
                          <Plus className="h-5 w-5 mr-2" />
                          Ajouter le bloc à la séance
                        </Button>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="blocks" className="flex-1 min-h-0 mt-4">
                <ScrollArea className="h-full pr-4">
                  {session.blocks.length === 0 ? (
                    <div className="text-center py-12">
                      <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Aucun bloc ajouté</p>
                      <p className="text-sm text-muted-foreground">Construisez votre séance dans l'onglet "Construire"</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {session.blocks.map((block, index) => (
                        <Card key={block.id} className={`border-l-4 ${getProtocolColor(block.protocol.type)}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-lg">{getBlockTypeIcon(block.type)}</span>
                                  <h4 className="font-bold">{block.title}</h4>
                                  <Badge className={getProtocolColor(block.protocol.type)}>
                                    {block.protocol.type}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {getProtocolDescription(block.protocol)}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" onClick={() => moveBlock(block.id, 'up')} disabled={index === 0}>
                                  <MoveUp className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => moveBlock(block.id, 'down')} disabled={index === session.blocks.length - 1}>
                                  <MoveDown className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => duplicateBlock(block.id)}>
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => shuffleBlockExercises(block.id)}>
                                  <Shuffle className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => removeBlock(block.id)}>
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-muted-foreground">Exercices:</p>
                              {block.exercises.map((ex) => (
                                <div key={ex.id} className="text-sm pl-3 border-l-2 border-muted">
                                  • {ex.title}
                                </div>
                              ))}
                            </div>
                            {block.notes && (
                              <p className="text-xs text-muted-foreground italic mt-2 pt-2 border-t">
                                💡 {block.notes}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* COLONNE DROITE - Aperçu et statistiques */}
        <Card className="col-span-3 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Aperçu & Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {/* Statistiques globales */}
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-blue-800">Durée totale</span>
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{session.totalDuration} min</p>
                  </div>

                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-orange-800">Intensité moyenne</span>
                      <Zap className="h-4 w-4 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-orange-900">{session.totalIntensity}%</p>
                  </div>

                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-purple-800">Ratio Travail/Repos</span>
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-purple-900">{session.workRestRatio}</p>
                  </div>

                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-green-800">Nombre de blocs</span>
                      <Target className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-900">{session.blocks.length}</p>
                  </div>
                </div>

                <Separator />

                {/* Timeline chronologique */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Timer className="h-4 w-4 mr-2" />
                    Timeline
                  </h4>
                  {session.blocks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">
                      Aucun bloc à afficher
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {session.blocks.map((block, index) => (
                        <div key={block.id} className="relative pl-6">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary to-primary/30" />
                          <div className="absolute left-[-4px] top-2 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                          <div className="pb-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span>{getBlockTypeIcon(block.type)}</span>
                              <span className="font-medium text-sm">{block.title}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {block.protocol.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Graphique effort/repos */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Heart className="h-4 w-4 mr-2" />
                    Rythme de la séance
                  </h4>
                  <div className="space-y-2">
                    {session.blocks.map((block) => {
                      const workPercent = session.totalIntensity; // Simplified
                      return (
                        <div key={block.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium">{block.title}</span>
                            <span className="text-muted-foreground">{block.protocol.type}</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                              style={{ width: `${workPercent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Modal de publication */}
      <Dialog open={showPublishModal} onOpenChange={setShowPublishModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publier la séance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sélectionnez les patients qui recevront cette séance.
            </p>
            {patients.length > 0 ? (
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {patients.map((patient) => (
                    <div key={patient.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={patient.id}
                        checked={selectedPatients.includes(patient.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPatients(prev => [...prev, patient.id]);
                          } else {
                            setSelectedPatients(prev => prev.filter(id => id !== patient.id));
                          }
                        }}
                      />
                      <Label htmlFor={patient.id} className="flex-1">
                        {patient.firstName} {patient.lastName}
                        <span className="text-xs text-muted-foreground block">{patient.email}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Aucun patient disponible
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishModal(false)}>
              Annuler
            </Button>
            <Button onClick={handlePublish}>
              <Send className="h-4 w-4 mr-2" />
              Publier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
