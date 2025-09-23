import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface UseAutoRefreshOptions {
  queryKeys: string[][];
  intervalMs?: number;
  enabled?: boolean;
  onRefresh?: () => void;
}

/**
 * Hook personnalisé pour actualiser automatiquement les données à intervalles réguliers
 */
export function useAutoRefresh({
  queryKeys,
  intervalMs = 30000, // 30 secondes par défaut
  enabled = true,
  onRefresh
}: UseAutoRefreshOptions) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || queryKeys.length === 0) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh des données...');
      
      // Invalider toutes les queries spécifiées
      queryKeys.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
      
      // Callback optionnel
      onRefresh?.();
    }, intervalMs);

    return () => {
      clearInterval(interval);
    };
  }, [queryClient, queryKeys, intervalMs, enabled, onRefresh]);
}

/**
 * Hook spécialisé pour l'actualisation des données du dashboard
 */
export function useDashboardAutoRefresh(enabled: boolean = true) {
  return useAutoRefresh({
    queryKeys: [
      ["dashboard", "stats"],
      ["cravings"],
      ["exercise-sessions"],
      ["strategies"],
      ["beck-analyses"]
    ],
    intervalMs: 30000, // 30 secondes
    enabled,
    onRefresh: () => {
      console.log('📊 Données du dashboard actualisées');
    }
  });
}

/**
 * Hook spécialisé pour l'actualisation des données de suivi
 */
export function useTrackingAutoRefresh(enabled: boolean = true) {
  return useAutoRefresh({
    queryKeys: [
      ["cravings"],
      ["exercise-sessions"],
      ["strategies"]
    ],
    intervalMs: 20000, // 20 secondes pour les données de suivi
    enabled,
    onRefresh: () => {
      console.log('📈 Données de suivi actualisées');
    }
  });
}

/**
 * Hook spécialisé pour l'actualisation des données admin
 */
export function useAdminAutoRefresh(enabled: boolean = true) {
  return useAutoRefresh({
    queryKeys: [
      ["admin", "dashboard"],
      ["admin", "exercises"],
      ["admin", "sessions"],
      ["admin", "patients"],
      ["admin", "patient-sessions"]
    ],
    intervalMs: 45000, // 45 secondes pour l'admin
    enabled,
    onRefresh: () => {
      console.log('⚙️ Données admin actualisées');
    }
  });
}