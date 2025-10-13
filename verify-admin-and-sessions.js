import pkg from 'pg';
const { Client } = pkg;

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_vRJU7LlnYG1y@ep-soft-bush-ab0hbww0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  
  try {
    // Vérifier le compte admin doriansarry@yahoo.fr
    console.log('🔍 Vérification du compte admin...\n');
    const adminResult = await client.query(`
      SELECT id, email, role, first_name, last_name
      FROM users
      WHERE email = 'doriansarry@yahoo.fr'
    `);
    
    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];
      console.log(`✅ Admin trouvé:`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Rôle: ${admin.role}`);
      console.log(`   Nom: ${admin.first_name} ${admin.last_name}`);
      console.log(`   ID: ${admin.id}\n`);
      
      if (admin.role !== 'admin') {
        console.log('⚠️ Le rôle n\'est pas admin, mise à jour...');
        await client.query(`
          UPDATE users SET role = 'admin' WHERE email = 'doriansarry@yahoo.fr'
        `);
        console.log('✅ Rôle mis à jour vers admin\n');
      }
    } else {
      console.log('❌ Compte admin non trouvé avec cet email\n');
    }
    
    // Lister toutes les séances
    console.log('📋 Liste des séances créées:\n');
    const sessionsResult = await client.query(`
      SELECT id, title, category, difficulty, total_duration, status, is_public
      FROM custom_sessions
      ORDER BY created_at DESC
    `);
    
    sessionsResult.rows.forEach((session, i) => {
      console.log(`${i + 1}. ${session.title}`);
      console.log(`   - Catégorie: ${session.category}`);
      console.log(`   - Difficulté: ${session.difficulty}`);
      console.log(`   - Durée: ${session.total_duration} min`);
      console.log(`   - Statut: ${session.status}`);
      console.log(`   - Public: ${session.is_public ? 'Oui' : 'Non'}`);
      console.log(`   - ID: ${session.id}\n`);
    });
    
    console.log(`✅ Total: ${sessionsResult.rows.length} séances disponibles`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.end();
  }
}

main();
