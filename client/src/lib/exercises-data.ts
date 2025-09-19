export interface Exercise {
  id: string;
  title: string;
  description: string;
  category: 'craving_reduction' | 'relaxation' | 'energy_boost' | 'emotion_management';
  level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
  duration: number; // in minutes
  intensity: 'gentle' | 'moderate' | 'dynamic';
  type: 'physical' | 'breathing' | 'relaxation' | 'emergency';
  imageUrl: string;
  instructions: string[];
  benefits: string[];
}

export const exercises: Exercise[] = [
  // Beginner Level Exercises
  {
    id: 'gentle-stretching',
    title: 'Étirements Doux Anti-Stress',
    description: 'Séquence d\'étirements simples pour apaiser le système nerveux et réduire les tensions.',
    category: 'cardio',
    level: 'beginner',
    duration: 5,
    intensity: 'gentle',
    type: 'physical',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: [
      'Asseyez-vous confortablement ou tenez-vous debout',
      'Roulez lentement les épaules vers l\'arrière 5 fois',
      'Étirez doucement le cou de chaque côté',
      'Levez les bras au-dessus de la tête et étirez-vous',
      'Penchez-vous légèrement vers l\'avant pour étirer le dos'
    ],
    benefits: [
      'Réduction du stress physique',
      'Diminution des tensions musculaires',
      'Amélioration de la circulation',
      'Effet calmant sur le système nerveux'
    ]
  },
  {
    id: 'breathing-coherence',
    title: 'Respiration Cohérence Cardiaque',
    description: 'Technique de respiration guidée pour réguler le système nerveux et réduire l\'anxiété.',
    category: 'mindfulness',
    level: 'all_levels',
    duration: 6,
    intensity: 'gentle',
    type: 'breathing',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: [
      'Installez-vous confortablement, dos droit',
      'Inspirez lentement par le nez pendant 5 secondes',
      'Expirez doucement par la bouche pendant 5 secondes',
      'Répétez ce rythme pendant 6 minutes',
      'Focalisez-vous sur votre cœur pendant l\'exercice'
    ],
    benefits: [
      'Régulation du rythme cardiaque',
      'Réduction de l\'anxiété',
      'Amélioration de la concentration',
      'Activation du système parasympathique'
    ]
  },

  // Intermediate Level Exercises
  {
    id: 'cardio-circuit',
    title: 'Circuit Cardio Doux',
    description: 'Enchaînement de mouvements pour activer la circulation et libérer les endorphines.',
    category: 'cardio',
    level: 'intermediate',
    duration: 8,
    intensity: 'moderate',
    type: 'physical',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: [
      'Échauffement : marchez sur place 1 minute',
      '30 secondes de montées de genoux',
      '30 secondes de talons-fesses',
      '1 minute de squats légers',
      '30 secondes d\'étirements pour récupérer'
    ],
    benefits: [
      'Libération d\'endorphines',
      'Amélioration de l\'humeur',
      'Réduction du stress',
      'Activation métabolique'
    ]
  },
  {
    id: 'yoga-relaxation',
    title: 'Yoga Relaxation Progressive',
    description: 'Enchaînement de postures douces pour la détente musculaire et mentale profonde.',
    category: 'relaxation',
    level: 'beginner',
    duration: 10,
    intensity: 'gentle',
    type: 'relaxation',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: [
      'Commencez en position debout, pieds parallèles',
      'Passez en posture de l\'enfant pendant 2 minutes',
      'Enchaînez avec la posture du chat-vache',
      'Terminez par la posture du cadavre',
      'Respirez profondément tout au long de l\'exercice'
    ],
    benefits: [
      'Relaxation musculaire profonde',
      'Réduction du stress mental',
      'Amélioration de la flexibilité',
      'Centrage et ancrage'
    ]
  },

  // Advanced Level Exercises
  {
    id: 'hiit-anti-craving',
    title: 'HIIT Anti-Craving',
    description: 'Entraînement intensif pour une libération maximale d\'endorphines et réduction rapide du craving.',
    category: 'cardio',
    level: 'advanced',
    duration: 12,
    intensity: 'dynamic',
    type: 'physical',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: [
      'Échauffement : 2 minutes de cardio léger',
      '30 secondes de burpees, 30 secondes de repos',
      '30 secondes de jumping jacks, 30 secondes de repos',
      '30 secondes de mountain climbers, 30 secondes de repos',
      'Répétez le circuit 3 fois, puis récupération'
    ],
    benefits: [
      'Libération massive d\'endorphines',
      'Réduction rapide du craving',
      'Amélioration de la condition physique',
      'Effet antidépresseur naturel'
    ]
  },

  // Emergency Routine
  {
    id: 'emergency-routine',
    title: 'Routine Urgence Anti-Craving',
    description: 'Séquence rapide et efficace pour casser immédiatement un pic de craving intense.',
    category: 'cardio',
    level: 'all_levels',
    duration: 3,
    intensity: 'moderate',
    type: 'emergency',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: [
      '10 respirations profondes et rapides',
      '30 secondes de sautillements sur place',
      '20 squats rapides',
      '10 respirations de récupération',
      'Évaluation de votre état'
    ],
    benefits: [
      'Interruption immédiate du craving',
      'Libération rapide d\'endorphines',
      'Recentrage mental',
      'Activation du système nerveux sympathique'
    ]
  },

  // Energy Boost Exercises
  {
    id: 'morning-energizer',
    title: 'Réveil Énergisant',
    description: 'Routine matinale pour commencer la journée avec énergie et motivation.',
    category: 'strength',
    level: 'intermediate',
    duration: 7,
    intensity: 'moderate',
    type: 'physical',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: [
      'Réveil articulaire : rotation des articulations',
      '1 minute de marche dynamique',
      '20 squats avec bras levés',
      '30 secondes de jumping jacks',
      'Étirements dynamiques pour finir'
    ],
    benefits: [
      'Activation métabolique',
      'Amélioration de l\'humeur',
      'Boost d\'énergie naturel',
      'Préparation mentale positive'
    ]
  },

  // Emotion Management
  {
    id: 'anxiety-relief',
    title: 'Gestion de l\'Anxiété',
    description: 'Combinaison de mouvements et respiration pour gérer l\'anxiété et les émotions difficiles.',
    category: 'mindfulness',
    level: 'beginner',
    duration: 8,
    intensity: 'gentle',
    type: 'relaxation',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: [
      'Position confortable, yeux fermés',
      '3 minutes de respiration 4-7-8',
      'Visualisation d\'un lieu sûr',
      'Mouvements doux des bras et du corps',
      'Affirmations positives'
    ],
    benefits: [
      'Réduction de l\'anxiété',
      'Régulation émotionnelle',
      'Amélioration de l\'estime de soi',
      'Développement de la résilience'
    ]
  },

  // Relaxation Exercises
  {
    id: 'progressive-relaxation',
    title: 'Relaxation Musculaire Progressive',
    description: 'Technique de Jacobson pour relâcher toutes les tensions du corps.',
    category: 'relaxation',
    level: 'all_levels',
    duration: 15,
    intensity: 'gentle',
    type: 'relaxation',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: [
      'Allongez-vous confortablement',
      'Contractez et relâchez chaque groupe musculaire',
      'Commencez par les pieds, remontez jusqu\'à la tête',
      'Maintenez la contraction 5 secondes, relâchez 10 secondes',
      'Terminez par une relaxation complète'
    ],
    benefits: [
      'Relâchement des tensions physiques',
      'Amélioration du sommeil',
      'Réduction du stress chronique',
      'Conscience corporelle accrue'
    ]
  },
  
  // Additional Respiration Exercises for all levels
  {
    id: 'deep-breathing-beginner',
    title: 'Respiration Profonde - Débutant',
    description: 'Introduction à la respiration consciente pour calmer l\'esprit et réduire le stress.',
    category: 'respiration',
    level: 'beginner',
    duration: 5,
    intensity: 'gentle',
    type: 'breathing',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: [
      'Asseyez-vous confortablement, dos droit',
      'Placez une main sur le ventre, l\'autre sur la poitrine',
      'Inspirez lentement par le nez en gonflant le ventre',
      'Expirez doucement par la bouche',
      'Répétez pendant 5 minutes'
    ],
    benefits: [
      'Initiation à la respiration consciente',
      'Réduction du stress immédiate',
      'Amélioration de l\'oxygénation',
      'Base pour autres techniques respiratoires'
    ]
  },
  {
    id: '478-breathing-intermediate',
    title: 'Respiration 4-7-8 - Intermédiaire', 
    description: 'Technique avancée de respiration pour un apaisement profond et l\'amélioration du sommeil.',
    category: 'respiration',
    level: 'intermediate',
    duration: 8,
    intensity: 'moderate',
    type: 'breathing',
    imageUrl: 'https://images.unsplash.com/photo-1545389336-cf090694435e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: [
      'Position confortable, yeux fermés ou mi-clos',
      'Inspirez par le nez pendant 4 temps',
      'Retenez votre respiration pendant 7 temps',
      'Expirez par la bouche pendant 8 temps',
      'Répétez le cycle 4 à 8 fois'
    ],
    benefits: [
      'Activation du système parasympathique',
      'Amélioration de la qualité du sommeil',
      'Réduction de l\'anxiété profonde',
      'Régulation du système nerveux'
    ]
  },
  {
    id: 'alternate-nostril-advanced',
    title: 'Respiration Alternée - Avancé',
    description: 'Technique yogique sophistiquée pour équilibrer les énergies et améliorer la concentration.',
    category: 'respiration',
    level: 'advanced',
    duration: 12,
    intensity: 'moderate',
    type: 'breathing',
    imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: [
      'Position assise stable, colonne vertébrale droite',
      'Utilisez le pouce pour fermer la narine droite',
      'Inspirez par la narine gauche pendant 4 temps',
      'Fermez les deux narines, retenez 4 temps',
      'Ouvrez la narine droite, expirez 4 temps',
      'Inversez le processus et continuez l\'alternance'
    ],
    benefits: [
      'Équilibrage des hémisphères cérébraux',
      'Amélioration de la concentration',
      'Harmonisation du système nerveux',
      'Développement de la discipline respiratoire'
    ]
  },

  // Additional Relaxation Exercises for all levels
  {
    id: 'body-scan-beginner',
    title: 'Scan Corporel - Débutant',
    description: 'Découverte guidée des sensations du corps pour développer la conscience corporelle.',
    category: 'relaxation',
    level: 'beginner',
    duration: 8,
    intensity: 'gentle',
    type: 'relaxation',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: [
      'Allongez-vous confortablement sur le dos',
      'Fermez les yeux et respirez naturellement',
      'Portez votre attention sur vos pieds',
      'Remontez progressivement vers la tête',
      'Observez les sensations sans les juger'
    ],
    benefits: [
      'Développement de la conscience corporelle',
      'Réduction des tensions musculaires',
      'Amélioration de la présence',
      'Initiation à la méditation'
    ]
  },
  {
    id: 'visualization-intermediate',
    title: 'Visualisation Guidée - Intermédiaire',
    description: 'Voyage mental dans un lieu de paix pour une relaxation profonde et régénératrice.',
    category: 'relaxation',
    level: 'intermediate',
    duration: 12,
    intensity: 'gentle',
    type: 'relaxation',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: [
      'Position confortable, yeux fermés',
      'Imaginez votre lieu de paix idéal',
      'Explorez cet endroit avec tous vos sens',
      'Laissez-vous immerger dans cette atmosphère',
      'Ancrez cette sensation de bien-être'
    ],
    benefits: [
      'Évasion mentale régénératrice',
      'Stimulation de l\'imagination positive',
      'Réduction du stress psychologique',
      'Création d\'un refuge mental'
    ]
  },
  {
    id: 'meditation-advanced',
    title: 'Méditation Pleine Conscience - Avancé',
    description: 'Pratique approfondie de méditation pour cultiver la présence et la sérénité.',
    category: 'relaxation',
    level: 'advanced',
    duration: 20,
    intensity: 'gentle',
    type: 'relaxation',
    imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: [
      'Position de méditation stable et confortable',
      'Concentrez-vous sur votre respiration naturelle',
      'Observez les pensées sans vous y attacher',
      'Revenez à l\'instant présent à chaque distraction',
      'Maintenez cette présence attentive'
    ],
    benefits: [
      'Développement de la présence attentive',
      'Réduction de l\'agitation mentale',
      'Amélioration de la régulation émotionnelle',
      'Cultivation de la sérénité intérieure'
    ]
  }
];

export const categories = {
  cardio: 'Cardio Training',
  strength: 'Renforcement Musculaire',
  flexibility: 'Étirement & Flexibilité',
  mindfulness: 'Pleine Conscience & Méditation',
  relaxation: 'Relaxation',
  respiration: 'Exercices de Respiration'
} as const;

export const levels = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire', 
  advanced: 'Avancé',
  all_levels: 'Tous niveaux'
} as const;

export const intensities = {
  gentle: 'Douce',
  moderate: 'Modérée',
  dynamic: 'Dynamique'
} as const;

export function getExercisesByCategory(category: keyof typeof categories) {
  return exercises.filter(exercise => exercise.category === category);
}

export function getExercisesByLevel(level: keyof typeof levels) {
  return exercises.filter(exercise => exercise.level === level);
}

export function getEmergencyExercises() {
  return exercises.filter(exercise => exercise.type === 'emergency');
}

export function getExerciseById(id: string) {
  return exercises.find(exercise => exercise.id === id);
}
