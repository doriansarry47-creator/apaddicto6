import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InsertAntiCravingStrategy } from "@shared/schema";

const contexts = [
  { key: 'leisure', label: 'Pendant mes loisirs' },
  { key: 'home', label: 'Au domicile' },
  { key: 'work', label: 'Au travail / lieu de soin' }
];

const effortLevels = [
  { value: 'faible', label: 'Faible' },
  { value: 'modéré', label: 'Modéré' },
  { value: 'intense', label: 'Intense' }
];

interface StrategyRow {
  id: string;
  context: string;
  exercise: string;
  effort: string;
  duration: number;
  cravingBefore: number;
  cravingAfter: number;
}

interface StrategiesBoxProps {
  userId: string;
  onSuccess?: () => void;
}

export function StrategiesBox({ userId, onSuccess }: StrategiesBoxProps) {
  const [strategies, setStrategies] = useState<StrategyRow[]>([
    {
      id: 'default',
      context: 'leisure',
      exercise: '',
      effort: 'modéré',
      duration: 10,
      cravingBefore: 5,
      cravingAfter: 3
    }
  ]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveStrategiesMutation = useMutation({
    mutationFn: async (data: InsertAntiCravingStrategy[]) => {
      console.log('Sending strategies to API:', data);
      
      try {
        const response = await apiRequest("POST", "/api/strategies", { strategies: data });
        
        // apiRequest already handles error checking and throws on non-ok responses
        // So if we get here, the response is ok and already parsed
        const result = await response.json();
        console.log('API response:', result);
        return result;
      } catch (error: any) {
        console.error('Error in saveStrategiesMutation:', error);
        // Re-throw with better error message
        throw new Error(error.message || 'Erreur lors de la sauvegarde des stratégies');
      }
    },
    onSuccess: (result) => {
      const count = result.strategies?.length || result.length || 0;
      toast({
        title: "Stratégies sauvegardées !",
        description: `${count} stratégie(s) enregistrée(s) avec succès dans l'onglet Suivi.`,
      });
      
      // Invalider tous les caches liés aux stratégies avec les clés correctes
      queryClient.invalidateQueries({ queryKey: ["/api/strategies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/strategies", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/stats"] });
      
      // Invalider toutes les queries relatives aux stratégies pour être sûr
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.length > 0 && key[0] === "/api/strategies";
        }
      });
      
      // Refetch immédiat
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["/api/strategies"] });
        queryClient.refetchQueries({ queryKey: ["/api/strategies", userId] });
      }, 100);
      
      console.log('Strategies saved successfully, caches invalidated');
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error saving strategies:", error);
      toast({
        title: "Erreur de sauvegarde",
        description: `Impossible de sauvegarder les stratégies: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        variant: "destructive",
      });
    },
  });

  const addRow = () => {
    const newRow: StrategyRow = {
      id: Date.now().toString(),
      context: 'leisure',
      exercise: '',
      effort: 'modéré',
      duration: 10,
      cravingBefore: 5,
      cravingAfter: 3
    };
    setStrategies([...strategies, newRow]);
  };

  const updateStrategy = (id: string, field: keyof StrategyRow, value: any) => {
    setStrategies(strategies.map(strategy => 
      strategy.id === id ? { ...strategy, [field]: value } : strategy
    ));
  };

  const removeRow = (id: string) => {
    if (strategies.length > 1) {
      setStrategies(strategies.filter(strategy => strategy.id !== id));
    }
  };

  const handleSave = () => {
    console.log('Handle save called, current strategies:', strategies);
    
    const validStrategies = strategies
      .filter(strategy => {
        const hasExercise = strategy.exercise && strategy.exercise.trim().length > 0;
        console.log('Strategy validation:', { 
          id: strategy.id,
          exercise: strategy.exercise, 
          hasExercise,
          context: strategy.context,
          effort: strategy.effort,
          duration: strategy.duration,
          cravingBefore: strategy.cravingBefore,
          cravingAfter: strategy.cravingAfter
        });
        return hasExercise;
      })
      .map(strategy => {
        const mappedStrategy = {
          // Don't include userId here as it will be added by the server
          context: strategy.context,
          exercise: strategy.exercise.trim(),
          effort: strategy.effort,
          duration: Number(strategy.duration),
          cravingBefore: Number(strategy.cravingBefore),
          cravingAfter: Number(strategy.cravingAfter)
        };
        console.log('Mapped strategy:', mappedStrategy);
        return mappedStrategy;
      });

    console.log('Valid strategies to save:', validStrategies);

    if (validStrategies.length === 0) {
      console.warn('No valid strategies found');
      toast({
        title: "Aucune stratégie valide",
        description: "Veuillez remplir au moins une stratégie avec un exercice décrit avant de sauvegarder.",
        variant: "destructive",
      });
      return;
    }

    // Validation supplémentaire avec logs détaillés
    for (let i = 0; i < validStrategies.length; i++) {
      const strategy = validStrategies[i];
      console.log(`Validating strategy ${i + 1}:`, strategy);
      
      if (isNaN(strategy.duration) || strategy.duration < 1 || strategy.duration > 180) {
        console.error(`Invalid duration for strategy ${i + 1}:`, strategy.duration);
        toast({
          title: "Durée invalide",
          description: `La durée de la stratégie ${i + 1} doit être entre 1 et 180 minutes. (Actuel: ${strategy.duration})`,
          variant: "destructive",
        });
        return;
      }
      
      if (isNaN(strategy.cravingBefore) || strategy.cravingBefore < 0 || strategy.cravingBefore > 10) {
        console.error(`Invalid cravingBefore for strategy ${i + 1}:`, strategy.cravingBefore);
        toast({
          title: "Niveau de craving invalide",
          description: `Le craving avant de la stratégie ${i + 1} doit être entre 0 et 10. (Actuel: ${strategy.cravingBefore})`,
          variant: "destructive",
        });
        return;
      }
      
      if (isNaN(strategy.cravingAfter) || strategy.cravingAfter < 0 || strategy.cravingAfter > 10) {
        console.error(`Invalid cravingAfter for strategy ${i + 1}:`, strategy.cravingAfter);
        toast({
          title: "Niveau de craving invalide",
          description: `Le craving après de la stratégie ${i + 1} doit être entre 0 et 10. (Actuel: ${strategy.cravingAfter})`,
          variant: "destructive",
        });
        return;
      }
    }

    console.log('All validation passed. Starting mutation with valid strategies:', validStrategies);
    saveStrategiesMutation.mutate(validStrategies);
  };

  const getExampleText = (context: string) => {
    const examples = {
      'leisure': 'Ex: Course à pied, méditation, lecture',
      'home': 'Ex: Ménage, yoga, cuisine créative',
      'work': 'Ex: Pause active, respiration, étirements'
    };
    return examples[context as keyof typeof examples] || '';
  };

  return (
    <Card className="shadow-material" data-testid="card-strategies-box">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-medium">
          <span className="material-icons mr-2 text-primary">psychology</span>
          Boîte à Stratégies Anti-Craving
        </CardTitle>
        <div className="text-sm text-muted-foreground mt-2 space-y-2">
          <p>
            Cet outil vous permet de découvrir et d'expérimenter différentes activités physiques ou stratégies pour réduire vos envies de fumer (cravings).
          </p>
          <p>
            Vous pouvez tester plusieurs actions, noter leur durée, leur intensité et évaluer l'impact sur votre craving avant et après l'activité.
          </p>
          <p>
            Avec le temps, cela vous aidera à identifier les stratégies qui vous apportent le plus de bénéfices et à construire votre propre boîte à outils anti-craving.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Responsive Strategy Form */}
        <div className="space-y-6">
          {strategies.map((strategy, index) => (
            <Card key={strategy.id} className="border-l-4 border-l-primary/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    <span className="material-icons mr-2 text-primary text-sm">psychology</span>
                    Stratégie {index + 1}
                  </CardTitle>
                  {strategies.length > 1 && (
                    <Button
                      onClick={() => removeRow(strategy.id)}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive h-8 w-8 p-0"
                      data-testid={`button-remove-${index}`}
                    >
                      <span className="material-icons text-sm">delete</span>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Row 1: Context and Exercise */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Contexte</label>
                    <select
                      value={strategy.context}
                      onChange={(e) => updateStrategy(strategy.id, 'context', e.target.value)}
                      className="w-full p-3 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      data-testid={`select-context-${index}`}
                    >
                      {contexts.map(context => (
                        <option key={context.key} value={context.key}>
                          {context.label}
                        </option>
                      ))}
                    </select>
                    <div className="text-xs text-muted-foreground italic">
                      {getExampleText(strategy.context)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Description de l'exercice/stratégie</label>
                    <textarea
                      value={strategy.exercise}
                      onChange={(e) => updateStrategy(strategy.id, 'exercise', e.target.value)}
                      placeholder="Décrivez précisément votre activité, technique ou stratégie..."
                      className="w-full p-3 border border-input rounded-lg text-sm resize-none h-20 bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      data-testid={`textarea-exercise-${index}`}
                    />
                  </div>
                </div>

                {/* Row 2: Effort and Duration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Niveau d'effort</label>
                    <select
                      value={strategy.effort}
                      onChange={(e) => updateStrategy(strategy.id, 'effort', e.target.value)}
                      className="w-full p-3 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      data-testid={`select-effort-${index}`}
                    >
                      {effortLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Durée (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={strategy.duration}
                      onChange={(e) => updateStrategy(strategy.id, 'duration', Number(e.target.value))}
                      className="w-full p-3 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="En minutes (1-180)"
                      data-testid={`input-duration-${index}`}
                    />
                  </div>
                </div>

                {/* Row 3: Cravings Before and After */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Niveau de craving AVANT (0-10)</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={strategy.cravingBefore}
                        onChange={(e) => updateStrategy(strategy.id, 'cravingBefore', Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        data-testid={`range-craving-before-${index}`}
                      />
                      <span className="text-lg font-bold text-destructive min-w-[2rem] text-center">
                        {strategy.cravingBefore}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Niveau de craving APRÈS (0-10)</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={strategy.cravingAfter}
                        onChange={(e) => updateStrategy(strategy.id, 'cravingAfter', Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        data-testid={`range-craving-after-${index}`}
                      />
                      <span className="text-lg font-bold text-success min-w-[2rem] text-center">
                        {strategy.cravingAfter}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Effectiveness indicator */}
                {strategy.cravingBefore !== strategy.cravingAfter && (
                  <div className={`p-3 rounded-lg text-sm font-medium ${
                    strategy.cravingBefore > strategy.cravingAfter 
                      ? 'bg-success/10 text-success border border-success/20' 
                      : strategy.cravingBefore < strategy.cravingAfter 
                      ? 'bg-destructive/10 text-destructive border border-destructive/20'
                      : 'bg-muted/50 text-muted-foreground'
                  }`}>
                    {strategy.cravingBefore > strategy.cravingAfter ? (
                      <>
                        <span className="material-icons text-sm mr-2">trending_down</span>
                        Efficace ! Réduction de {strategy.cravingBefore - strategy.cravingAfter} point(s)
                      </>
                    ) : strategy.cravingBefore < strategy.cravingAfter ? (
                      <>
                        <span className="material-icons text-sm mr-2">trending_up</span>
                        Attention ! Augmentation de {strategy.cravingAfter - strategy.cravingBefore} point(s)
                      </>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between pt-6 border-t border-border">
          <Button
            onClick={addRow}
            variant="outline"
            className="flex items-center gap-2 h-12"
            data-testid="button-add-row"
          >
            <span className="material-icons text-sm">add</span>
            Ajouter une stratégie
          </Button>

          <Button
            onClick={handleSave}
            disabled={saveStrategiesMutation.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6"
            data-testid="button-save-strategies"
          >
            {saveStrategiesMutation.isPending ? (
              <>
                <span className="material-icons animate-spin mr-2 text-sm">refresh</span>
                Sauvegarde en cours...
              </>
            ) : (
              <>
                <span className="material-icons mr-2 text-sm">save</span>
                Enregistrer dans l'onglet Suivi
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}