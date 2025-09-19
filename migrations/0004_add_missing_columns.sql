-- Migration pour ajouter les colonnes manquantes
-- Ajouter last_login_at et inactivity_threshold à la table users
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp;
ALTER TABLE "users" ADD COLUMN "inactivity_threshold" integer DEFAULT 30;
ALTER TABLE "users" ADD COLUMN "notes" text;

-- Ajouter notes et updated_at à la table exercise_sessions  
ALTER TABLE "exercise_sessions" ADD COLUMN "notes" text;
ALTER TABLE "exercise_sessions" ADD COLUMN "updated_at" timestamp DEFAULT now();

-- Ajouter exerciseTitle, exerciseCategory pour les sessions
ALTER TABLE "exercise_sessions" ADD COLUMN "exercise_title" varchar;
ALTER TABLE "exercise_sessions" ADD COLUMN "exercise_category" varchar;

-- Créer la table anti_craving_strategies si elle n'existe pas
CREATE TABLE IF NOT EXISTS "anti_craving_strategies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"context" varchar NOT NULL,
	"exercise" text NOT NULL,
	"effort" varchar NOT NULL,
	"duration" integer NOT NULL,
	"craving_before" integer NOT NULL,
	"craving_after" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Ajouter les contraintes de clés étrangères
ALTER TABLE "beck_analyses" ADD CONSTRAINT "beck_analyses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
ALTER TABLE "craving_entries" ADD CONSTRAINT "craving_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
ALTER TABLE "exercise_sessions" ADD CONSTRAINT "exercise_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
ALTER TABLE "anti_craving_strategies" ADD CONSTRAINT "anti_craving_strategies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;