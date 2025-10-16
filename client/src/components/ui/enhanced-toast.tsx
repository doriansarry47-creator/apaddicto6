import React from 'react';
import { toast as sonnerToast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, Info, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
}

export interface AnimatedToastOptions extends ToastOptions {
  animation?: 'slide' | 'bounce' | 'fade' | 'scale';
  confetti?: boolean;
  sound?: boolean;
  haptic?: boolean;
}

class EnhancedToastSystem {
  
  // Toast de succès avec animation de celebration
  success(options: AnimatedToastOptions) {
    this.playFeedback(options);
    
    return sonnerToast.success(options.title, {
      description: options.description,
      duration: options.duration || 4000,
      dismissible: options.dismissible ?? true,
      action: options.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined,
      className: cn(
        "border-green-200 bg-green-50 text-green-800",
        this.getAnimationClass(options.animation || 'slide')
      ),
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
    });
  }

  // Toast d'erreur avec animation shake
  error(options: AnimatedToastOptions) {
    this.playFeedback({ ...options, sound: options.sound ?? true, haptic: true });
    
    return sonnerToast.error(options.title, {
      description: options.description,
      duration: options.duration || 5000,
      dismissible: options.dismissible ?? true,
      action: options.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined,
      className: cn(
        "border-red-200 bg-red-50 text-red-800 animate-shake",
        this.getAnimationClass(options.animation || 'bounce')
      ),
      icon: <XCircle className="h-5 w-5 text-red-600" />,
    });
  }

  // Toast d'avertissement
  warning(options: AnimatedToastOptions) {
    this.playFeedback(options);
    
    return sonnerToast.warning(options.title, {
      description: options.description,
      duration: options.duration || 4000,
      dismissible: options.dismissible ?? true,
      action: options.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined,
      className: cn(
        "border-yellow-200 bg-yellow-50 text-yellow-800",
        this.getAnimationClass(options.animation || 'slide')
      ),
      icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
    });
  }

  // Toast d'information
  info(options: AnimatedToastOptions) {
    this.playFeedback(options);
    
    return sonnerToast.info(options.title, {
      description: options.description,
      duration: options.duration || 3000,
      dismissible: options.dismissible ?? true,
      action: options.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined,
      className: cn(
        "border-blue-200 bg-blue-50 text-blue-800",
        this.getAnimationClass(options.animation || 'fade')
      ),
      icon: <Info className="h-5 w-5 text-blue-600" />,
    });
  }

  // Toast de chargement avec spinner
  loading(options: AnimatedToastOptions & { loadingText?: string }) {
    return sonnerToast.loading(options.title, {
      description: options.description || options.loadingText || 'Traitement en cours...',
      duration: options.duration || Infinity,
      dismissible: options.dismissible ?? false,
      className: cn(
        "border-gray-200 bg-gray-50 text-gray-800",
        this.getAnimationClass(options.animation || 'slide')
      ),
      icon: <Loader2 className="h-5 w-5 text-gray-600 animate-spin" />,
    });
  }

  // Toast personnalisé avec celebration
  celebrate(options: AnimatedToastOptions & { celebrationText?: string }) {
    this.playFeedback({ ...options, confetti: true, haptic: true });
    
    // Effet confettis (simulation - en production utiliser canvas-confetti)
    if (options.confetti) {
      this.triggerConfetti();
    }
    
    return sonnerToast.success(options.title, {
      description: options.description || options.celebrationText || 'Félicitations ! 🎉',
      duration: options.duration || 5000,
      dismissible: options.dismissible ?? true,
      action: options.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined,
      className: cn(
        "border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-800",
        "animate-bounce",
        this.getAnimationClass('bounce')
      ),
      icon: (
        <div className="relative">
          <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
          <div className="absolute -top-1 -right-1 h-2 w-2 bg-yellow-400 rounded-full animate-ping"></div>
        </div>
      ),
    });
  }

  // Toast de mise à jour en temps réel
  update(toastId: string | number, options: AnimatedToastOptions) {
    return sonnerToast.success(options.title, {
      id: toastId,
      description: options.description,
      duration: options.duration || 3000,
      className: this.getAnimationClass('scale')
    });
  }

  // Fermer un toast spécifique
  dismiss(toastId?: string | number) {
    return sonnerToast.dismiss(toastId);
  }

  // Fermer tous les toasts
  dismissAll() {
    return sonnerToast.dismiss();
  }

  private getAnimationClass(animation: string): string {
    switch (animation) {
      case 'bounce':
        return 'animate-bounce';
      case 'fade':
        return 'animate-fade-in';
      case 'scale':
        return 'animate-scale-in';
      case 'slide':
      default:
        return 'animate-slide-in-right';
    }
  }

  private playFeedback(options: AnimatedToastOptions) {
    // Feedback haptique
    if (options.haptic && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }

    // Feedback sonore (simulation)
    if (options.sound) {
      console.log('🔊 Playing toast sound feedback');
      // En production : utiliser Web Audio API pour jouer des sons
    }
  }

  private triggerConfetti() {
    console.log('🎉 Triggering confetti animation');
    // En production : utiliser canvas-confetti ou une librairie similaire
    // Simulation d'effet confettis
    const confettiColors = ['#f43f5e', '#8b5cf6', '#06d6a0', '#ffd60a', '#f72585'];
    
    // Créer des éléments confettis temporaires
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'fixed pointer-events-none z-[9999]';
      confetti.style.cssText = `
        width: 8px;
        height: 8px;
        background: ${confettiColors[Math.floor(Math.random() * confettiColors.length)]};
        left: ${Math.random() * window.innerWidth}px;
        top: -10px;
        border-radius: 50%;
        animation: confetti-fall 3s linear forwards;
      `;
      
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        confetti.remove();
      }, 3000);
    }
  }
}

// Instance globale du système de toast
export const enhancedToast = new EnhancedToastSystem();

// Hook React pour utiliser les toasts avec état
export const useEnhancedToast = () => {
  const [activeToasts, setActiveToasts] = React.useState<(string | number)[]>([]);

  const success = (options: AnimatedToastOptions) => {
    const id = enhancedToast.success(options);
    setActiveToasts(prev => [...prev, id]);
    return id;
  };

  const error = (options: AnimatedToastOptions) => {
    const id = enhancedToast.error(options);
    setActiveToasts(prev => [...prev, id]);
    return id;
  };

  const warning = (options: AnimatedToastOptions) => {
    const id = enhancedToast.warning(options);
    setActiveToasts(prev => [...prev, id]);
    return id;
  };

  const info = (options: AnimatedToastOptions) => {
    const id = enhancedToast.info(options);
    setActiveToasts(prev => [...prev, id]);
    return id;
  };

  const loading = (options: AnimatedToastOptions) => {
    const id = enhancedToast.loading(options);
    setActiveToasts(prev => [...prev, id]);
    return id;
  };

  const celebrate = (options: AnimatedToastOptions) => {
    const id = enhancedToast.celebrate(options);
    setActiveToasts(prev => [...prev, id]);
    return id;
  };

  const dismiss = (toastId: string | number) => {
    enhancedToast.dismiss(toastId);
    setActiveToasts(prev => prev.filter(id => id !== toastId));
  };

  const dismissAll = () => {
    enhancedToast.dismissAll();
    setActiveToasts([]);
  };

  return {
    success,
    error,
    warning,
    info,
    loading,
    celebrate,
    dismiss,
    dismissAll,
    activeToasts
  };
};