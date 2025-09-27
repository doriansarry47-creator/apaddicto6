const { Client } = require('pg');

// Configuration de la base de données
const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_vRJU7LlnYG1y@ep-soft-bush-ab0hbww0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require",
});

// Exercices de base pour les routines d'urgence
const emergencyExercises = [
  {
    title: "Jumping Jacks",
    description: "Écartés sautés pour activer tout le corps",
    category: "cardio",
    duration: 2,
    instructions: "Sautez en écartant bras et jambes, puis revenez en position initiale. Maintenez un rythme régulier.",
    benefits: "Active la circulation, libère des endorphines rapidement",
    difficulty: "beginner"
  },
  {
    title: "Pompes sur les genoux",
    description: "Version adaptée des pompes pour tous niveaux",
    category: "strength",
    duration: 2,
    instructions: "Genoux au sol, mains sous les épaules. Descendez la poitrine vers le sol puis remontez.",
    benefits: "Renforce le haut du corps, recentre l'attention",
    difficulty: "beginner"
  },
  {
    title: "Marche rapide sur place",
    description: "Activation cardio douce et accessible",
    category: "cardio",
    duration: 3,
    instructions: "Marchez énergiquement sur place en levant bien les genoux. Balancez les bras naturellement.",
    benefits: "Apaise l'agitation mentale, améliore la circulation",
    difficulty: "beginner"
  },
  {
    title: "Étirements dynamiques",
    description: "Mouvements d'étirement en mouvement",
    category: "flexibility",
    duration: 2,
    instructions: "Rotations des bras, flexions latérales, étirements du cou. Mouvements fluides et contrôlés.",
    benefits: "Détend les tensions, recentre l'esprit",
    difficulty: "beginner"
  },
  {
    title: "Mountain Climbers",
    description: "Exercice cardio intense",
    category: "cardio",
    duration: 1,
    instructions: "En position de planche, alternez rapidement les genoux vers la poitrine.",
    benefits: "Évacue l'énergie nerveuse, concentration intense",
    difficulty: "intermediate"
  },
  {
    title: "Gainage planche",
    description: "Renforcement du tronc en statique",
    category: "strength",
    duration: 1,
    instructions: "Maintenez la position planche, corps aligné des pieds à la tête.",
    benefits: "Force mentale, stabilité corporelle",
    difficulty: "intermediate"
  },
  {
    title: "Burpees simplifiés",
    description: "Version adaptée de l'exercice complet",
    category: "cardio",
    duration: 2,
    instructions: "Squat, position planche (sans saut), retour squat, saut vertical optionnel.",
    benefits: "Exercice complet, libération d'endorphines maximale",
    difficulty: "intermediate"
  },
  {
    title: "Respiration contrôlée",
    description: "Technique de respiration 4-7-8",
    category: "mindfulness",
    duration: 3,
    instructions: "Inspirez 4 temps, retenez 7 temps, expirez 8 temps. Répétez 4-6 cycles.",
    benefits: "Apaise le système nerveux, réduit l'anxiété",
    difficulty: "beginner"
  }
];

async function createEmergencyExercises() {
  console.log("💪 Création des exercices d'urgence...");

  for (const exercise of emergencyExercises) {
    try {
      const checkQuery = 'SELECT id FROM exercises WHERE title = $1';
      const existingExercise = await client.query(checkQuery, [exercise.title]);
      
      if (existingExercise.rows.length > 0) {
        console.log(`ℹ️ Exercice existe déjà : ${exercise.title}`);
        continue;
      }

      const insertQuery = `
        INSERT INTO exercises (
          title, description, category, duration, instructions, benefits, difficulty, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, true)
        RETURNING id
      `;
      
      const result = await client.query(insertQuery, [
        exercise.title,
        exercise.description,
        exercise.category,
        exercise.duration,
        exercise.instructions,
        exercise.benefits,
        exercise.difficulty
      ]);
      
      console.log(`✅ Exercice créé : ${exercise.title} (ID: ${result.rows[0].id})`);
    } catch (error) {
      console.error(`❌ Erreur exercice "${exercise.title}":`, error.message);
    }
  }
}

