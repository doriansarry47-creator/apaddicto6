const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_vRJU7LlnYG1y@ep-soft-bush-ab0hbww0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function createBreathingSessions() {
  const client = await pool.connect();
  
  try {
    console.log('🌿 Création des séances de respiration interactives...\n');

    // 1. Cohérence Cardiaque
    const heartCoherenceSession = {
      title: '💙 Cohérence Cardiaque',
      description: 'Exercice de respiration rythmée pour réguler le système nerveux autonome et diminuer le stress. 6 cycles de respiration par minute pour harmoniser cœur et cerveau.',
      category: 'breathing',
      protocol: 'standard',
      protocolConfig: {
        pattern: 'heart-coherence',
        defaultDuration: 5, // minutes
        customizable: true,
        settings: {
          inhaleTime: 5,
          exhaleTime: 5,
          cycles: 30,
          soundEnabled: true,
          vibrationEnabled: false,
          themeColor: 'blue'
        }
      },
      totalDuration: 5,
      difficulty: 'beginner',
      tags: ['respiration', 'stress', 'relaxation', 'coherence_cardiaque', 'debutant'],
      isPublic: true,
      status: 'published'
    };

    // 2. Respiration Triangulaire
    const triangleBreathingSession = {
      title: '🔺 Respiration Triangulaire',
      description: 'Technique de respiration apaisante basée sur trois phases équilibrées : inspiration – rétention – expiration. Idéale pour réduire l\'anxiété et retrouver son calme.',
      category: 'breathing',
      protocol: 'standard',
      protocolConfig: {
        pattern: 'triangle',
        defaultDuration: 5,
        customizable: true,
        settings: {
          inhaleTime: 4,
          holdTime: 4,
          exhaleTime: 4,
          cycles: 25,
          soundEnabled: true,
          vibrationEnabled: false,
          themeColor: 'emerald'
        }
      },
      totalDuration: 5,
      difficulty: 'beginner',
      tags: ['respiration', 'anxiete', 'calme', 'triangle', 'debutant'],
      isPublic: true,
      status: 'published'
    };

    // 3. Respiration Carrée (Box Breathing)
    const squareBreathingSession = {
      title: '🟦 Respiration Carrée (Box Breathing)',
      description: 'Respiration en quatre temps utilisée pour la relaxation et la concentration (technique de la Navy SEAL). Inspiration → Rétention → Expiration → Rétention.',
      category: 'breathing',
      protocol: 'standard',
      protocolConfig: {
        pattern: 'square',
        defaultDuration: 5,
        customizable: true,
        settings: {
          inhaleTime: 4,
          holdAfterInhaleTime: 4,
          exhaleTime: 4,
          holdAfterExhaleTime: 4,
          cycles: 18,
          soundEnabled: true,
          vibrationEnabled: false,
          themeColor: 'indigo'
        }
      },
      totalDuration: 5,
      difficulty: 'intermediate',
      tags: ['respiration', 'concentration', 'relaxation', 'box_breathing', 'intermediaire'],
      isPublic: true,
      status: 'published'
    };

    const sessions = [heartCoherenceSession, triangleBreathingSession, squareBreathingSession];

    for (const session of sessions) {
      // Vérifier si la séance existe déjà
      const existing = await client.query(
        'SELECT id FROM custom_sessions WHERE title = $1',
        [session.title]
      );

      // Récupérer l'ID du premier admin pour creator_id
      const adminResult = await client.query(
        "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
      );
      
      if (adminResult.rows.length === 0) {
        console.error('❌ Aucun admin trouvé dans la base de données. Créez un admin d\'abord.');
        continue;
      }
      
      const creatorId = adminResult.rows[0].id;

      if (existing.rows.length > 0) {
        // Mettre à jour la séance existante
        await client.query(`
          UPDATE custom_sessions 
          SET 
            description = $1,
            category = $2,
            protocol = $3,
            protocol_config = $4,
            total_duration = $5,
            difficulty = $6,
            tags = $7,
            is_public = $8,
            status = $9,
            updated_at = NOW()
          WHERE title = $10
        `, [
          session.description,
          session.category,
          session.protocol,
          JSON.stringify(session.protocolConfig),
          session.totalDuration,
          session.difficulty,
          JSON.stringify(session.tags),
          session.isPublic,
          session.status,
          session.title
        ]);
        console.log(`✅ Séance mise à jour : ${session.title}`);
      } else {
        // Créer une nouvelle séance
        await client.query(`
          INSERT INTO custom_sessions (
            creator_id,
            title,
            description,
            category,
            protocol,
            protocol_config,
            total_duration,
            difficulty,
            tags,
            is_public,
            status,
            is_template,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
        `, [
          creatorId,
          session.title,
          session.description,
          session.category,
          session.protocol,
          JSON.stringify(session.protocolConfig),
          session.totalDuration,
          session.difficulty,
          JSON.stringify(session.tags),
          session.isPublic,
          session.status,
          true // is_template
        ]);
        console.log(`✅ Séance créée : ${session.title}`);
      }
    }

    console.log('\n🎉 Toutes les séances de respiration ont été créées/mises à jour avec succès!');
    console.log('\n📋 Résumé des séances créées :');
    console.log('1. 💙 Cohérence Cardiaque - Réduction du stress');
    console.log('2. 🔺 Respiration Triangulaire - Gestion de l\'anxiété');
    console.log('3. 🟦 Respiration Carrée - Concentration et relaxation');
    console.log('\n✨ Les patients peuvent maintenant accéder à ces séances via la bibliothèque!');

  } catch (error) {
    console.error('❌ Erreur lors de la création des séances:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Exécuter le script
createBreathingSessions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
