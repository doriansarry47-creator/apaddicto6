import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Hash, Repeat, Timer, Info } from "lucide-react";

interface ExerciseConfig {
  duration: number; // en secondes
  repetitions: number;
  sets: number;
  restTime: number; // en secondes
  workTime?: number; // pour intervalles
  restInterval?: number; // pour intervalles
  isOptional: boolean;
  notes: string;
}

interface ExerciseConfigFormProps {
  config: ExerciseConfig;
  onChange: (config: ExerciseConfig) => void;
  protocol: string;
  exerciseTitle: string;
}

export function ExerciseConfigForm({ 
  config, 
  onChange, 
  protocol,
  exerciseTitle 
}: ExerciseConfigFormProps) {
  const [localConfig, setLocalConfig] = useState<ExerciseConfig>(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const updateConfig = (updates: Partial<ExerciseConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // Déterminer quels champs afficher selon le protocole
  const needsRepetitions = ['hict', 'emom', 'e2mom', 'amrap'].includes(protocol);
  const needsDuration = ['standard', 'hiit', 'tabata'].includes(protocol);
  const needsIntervals = ['hiit'].includes(protocol);
  const isTimeBased = ['emom', 'e2mom', 'amrap'].includes(protocol);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Configuration : {exerciseTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info selon protocole */}
        {protocol !== 'standard' && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {protocol === 'hict' && "HICT : Définissez le nombre de répétitions et de séries"}
              {protocol === 'emom' && "EMOM : Nombre de répétitions à faire chaque minute"}
              {protocol === 'e2mom' && "E2MOM : Nombre de répétitions à faire toutes les 2 minutes"}
              {protocol === 'amrap' && "AMRAP : Nombre de répétitions par tour"}
              {protocol === 'hiit' && "HIIT : Configurez la durée d'effort et les intervalles"}
              {protocol === 'tabata' && "TABATA : Durée d'effort par intervalle"}
            </AlertDescription>
          </Alert>
        )}

        {/* Répétitions (obligatoire pour certains protocoles) */}
        {needsRepetitions && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Répétitions {needsRepetitions && <span className="text-red-500">*</span>}
            </Label>
            <Input
              type="number"
              value={localConfig.repetitions}
              onChange={(e) => updateConfig({ repetitions: parseInt(e.target.value) || 0 })}
              min={0}
              max={100}
              placeholder="Ex: 12"
              required={needsRepetitions}
              className={needsRepetitions && localConfig.repetitions === 0 ? "border-red-500" : ""}
            />
            {needsRepetitions && localConfig.repetitions === 0 && (
              <p className="text-sm text-red-500">Les répétitions sont obligatoires pour ce protocole</p>
            )}
          </div>
        )}

        {/* Durée (pour protocoles temporels) */}
        {needsDuration && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Durée d'effort (secondes)
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={localConfig.duration}
                onChange={(e) => updateConfig({ duration: parseInt(e.target.value) || 0 })}
                min={0}
                max={3600}
                placeholder="Ex: 300"
              />
              <Badge variant="outline" className="whitespace-nowrap">
                {formatTime(localConfig.duration)}
              </Badge>
            </div>
          </div>
        )}

        {/* Séries (optionnel sauf pour HICT) */}
        {(protocol === 'hict' || protocol === 'standard') && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Repeat className="w-4 h-4" />
              Nombre de séries
            </Label>
            <Input
              type="number"
              value={localConfig.sets}
              onChange={(e) => updateConfig({ sets: parseInt(e.target.value) || 1 })}
              min={1}
              max={10}
              placeholder="Ex: 3"
            />
          </div>
        )}

        {/* Configuration des intervalles (pour HIIT) */}
        {needsIntervals && (
          <>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Temps de travail (secondes)
              </Label>
              <Input
                type="number"
                value={localConfig.workTime || 30}
                onChange={(e) => updateConfig({ workTime: parseInt(e.target.value) || 30 })}
                min={5}
                max={300}
                placeholder="Ex: 30"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Temps de repos dans l'intervalle (secondes)
              </Label>
              <Input
                type="number"
                value={localConfig.restInterval || 15}
                onChange={(e) => updateConfig({ restInterval: parseInt(e.target.value) || 15 })}
                min={0}
                max={120}
                placeholder="Ex: 15"
              />
            </div>
          </>
        )}

        {/* Temps de repos après l'exercice */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Timer className="w-4 h-4" />
            Repos après l'exercice (secondes)
          </Label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={localConfig.restTime}
              onChange={(e) => updateConfig({ restTime: parseInt(e.target.value) || 0 })}
              min={0}
              max={300}
              placeholder="Ex: 60"
            />
            <Badge variant="outline" className="whitespace-nowrap">
              {formatTime(localConfig.restTime)}
            </Badge>
          </div>
        </div>

        {/* Exercice optionnel */}
        <div className="flex items-center justify-between space-y-0 rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label>Exercice optionnel</Label>
            <p className="text-sm text-muted-foreground">
              Peut être ignoré pendant la séance
            </p>
          </div>
          <Switch
            checked={localConfig.isOptional}
            onCheckedChange={(checked) => updateConfig({ isOptional: checked })}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label>Notes / Instructions spécifiques</Label>
          <Textarea
            value={localConfig.notes}
            onChange={(e) => updateConfig({ notes: e.target.value })}
            placeholder="Ajoutez des instructions particulières pour cet exercice..."
            rows={3}
          />
        </div>

        {/* Résumé */}
        <div className="pt-4 border-t space-y-2">
          <h4 className="font-medium text-sm">Résumé</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {localConfig.repetitions > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Répétitions :</span>
                <Badge variant="secondary">{localConfig.repetitions}</Badge>
              </div>
            )}
            {localConfig.sets > 1 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Séries :</span>
                <Badge variant="secondary">{localConfig.sets}</Badge>
              </div>
            )}
            {localConfig.duration > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Durée :</span>
                <Badge variant="secondary">{formatTime(localConfig.duration)}</Badge>
              </div>
            )}
            {localConfig.restTime > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Repos :</span>
                <Badge variant="secondary">{formatTime(localConfig.restTime)}</Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
