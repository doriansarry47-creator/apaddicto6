#!/usr/bin/env node
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

async function addSetsColumn() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('🔧 Ajout des colonnes manquantes à session_elements...\n');

  try {
    // Ajouter plusieurs colonnes manquantes
    await sql`
      ALTER TABLE session_elements 
      ADD COLUMN IF NOT EXISTS sets INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS work_time INTEGER,
      ADD COLUMN IF NOT EXISTS rest_interval INTEGER,
      ADD COLUMN IF NOT EXISTS timer_settings JSONB
    `;
    console.log('✅ Colonnes ajoutées à session_elements');

    console.log('\n✨ Colonnes ajoutées avec succès!\n');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

addSetsColumn();
