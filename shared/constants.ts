// Catégories d'exercices synchronisées entre admin et patient
export const EXERCISE_CATEGORIES = [
  { value: "craving_reduction", label: "Réduction Craving", icon: "🎯", color: "bg-red-100 text-red-800" },
  { value: "relaxation", label: "Relaxation", icon: "😌", color: "bg-blue-100 text-blue-800" },
  { value: "energy_boost", label: "Regain d'Énergie", icon: "⚡", color: "bg-yellow-100 text-yellow-800" },
  { value: "emotion_management", label: "Gestion Émotionnelle", icon: "💚", color: "bg-green-100 text-green-800" },
  { value: "strength", label: "Force & Musculation", icon: "💪", color: "bg-purple-100 text-purple-800" },
  { value: "cardio", label: "Cardio-vasculaire", icon: "❤️", color: "bg-pink-100 text-pink-800" },
  { value: "flexibility", label: "Flexibilité", icon: "🤸", color: "bg-indigo-100 text-indigo-800" },
  { value: "mindfulness", label: "Pleine Conscience", icon: "🧘", color: "bg-teal-100 text-teal-800" },
  { value: "general", label: "Général", icon: "📋", color: "bg-gray-100 text-gray-800" }
];

// Catégories de séances synchronisées
export const SESSION_CATEGORIES = [
  { value: "morning", label: "Séance Matinale", icon: "🌅", color: "bg-orange-100 text-orange-800" },
  { value: "evening", label: "Séance Soirée", icon: "🌙", color: "bg-purple-100 text-purple-800" },
  { value: "crisis", label: "Gestion de Crise", icon: "🚨", color: "bg-red-100 text-red-800" },
  { value: "maintenance", label: "Maintenance", icon: "🔧", color: "bg-blue-100 text-blue-800" },
  { value: "recovery", label: "Récupération", icon: "🔄", color: "bg-green-100 text-green-800" },
  { value: "energy", label: "Boost d'Énergie", icon: "⚡", color: "bg-yellow-100 text-yellow-800" },
  { value: "stress", label: "Anti-Stress", icon: "😌", color: "bg-teal-100 text-teal-800" },
  { value: "sleep", label: "Sommeil", icon: "😴", color: "bg-indigo-100 text-indigo-800" }
];

// Niveaux de difficulté
export const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Débutant", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "intermediate", label: "Intermédiaire", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "advanced", label: "Avancé", color: "bg-red-100 text-red-800 border-red-200" },
];

// Fonction utilitaire pour obtenir une catégorie par valeur
export function getCategoryByValue(value: string, categories = EXERCISE_CATEGORIES) {
  return categories.find(cat => cat.value === value) || { 
    value, 
    label: value, 
    icon: "📋", 
    color: "bg-gray-100 text-gray-800" 
  };
}

// Fonction utilitaire pour obtenir le niveau de difficulté
export function getDifficultyByValue(value: string) {
  return DIFFICULTY_LEVELS.find(level => level.value === value) || {
    value,
    label: value,
    color: "bg-gray-100 text-gray-800 border-gray-200"
  };
}

// Statuts de séances
export const SESSION_STATUSES = [
  { value: "draft", label: "Brouillon", color: "bg-gray-100 text-gray-800" },
  { value: "published", label: "Publiée", color: "bg-green-100 text-green-800" },
  { value: "archived", label: "Archivée", color: "bg-red-100 text-red-800" },
];

// Statuts des séances patients
export const PATIENT_SESSION_STATUSES = [
  { value: "assigned", label: "Assignée", color: "bg-blue-100 text-blue-800", icon: "📋" },
  { value: "in_progress", label: "En cours", color: "bg-yellow-100 text-yellow-800", icon: "⏳" },
  { value: "done", label: "Terminée", color: "bg-green-100 text-green-800", icon: "✅" },
  { value: "skipped", label: "Ignorée", color: "bg-red-100 text-red-800", icon: "⏭️" },
];

export function getStatusByValue(value: string, statuses = SESSION_STATUSES) {
  return statuses.find(status => status.value === value) || {
    value,
    label: value,
    color: "bg-gray-100 text-gray-800"
  };
}

// Protocoles d'entraînement avancés
export const TRAINING_PROTOCOLS = [
  { 
    value: "standard", 
    label: "Standard", 
    icon: "📋", 
    color: "bg-gray-100 text-gray-800",
    description: "Séance classique sans protocole spécifique"
  },
  { 
    value: "hiit", 
    label: "HIIT", 
    icon: "⚡", 
    color: "bg-red-100 text-red-800",
    description: "High Intensity Interval Training - Alternance haute intensité/repos"
  },
  { 
    value: "tabata", 
    label: "TABATA", 
    icon: "🔥", 
    color: "bg-orange-100 text-orange-800",
    description: "8 intervalles de 20s d'effort / 10s de repos"
  },
  { 
    value: "hict", 
    label: "HICT", 
    icon: "🧱", 
    color: "bg-purple-100 text-purple-800",
    description: "High Intensity Circuit Training - Circuit basé sur répétitions"
  },
  { 
    value: "emom", 
    label: "EMOM", 
    icon: "🕐", 
    color: "bg-blue-100 text-blue-800",
    description: "Every Minute On the Minute - Répétitions chaque minute"
  },
  { 
    value: "e2mom", 
    label: "E2MOM", 
    icon: "🕑", 
    color: "bg-cyan-100 text-cyan-800",
    description: "Every 2 Minutes On the Minute - Répétitions toutes les 2 minutes"
  },
  { 
    value: "amrap", 
    label: "AMRAP", 
    icon: "🔁", 
    color: "bg-green-100 text-green-800",
    description: "As Many Rounds As Possible - Maximum de tours en temps donné"
  },
];

// Fonction pour obtenir un protocole par valeur
export function getProtocolByValue(value: string) {
  return TRAINING_PROTOCOLS.find(protocol => protocol.value === value) || TRAINING_PROTOCOLS[0];
}