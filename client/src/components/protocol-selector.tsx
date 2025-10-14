import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { TRAINING_PROTOCOLS, getProtocolByValue } from "@shared/constants";
import { Info, Zap, Flame, Grid3x3, Clock, RotateCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProtocolConfig {
  // HIIT
  workDuration?: number; // secondes
  restDuration?: number; // secondes
  rounds?: number;
  
  // TABATA
  tabataIntervals?: number; // toujours 8 pour tabata standard
  tabataWork?: number; // 20 secondes standard
  tabataRest?: number; // 10 secondes standard
  
  // HICT
  exerciseRepetitions?: number;
  circuitRounds?: number;
  restBetweenExercises?: number;
  
  // EMOM / E2MOM
  minuteInterval?: number; // 1 pour EMOM, 2 pour E2MOM
  totalMinutes?: number;
  repsPerInterval?: number;
  
  // AMRAP
  amrapDuration?: number; // durée totale en minutes
  targetRounds?: number; // objectif de tours
}

interface ProtocolSelectorProps {
  value: string;
  config: ProtocolConfig;
  onChange: (protocol: string, config: ProtocolConfig) => void;
  exerciseCount?: number;
}

export function ProtocolSelector({ value, config, onChange, exerciseCount = 0 }: ProtocolSelectorProps) {
  const [selectedProtocol, setSelectedProtocol] = useState(value);
  const [protocolConfig, setProtocolConfig] = useState<ProtocolConfig>(config);

  useEffect(() => {
    // Initialiser avec des valeurs par défaut selon le protocole
    if (selectedProtocol !== value) {
      const defaultConfig = getDefaultConfig(selectedProtocol);
      setProtocolConfig(defaultConfig);
      onChange(selectedProtocol, defaultConfig);
    }
  }, [selectedProtocol]);

  const getDefaultConfig = (protocol: string): ProtocolConfig => {
    switch (protocol) {
      case 'hiit':
        return {
          workDuration: 30,
          restDuration: 15,
          rounds: 8,
        };
      case 'tabata':
        return {
          tabataIntervals: 8,
          tabataWork: 20,
          tabataRest: 10,
        };
      case 'hict':
        return {
          exerciseRepetitions: 12,
          circuitRounds: 3,
          restBetweenExercises: 30,
        };
      case 'emom':
        return {
          minuteInterval: 1,
          totalMinutes: 10,
          repsPerInterval: 10,
        };
      case 'e2mom':
        return {
          minuteInterval: 2,
          totalMinutes: 20,
          repsPerInterval: 15,
        };
      case 'amrap':
        return {
          amrapDuration: 10,
          targetRounds: 5,
        };
      default:
        return {};
    }
  };

  const updateConfig = (updates: Partial<ProtocolConfig>) => {
    const newConfig = { ...protocolConfig, ...updates };
    setProtocolConfig(newConfig);
    onChange(selectedProtocol, newConfig);
  };

  const calculateTotalDuration = () => {
    switch (selectedProtocol) {
      case 'hiit':
        return ((protocolConfig.workDuration || 0) + (protocolConfig.restDuration || 0)) * (protocolConfig.rounds || 0);
      case 'tabata':
        return ((protocolConfig.tabataWork || 0) + (protocolConfig.tabataRest || 0)) * (protocolConfig.tabataIntervals || 0);
      case 'emom':
        return (protocolConfig.totalMinutes || 0) * 60;
      case 'e2mom':
        return (protocolConfig.totalMinutes || 0) * 60;
      case 'amrap':
        return (protocolConfig.amrapDuration || 0) * 60;
      default:
        return 0;
    }
  };

  const getProtocolIcon = (protocol: string) => {
    switch (protocol) {
      case 'hiit': return <Zap className="w-4 h-4" />;
      case 'tabata': return <Flame className="w-4 h-4" />;
      case 'hict': return <Grid3x3 className="w-4 h-4" />;
      case 'emom':
      case 'e2mom': return <Clock className="w-4 h-4" />;
      case 'amrap': return <RotateCw className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const protocol = getProtocolByValue(selectedProtocol);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getProtocolIcon(selectedProtocol)}
          Configuration du Protocole
        </CardTitle>
        <CardDescription>
          Choisissez et configurez le type de protocole d'entraînement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sélecteur de protocole */}
        <div className="space-y-2">
          <Label>Type de Protocole</Label>
          <Select value={selectedProtocol} onValueChange={setSelectedProtocol}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRAINING_PROTOCOLS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  <div className="flex items-center gap-2">
                    <span>{p.icon}</span>
                    <span className="font-medium">{p.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>{protocol.description}</AlertDescription>
          </Alert>
        </div>

        {/* Configuration HIIT */}
        {selectedProtocol === 'hiit' && (
          <div className="space-y-4 border-l-4 border-red-500 pl-4">
            <div className="space-y-2">
              <Label>Durée d'effort (secondes)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[protocolConfig.workDuration || 30]}
                  onValueChange={([v]) => updateConfig({ workDuration: v })}
                  min={10}
                  max={120}
                  step={5}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={protocolConfig.workDuration || 30}
                  onChange={(e) => updateConfig({ workDuration: parseInt(e.target.value) })}
                  className="w-20"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Durée de repos (secondes)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[protocolConfig.restDuration || 15]}
                  onValueChange={([v]) => updateConfig({ restDuration: v })}
                  min={5}
                  max={60}
                  step={5}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={protocolConfig.restDuration || 15}
                  onChange={(e) => updateConfig({ restDuration: parseInt(e.target.value) })}
                  className="w-20"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Nombre de tours</Label>
              <Input
                type="number"
                value={protocolConfig.rounds || 8}
                onChange={(e) => updateConfig({ rounds: parseInt(e.target.value) })}
                min={1}
                max={20}
              />
            </div>
          </div>
        )}

        {/* Configuration TABATA */}
        {selectedProtocol === 'tabata' && (
          <div className="space-y-4 border-l-4 border-orange-500 pl-4">
            <Alert>
              <Flame className="h-4 w-4" />
              <AlertDescription>
                TABATA classique : 8 intervalles de 20" d'effort / 10" de repos
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label>Effort (secondes)</Label>
              <Input
                type="number"
                value={protocolConfig.tabataWork || 20}
                onChange={(e) => updateConfig({ tabataWork: parseInt(e.target.value) })}
                min={15}
                max={30}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Repos (secondes)</Label>
              <Input
                type="number"
                value={protocolConfig.tabataRest || 10}
                onChange={(e) => updateConfig({ tabataRest: parseInt(e.target.value) })}
                min={5}
                max={20}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Nombre d'intervalles</Label>
              <Input
                type="number"
                value={protocolConfig.tabataIntervals || 8}
                onChange={(e) => updateConfig({ tabataIntervals: parseInt(e.target.value) })}
                min={4}
                max={12}
              />
            </div>
          </div>
        )}

        {/* Configuration HICT */}
        {selectedProtocol === 'hict' && (
          <div className="space-y-4 border-l-4 border-purple-500 pl-4">
            <div className="space-y-2">
              <Label>Répétitions par exercice</Label>
              <Input
                type="number"
                value={protocolConfig.exerciseRepetitions || 12}
                onChange={(e) => updateConfig({ exerciseRepetitions: parseInt(e.target.value) })}
                min={5}
                max={30}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Nombre de tours du circuit</Label>
              <Input
                type="number"
                value={protocolConfig.circuitRounds || 3}
                onChange={(e) => updateConfig({ circuitRounds: parseInt(e.target.value) })}
                min={1}
                max={10}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Repos entre exercices (secondes)</Label>
              <Input
                type="number"
                value={protocolConfig.restBetweenExercises || 30}
                onChange={(e) => updateConfig({ restBetweenExercises: parseInt(e.target.value) })}
                min={0}
                max={120}
              />
            </div>
          </div>
        )}

        {/* Configuration EMOM / E2MOM */}
        {(selectedProtocol === 'emom' || selectedProtocol === 'e2mom') && (
          <div className="space-y-4 border-l-4 border-blue-500 pl-4">
            <div className="space-y-2">
              <Label>Intervalle (minutes)</Label>
              <Input
                type="number"
                value={protocolConfig.minuteInterval || (selectedProtocol === 'emom' ? 1 : 2)}
                onChange={(e) => updateConfig({ minuteInterval: parseInt(e.target.value) })}
                min={1}
                max={5}
                disabled={selectedProtocol === 'emom'}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Durée totale (minutes)</Label>
              <Input
                type="number"
                value={protocolConfig.totalMinutes || (selectedProtocol === 'emom' ? 10 : 20)}
                onChange={(e) => updateConfig({ totalMinutes: parseInt(e.target.value) })}
                min={5}
                max={60}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Répétitions par intervalle</Label>
              <Input
                type="number"
                value={protocolConfig.repsPerInterval || 10}
                onChange={(e) => updateConfig({ repsPerInterval: parseInt(e.target.value) })}
                min={5}
                max={50}
              />
            </div>
          </div>
        )}

        {/* Configuration AMRAP */}
        {selectedProtocol === 'amrap' && (
          <div className="space-y-4 border-l-4 border-green-500 pl-4">
            <div className="space-y-2">
              <Label>Durée totale (minutes)</Label>
              <Input
                type="number"
                value={protocolConfig.amrapDuration || 10}
                onChange={(e) => updateConfig({ amrapDuration: parseInt(e.target.value) })}
                min={5}
                max={60}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Objectif de tours (optionnel)</Label>
              <Input
                type="number"
                value={protocolConfig.targetRounds || 5}
                onChange={(e) => updateConfig({ targetRounds: parseInt(e.target.value) })}
                min={1}
                max={20}
                placeholder="Nombre de tours à viser"
              />
            </div>
            
            <Alert>
              <RotateCw className="h-4 w-4" />
              <AlertDescription>
                Les répétitions sont définies individuellement pour chaque exercice.
                Objectif : compléter le maximum de tours possibles.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Résumé */}
        {selectedProtocol !== 'standard' && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Durée totale estimée :</span>
              <Badge variant="outline" className="text-base">
                {Math.floor(calculateTotalDuration() / 60)} min {calculateTotalDuration() % 60} sec
              </Badge>
            </div>
            {exerciseCount > 0 && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-muted-foreground">Exercices dans la séance :</span>
                <Badge>{exerciseCount}</Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
