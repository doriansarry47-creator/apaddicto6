import React, { useState } from 'react';
import { Button, ButtonProps } from './button';
import { cn } from '@/lib/utils';
import { Loader2, Check, X, Sparkles } from 'lucide-react';

export interface EnhancedButtonProps extends ButtonProps {
  /** État du bouton pour feedback visuel */
  state?: 'default' | 'loading' | 'success' | 'error';
  
  /** Animation de celebration lors du succès */
  celebrateOnSuccess?: boolean;
  
  /** Feedback haptique (si supporté) */
  hapticFeedback?: boolean;
  
  /** Pulse animation lors du hover */
  pulse?: boolean;
  
  /** Ripple effect au clic */
  ripple?: boolean;
  
  /** Son de feedback (optionnel) */
  soundFeedback?: 'click' | 'success' | 'error';
  
  /** Durée automatique de l'état success/error (ms) */
  autoResetDuration?: number;
}

export const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    children, 
    state = 'default',
    celebrateOnSuccess = false,
    hapticFeedback = false,
    pulse = true,
    ripple = true,
    soundFeedback,
    autoResetDuration = 2000,
    onClick,
    disabled,
    ...props 
  }, ref) => {
    const [internalState, setInternalState] = useState(state);
    const [isRippling, setIsRippling] = useState(false);
    const [rippleCoords, setRippleCoords] = useState({ x: 0, y: 0 });

    // Réinitialisation automatique après succès/erreur
    React.useEffect(() => {
      if ((internalState === 'success' || internalState === 'error') && autoResetDuration > 0) {
        const timer = setTimeout(() => {
          setInternalState('default');
        }, autoResetDuration);
        return () => clearTimeout(timer);
      }
    }, [internalState, autoResetDuration]);

    // Synchroniser avec l'état externe
    React.useEffect(() => {
      setInternalState(state);
    }, [state]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      // Effet ripple
      if (ripple && !disabled) {
        const rect = event.currentTarget.getBoundingClientRect();
        setRippleCoords({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
        setIsRippling(true);
        setTimeout(() => setIsRippling(false), 600);
      }

      // Feedback haptique
      if (hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(10); // Vibration courte
      }

      // Feedback sonore (simulation - en production utiliser Web Audio API)
      if (soundFeedback && 'AudioContext' in window) {
        // Ici on pourrait jouer des sons
        console.log(`🔊 Sound feedback: ${soundFeedback}`);
      }

      // Appel du handler original
      if (onClick && !disabled) {
        onClick(event);
      }
    };

    const getStateIcon = () => {
      switch (internalState) {
        case 'loading':
          return <Loader2 className="h-4 w-4 animate-spin" />;
        case 'success':
          return <Check className="h-4 w-4" />;
        case 'error':
          return <X className="h-4 w-4" />;
        default:
          return null;
      }
    };

    const getStateClasses = () => {
      const baseClasses = "transition-all duration-300 ease-in-out relative overflow-hidden";
      
      switch (internalState) {
        case 'loading':
          return cn(baseClasses, "cursor-wait opacity-80");
        case 'success':
          return cn(
            baseClasses, 
            "bg-green-500 hover:bg-green-600 border-green-500 text-white",
            celebrateOnSuccess && "animate-pulse"
          );
        case 'error':
          return cn(baseClasses, "bg-red-500 hover:bg-red-600 border-red-500 text-white animate-shake");
        default:
          return cn(
            baseClasses,
            pulse && "hover:scale-105 active:scale-95",
            "transform transition-transform duration-150"
          );
      }
    };

    const isDisabled = disabled || internalState === 'loading';
    const icon = getStateIcon();

    return (
      <Button
        ref={ref}
        className={cn(getStateClasses(), className)}
        onClick={handleClick}
        disabled={isDisabled}
        {...props}
      >
        {/* Effet ripple */}
        {ripple && isRippling && (
          <span
            className="absolute bg-white opacity-30 rounded-full animate-ping"
            style={{
              left: rippleCoords.x - 10,
              top: rippleCoords.y - 10,
              width: 20,
              height: 20,
            }}
          />
        )}
        
        {/* Confettis pour succès */}
        {celebrateOnSuccess && internalState === 'success' && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <Sparkles
                key={i}
                className={cn(
                  "absolute h-3 w-3 text-yellow-300 animate-bounce",
                  `animation-delay-${i * 100}`
                )}
                style={{
                  left: `${10 + i * 15}%`,
                  top: `${10 + (i % 2) * 20}%`,
                  animationDelay: `${i * 100}ms`
                }}
              />
            ))}
          </div>
        )}

        {/* Contenu du bouton */}
        <span className="flex items-center gap-2">
          {icon}
          {children}
        </span>
      </Button>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';

// Hook pour contrôler l'état du bouton depuis l'extérieur
export const useEnhancedButtonState = () => {
  const [state, setState] = useState<EnhancedButtonProps['state']>('default');

  const setLoading = () => setState('loading');
  const setSuccess = () => setState('success');
  const setError = () => setState('error');
  const reset = () => setState('default');

  return {
    state,
    setLoading,
    setSuccess,
    setError,
    reset,
    setState
  };
};