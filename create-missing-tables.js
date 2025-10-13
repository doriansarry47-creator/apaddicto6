import pkg from 'pg';
const { Client } = pkg;

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_vRJU7LlnYG1y@ep-soft-bush-ab0hbww0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  
  try {
    console.log('🔨 Création de la table custom_sessions...\n');
    
    // Créer la table custom_sessions
    await client.query(`
      CREATE TABLE IF NOT EXISTS custom_sessions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        creator_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR NOT NULL,
        description TEXT,
        category VARCHAR NOT NULL,
        total_duration INTEGER,
        difficulty VARCHAR DEFAULT 'beginner',
        status VARCHAR DEFAULT 'draft',
        is_template BOOLEAN DEFAULT true,
        is_public BOOLEAN DEFAULT false,
        tags JSONB DEFAULT '[]',
        image_url VARCHAR,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✅ Table custom_sessions créée !');
    
    // Créer la table session_elements
    console.log('\n🔨 Création de la table session_elements...\n');
    await client.query(`
      CREATE TABLE IF NOT EXISTS session_elements (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR NOT NULL REFERENCES custom_sessions(id) ON DELETE CASCADE,
        exercise_id VARCHAR REFERENCES exercises(id) ON DELETE CASCADE,
        "order" INTEGER NOT NULL,
        duration INTEGER,
        repetitions INTEGER DEFAULT 1,
        rest_time INTEGER DEFAULT 0,
        timer_settings JSONB,
        notes TEXT,
        is_optional BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✅ Table session_elements créée !');
    
    // Créer la table session_instances
    console.log('\n🔨 Création de la table session_instances...\n');
    await client.query(`
      CREATE TABLE IF NOT EXISTS session_instances (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        session_id VARCHAR NOT NULL REFERENCES custom_sessions(id) ON DELETE CASCADE,
        status VARCHAR DEFAULT 'started',
        current_element_index INTEGER DEFAULT 0,
        total_duration INTEGER,
        craving_before INTEGER,
        craving_after INTEGER,
        mood_before VARCHAR,
        mood_after VARCHAR,
        notes TEXT,
        completed_elements JSONB DEFAULT '[]',
        started_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✅ Table session_instances créée !');
    
    // Vérifier que patient_sessions pointe vers custom_sessions
    console.log('\n🔍 Vérification de la table patient_sessions...\n');
    const psCheck = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'patient_sessions'
      ORDER BY ordinal_position
    `);
    
    console.log('Colonnes de patient_sessions:');
    psCheck.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Mettre à jour patient_sessions pour référencer custom_sessions
    console.log('\n🔨 Mise à jour de patient_sessions...\n');
    
    // Vérifier si la contrainte existe
    const constraintCheck = await client.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'patient_sessions'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name LIKE '%session_id%'
    `);
    
    if (constraintCheck.rows.length > 0) {
      console.log(`  Contrainte existante trouvée: ${constraintCheck.rows[0].constraint_name}`);
      console.log('  Suppression de la contrainte...');
      await client.query(`
        ALTER TABLE patient_sessions
        DROP CONSTRAINT IF EXISTS ${constraintCheck.rows[0].constraint_name}
      `);
    }
    
    // Ajouter la nouvelle contrainte
    console.log('  Ajout de la nouvelle contrainte vers custom_sessions...');
    await client.query(`
      ALTER TABLE patient_sessions
      ADD CONSTRAINT patient_sessions_session_id_fkey
      FOREIGN KEY (session_id) REFERENCES custom_sessions(id) ON DELETE CASCADE
    `);
    
    console.log('✅ patient_sessions mis à jour !');
    
    // Créer des séances par défaut
    console.log('\n🎨 Création de séances par défaut...\n');
    
    // Récupérer un admin
    const adminResult = await client.query(`
      SELECT id FROM users WHERE role = 'admin' LIMIT 1
    `);
    
    if (adminResult.rows.length === 0) {
      console.log('⚠️ Aucun admin trouvé. Création d\'un admin par défaut...');
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await client.query(`
        INSERT INTO users (email, password, role, first_name, last_name)
        VALUES ('admin@apaddicto.com', $1, 'admin', 'Admin', 'APAddicto')
        RETURNING id
      `, [hashedPassword]);
      
      const newAdminResult = await client.query(`
        SELECT id FROM users WHERE email = 'admin@apaddicto.com'
      `);
      
      var creatorId = newAdminResult.rows[0].id;
      console.log(`✅ Admin créé: admin@apaddicto.com (ID: ${creatorId})`);
    } else {
      var creatorId = adminResult.rows[0].id;
      console.log(`✅ Admin existant trouvé (ID: ${creatorId})`);
    }
    
    const sessionsToCreate = [
      {
        title: 'Séance Cardio Débutant',
        description: 'Une séance cardio idéale pour commencer en douceur et gérer les envies',
        category: 'cardio',
        difficulty: 'beginner',
        total_duration: 20,
        status: 'published',
        is_public: true,
        tags: ['cardio', 'débutant', 'endurance', 'anti-craving']
      },
      {
        title: 'Séance Renforcement Musculaire',
        description: 'Travail complet du corps pour gagner en force et confiance',
        category: 'strength',
        difficulty: 'intermediate',
        total_duration: 30,
        status: 'published',
        is_public: true,
        tags: ['force', 'muscu', 'full-body']
      },
      {
        title: 'Séance Relaxation et Étirements',
        description: 'Détendez-vous avec des étirements en douceur pour apaiser les envies',
        category: 'flexibility',
        difficulty: 'beginner',
        total_duration: 15,
        status: 'published',
        is_public: true,
        tags: ['relaxation', 'souplesse', 'étirements', 'mindfulness']
      },
      {
        title: 'Séance HIIT Intense',
        description: 'Entraînement intensif par intervalles pour maximiser les bénéfices',
        category: 'cardio',
        difficulty: 'advanced',
        total_duration: 25,
        status: 'published',
        is_public: true,
        tags: ['hiit', 'intense', 'cardio', 'brûle-calories']
      },
      {
        title: 'Séance Yoga & Mindfulness',
        description: 'Yoga doux avec focus sur la respiration et la pleine conscience',
        category: 'mindfulness',
        difficulty: 'beginner',
        total_duration: 30,
        status: 'published',
        is_public: true,
        tags: ['yoga', 'mindfulness', 'relaxation', 'respiration']
      }
    ];
    
    for (const session of sessionsToCreate) {
      const result = await client.query(
        `INSERT INTO custom_sessions (creator_id, title, description, category, difficulty, total_duration, status, is_public, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, title`,
        [creatorId, session.title, session.description, session.category, session.difficulty, session.total_duration, session.status, session.is_public, JSON.stringify(session.tags)]
      );
      console.log(`✅ Créé: ${result.rows[0].title} (ID: ${result.rows[0].id})`);
    }
    
    console.log('\n✅ Toutes les tables et séances ont été créées avec succès !');
    
    // Statistiques finales
    const sessionCount = await client.query('SELECT COUNT(*) FROM custom_sessions');
    console.log(`\n📊 Statistiques:`);
    console.log(`  - Séances créées: ${sessionCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    console.error('Détails:', error.message);
  } finally {
    await client.end();
  }
}

main();