// Routines d'urgence pré-définies
const emergencyRoutineTemplates = [
  {
    title: "SOS Craving - 3 minutes",
    description: "Routine ultra-rapide pour les cravings intenses",
    category: "emergency",
    totalDuration: 180, // 3 minutes en secondes
    isDefault: true,
    steps: [
      "Respiration contrôlée - 30 secondes",
      "Jumping Jacks - 60 secondes", 
      "Marche rapide sur place - 60 secondes",
      "Étirements dynamiques - 30 secondes"
    ]
  },
  {
    title: "Évacuation Stress - 5 minutes",
    description: "Pour évacuer le stress et l'agitation",
    category: "stress",
    totalDuration: 300, // 5 minutes
    isDefault: false,
    steps: [
      "Jumping Jacks - 60 secondes",
      "Mountain Climbers - 30 secondes",
      "Pompes sur les genoux - 60 secondes",
      "Gainage planche - 30 secondes",
      "Marche rapide - 90 secondes",
      "Respiration contrôlée - 60 secondes"
    ]
  },
  {
    title: "Recentrage Rapide - 2 minutes",
    description: "Routine discrète pour se recentrer rapidement",
    category: "mindfulness",
    totalDuration: 120, // 2 minutes
    isDefault: false,
    steps: [
      "Respiration contrôlée - 60 secondes",
      "Étirements dynamiques - 45 secondes",
      "Marche lente sur place - 15 secondes"
    ]
  },
  {
    title: "Activation Complète - 7 minutes",
    description: "Routine complète pour activation physique et mentale",
    category: "complete",
    totalDuration: 420, // 7 minutes
    isDefault: false,
    steps: [
      "Respiration contrôlée - 60 secondes",
      "Jumping Jacks - 90 secondes",
      "Pompes sur les genoux - 60 secondes",
      "Mountain Climbers - 60 secondes",
      "Burpees simplifiés - 60 secondes",
      "Gainage planche - 30 secondes",
      "Marche rapide - 60 secondes",
      "Étirements dynamiques et respiration - 60 secondes"
    ]
  }
];

async function createEmergencyRoutineTemplates() {
  console.log("🚨 Création des templates de routines d'urgence...");

  for (const routine of emergencyRoutineTemplates) {
    try {
      const checkQuery = 'SELECT id FROM emergency_routines WHERE title = $1';
      const existingRoutine = await client.query(checkQuery, [routine.title]);
      
      if (existingRoutine.rows.length > 0) {
        console.log(`ℹ️ Template existe déjà : ${routine.title}`);
        continue;
      }

      const insertQuery = `
        INSERT INTO emergency_routines (
          title, description, steps, duration, category, is_active, is_default
        )
        VALUES ($1, $2, $3, $4, $5, true, $6)
        RETURNING id
      `;
      
      const result = await client.query(insertQuery, [
        routine.title,
        routine.description,
        JSON.stringify(routine.steps),
        routine.totalDuration,
        routine.category,
        routine.isDefault
      ]);
      
      console.log(`✅ Template créé : ${routine.title} (ID: ${result.rows[0].id})`);
    } catch (error) {
      console.error(`❌ Erreur template "${routine.title}":`, error.message);
    }
  }
}

// Séances personnalisées types
const customSessionTemplates = [
  {
    title: "Séance Débutant - 20 minutes",
    description: "Programme d'initiation pour commencer en douceur",
    category: "beginner",
    totalDuration: 20,
    difficulty: "beginner",
    isTemplate: true,
    isPublic: true,
    elements: [
      { exerciseName: "Marche rapide sur place", duration: 5, order: 1 },
      { exerciseName: "Jumping Jacks", duration: 3, order: 2 },
      { exerciseName: "Pompes sur les genoux", duration: 3, order: 3 },
      { exerciseName: "Étirements dynamiques", duration: 4, order: 4 },
      { exerciseName: "Respiration contrôlée", duration: 5, order: 5 }
    ]
  },
  {
    title: "Urgence Craving - 10 minutes",
    description: "Routine intensive pour les moments difficiles",
    category: "crisis",
    totalDuration: 10,
    difficulty: "intermediate",
    isTemplate: true,
    isPublic: true,
    elements: [
      { exerciseName: "Respiration contrôlée", duration: 2, order: 1 },
      { exerciseName: "Burpees simplifiés", duration: 2, order: 2 },
      { exerciseName: "Mountain Climbers", duration: 1, order: 3 },
      { exerciseName: "Jumping Jacks", duration: 2, order: 4 },
      { exerciseName: "Gainage planche", duration: 1, order: 5 },
      { exerciseName: "Étirements dynamiques", duration: 2, order: 6 }
    ]
  },
  {
    title: "Séance Avancée - 30 minutes",
    description: "Programme complet pour utilisateurs expérimentés",
    category: "advanced",
    totalDuration: 30,
    difficulty: "advanced",
    isTemplate: true,
    isPublic: true,
    elements: [
      { exerciseName: "Marche rapide sur place", duration: 3, order: 1 },
      { exerciseName: "Jumping Jacks", duration: 5, order: 2 },
      { exerciseName: "Burpees simplifiés", duration: 4, order: 3 },
      { exerciseName: "Mountain Climbers", duration: 3, order: 4 },
      { exerciseName: "Pompes sur les genoux", duration: 4, order: 5 },
      { exerciseName: "Gainage planche", duration: 2, order: 6 },
      { exerciseName: "Jumping Jacks", duration: 3, order: 7 },
      { exerciseName: "Étirements dynamiques", duration: 4, order: 8 },
      { exerciseName: "Respiration contrôlée", duration: 2, order: 9 }
    ]
  }
];

