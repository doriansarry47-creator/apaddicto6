import { config } from 'dotenv';
import { getDB } from './server/db.js';
import { sql } from 'drizzle-orm';

config();

const db = getDB();

async function migrateEducationalContent() {
  console.log('🚀 Début de la migration des contenus éducatifs...');
  
  try {
    // Créer la table content_categories
    console.log('📝 Création de la table content_categories...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "content_categories" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL UNIQUE,
        "description" text,
        "color" varchar DEFAULT 'blue',
        "icon" varchar,
        "order" integer DEFAULT 0,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      )
    `);
    console.log('✅ Table content_categories créée');

    // Créer la table content_tags
    console.log('📝 Création de la table content_tags...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "content_tags" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL UNIQUE,
        "description" text,
        "color" varchar DEFAULT 'gray',
        "usage_count" integer DEFAULT 0,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now()
      )
    `);
    console.log('✅ Table content_tags créée');

    // Créer la table educational_contents
    console.log('📝 Création de la table educational_contents...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "educational_contents" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" varchar NOT NULL,
        "description" text,
        "type" varchar NOT NULL,
        "category_id" varchar REFERENCES "content_categories"("id") ON DELETE SET NULL,
        "tags" jsonb DEFAULT '[]',
        "media_url" varchar,
        "media_type" varchar,
        "content" text NOT NULL,
        "difficulty" varchar DEFAULT 'easy',
        "estimated_read_time" integer,
        "status" varchar DEFAULT 'draft',
        "is_recommended" boolean DEFAULT false,
        "view_count" integer DEFAULT 0,
        "like_count" integer DEFAULT 0,
        "thumbnail_url" varchar,
        "author_id" varchar REFERENCES "users"("id") ON DELETE SET NULL,
        "published_at" timestamp,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      )
    `);
    console.log('✅ Table educational_contents créée');

    // Créer la table content_interactions
    console.log('📝 Création de la table content_interactions...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "content_interactions" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" varchar NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "content_id" varchar NOT NULL REFERENCES "educational_contents"("id") ON DELETE CASCADE,
        "interaction_type" varchar NOT NULL,
        "duration" integer,
        "progress" integer DEFAULT 0,
        "created_at" timestamp DEFAULT now()
      )
    `);
    console.log('✅ Table content_interactions créée');

    // Créer les index pour optimiser les performances
    console.log('📝 Création des index...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "idx_educational_contents_type" ON "educational_contents" ("type")
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "idx_educational_contents_category" ON "educational_contents" ("category_id")
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "idx_educational_contents_status" ON "educational_contents" ("status")
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "idx_educational_contents_recommended" ON "educational_contents" ("is_recommended")
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "idx_content_interactions_user" ON "content_interactions" ("user_id")
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "idx_content_interactions_content" ON "content_interactions" ("content_id")
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "idx_content_interactions_type" ON "content_interactions" ("interaction_type")
    `);
    console.log('✅ Index créés');

    console.log('🎉 Migration des contenus éducatifs terminée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  }
}

// Exécuter la migration
migrateEducationalContent()
  .then(() => {
    console.log('✅ Migration terminée avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });