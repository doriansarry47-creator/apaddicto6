#!/usr/bin/env node
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

async function checkTables() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('🔍 Vérification des tables...\n');

  try {
    // Vérifier si patient_sessions existe
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('patient_sessions', 'custom_sessions', 'session_elements')
      ORDER BY table_name
    `;
    
    console.log('Tables trouvées:');
    result.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });
    
    // Vérifier les colonnes de custom_sessions
    console.log('\n🔍 Colonnes de custom_sessions:');
    const columns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'custom_sessions'
      ORDER BY ordinal_position
    `;
    
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkTables();
