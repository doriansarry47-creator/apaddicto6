#!/usr/bin/env node

/**
 * CLASSIFICATION INTELLIGENTE DES CONTENUS ÉDUCATIFS
 * 
 * Ce script analyse et classe automatiquement les contenus éducatifs
 * dans les bonnes catégories en fonction de leur titre et contenu.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { 
  educationalContents, 
  contentCategories
} from './shared/schema.ts';
import { eq, and, sql } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') || process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const db = drizzle(pool);

// Mots-clés par catégorie pour la classification intelligente
const CATEGORY_KEYWORDS = {
  "Comprendre l'Addiction": [
    "addiction", "dépendance", "neurobiologie", "cerveau", "dopamine", 
    "circuit", "récompense", "mécanisme", "neurologique", "compulsif"
  ],
  "Techniques de Motivation": [
    "motivation", "objectif", "but", "persévérance", "volonté", 
    "détermination", "encouragement", "inspiration", "élan"
  ],
  "Stratégies Anti-Craving": [
    "craving", "envie", "pulsion", "stratégie", "gérer", "surmonter",
    "résister", "impulse", "tentation", "urge", "surf"
  ],
  "Prévention des Rechutes": [
    "rechute", "prévention", "éviter", "maintenir", "abstinence",
    "récidive", "plan", "vigilance", "préparation", "anticipation"
  ],
  "Gestion Émotionnelle": [
    "émotion", "sentiment", "humeur", "stress", "anxiété", "colère",
    "tristesse", "régulation", "gestion", "émotionnel", "affectif"
  ],
  "Relaxation et Détente": [
    "relaxation", "détente", "méditation", "respiration", "calme",
    "zen", "apaisement", "sérénité", "tranquillité", "repos"
  ],
  "Activité Physique": [
    "exercice", "sport", "activité", "physique", "mouvement", 
    "entraînement", "fitness", "course", "marche", "yoga"
  ],
  "Psychologie Cognitive": [
    "pensée", "cognitif", "croyance", "schéma", "automatique",
    "beck", "thérapie", "cognition", "mental", "raisonnement"
  ]
};

async function categorizeContent() {
  console.log('\n🔍 === CLASSIFICATION INTELLIGENTE DES CONTENUS ===\n');
  
  try {
    // Récupérer tous les contenus et catégories
    const [contents, categories] = await Promise.all([
      db.select().from(educationalContents),
      db.select().from(contentCategories)
    ]);

    console.log(`📚 Contenus à analyser: ${contents.length}`);
    console.log(`📂 Catégories disponibles: ${categories.length}`);
    
    // Créer un map des catégories par nom
    const categoryMap = new Map();
    categories.forEach(cat => {
      categoryMap.set(cat.name, cat.id);
    });

    let updated = 0;
    let alreadyClassified = 0;
    let unclassified = 0;

    for (const content of contents) {
      // Skip si déjà bien classifié avec une catégorie valide
      if (content.categoryId && categoryMap.has([...categoryMap.values()].find(id => id === content.categoryId))) {
        const categoryName = [...categoryMap.entries()].find(([name, id]) => id === content.categoryId)?.[0];
        if (categoryName) {
          alreadyClassified++;
          console.log(`   ✅ "${content.title}" -> déjà dans "${categoryName}"`);
          continue;
        }
      }

      // Analyser le titre et le contenu
      const textToAnalyze = `${content.title} ${content.description || ''} ${content.content}`.toLowerCase();
      
      let bestCategory = null;
      let maxScore = 0;

      // Calculer le score pour chaque catégorie
      for (const [categoryName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (!categoryMap.has(categoryName)) continue;
        
        let score = 0;
        for (const keyword of keywords) {
          const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
          const matches = textToAnalyze.match(regex);
          if (matches) {
            score += matches.length;
            
            // Bonus si le mot-clé est dans le titre
            if (content.title.toLowerCase().includes(keyword)) {
              score += 2;
            }
          }
        }
        
        if (score > maxScore) {
          maxScore = score;
          bestCategory = categoryName;
        }
      }

      if (bestCategory && maxScore > 0) {
        try {
          await db
            .update(educationalContents)
            .set({ 
              categoryId: categoryMap.get(bestCategory),
              updatedAt: new Date()
            })
            .where(eq(educationalContents.id, content.id));
            
          console.log(`   🎯 "${content.title}" -> "${bestCategory}" (score: ${maxScore})`);
          updated++;
        } catch (error) {
          console.error(`   ❌ Erreur mise à jour "${content.title}":`, error.message);
        }
      } else {
        console.log(`   ❓ "${content.title}" -> aucune catégorie trouvée`);
        unclassified++;
      }
    }

    // Statistiques finales par catégorie
    console.log('\n📊 RÉPARTITION PAR CATÉGORIE:');
    console.log('═══════════════════════════════════════');
    
    for (const category of categories) {
      const categoryContents = await db
        .select()
        .from(educationalContents)
        .where(eq(educationalContents.categoryId, category.id));
        
      const published = categoryContents.filter(c => c.status === 'published');
      console.log(`📂 ${category.name}: ${categoryContents.length} contenus (${published.length} publiés)`);
    }

    // Contenus sans catégorie
    const uncategorized = await db
      .select()
      .from(educationalContents)
      .where(sql`${educationalContents.categoryId} IS NULL`);
      
    if (uncategorized.length > 0) {
      console.log(`❓ Sans catégorie: ${uncategorized.length} contenus`);
    }

    console.log('\n📈 RÉSUMÉ:');
    console.log(`✅ Contenus mis à jour: ${updated}`);
    console.log(`✅ Déjà bien classifiés: ${alreadyClassified}`);
    console.log(`❓ Non classifiés: ${unclassified}`);
    
    if (updated > 0) {
      console.log('\n🎉 Classification terminée avec succès !');
      console.log('   Les patients verront maintenant les contenus');
      console.log('   organisés par catégorie dans leur interface.');
    }

  } catch (error) {
    console.error('\n❌ ERREUR:', error);
  } finally {
    await pool.end();
    console.log('\n🔒 Connexion fermée.');
  }
}

categorizeContent().catch(console.error);