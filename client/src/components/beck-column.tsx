import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InsertBeckAnalysis } from "@shared/schema";

interface BeckColumnProps {
  userId: string;
  onSuccess?: () => void;
}

export function BeckColumn({ userId, onSuccess }: BeckColumnProps) {
  const [situation, setSituation] = useState("");
  const [automaticThoughts, setAutomaticThoughts] = useState("");
  const [emotions, setEmotions] = useState("");
  const [emotionIntensity, setEmotionIntensity] = useState(5);
  const [rationalResponse, setRationalResponse] = useState("");
  const [newFeeling, setNewFeeling] = useState("");
  const [newIntensity, setNewIntensity] = useState(5);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createBeckAnalysisMutation = useMutation({
    mutationFn: async (data: InsertBeckAnalysis) => {
      try {
        const response = await apiRequest("POST", "/api/beck-analyses", data);
        const result = await response.json();
        console.log('Beck analysis created successfully:', result);
        return result;
      } catch (error: any) {
        console.error('Error creating Beck analysis:', error);
        throw new Error(error.message || 'Erreur lors de la création de l\'analyse Beck');
      }
    },
    onSuccess: () => {
      toast({
        title: "Analyse sauvegardée",
        description: "Votre analyse cognitive a été sauvegardée avec succès.",
      });
      // Invalidation plus large pour s'assurer que toutes les données sont actualisées
      queryClient.invalidateQueries({ queryKey: ["/api/beck-analyses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/stats"] });
      queryClient.invalidateQueries({ queryKey: ["beck-analyses"] });
      queryClient.invalidateQueries({ queryKey: ["users", "stats"] });
      // Vider le formulaire après sauvegarde réussie
      clearForm();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'analyse. Veuillez réessayer.",
        variant: "destructive",
      });
      console.error("Error creating Beck analysis:", error);
    },
  });

  const handleSubmit = () => {
    if (!situation.trim() || !automaticThoughts.trim() || !emotions.trim()) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir au moins les 3 premières colonnes.",
        variant: "destructive",
      });
      return;
    }

    createBeckAnalysisMutation.mutate({
      userId,
      situation: situation.trim(),
      automaticThoughts: automaticThoughts.trim(),
      emotions: emotions.trim(),
      emotionIntensity,
      rationalResponse: rationalResponse.trim() || null,
      newFeeling: newFeeling.trim() || null,
      newIntensity: newFeeling.trim() ? newIntensity : null,
    });
  };

  const clearForm = () => {
    setSituation("");
    setAutomaticThoughts("");
    setEmotions("");
    setEmotionIntensity(5);
    setRationalResponse("");
    setNewFeeling("");
    setNewIntensity(5);
  };

  return (
    <Card className="shadow-material" data-testid="card-beck-column">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-medium">
          <span className="material-icons mr-2 text-primary">psychology</span>
          Colonne de Beck - Analyse Cognitive
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Analysez vos pensées et émotions pour mieux comprendre vos réactions.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Étape 1 & 2: Situation et Pensées */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">1</span>
                  Situation déclenchante
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-muted-foreground p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <strong>Exemples :</strong><br/>
                  • "J'ai vu mon dealer dans la rue"<br/>
                  • "Mon conjoint m'a critiqué"<br/>
                  • "Je me suis disputé avec un ami"<br/>
                  • "J'ai reçu une mauvaise nouvelle au travail"
                </div>
                <textarea
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  className="w-full p-4 border border-input rounded-lg resize-none h-28 text-sm bg-background focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Décrivez la situation déclenchante de façon factuelle et objective..."
                  data-testid="textarea-situation"
                />
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">2</span>
                  Pensées automatiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-muted-foreground p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <strong>Exemples :</strong><br/>
                  • "Je n'y arriverai jamais"<br/>
                  • "Personne ne me comprend"<br/>
                  • "C'est trop dur, j'ai besoin de consommer"<br/>
                  • "Une seule fois ne changera rien"
                </div>
                <textarea
                  value={automaticThoughts}
                  onChange={(e) => setAutomaticThoughts(e.target.value)}
                  className="w-full p-4 border border-input rounded-lg resize-none h-28 text-sm bg-background focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  placeholder="Quelles pensées vous sont venues spontanément? (sans les censurer)"
                  data-testid="textarea-thoughts"
                />
              </CardContent>
            </Card>
          </div>

          {/* Étape 3: Émotions */}
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">3</span>
                Émotions ressenties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-xs text-muted-foreground p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <strong>Exemples :</strong><br/>
                • "Anxiété, peur du manque" • "Tristesse profonde, désespoir" • "Colère contre moi-même" • "Honte, culpabilité" • "Vide intérieur, solitude"
              </div>
              <textarea
                value={emotions}
                onChange={(e) => setEmotions(e.target.value)}
                className="w-full p-4 border border-input rounded-lg resize-none h-24 text-sm bg-background focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                placeholder="Nommez les émotions ressenties avec précision..."
                data-testid="textarea-emotions"
              />
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-muted-foreground min-w-fit">Intensité émotionnelle:</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={emotionIntensity}
                  onChange={(e) => setEmotionIntensity(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  data-testid="slider-emotion-intensity"
                />
                <span className="text-lg font-bold text-red-500 min-w-[2rem] text-center" data-testid="text-emotion-intensity">
                  {emotionIntensity}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Étape 4 & 5: Restructuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">4</span>
                  Réponses rationnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-muted-foreground p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <strong>Exemples :</strong><br/>
                  • "J'ai déjà surmonté des difficultés avant"<br/>
                  • "Cette émotion va passer, comme les autres"<br/>
                  • "Consommer ne résoudra pas mon problème"<br/>
                  • "Chaque jour sobre est une victoire"
                </div>
                <textarea
                  value={rationalResponse}
                  onChange={(e) => setRationalResponse(e.target.value)}
                  className="w-full p-4 border border-input rounded-lg resize-none h-28 text-sm bg-background focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  placeholder="Reformulez vos pensées de manière plus équilibrée et bienveillante..."
                  data-testid="textarea-rational-response"
                />
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">5</span>
                  Nouveau ressenti
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-muted-foreground p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <strong>Exemples :</strong><br/>
                  • "Plus calme, moins d'urgence"<br/>
                  • "Toujours triste mais avec de l'espoir"<br/>
                  • "Un peu soulagé(e), plus confiant(e)"
                </div>
                <textarea
                  value={newFeeling}
                  onChange={(e) => setNewFeeling(e.target.value)}
                  className="w-full p-4 border border-input rounded-lg resize-none h-24 text-sm bg-background focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  placeholder="Décrivez votre nouvel état émotionnel après la restructuration..."
                  data-testid="textarea-new-feeling"
                />
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-muted-foreground min-w-fit">Nouvelle intensité:</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={newIntensity}
                    onChange={(e) => setNewIntensity(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    data-testid="slider-new-intensity"
                  />
                  <span className="text-lg font-bold text-purple-500 min-w-[2rem] text-center" data-testid="text-new-intensity">
                    {newIntensity}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparaison des intensités */}
          {emotionIntensity !== newIntensity && emotions.trim() && newFeeling.trim() && (
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-center space-x-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Émotion initiale</div>
                    <div className="text-2xl font-bold text-red-500">{emotionIntensity}/10</div>
                  </div>
                  <div className="flex items-center">
                    <span className="material-icons text-3xl text-primary">arrow_forward</span>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Après restructuration</div>
                    <div className="text-2xl font-bold text-purple-500">{newIntensity}/10</div>
                  </div>
                  <div className="text-center">
                    {emotionIntensity > newIntensity ? (
                      <div className="text-success font-medium">
                        <span className="material-icons text-sm">trending_down</span>
                        Amélioration de {emotionIntensity - newIntensity} point(s)
                      </div>
                    ) : emotionIntensity < newIntensity ? (
                      <div className="text-warning font-medium">
                        <span className="material-icons text-sm">trending_up</span>
                        Augmentation de {newIntensity - emotionIntensity} point(s)
                      </div>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={clearForm}
            data-testid="button-clear-beck"
          >
            Effacer
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createBeckAnalysisMutation.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="button-save-beck"
          >
            {createBeckAnalysisMutation.isPending ? "Sauvegarde..." : "Sauvegarder l'Analyse"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
