import { useLocation } from "wouter";
import { Navigation } from "@/components/navigation";
import { CravingEntry } from "@/components/craving-entry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthQuery } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function CravingEntryPage() {
  const [, setLocation] = useLocation();
  const { data: authenticatedUser, isLoading } = useAuthQuery();
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: "Craving enregistré",
      description: "Votre craving a été enregistré avec succès. Merci de partager votre ressenti.",
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
            <p className="text-muted-foreground">Veuillez vous connecter pour enregistrer un craving.</p>
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
              <h1 className="text-3xl font-bold text-primary mb-2">
                Enregistrer un Craving
              </h1>
              <p className="text-muted-foreground">
                Prenez un moment pour noter votre ressenti actuel et les éléments déclencheurs.
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

        {/* Instructions Card */}
        <section className="mb-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <span className="material-icons text-primary">info</span>
                <div>
                  <h3 className="font-medium text-foreground mb-2">Pourquoi enregistrer vos cravings ?</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Identifier les patterns et déclencheurs</li>
                    <li>• Suivre votre progression au fil du temps</li>
                    <li>• Mieux comprendre vos émotions</li>
                    <li>• Développer des stratégies personnalisées</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Main Form */}
        <section>
          <CravingEntry
            userId={authenticatedUser.id}
            onSuccess={handleSuccess}
          />
        </section>

        {/* Quick Access Tips */}
        <section className="mt-8">
          <Card className="shadow-material">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <span className="material-icons mr-2 text-secondary">tips_and_updates</span>
                Conseils Rapides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">⚡ En cas de craving intense :</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Prenez 3 respirations profondes</li>
                    <li>• Utilisez la routine d'urgence</li>
                    <li>• Contactez votre réseau de soutien</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">🎯 Après l'enregistrement :</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Consultez vos exercices personnalisés</li>
                    <li>• Explorez vos stratégies éprouvées</li>
                    <li>• Analysez vos progrès dans le suivi</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}