import { useLocation } from "wouter";
import { Navigation } from "@/components/navigation";
import { BeckColumn } from "@/components/beck-column";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthQuery } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function BeckAnalysisPage() {
  const [, setLocation] = useLocation();
  const { data: authenticatedUser, isLoading } = useAuthQuery();
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: "Analyse sauvegardée",
      description: "Votre analyse cognitive a été enregistrée. Excellente réflexion !",
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
            <p className="text-muted-foreground">Veuillez vous connecter pour effectuer une analyse Beck.</p>
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
              <h1 className="text-3xl font-bold text-secondary mb-2">
                Analyse Cognitive (Beck)
              </h1>
              <p className="text-muted-foreground">
                Identifiez et restructurez vos pensées automatiques pour mieux gérer vos émotions.
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
          <Card className="border-secondary/20 bg-secondary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <span className="material-icons text-secondary">psychology</span>
                <div>
                  <h3 className="font-medium text-foreground mb-3">La Méthode des Colonnes de Beck</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-foreground mb-1">1. Situation</h4>
                      <p className="text-muted-foreground">Décrivez objectivement la situation qui a déclenché vos émotions</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">2. Pensées Automatiques</h4>
                      <p className="text-muted-foreground">Identifiez les pensées qui vous sont venues spontanément</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">3. Réponse Rationnelle</h4>
                      <p className="text-muted-foreground">Reformulez avec une perspective plus équilibrée</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Main Form */}
        <section>
          <BeckColumn
            userId={authenticatedUser.id}
            onSuccess={handleSuccess}
          />
        </section>

        {/* Benefits and Tips */}
        <section className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-material">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <span className="material-icons mr-2 text-primary">lightbulb</span>
                  Bénéfices de l'Analyse Beck
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="material-icons text-xs text-success mt-0.5">check_circle</span>
                    <span>Prendre du recul sur les situations stressantes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-icons text-xs text-success mt-0.5">check_circle</span>
                    <span>Identifier les distorsions cognitives</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-icons text-xs text-success mt-0.5">check_circle</span>
                    <span>Développer des pensées plus équilibrées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-icons text-xs text-success mt-0.5">check_circle</span>
                    <span>Réduire l'intensité émotionnelle</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-icons text-xs text-success mt-0.5">check_circle</span>
                    <span>Prévenir les rechutes</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-material">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <span className="material-icons mr-2 text-warning">tips_and_updates</span>
                  Conseils d'Utilisation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="material-icons text-xs text-warning mt-0.5">star</span>
                    <span>Soyez le plus précis possible dans vos descriptions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-icons text-xs text-warning mt-0.5">star</span>
                    <span>Prenez votre temps pour identifier vos pensées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-icons text-xs text-warning mt-0.5">star</span>
                    <span>Cherchez des preuves pour et contre vos pensées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-icons text-xs text-warning mt-0.5">star</span>
                    <span>Utilisez cet outil dès que vous ressentez une émotion intense</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-icons text-xs text-warning mt-0.5">star</span>
                    <span>Relisez vos analyses passées pour voir vos progrès</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}