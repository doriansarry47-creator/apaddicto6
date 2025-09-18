-- Migration pour permettre exerciseId null dans exercise_sessions
-- Ceci permet plus de flexibilité pour les sessions d'exercices

-- Supprimer la contrainte NOT NULL sur exercise_id
ALTER TABLE exercise_sessions ALTER COLUMN exercise_id DROP NOT NULL;

-- Ajouter les colonnes notes et updatedAt si elles n'existent pas
DO $$ 
BEGIN
    -- Ajouter la colonne notes si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'exercise_sessions' AND column_name = 'notes') THEN
        ALTER TABLE exercise_sessions ADD COLUMN notes TEXT;
    END IF;
    
    -- Ajouter la colonne updated_at si elle n'existe pas  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'exercise_sessions' AND column_name = 'updated_at') THEN
        ALTER TABLE exercise_sessions ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    END IF;
END $$;