async function getExerciseIdByName(exerciseName) {
  const query = 'SELECT id FROM exercises WHERE title = $1';
  const result = await client.query(query, [exerciseName]);
  return result.rows.length > 0 ? result.rows[0].id : null;
}

async function createCustomSessionTemplates() {
  console.log("📋 Création des templates de séances personnalisées...");

  // Récupérer un utilisateur admin pour créer les templates
  const adminQuery = 'SELECT id FROM users WHERE role = $1 LIMIT 1';
  const adminResult = await client.query(adminQuery, ['admin']);
  
  if (adminResult.rows.length === 0) {
    console.log("⚠️ Aucun administrateur trouvé pour créer les templates de séances");
    return;
  }
  
  const adminId = adminResult.rows[0].id;

  for (const session of customSessionTemplates) {
    try {
      const checkQuery = 'SELECT id FROM custom_sessions WHERE title = $1';
      const existingSession = await client.query(checkQuery, [session.title]);
      
      if (existingSession.rows.length > 0) {
        console.log(`ℹ️ Séance template existe déjà : ${session.title}`);
        continue;
      }

      const insertSessionQuery = `
        INSERT INTO custom_sessions (
          creator_id, title, description, category, total_duration, difficulty,
          status, is_template, is_public, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'published', $7, $8, true)
        RETURNING id
      `;
      
      const sessionResult = await client.query(insertSessionQuery, [
        adminId,
        session.title,
        session.description,
        session.category,
        session.totalDuration,
        session.difficulty,
        session.isTemplate,
        session.isPublic
      ]);
      
      const sessionId = sessionResult.rows[0].id;
      console.log(`✅ Séance template créée : ${session.title} (ID: ${sessionId})`);

      // Ajouter les éléments de la séance
      for (const element of session.elements) {
        const exerciseId = await getExerciseIdByName(element.exerciseName);
        if (exerciseId) {
          const insertElementQuery = `
            INSERT INTO session_elements (
              session_id, exercise_id, "order", duration, repetitions, rest_time
            )
            VALUES ($1, $2, $3, $4, 1, 30)
          `;
          
          await client.query(insertElementQuery, [
            sessionId,
            exerciseId,
            element.order,
            element.duration * 60 // convertir en secondes
          ]);
          
          console.log(`  ✅ Élément ajouté : ${element.exerciseName}`);
        } else {
          console.log(`  ⚠️ Exercice non trouvé : ${element.exerciseName}`);
        }
      }
    } catch (error) {
      console.error(`❌ Erreur séance "${session.title}":`, error.message);
    }
  }
}

async function main() {
  try {
    console.log("🚀 Création des templates d'urgence et séances types...\n");
    
    await client.connect();
    console.log("✅ Connexion à la base de données établie");

    await createEmergencyExercises();
    console.log("");
    await createEmergencyRoutineTemplates();
    console.log("");
    await createCustomSessionTemplates();

    console.log("\n🎉 Création des templates terminée avec succès !");
    console.log("\n📊 Résumé :");
    console.log(`- ${emergencyExercises.length} exercices d'urgence créés`);
    console.log(`- ${emergencyRoutineTemplates.length} templates de routines d'urgence créés`);
    console.log(`- ${customSessionTemplates.length} séances types créées`);
    console.log("\n💡 Les utilisateurs ont maintenant accès à des routines pré-construites et des séances types.");

  } catch (error) {
    console.error("❌ Erreur lors de la création des templates :", error);
  } finally {
    await client.end();
    console.log("🔌 Connexion fermée");
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };