import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  Sparkles,
  CheckCircle,
  Award,
  Flame
} from 'lucide-react';

interface ProgressFeedbackProps {
  /** Valeur actuelle (0-100) */
  value: number;
  
  /** Valeur précédente pour animation de transition */
  previousValue?: number;
  
  /** Libellé de progression */
  label?: string;
  
  /** Paliers de récompense */
  milestones?: number[];
  
  /** Type de progression */
  type?: 'exercise' | 'session' | 'streak' | 'level' | 'points';
  
  /** Afficher les étincelles de celebration */
  showSparkles?: boolean;
  
  /** Animation de pulsation */
  pulse?: boolean;
  
  /** Taille du composant */
  size?: 'sm' | 'md' | 'lg';
  
  /** Callback quand un palier est atteint */
  onMilestoneReached?: (milestone: number) => void;
  
  /** Afficher les détails de progression */
  showDetails?: boolean;
}

export const ProgressFeedback: React.FC<ProgressFeedbackProps> = ({
  value,
  previousValue = 0,
  label,
  milestones = [25, 50, 75, 100],
  type = 'exercise',
  showSparkles = true,
  pulse = false,
  size = 'md',
  onMilestoneReached,
  showDetails = true
}) => {
  const [animatedValue, setAnimatedValue] = useState(previousValue);
  const [justReachedMilestone, setJustReachedMilestone] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Animer la progression
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
      
      // Vérifier si un palier a été atteint
      const reachedMilestone = milestones.find(
        milestone => value >= milestone && previousValue < milestone
      );
      
      if (reachedMilestone) {
        setJustReachedMilestone(reachedMilestone);
        setShowCelebration(true);
        onMilestoneReached?.(reachedMilestone);
        
        // Arrêter la célébration après 3 secondes
        setTimeout(() => {
          setShowCelebration(false);
          setJustReachedMilestone(null);
        }, 3000);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [value, previousValue, milestones, onMilestoneReached]);

  const getIcon = () => {
    switch (type) {
      case 'exercise':
        return <Target className="h-4 w-4" />;
      case 'session':
        return <CheckCircle className="h-4 w-4" />;
      case 'streak':
        return <Flame className="h-4 w-4" />;
      case 'level':
        return <Trophy className="h-4 w-4" />;
      case 'points':
        return <Star className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getProgressColor = () => {
    if (value >= 100) return 'from-green-500 to-emerald-500';
    if (value >= 75) return 'from-blue-500 to-cyan-500';
    if (value >= 50) return 'from-yellow-500 to-orange-500';
    if (value >= 25) return 'from-purple-500 to-pink-500';
    return 'from-gray-400 to-gray-500';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-3',
          progress: 'h-2',
          text: 'text-sm',
          icon: 'h-3 w-3'
        };
      case 'lg':
        return {
          container: 'p-6',
          progress: 'h-4',
          text: 'text-lg',
          icon: 'h-6 w-6'
        };
      default:
        return {
          container: 'p-4',
          progress: 'h-3',
          text: 'text-base',
          icon: 'h-4 w-4'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const nextMilestone = milestones.find(m => m > value);
  const completedMilestones = milestones.filter(m => m <= value);

  return (
    <div 
      className={cn(
        "relative bg-gradient-to-br from-white to-gray-50 rounded-lg border shadow-sm",
        "transition-all duration-300 ease-in-out",
        sizeClasses.container,
        pulse && "animate-pulse-glow",
        showCelebration && "animate-bounce border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50"
      )}
    >
      {/* Particules de celebration */}
      {showSparkles && showCelebration && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          {[...Array(8)].map((_, i) => (
            <Sparkles
              key={i}
              className={cn(
                "absolute h-4 w-4 text-yellow-400 animate-particle",
                `animation-delay-${i * 200}`
              )}
              style={{
                left: `${10 + i * 10}%`,
                top: `${20 + (i % 3) * 20}%`,
                animationDelay: `${i * 200}ms`
              }}
            />
          ))}
        </div>
      )}

      {/* En-tête */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-2 rounded-full bg-primary/10 text-primary",
            showCelebration && "bg-yellow-100 text-yellow-600"
          )}>
            {getIcon()}
          </div>
          <div>
            <h3 className={cn("font-semibold", sizeClasses.text)}>
              {label || 'Progression'}
            </h3>
            {showDetails && (
              <p className="text-sm text-muted-foreground">
                {Math.round(animatedValue)}% complété
              </p>
            )}
          </div>
        </div>
        
        {/* Badge de célébration */}
        {justReachedMilestone && (
          <Badge className="animate-badge-bounce bg-yellow-500 text-yellow-900">
            <Award className="h-3 w-3 mr-1" />
            {justReachedMilestone}% atteint !
          </Badge>
        )}
      </div>

      {/* Barre de progression */}
      <div className="space-y-2">
        <div className="relative">
          <Progress 
            value={animatedValue} 
            className={cn(
              sizeClasses.progress,
              "bg-gray-200 overflow-hidden"
            )}
          />
          
          {/* Overlay dégradé */}
          <div 
            className={cn(
              "absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out",
              `bg-gradient-to-r ${getProgressColor()}`,
              showCelebration && "animate-pulse"
            )}
            style={{ width: `${animatedValue}%` }}
          />
        </div>

        {/* Marqueurs de paliers */}
        {showDetails && (
          <div className="flex justify-between text-xs text-muted-foreground relative">
            {milestones.map((milestone) => (
              <div
                key={milestone}
                className={cn(
                  "flex flex-col items-center transition-all duration-300",
                  milestone <= value ? "text-primary font-medium" : ""
                )}
                style={{ position: 'absolute', left: `${milestone}%`, transform: 'translateX(-50%)' }}
              >
                <div className={cn(
                  "w-2 h-2 rounded-full border-2 mb-1 transition-all duration-300",
                  milestone <= value 
                    ? "bg-primary border-primary scale-125" 
                    : "bg-gray-200 border-gray-300"
                )} />
                <span>{milestone}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Informations de progression */}
      {showDetails && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              Paliers atteints: <span className="font-medium text-primary">{completedMilestones.length}</span>
            </span>
            {nextMilestone && (
              <span className="text-muted-foreground">
                Prochain: <span className="font-medium">{nextMilestone}%</span>
              </span>
            )}
          </div>
          
          {value >= 100 && (
            <div className="flex items-center gap-1 text-green-600 font-medium">
              <Trophy className="h-4 w-4" />
              Terminé !
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Hook pour gérer la progression automatique
export const useProgressFeedback = (initialValue = 0) => {
  const [progress, setProgress] = useState(initialValue);
  const [previousProgress, setPreviousProgress] = useState(initialValue);

  const updateProgress = (newValue: number) => {
    setPreviousProgress(progress);
    setProgress(Math.min(100, Math.max(0, newValue)));
  };

  const incrementProgress = (amount: number) => {
    updateProgress(progress + amount);
  };

  const resetProgress = () => {
    setPreviousProgress(progress);
    setProgress(0);
  };

  return {
    progress,
    previousProgress,
    updateProgress,
    incrementProgress,
    resetProgress
  };
};

// Composant pour afficher plusieurs progressions
export const ProgressDashboard: React.FC<{
  progressItems: Array<{
    id: string;
    label: string;
    value: number;
    previousValue?: number;
    type: ProgressFeedbackProps['type'];
    milestones?: number[];
  }>;
  onMilestoneReached?: (id: string, milestone: number) => void;
}> = ({ progressItems, onMilestoneReached }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {progressItems.map((item) => (
        <ProgressFeedback
          key={item.id}
          label={item.label}
          value={item.value}
          previousValue={item.previousValue}
          type={item.type}
          milestones={item.milestones}
          onMilestoneReached={(milestone) => onMilestoneReached?.(item.id, milestone)}
          size="sm"
        />
      ))}
    </div>
  );
};