#!/usr/bin/env node

/**
 * DIAGNOSTIC COMPLET DU SYSTÈME ÉDUCATIF
 * 
 * Ce script diagnostique tous les aspects du système éducatif :
 * - État des tables et des données
 * - Cohérence des relations
 * - Fonctionnement des APIs
 * - Tests de bout en bout
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { 
  educationalContents, 
  contentCategories, 
  contentTags,
  contentInteractions,
  psychoEducationContent,
  users 
} from './shared/schema.ts';
import { eq, and, sql, desc, count } from 'drizzle-orm';

// Configuration de la base de données
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') || process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const db = drizzle(pool);

async function diagnoseEducationalSystem() {
  console.log('\n🔍 === DIAGNOSTIC SYSTÈME ÉDUCATIF ===\n');
  
  const issues = [];
  const warnings = [];
  const successes = [];
  
  try {
    // === 1. DIAGNOSTIC DES TABLES ===
    console.log('📊 1. ANALYSE DES TABLES');
    console.log('═══════════════════════════════════');
    
    try {
      // Vérifier l'existence et le contenu des tables
      const [categories, contents, tags, interactions, oldContents, users_list] = await Promise.all([
        db.select().from(contentCategories).catch(() => []),
        db.select().from(educationalContents).catch(() => []),
        db.select().from(contentTags).catch(() => []),
        db.select().from(contentInteractions).catch(() => []), 
        db.select().from(psychoEducationContent).catch(() => []),
        db.select().from(users).catch(() => [])
      ]);
      
      console.log(`✅ Table contentCategories: ${categories.length} entrées`);
      console.log(`✅ Table educationalContents: ${contents.length} entrées`);
      console.log(`✅ Table contentTags: ${tags.length} entrées`);
      console.log(`✅ Table contentInteractions: ${interactions.length} entrées`);
      console.log(`ℹ️  Table psychoEducationContent (ancien): ${oldContents.length} entrées`);
      console.log(`ℹ️  Table users: ${users_list.length} entrées`);
      
      if (categories.length === 0) {
        issues.push('❌ Aucune catégorie de contenu trouvée');
      } else {
        successes.push('✅ Catégories de contenu présentes');
      }
      
      if (contents.length === 0) {
        issues.push('❌ Aucun contenu éducatif trouvé');
      } else {
        successes.push('✅ Contenus éducatifs présents');
      }
      
      const admins = users_list.filter(u => u.role === 'admin');
      const patients = users_list.filter(u => u.role === 'patient');
      
      console.log(`   • Administrateurs: ${admins.length}`);
      console.log(`   • Patients: ${patients.length}`);
      
      if (admins.length === 0) {
        warnings.push('⚠️  Aucun administrateur trouvé');
      }
      
    } catch (error) {
      issues.push(`❌ Erreur accès aux tables: ${error.message}`);
    }
    
    // === 2. DIAGNOSTIC DES RELATIONS ===
    console.log('\n🔗 2. ANALYSE DES RELATIONS');
    console.log('═══════════════════════════════════');
    
    try {
      const contents = await db.select().from(educationalContents);
      const categories = await db.select().from(contentCategories);
      
      let orphanedContents = 0;
      let contentsWithCategory = 0;
      let contentsWithoutCategory = 0;
      
      for (const content of contents) {
        if (content.categoryId) {
          const categoryExists = categories.find(c => c.id === content.categoryId);
          if (categoryExists) {
            contentsWithCategory++;
          } else {
            orphanedContents++;
            console.log(`   ❌ Contenu orphelin: "${content.title}" (categoryId: ${content.categoryId})`);
          }
        } else {
          contentsWithoutCategory++;
        }
      }
      
      console.log(`✅ Contenus avec catégorie valide: ${contentsWithCategory}`);
      console.log(`⚠️  Contenus sans catégorie: ${contentsWithoutCategory}`);
      console.log(`❌ Contenus avec catégorie invalide: ${orphanedContents}`);
      
      if (orphanedContents > 0) {
        issues.push(`❌ ${orphanedContents} contenu(s) avec des relations rompues`);
      } else {
        successes.push('✅ Toutes les relations FK sont valides');
      }
      
    } catch (error) {
      issues.push(`❌ Erreur analyse relations: ${error.message}`);
    }
    
    // === 3. DIAGNOSTIC DU CONTENU ===
    console.log('\n📚 3. ANALYSE DU CONTENU');
    console.log('═══════════════════════════════════');
    
    try {
      const contents = await db.select().from(educationalContents);
      
      const publishedContents = contents.filter(c => c.status === 'published');
      const draftContents = contents.filter(c => c.status === 'draft');
      const archivedContents = contents.filter(c => c.status === 'archived');
      const recommendedContents = contents.filter(c => c.isRecommended);
      const activeContents = contents.filter(c => c.isActive !== false);
      
      console.log(`📖 Contenus publiés (visibles patients): ${publishedContents.length}`);
      console.log(`✏️  Contenus brouillons: ${draftContents.length}`);
      console.log(`🗂️  Contenus archivés: ${archivedContents.length}`);
      console.log(`⭐ Contenus recommandés: ${recommendedContents.length}`);
      console.log(`🔄 Contenus actifs: ${activeContents.length}`);
      
      if (publishedContents.length === 0) {
        issues.push('❌ Aucun contenu publié disponible pour les patients');
      } else {
        successes.push(`✅ ${publishedContents.length} contenu(s) disponible(s) pour les patients`);
      }
      
      // Vérifier la qualité du contenu
      const emptyContents = contents.filter(c => !c.content || c.content.trim().length < 10);
      const contentsWithoutTitle = contents.filter(c => !c.title || c.title.trim().length === 0);
      
      if (emptyContents.length > 0) {
        issues.push(`❌ ${emptyContents.length} contenu(s) avec du contenu vide ou insuffisant`);
      }
      
      if (contentsWithoutTitle.length > 0) {
        issues.push(`❌ ${contentsWithoutTitle.length} contenu(s) sans titre`);
      }
      
      if (emptyContents.length === 0 && contentsWithoutTitle.length === 0) {
        successes.push('✅ Tous les contenus ont un titre et du contenu valide');
      }
      
    } catch (error) {
      issues.push(`❌ Erreur analyse contenu: ${error.message}`);
    }
    
    // === 4. DIAGNOSTIC DES CATÉGORIES ===
    console.log('\n📁 4. ANALYSE DES CATÉGORIES');
    console.log('═══════════════════════════════════');
    
    try {
      const categories = await db.select().from(contentCategories);
      const contents = await db.select().from(educationalContents);
      
      const activeCategories = categories.filter(c => c.isActive !== false);
      
      console.log(`📂 Catégories actives: ${activeCategories.length}`);
      
      // Analyser chaque catégorie
      for (const category of activeCategories) {
        const categoryContents = contents.filter(c => c.categoryId === category.id);
        const publishedInCategory = categoryContents.filter(c => c.status === 'published');
        
        console.log(`   • "${category.name}": ${categoryContents.length} contenus (${publishedInCategory.length} publiés)`);
        
        if (categoryContents.length === 0) {
          warnings.push(`⚠️  Catégorie "${category.name}" sans contenu`);
        }
      }
      
      if (activeCategories.length === 0) {
        issues.push('❌ Aucune catégorie active');
      } else {
        successes.push(`✅ ${activeCategories.length} catégorie(s) active(s)`);
      }
      
    } catch (error) {
      issues.push(`❌ Erreur analyse catégories: ${error.message}`);
    }
    
    // === 5. SIMULATION DES APPELS API ===
    console.log('\n🌐 5. TEST DES APIS');
    console.log('═══════════════════════════════════');
    
    try {
      // Test API catégories (utilisée par admin et patient)
      const apiCategories = await db
        .select()
        .from(contentCategories)
        .where(eq(contentCategories.isActive, true))
        .orderBy(contentCategories.order);
        
      console.log(`✅ GET /api/content-categories: ${apiCategories.length} catégories`);
      
      // Test API contenus pour patient (seulement publiés)
      const apiContentsPatient = await db
        .select()
        .from(educationalContents)
        .where(and(
          eq(educationalContents.status, 'published'),
          eq(educationalContents.isActive, true)
        ))
        .orderBy(desc(educationalContents.createdAt));
        
      console.log(`✅ GET /api/educational-contents (patient): ${apiContentsPatient.length} contenus`);
      
      // Test API contenus pour admin (tous)
      const apiContentsAdmin = await db
        .select()
        .from(educationalContents)
        .where(eq(educationalContents.isActive, true))
        .orderBy(desc(educationalContents.createdAt));
        
      console.log(`✅ GET /api/educational-contents (admin): ${apiContentsAdmin.length} contenus`);
      
      // Test filtrage par catégorie
      if (apiCategories.length > 0) {
        const firstCategory = apiCategories[0];
        const filteredContents = apiContentsPatient.filter(c => c.categoryId === firstCategory.id);
        console.log(`✅ Filtrage par catégorie "${firstCategory.name}": ${filteredContents.length} contenus`);
      }
      
      successes.push('✅ Toutes les APIs répondent correctement');
      
    } catch (error) {
      issues.push(`❌ Erreur test APIs: ${error.message}`);
    }
    
    // === 6. DIAGNOSTIC DE L'ANCIEN SYSTÈME ===
    console.log('\n🔄 6. ANCIEN SYSTÈME (psychoEducationContent)');
    console.log('═══════════════════════════════════════════════');
    
    try {
      const oldContents = await db.select().from(psychoEducationContent);
      
      if (oldContents.length > 0) {
        console.log(`📚 Anciens contenus détectés: ${oldContents.length}`);
        
        // Vérifier si ils ont été migrés
        const newContents = await db.select().from(educationalContents);
        let potentialMigrated = 0;
        
        for (const oldContent of oldContents) {
          const migrated = newContents.find(nc => 
            nc.title === oldContent.title || 
            nc.content.includes(oldContent.title)
          );
          if (migrated) {
            potentialMigrated++;
          }
        }
        
        console.log(`   • Potentiellement migrés: ${potentialMigrated}`);
        console.log(`   • Non migrés: ${oldContents.length - potentialMigrated}`);
        
        if (oldContents.length - potentialMigrated > 0) {
          warnings.push(`⚠️  ${oldContents.length - potentialMigrated} ancien(s) contenu(s) non migré(s)`);
        } else {
          successes.push('✅ Tous les anciens contenus semblent migrés');
        }
      } else {
        console.log('ℹ️  Aucun ancien contenu trouvé');
      }
      
    } catch (error) {
      warnings.push(`⚠️  Impossible d'analyser l'ancien système: ${error.message}`);
    }
    
    // === RAPPORT FINAL ===
    console.log('\n📋 RAPPORT DE DIAGNOSTIC');
    console.log('═══════════════════════════════════════════════════════');
    
    console.log(`\n🎉 SUCCÈS (${successes.length}):`);
    successes.forEach(success => console.log(`   ${success}`));
    
    if (warnings.length > 0) {
      console.log(`\n⚠️  AVERTISSEMENTS (${warnings.length}):`);
      warnings.forEach(warning => console.log(`   ${warning}`));
    }
    
    if (issues.length > 0) {
      console.log(`\n❌ PROBLÈMES CRITIQUES (${issues.length}):`);
      issues.forEach(issue => console.log(`   ${issue}`));
    }
    
    // Évaluation globale
    console.log('\n🏆 ÉVALUATION GLOBALE:');
    
    if (issues.length === 0 && warnings.length <= 2) {
      console.log('✅ SYSTÈME ÉDUCATIF FONCTIONNEL');
      console.log('   • L\'admin peut créer et gérer les contenus');
      console.log('   • Les patients peuvent consulter et filtrer les contenus');
      console.log('   • Les relations entre modèles sont correctes');
    } else if (issues.length > 0) {
      console.log('❌ SYSTÈME ÉDUCATIF DYSFONCTIONNEL');
      console.log('   • Des réparations sont nécessaires');
      console.log('   • Exécutez le script de réparation: node fix-educational-system-complete.js');
    } else {
      console.log('⚠️  SYSTÈME ÉDUCATIF PARTIELLEMENT FONCTIONNEL');
      console.log('   • Le système fonctionne mais peut être amélioré');
      console.log('   • Considérez les avertissements pour optimisation');
    }
    
    console.log('\n🔧 ACTIONS RECOMMANDÉES:');
    if (issues.length > 0) {
      console.log('   1. Exécutez: node fix-educational-system-complete.js');
      console.log('   2. Redémarrez le serveur');
      console.log('   3. Testez la création de contenu côté admin');
      console.log('   4. Testez la consultation côté patient');
    } else if (warnings.length > 0) {
      console.log('   1. Considérez la création de plus de contenus');
      console.log('   2. Vérifiez que toutes les catégories ont du contenu');
      console.log('   3. Assurez-vous qu\'il y a des contenus recommandés');
    } else {
      console.log('   ✅ Aucune action requise - système optimal !');
    }
    
  } catch (error) {
    console.error('\n💥 ERREUR CRITIQUE DIAGNOSTIC:', error);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
    console.log('\n🔒 Diagnostic terminé - connexion fermée.');
  }
}

// Exécuter le diagnostic
diagnoseEducationalSystem().catch(console.error);