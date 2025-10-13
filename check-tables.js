import pkg from 'pg';
const { Client } = pkg;

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_vRJU7LlnYG1y@ep-soft-bush-ab0hbww0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  
  try {
    console.log('🔍 Vérification des tables dans la base de données...\n');
    
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`📊 Tables trouvées (${result.rows.length}):`);
    result.rows.forEach((row, i) => {
      console.log(`  ${i + 1}. ${row.table_name}`);
    });
    
    // Vérifier spécifiquement custom_sessions
    const customSessionsExists = result.rows.some(row => row.table_name === 'custom_sessions');
    console.log(`\n✅ custom_sessions existe: ${customSessionsExists}`);
    
    // Vérifier spécifiquement patient_sessions
    const patientSessionsExists = result.rows.some(row => row.table_name === 'patient_sessions');
    console.log(`✅ patient_sessions existe: ${patientSessionsExists}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.end();
  }
}

main();
