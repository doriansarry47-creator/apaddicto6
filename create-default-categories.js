import { getDB } from './server-dist/db.js';
import { contentCategories, contentTags } from './server-dist/schema.js';

const db = getDB();

const defaultCategories = [
  {
    name: "Comprendre l'Addiction",
    description: "Concepts fondamentaux sur l'addiction et les mécanismes cérébraux",
    color: "red",
    icon: "psychology",
    order: 1
  },
  {
    name: "Exercice et Récupération",
    description: "Rôle de l'activité physique dans le processus de guérison",
    color: "blue",
    icon: "fitness_center",
    order: 2
  },
  {
    name: "Psychologie Cognitive",
    description: "Techniques psychologiques pour gérer les pensées et émotions",
    color: "green",
    icon: "lightbulb",
    order: 3
  },
  {
    name: "Techniques Pratiques",
    description: "Outils concrets pour la gestion quotidienne des cravings",
    color: "purple",
    icon: "self_improvement",
    order: 4
  },
  {
    name: "Prévention des Rechutes",
    description: "Stratégies pour maintenir la récupération à long terme",
    color: "orange",
    icon: "shield",
    order: 5
  }
];

const defaultTags = [
  { name: "addiction", description: "Contenu sur les mécanismes de l'addiction", color: "red" },
  { name: "motivation", description: "Contenu motivationnel pour la récupération", color: "green" },
  { name: "relaxation", description: "Techniques de relaxation et gestion du stress", color: "blue" },
  { name: "respiration", description: "Exercices de respiration", color: "cyan" },
  { name: "pleine-conscience", description: "Pratiques de mindfulness et méditation", color: "purple" },
  { name: "coping", description: "Stratégies d'adaptation aux difficultés", color: "yellow" },
  { name: "exercice", description: "Activité physique et sport", color: "orange" },
  { name: "urgence", description: "Techniques pour les moments de crise", color: "red" },
  { name: "cognitif", description: "Thérapie cognitive et restructuration des pensées", color: "indigo" },
  { name: "soutien-social", description: "Importance du soutien social et des relations", color: "pink" }
];

async function createDefaultData() {
  try {
    console.log('🔧 Création des catégories et tags par défaut...');

    // Créer les catégories par défaut
    for (const category of defaultCategories) {
      try {
        const existing = await db
          .select()
          .from(contentCategories)
          .where(eq(contentCategories.name, category.name))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(contentCategories).values(category);
          console.log(`✅ Catégorie créée: ${category.name}`);
        } else {
          console.log(`⚠️ Catégorie existe déjà: ${category.name}`);
        }
      } catch (error) {
        console.error(`❌ Erreur lors de la création de la catégorie ${category.name}:`, error);
      }
    }

    // Créer les tags par défaut
    for (const tag of defaultTags) {
      try {
        const existing = await db
          .select()
          .from(contentTags)
          .where(eq(contentTags.name, tag.name))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(contentTags).values(tag);
          console.log(`✅ Tag créé: ${tag.name}`);
        } else {
          console.log(`⚠️ Tag existe déjà: ${tag.name}`);
        }
      } catch (error) {
        console.error(`❌ Erreur lors de la création du tag ${tag.name}:`, error);
      }
    }

    console.log('✅ Création des données par défaut terminée!');

  } catch (error) {
    console.error('❌ Erreur lors de la création des données par défaut:', error);
  } finally {
    process.exit(0);
  }
}

// Ajouter l'import manquant
import { eq } from 'drizzle-orm';

createDefaultData();