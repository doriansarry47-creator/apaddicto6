import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { PatientSessions } from "@/components/patient-sessions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuthQuery } from "@/hooks/use-auth";

// Interface pour les séances patients
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

export default function Exercises() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: user } = useAuthQuery();
  const [, setLocation] = useLocation();

  // Récupération des séances assignées au patient
  const { data: patientSessions, isLoading, error, refetch: refetchSessions } = useQuery<PatientSession[]>({
    queryKey: ['patient-sessions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/patient-sessions');
      return response.json();
    },
    initialData: [],
    staleTime: 30000, // 30 secondes au lieu de 0 pour réduire les requêtes
    refetchOnWindowFocus: true, // Rafraîchir quand l'utilisateur revient sur la page
    enabled: !!user && user.role === 'patient'
  });

  // Fonction pour terminer une séance
  const handleCompleteSession = async (sessionId: string, feedback: string, effort: number, duration: number) => {
    try {
      await apiRequest('POST', `/api/patient-sessions/${sessionId}/complete`, {
        feedback,
        effort,
        duration
      });
      await refetchSessions();
      toast({
        title: "Séance terminée !",
        description: "Votre feedback a été enregistré avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'enregistrement",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Fonction pour ignorer une séance
  const handleSkipSession = async (sessionId: string) => {
    try {
      await apiRequest('POST', `/api/patient-sessions/${sessionId}/skip`);
      await refetchSessions();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'action",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Démarrer une séance
  const handleStartSession = (sessionId: string) => {
    setLocation(`/session/${sessionId}`);
  };

  // Rafraîchir les séances
  const handleRefresh = () => {
    refetchSessions();
  };

  // Afficher la bibliothèque d'exercices pour les administrateurs, séances pour les patients
  if (user?.role === 'admin') {
    // Rediriger les administrateurs vers la gestion d'exercices
    window.location.href = '/admin/manage-exercises-sessions';
    return null;
  }

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement de vos séances...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-destructive mb-4">Erreur lors du chargement de vos séances</p>
              <Button onClick={handleRefresh}>Réessayer</Button>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <PatientSessions 
          sessions={patientSessions || []}
          onCompleteSession={handleCompleteSession}
          onSkipSession={handleSkipSession}
          onStartSession={handleStartSession}
          onRefresh={handleRefresh}
        />
      </main>
    </>
  );
}