import { useLocation } from "wouter";
import { Navigation } from "@/components/navigation";
import { StrategiesBox } from "@/components/strategies-box";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthQuery } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function StrategiesPage() {
  const [, setLocation] = useLocation();
  const { data: authenticatedUser, isLoading } = useAuthQuery();
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: "Stratégie enregistrée",
      description: "Votre stratégie anti-craving a été ajoutée à votre boîte à outils personnelle.",
    });
    // Retour automatique vers la page précédente après 2 secondes
    setTimeout(() => {
      setLocation("/");
    }, 2000);
  };

  const handleCancel = () => {
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!authenticatedUser) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-bold text-destructive mb-4">Accès non autorisé</h2>
            <p className="text-muted-foreground">Veuillez vous connecter pour accéder à la boîte à stratégies.</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        {/* Page Header */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-warning mb-2">
                Boîte à Stratégies Anti-Craving
              </h1>
              <p className="text-muted-foreground">
                Testez et évaluez l'efficacité de différentes stratégies pour gérer vos cravings.
              </p>
            </div>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex items-center gap-2"
            >
              <span className="material-icons text-sm">arrow_back</span>
              Retour
            </Button>
          </div>
        </section>

        {/* Method Explanation */}
        <section className="mb-6">
          <Card className="border-warning/20 bg-warning/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <span className="material-icons text-warning">fitness_center</span>
                <div>
                  <h3 className="font-medium text-foreground mb-3">Comment utiliser la Boîte à Stratégies</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs px-2 py-1 min-w-fit">1</Badge>
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Évaluez votre craving initial</h4>
                        <p className="text-muted-foreground text-xs">Notez votre niveau de craving avant la stratégie</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs px-2 py-1 min-w-fit">2</Badge>
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Choisissez une stratégie</h4>
                        <p className="text-muted-foreground text-xs">Sélectionnez l'exercice selon votre contexte</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs px-2 py-1 min-w-fit">3</Badge>
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Pratiquez la stratégie</h4>
                        <p className="text-muted-foreground text-xs">Appliquez l'exercice avec attention</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs px-2 py-1 min-w-fit">4</Badge>
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Réévaluez votre craving</h4>
                        <p className="text-muted-foreground text-xs">Mesurez l'efficacité de la stratégie</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Main Form */}
        <section>
          <StrategiesBox
            userId={authenticatedUser.id}
            onSuccess={handleSuccess}
          />
        </section>

        {/* Benefits and Context Guide */}
        <section className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-material">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <span className="material-icons mr-2 text-success">emoji_events</span>
                  Construisez votre Boîte à Outils
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="material-icons text-xs text-success mt-0.5">psychology</span>
                    <div>
                      <p className="font-medium text-foreground">Stratégies personnalisées</p>
                      <p className="text-muted-foreground text-xs">Découvrez quelles techniques fonctionnent le mieux pour vous</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="material-icons text-xs text-success mt-0.5">analytics</span>
                    <div>
                      <p className="font-medium text-foreground">Suivi de l'efficacité</p>
                      <p className="text-muted-foreground text-xs">Mesurez l'impact réel de chaque stratégie sur vos cravings</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="material-icons text-xs text-success mt-0.5">trending_up</span>
                    <div>
                      <p className="font-medium text-foreground">Amélioration continue</p>
                      <p className="text-muted-foreground text-xs">Adaptez vos stratégies selon les contextes et situations</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-material">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <span className="material-icons mr-2 text-info">place</span>
                  Guide des Contextes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">🏠 Domicile</Badge>
                      <span className="font-medium text-foreground">Environnement calme</span>
                    </div>
                    <p className="text-muted-foreground text-xs">Exercices de relaxation, méditation, activités créatives</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">💼 Travail</Badge>
                      <span className="font-medium text-foreground">Discrétion nécessaire</span>
                    </div>
                    <p className="text-muted-foreground text-xs">Techniques de respiration, exercices mentaux, pauses courtes</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">🎯 Loisirs</Badge>
                      <span className="font-medium text-foreground">Contexte social</span>
                    </div>
                    <p className="text-muted-foreground text-xs">Activités de substitution, techniques de distraction</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quick Tips */}
        <section className="mt-6">
          <Card className="shadow-material border-info/20 bg-info/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <span className="material-icons text-info">lightbulb</span>
                <div>
                  <h3 className="font-medium text-foreground mb-2">💡 Conseils pour maximiser l'efficacité</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <p>• Testez plusieurs stratégies dans le même contexte</p>
                      <p>• Notez vos observations personnelles</p>
                      <p>• Soyez patient avec le processus d'apprentissage</p>
                    </div>
                    <div>
                      <p>• Variez l'effort requis selon votre énergie du moment</p>
                      <p>• Consultez régulièrement vos stratégies les plus efficaces</p>
                      <p>• Adaptez les durées selon vos contraintes</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}