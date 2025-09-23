#!/usr/bin/env node

import pkg from 'pg';
import * as dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

async function checkSchema() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('🔍 Vérification du schéma de la table exercises...');
    
    // Récupérer la structure de la table
    const schemaResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'exercises'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Colonnes de la table exercises:');
    schemaResult.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Compter les exercices
    const countResult = await pool.query('SELECT COUNT(*) FROM exercises');
    console.log(`\n📊 Nombre total d'exercices: ${countResult.rows[0].count}`);
    
    // Récupérer quelques exemples
    const samplesResult = await pool.query('SELECT title, category, difficulty FROM exercises LIMIT 5');
    console.log('\n🔍 Exemples d\'exercices:');
    samplesResult.rows.forEach(ex => {
      console.log(`  - "${ex.title}" (${ex.category}, ${ex.difficulty})`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await pool.end();
  }
}

checkSchema();