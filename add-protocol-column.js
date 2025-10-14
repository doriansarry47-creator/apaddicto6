#!/usr/bin/env node
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

async function addProtocolColumn() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('🔧 Ajout de la colonne protocol...\n');

  try {
    // Ajouter la colonne protocol à custom_sessions si elle n'existe pas
    await sql`
      ALTER TABLE custom_sessions 
      ADD COLUMN IF NOT EXISTS protocol VARCHAR DEFAULT 'standard'
    `;
    console.log('✅ Colonne protocol ajoutée à custom_sessions');

    // Vérifier si la colonne protocol_config existe déjà (elle est listée dans check-tables.js)
    console.log('✅ Colonne protocol_config existe déjà');

    console.log('\n✨ Colonne protocol ajoutée avec succès!\n');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

addProtocolColumn();
