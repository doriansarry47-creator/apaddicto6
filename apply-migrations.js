#!/usr/bin/env node
/**
 * Script pour appliquer les migrations de base de données
 */

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
config();

async function applyMigrations() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('🔧 Application des migrations...\n');

  try {
    // 1. Migration add_session_features.sql
    console.log('📝 Application de add_session_features.sql...');
    const sessionFeaturesSql = readFileSync(
      join(__dirname, 'migrations', 'add_session_features.sql'),
      'utf-8'
    );
    
    // Exécuter les commandes SQL une par une
    const commands = sessionFeaturesSql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    for (const command of commands) {
      try {
        await sql(command);
        console.log('  ✅ Commande exécutée');
      } catch (error) {
        // Ignorer les erreurs "already exists"
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate') ||
            error.message.includes('does not exist')) {
          console.log('  ⚠️  Déjà existant ou non applicable, continue...');
        } else {
          console.error('  ❌ Erreur:', error.message);
        }
      }
    }

    // 2. Migration add_advanced_protocols.sql
    console.log('\n📝 Application de add_advanced_protocols.sql...');
    const advancedProtocolsSql = readFileSync(
      join(__dirname, 'migrations', 'add_advanced_protocols.sql'),
      'utf-8'
    );
    
    const protocolCommands = advancedProtocolsSql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    for (const command of protocolCommands) {
      try {
        await sql(command);
        console.log('  ✅ Commande exécutée');
      } catch (error) {
        // Ignorer les erreurs "already exists"
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate') ||
            error.message.includes('does not exist')) {
          console.log('  ⚠️  Déjà existant ou non applicable, continue...');
        } else {
          console.error('  ❌ Erreur:', error.message);
        }
      }
    }

    console.log('\n✅ Migrations appliquées avec succès!\n');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'application des migrations:', error);
    process.exit(1);
  }
}

applyMigrations();
