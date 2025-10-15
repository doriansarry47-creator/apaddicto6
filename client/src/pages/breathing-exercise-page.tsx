import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import HeartCoherenceExercise from '@/components/interactive-exercises/HeartCoherenceExercise';
import TriangleBreathingExercise from '@/components/interactive-exercises/TriangleBreathingExercise';
import SquareBreathingExercise from '@/components/interactive-exercises/SquareBreathingExercise';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function BreathingExercisePage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const pattern = params.pattern as string;
  const [isCompleted, setIsCompleted] = useState(false);

  // Récupérer sessionId depuis l'URL si présent
  const searchParams = new URLSearchParams(window.location.search);
  const sessionId = searchParams.get('sessionId');

  const getExerciseComponent = () => {
    const handleComplete = (duration: number) => {
      setIsCompleted(true);
      toast({
        title: '✅ Exercice terminé !',
        description: `Bravo ! Vous avez complété ${Math.round(duration / 60)} minutes de respiration.`,
      });

      // TODO: Enregistrer la séance dans l'historique si sessionId est présent
      if (sessionId) {
        // Envoyer au serveur
        console.log('Session completed:', { sessionId, duration });
      }
    };

    const handleStart = () => {
      console.log('Exercise started:', pattern);
    };

    const handleStop = () => {
      console.log('Exercise stopped:', pattern);
    };

    switch (pattern) {
      case 'coherence':
        return (
          <HeartCoherenceExercise
            onComplete={handleComplete}
            onStart={handleStart}
            onStop={handleStop}
          />
        );
      case 'triangle':
        return (
          <TriangleBreathingExercise
            onComplete={handleComplete}
            onStart={handleStart}
            onStop={handleStop}
          />
        );
      case 'square':
        return (
          <SquareBreathingExercise
            onComplete={handleComplete}
            onStart={handleStart}
            onStop={handleStop}
          />
        );
      default:
        return (
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-xl font-semibold mb-4">Exercice non trouvé</h3>
              <p className="text-muted-foreground">Le type d'exercice "{pattern}" n'existe pas.</p>
              <Button onClick={() => setLocation('/library-exercises')} className="mt-4">
                Retour à la bibliothèque
              </Button>
            </CardContent>
          </Card>
        );
    }
  };

  const getExerciseTitle = () => {
    switch (pattern) {
      case 'coherence':
        return '💙 Cohérence Cardiaque';
      case 'triangle':
        return '💚 Respiration Triangulaire';
      case 'square':
        return '💜 Respiration Carrée';
      default:
        return 'Exercice de respiration';
    }
  };

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/library-exercises')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la bibliothèque
            </Button>
            <h1 className="text-3xl font-bold">{getExerciseTitle()}</h1>
            <Badge className="mt-2 bg-cyan-100 text-cyan-800">
              🧘 Respiration & Relaxation
            </Badge>
          </div>
          
          {isCompleted && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              <span className="font-semibold">Terminé !</span>
            </div>
          )}
        </div>

        {/* Exercise Component */}
        <div className="max-w-4xl mx-auto">
          {getExerciseComponent()}
        </div>

        {/* Information complémentaire */}
        {isCompleted && (
          <Card className="mt-6 max-w-4xl mx-auto border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Excellent travail !
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Vous avez terminé votre exercice de respiration. Ces techniques sont excellentes pour :
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Réduire le stress et l'anxiété</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Améliorer la concentration et la clarté mentale</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Réguler le système nerveux autonome</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Gérer les cravings et envies compulsives</span>
                </li>
              </ul>
              <div className="mt-6 flex gap-3">
                <Button onClick={() => setLocation('/library-exercises')} variant="outline">
                  Explorer d'autres exercices
                </Button>
                <Button onClick={() => window.location.reload()} className="bg-primary">
                  Recommencer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
