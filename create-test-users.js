#!/usr/bin/env node

/**
 * CRÉATION D'UTILISATEURS DE TEST
 * 
 * Crée des comptes admin et patient pour tester le système éducatif
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { users } from './shared/schema.ts';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Configuration de la base de données
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') || process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const db = drizzle(pool);

async function createTestUsers() {
  console.log('\n👥 === CRÉATION D\'UTILISATEURS DE TEST ===\n');
  
  try {
    // Utilisateurs de test
    const testUsers = [
      {
        email: 'admin@example.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'Test',
        role: 'admin'
      },
      {
        email: 'patient@example.com', 
        password: 'patient123',
        firstName: 'Patient',
        lastName: 'Test',
        role: 'patient'
      }
    ];

    for (const userData of testUsers) {
      try {
        // Vérifier si l'utilisateur existe déjà
        const existing = await db.select().from(users).where(eq(users.email, userData.email));
        
        if (existing.length > 0) {
          console.log(`   ✅ Utilisateur existant: ${userData.email} (${userData.role})`);
          continue;
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Créer l'utilisateur
        const [newUser] = await db.insert(users).values({
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          isActive: true
        }).returning();

        console.log(`   ✅ Créé: ${userData.email} (${userData.role})`);
      } catch (error) {
        console.error(`   ❌ Erreur création ${userData.email}:`, error.message);
      }
    }

    // Vérification finale
    const allUsers = await db.select().from(users);
    const admins = allUsers.filter(u => u.role === 'admin');
    const patients = allUsers.filter(u => u.role === 'patient');

    console.log('\n📊 RÉSUMÉ UTILISATEURS:');
    console.log(`   • Total utilisateurs: ${allUsers.length}`);
    console.log(`   • Administrateurs: ${admins.length}`);
    console.log(`   • Patients: ${patients.length}`);

    console.log('\n🔑 COMPTES DE TEST DISPONIBLES:');
    console.log('   • admin@example.com / admin123 (administrateur)');
    console.log('   • patient@example.com / patient123 (patient)');

  } catch (error) {
    console.error('\n❌ ERREUR:', error);
  } finally {
    await pool.end();
    console.log('\n🔒 Connexion fermée.');
  }
}

createTestUsers().catch(console.error);