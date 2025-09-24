#!/usr/bin/env node

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { exercises } from './shared/schema.js';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

const basicExercises = [
  {
    title: "Pompes classiques",
    description: "Exercice de base pour renforcer le haut du corps. Parfait pour commencer ou maintenir une routine d'exercice.",
    category: "energy_boost",
    difficulty: "beginner",
    duration: 10,
    instructions: "1. Placez-vous en position de planche\n2. Descendez lentement en fléchissant les bras\n3. Remontez en poussant\n4. Répétez 10-15 fois selon votre niveau",
    benefits: "Renforce les pectoraux, triceps et muscles stabilisateurs. Améliore l'estime de soi.",
    isActive: true,
    tags: ["force", "haut du corps", "simple"]
  },
  {
    title: "Squats",
    description: "Mouvement fondamental pour renforcer les jambes et les fessiers.",
    category: "energy_boost", 
    difficulty: "beginner",
    duration: 8,
    instructions: "1. Pieds écartés largeur d'épaules\n2. Descendez comme pour s'asseoir\n3. Gardez le dos droit\n4. Remontez en poussant sur les talons\n5. Répétez 15-20 fois",
    benefits: "Renforce les jambes, améliore la posture et libère des endorphines.",
    isActive: true,
    tags: ["jambes", "fessiers", "fonctionnel"]
  },
  {
    title: "Respiration carrée anti-stress",
    description: "Technique de respiration pour gérer l'anxiété et les envies compulsives.",
    category: "craving_reduction",
    difficulty: "beginner", 
    duration: 5,
    instructions: "1. Inspirez pendant 4 secondes\n2. Retenez votre souffle 4 secondes\n3. Expirez pendant 4 secondes\n4. Retenez poumons vides 4 secondes\n5. Répétez 5-10 cycles",
    benefits: "Calme le système nerveux, réduit l'anxiété et aide à gérer les cravings.",
    isActive: true,
    tags: ["respiration", "calme", "anxiété"]
  },
  {
    title: "Marche active 10 minutes",
    description: "Marche dynamique pour évacuer le stress et les tensions.",
    category: "emotion_management",
    difficulty: "beginner",
    duration: 10,
    instructions: "1. Sortez à l'extérieur si possible\n2. Marchez d'un bon pas\n3. Concentrez-vous sur votre respiration\n4. Observez votre environnement\n5. Restez dans l'instant présent",
    benefits: "Libère des endorphines, améliore l'humeur et aide à prendre du recul.",
    isActive: true,
    tags: ["cardio", "nature", "mindfulness"]
  },
  {
    title: "Étirements relaxants",
    description: "Séquence d'étirements doux pour détendre le corps et l'esprit.",
    category: "relaxation",
    difficulty: "beginner",
    duration: 15,
    instructions: "1. Étirez doucement votre nuque\n2. Roulez les épaules\n3. Étirez les bras et le torse\n4. Étirez les jambes\n5. Respirez profondément à chaque mouvement",
    benefits: "Relâche les tensions musculaires, améliore la flexibilité et favorise la détente.",
    isActive: true,
    tags: ["souplesse", "détente", "bien-être"]
  },
  {
    title: "Jumping Jacks énergisants",
    description: "Exercice cardiovasculaire simple pour booster l'énergie rapidement.",
    category: "energy_boost",
    difficulty: "beginner",
    duration: 5,
    instructions: "1. Position debout, bras le long du corps\n2. Sautez en écartant jambes et bras\n3. Revenez à la position initiale\n4. Maintenez un rythme soutenu\n5. Faites 30 secondes, repos 30 secondes, répétez 3-5 fois",
    benefits: "Améliore la circulation, libère des endorphines et boost l'énergie.",
    isActive: true,
    tags: ["cardio", "énergie", "simple"]
  }
];

async function createBasicExercises() {
  try {
    console.log('🏃‍♂️ Création des exercices de base...');
    
    // Vérifier si des exercices existent déjà
    const existingExercises = await db.select().from(exercises);
    console.log(`📊 ${existingExercises.length} exercice(s) trouvé(s) dans la base`);
    
    for (const exerciseData of basicExercises) {
      // Vérifier si l'exercice existe déjà
      const existing = existingExercises.find(ex => ex.title === exerciseData.title);
      
      if (existing) {
        console.log(`⏭️  Exercice "${exerciseData.title}" existe déjà, ignoré`);
        continue;
      }
      
      const result = await db.insert(exercises).values(exerciseData).returning();
      console.log(`✅ Exercice créé: "${result[0].title}" (${result[0].category})`);
    }
    
    const finalCount = await db.select().from(exercises);
    console.log(`🎯 Total d'exercices dans la base: ${finalCount.length}`);
    console.log('✅ Création des exercices terminée!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des exercices:', error);
    throw error;
  }
}

createBasicExercises().catch(console.error);