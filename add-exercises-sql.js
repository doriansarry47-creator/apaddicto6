#!/usr/bin/env node

import pkg from 'pg';
import * as dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

const basicExercises = [
  {
    title: "Pompes classiques",
    description: "Exercice de base pour renforcer le haut du corps. Parfait pour commencer ou maintenir une routine d'exercice.",
    category: "energy_boost",
    difficulty: "beginner",
    duration: 10,
    instructions: "1. Placez-vous en position de planche\\n2. Descendez lentement en fléchissant les bras\\n3. Remontez en poussant\\n4. Répétez 10-15 fois selon votre niveau",
    benefits: "Renforce les pectoraux, triceps et muscles stabilisateurs. Améliore l'estime de soi.",
    tags: '["force", "haut du corps", "simple"]'
  },
  {
    title: "Squats",
    description: "Mouvement fondamental pour renforcer les jambes et les fessiers.",
    category: "energy_boost", 
    difficulty: "beginner",
    duration: 8,
    instructions: "1. Pieds écartés largeur d'épaules\\n2. Descendez comme pour s'asseoir\\n3. Gardez le dos droit\\n4. Remontez en poussant sur les talons\\n5. Répétez 15-20 fois",
    benefits: "Renforce les jambes, améliore la posture et libère des endorphines.",
    tags: '["jambes", "fessiers", "fonctionnel"]'
  },
  {
    title: "Respiration carrée anti-stress",
    description: "Technique de respiration pour gérer l'anxiété et les envies compulsives.",
    category: "craving_reduction",
    difficulty: "beginner", 
    duration: 5,
    instructions: "1. Inspirez pendant 4 secondes\\n2. Retenez votre souffle 4 secondes\\n3. Expirez pendant 4 secondes\\n4. Retenez poumons vides 4 secondes\\n5. Répétez 5-10 cycles",
    benefits: "Calme le système nerveux, réduit l'anxiété et aide à gérer les cravings.",
    tags: '["respiration", "calme", "anxiété"]'
  },
  {
    title: "Marche active 10 minutes",
    description: "Marche dynamique pour évacuer le stress et les tensions.",
    category: "emotion_management",
    difficulty: "beginner",
    duration: 10,
    instructions: "1. Sortez à l'extérieur si possible\\n2. Marchez d'un bon pas\\n3. Concentrez-vous sur votre respiration\\n4. Observez votre environnement\\n5. Restez dans l'instant présent",
    benefits: "Libère des endorphines, améliore l'humeur et aide à prendre du recul.",
    tags: '["cardio", "nature", "mindfulness"]'
  },
  {
    title: "Étirements relaxants",
    description: "Séquence d'étirements doux pour détendre le corps et l'esprit.",
    category: "relaxation",
    difficulty: "beginner",
    duration: 15,
    instructions: "1. Étirez doucement votre nuque\\n2. Roulez les épaules\\n3. Étirez les bras et le torse\\n4. Étirez les jambes\\n5. Respirez profondément à chaque mouvement",
    benefits: "Relâche les tensions musculaires, améliore la flexibilité et favorise la détente.",
    tags: '["souplesse", "détente", "bien-être"]'
  },
  {
    title: "Jumping Jacks énergisants",
    description: "Exercice cardiovasculaire simple pour booster l'énergie rapidement.",
    category: "energy_boost",
    difficulty: "beginner",
    duration: 5,
    instructions: "1. Position debout, bras le long du corps\\n2. Sautez en écartant jambes et bras\\n3. Revenez à la position initiale\\n4. Maintenez un rythme soutenu\\n5. Faites 30 secondes, repos 30 secondes, répétez 3-5 fois",
    benefits: "Améliore la circulation, libère des endorphines et boost l'énergie.",
    tags: '["cardio", "énergie", "simple"]'
  }
];

async function addExercises() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('🏃‍♂️ Ajout des exercices de base...');
    
    // Vérifier combien d'exercices existent
    const existingResult = await pool.query('SELECT COUNT(*) FROM exercises');
    const existingCount = parseInt(existingResult.rows[0].count);
    console.log(`📊 ${existingCount} exercice(s) trouvé(s) dans la base`);
    
    for (const exercise of basicExercises) {
      // Vérifier si l'exercice existe déjà
      const checkResult = await pool.query('SELECT id FROM exercises WHERE title = $1', [exercise.title]);
      
      if (checkResult.rows.length > 0) {
        console.log(`⏭️  Exercice "${exercise.title}" existe déjà, ignoré`);
        continue;
      }
      
      const insertResult = await pool.query(`
        INSERT INTO exercises (title, description, category, difficulty, duration, instructions, benefits, tags, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
        RETURNING id, title
      `, [
        exercise.title,
        exercise.description, 
        exercise.category,
        exercise.difficulty,
        exercise.duration,
        exercise.instructions,
        exercise.benefits,
        exercise.tags
      ]);
      
      console.log(`✅ Exercice créé: "${insertResult.rows[0].title}" (ID: ${insertResult.rows[0].id})`);
    }
    
    const finalResult = await pool.query('SELECT COUNT(*) FROM exercises');
    const finalCount = parseInt(finalResult.rows[0].count);
    console.log(`🎯 Total d'exercices dans la base: ${finalCount}`);
    console.log('✅ Ajout des exercices terminé!');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des exercices:', error);
  } finally {
    await pool.end();
  }
}

addExercises();