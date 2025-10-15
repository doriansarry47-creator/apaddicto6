const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function createBreathingSessions() {
  console.log('🧘 Création des séances de respiration...\n');

  try {
    // Récupérer l'admin (créateur)
    const adminResult = await sql`
      SELECT * FROM users WHERE role = 'admin' LIMIT 1
    `;

    if (adminResult.length === 0) {
      console.error('❌ Aucun administrateur trouvé. Veuillez créer un compte admin d\'abord.');
      return;
    }

    const adminUser = adminResult[0];
    console.log(`✅ Admin trouvé: ${adminUser.email}\n`);

    // 1. Cohérence Cardiaque
    console.log('📘 Création : Cohérence Cardiaque');
    const heartCoherence = await sql`
      INSERT INTO custom_sessions (
        creator_id, title, description, category, protocol, protocol_config,
        total_duration, difficulty, status, is_template, is_public, tags, is_active
      ) VALUES (
        ${adminUser.id},
        '💙 Cohérence Cardiaque',
        'Technique de respiration rythmée pour réguler le système nerveux autonome et diminuer le stress. 6 cycles de respiration par minute (inspiration 5s / expiration 5s).',
        'breathing',
        'standard',
        ${JSON.stringify({
          type: 'breathing',
          pattern: 'coherence',
          inhaleTime: 5,
          exhaleTime: 5,
          totalDuration: 300
        })}::jsonb,
        5,
        'beginner',
        'published',
        true,
        true,
        ${JSON.stringify(['respiration', 'stress', 'relaxation', 'autonomie'])}::jsonb,
        true
      ) RETURNING *
    `;

    console.log(`✅ Séance créée: ${heartCoherence[0].title} (ID: ${heartCoherence[0].id})\n`);

    // 2. Respiration Triangulaire
    console.log('📗 Création : Respiration Triangulaire');
    const triangleBreathing = await sql`
      INSERT INTO custom_sessions (
        creator_id, title, description, category, protocol, protocol_config,
        total_duration, difficulty, status, is_template, is_public, tags, is_active
      ) VALUES (
        ${adminUser.id},
        '💚 Respiration Triangulaire',
        'Technique de respiration apaisante basée sur trois phases équilibrées : inspiration – rétention – expiration. Cycle standard : 4s / 4s / 4s.',
        'breathing',
        'standard',
        ${JSON.stringify({
          type: 'breathing',
          pattern: 'triangle',
          inhaleTime: 4,
          holdTime: 4,
          exhaleTime: 4,
          totalDuration: 240
        })}::jsonb,
        4,
        'beginner',
        'published',
        true,
        true,
        ${JSON.stringify(['respiration', 'calme', 'équilibre', 'concentration'])}::jsonb,
        true
      ) RETURNING *
    `;

    console.log(`✅ Séance créée: ${triangleBreathing[0].title} (ID: ${triangleBreathing[0].id})\n`);

    // 3. Respiration Carrée (Box Breathing)
    console.log('📙 Création : Respiration Carrée (Box Breathing)');
    const squareBreathing = await sql`
      INSERT INTO custom_sessions (
        creator_id, title, description, category, protocol, protocol_config,
        total_duration, difficulty, status, is_template, is_public, tags, is_active
      ) VALUES (
        ${adminUser.id},
        '💜 Respiration Carrée (Box Breathing)',
        'Respiration en quatre temps utilisée pour la relaxation et la concentration (technique de la Navy SEAL). 4 phases égales : Inspiration → Rétention → Expiration → Rétention.',
        'breathing',
        'standard',
        ${JSON.stringify({
          type: 'breathing',
          pattern: 'square',
          inhaleTime: 4,
          holdAfterInhaleTime: 4,
          exhaleTime: 4,
          holdAfterExhaleTime: 4,
          totalDuration: 256
        })}::jsonb,
        4,
        'intermediate',
        'published',
        true,
        true,
        ${JSON.stringify(['respiration', 'concentration', 'navy seal', 'performance'])}::jsonb,
        true
      ) RETURNING *
    `;

    console.log(`✅ Séance créée: ${squareBreathing[0].title} (ID: ${squareBreathing[0].id})\n`);

    console.log('🎉 Toutes les séances de respiration ont été créées avec succès!\n');
    console.log('📊 Résumé:');
    console.log(`  - Cohérence Cardiaque: ${heartCoherence[0].id}`);
    console.log(`  - Respiration Triangulaire: ${triangleBreathing[0].id}`);
    console.log(`  - Respiration Carrée: ${squareBreathing[0].id}`);
    console.log('\n✨ Les patients peuvent maintenant accéder à ces séances dans leur bibliothèque!');

  } catch (error) {
    console.error('❌ Erreur lors de la création des séances:', error);
    throw error;
  }
}

// Exécution
createBreathingSessions()
  .then(() => {
    console.log('\n✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Le script a échoué:', error);
    process.exit(1);
  });
