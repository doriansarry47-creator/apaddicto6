import pkg from 'pg';
const { Client } = pkg;

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_vRJU7LlnYG1y@ep-soft-bush-ab0hbww0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  
  try {
    console.log('🔍 Vérification des séances existantes...\n');
    
    // Vérifier les séances
    const sessionsResult = await client.query('SELECT * FROM custom_sessions ORDER BY created_at DESC LIMIT 5');
    console.log(`📊 Nombre de séances: ${sessionsResult.rows.length}`);
    
    if (sessionsResult.rows.length > 0) {
      console.log('\n✅ Séances existantes:');
      sessionsResult.rows.forEach((session, i) => {
        console.log(`${i + 1}. ${session.title} (${session.category}, ${session.difficulty})`);
      });
    } else {
      console.log('⚠️ Aucune séance trouvée. Création de séances par défaut...\n');
      
      // Créer des séances par défaut
      const sessionsToCreate = [
        {
          title: 'Séance Cardio Débutant',
          description: 'Une séance cardio idéale pour commencer en douceur',
          category: 'cardio',
          difficulty: 'beginner',
          total_duration: 20,
          tags: ['cardio', 'débutant', 'endurance']
        },
        {
          title: 'Séance Renforcement Musculaire',
          description: 'Travail complet du corps pour gagner en force',
          category: 'strength',
          difficulty: 'intermediate',
          total_duration: 30,
          tags: ['force', 'muscu', 'full-body']
        },
        {
          title: 'Séance Relaxation et Étirements',
          description: 'Détendez-vous avec des étirements en douceur',
          category: 'flexibility',
          difficulty: 'beginner',
          total_duration: 15,
          tags: ['relaxation', 'souplesse', 'étirements']
        },
        {
          title: 'Séance HIIT Intense',
          description: 'Entraînement intensif par intervalles',
          category: 'cardio',
          difficulty: 'advanced',
          total_duration: 25,
          tags: ['hiit', 'intense', 'cardio']
        },
        {
          title: 'Séance Yoga & Mindfulness',
          description: 'Yoga doux avec focus sur la respiration',
          category: 'relaxation',
          difficulty: 'beginner',
          total_duration: 30,
          tags: ['yoga', 'mindfulness', 'relaxation']
        }
      ];
      
      for (const session of sessionsToCreate) {
        await client.query(
          `INSERT INTO custom_sessions (title, description, category, difficulty, total_duration, tags)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [session.title, session.description, session.category, session.difficulty, session.total_duration, session.tags]
        );
        console.log(`✅ Créé: ${session.title}`);
      }
      
      console.log('\n✅ Toutes les séances ont été créées !');
    }
    
    // Vérifier le compte admin
    console.log('\n🔍 Vérification du compte admin...');
    const adminResult = await client.query(
      "SELECT id, email, role FROM users WHERE email = 'doriansarry@yahoo.fr'"
    );
    
    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];
      console.log(`✅ Admin trouvé: ${admin.email} (role: ${admin.role})`);
      
      if (admin.role !== 'admin') {
        console.log('⚠️ Le rôle n\'est pas admin, mise à jour...');
        await client.query(
          "UPDATE users SET role = 'admin' WHERE email = 'doriansarry@yahoo.fr'"
        );
        console.log('✅ Rôle mis à jour vers admin');
      }
    } else {
      console.log('❌ Compte admin non trouvé');
    }
    
    // Vérifier les séances assignées à des patients
    console.log('\n🔍 Vérification des séances assignées aux patients...');
    const patientSessionsResult = await client.query(`
      SELECT ps.id, ps.status, u.email as patient_email, cs.title as session_title
      FROM patient_sessions ps
      JOIN users u ON ps.patient_id = u.id
      JOIN custom_sessions cs ON ps.session_id = cs.id
      ORDER BY ps.assigned_at DESC
      LIMIT 10
    `);
    
    console.log(`📊 Nombre de séances assignées: ${patientSessionsResult.rows.length}`);
    if (patientSessionsResult.rows.length > 0) {
      console.log('\nDernières assignations:');
      patientSessionsResult.rows.forEach((ps, i) => {
        console.log(`${i + 1}. ${ps.patient_email}: ${ps.session_title} (${ps.status})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.end();
  }
}

main();
