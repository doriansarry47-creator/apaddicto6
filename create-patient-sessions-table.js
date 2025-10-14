#!/usr/bin/env node
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

async function createPatientSessionsTable() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('🔧 Création de la table patient_sessions...\n');

  try {
    // Créer la table patient_sessions
    await sql`
      CREATE TABLE IF NOT EXISTS patient_sessions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        patient_id VARCHAR NOT NULL,
        session_id VARCHAR NOT NULL,
        status VARCHAR DEFAULT 'assigned',
        feedback TEXT,
        effort INTEGER,
        duration INTEGER,
        assigned_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (session_id) REFERENCES custom_sessions(id) ON DELETE CASCADE
      )
    `;
    console.log('✅ Table patient_sessions créée');

    // Créer les index
    await sql`CREATE INDEX IF NOT EXISTS idx_patient_sessions_patient_id ON patient_sessions(patient_id)`;
    console.log('✅ Index idx_patient_sessions_patient_id créé');

    await sql`CREATE INDEX IF NOT EXISTS idx_patient_sessions_session_id ON patient_sessions(session_id)`;
    console.log('✅ Index idx_patient_sessions_session_id créé');

    await sql`CREATE INDEX IF NOT EXISTS idx_patient_sessions_status ON patient_sessions(status)`;
    console.log('✅ Index idx_patient_sessions_status créé');

    // Ajouter la contrainte de validation (si elle n'existe pas déjà)
    try {
      await sql`
        ALTER TABLE patient_sessions 
        ADD CONSTRAINT check_effort_range 
        CHECK (effort IS NULL OR (effort >= 1 AND effort <= 10))
      `;
      console.log('✅ Contrainte check_effort_range ajoutée');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  Contrainte check_effort_range existe déjà');
      } else {
        console.log('⚠️  Contrainte check_effort_range non ajoutée:', error.message);
      }
    }

    console.log('\n✨ Table patient_sessions créée avec succès!\n');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

createPatientSessionsTable();
