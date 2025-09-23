-- Migration pour ajouter les nouvelles fonctionnalités de séances
-- À exécuter manuellement ou via un outil de migration

-- 1. Ajouter les nouveaux champs à la table exercises
ALTER TABLE exercises 
ADD COLUMN IF NOT EXISTS media_url VARCHAR,
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS variable_1 TEXT,
ADD COLUMN IF NOT EXISTS variable_2 TEXT,
ADD COLUMN IF NOT EXISTS variable_3 TEXT;

-- 2. Ajouter le champ status à la table custom_sessions
ALTER TABLE custom_sessions 
ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'draft';

-- Mettre à jour les séances existantes comme publiées
UPDATE custom_sessions 
SET status = 'published' 
WHERE status IS NULL;

-- 3. Créer la table patient_sessions
CREATE TABLE IF NOT EXISTS patient_sessions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
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
);

-- 4. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_patient_sessions_patient_id ON patient_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_sessions_session_id ON patient_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_patient_sessions_status ON patient_sessions(status);
CREATE INDEX IF NOT EXISTS idx_exercises_tags ON exercises USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_custom_sessions_status ON custom_sessions(status);

-- 5. Ajouter des contraintes de validation
ALTER TABLE patient_sessions 
ADD CONSTRAINT IF NOT EXISTS check_effort_range 
CHECK (effort IS NULL OR (effort >= 1 AND effort <= 10));

ALTER TABLE patient_sessions 
ADD CONSTRAINT IF NOT EXISTS check_duration_positive 
CHECK (duration IS NULL OR duration > 0);

ALTER TABLE patient_sessions 
ADD CONSTRAINT IF NOT EXISTS check_status_valid 
CHECK (status IN ('assigned', 'done', 'skipped'));

ALTER TABLE custom_sessions 
ADD CONSTRAINT IF NOT EXISTS check_session_status_valid 
CHECK (status IN ('draft', 'published', 'archived'));

-- 6. Ajouter des triggers pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_patient_sessions_updated_at ON patient_sessions;
CREATE TRIGGER update_patient_sessions_updated_at 
    BEFORE UPDATE ON patient_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Insérer des données de test (optionnel)
-- Vous pouvez décommenter ces lignes pour avoir des données de test

/*
-- Ajouter des tags aux exercices existants
UPDATE exercises 
SET tags = '["relaxation", "anti-stress"]'::jsonb 
WHERE category = 'relaxation' AND tags = '[]';

UPDATE exercises 
SET tags = '["cardio", "endurance"]'::jsonb 
WHERE category = 'cardio' AND tags = '[]';

UPDATE exercises 
SET tags = '["force", "musculation"]'::jsonb 
WHERE category = 'strength' AND tags = '[]';

UPDATE exercises 
SET tags = '["respiration", "mindfulness"]'::jsonb 
WHERE category = 'mindfulness' AND tags = '[]';

-- Ajouter des variables dynamiques à quelques exercices
UPDATE exercises 
SET variable_1 = 'Nombre de répétitions: 10-15',
    variable_2 = 'Durée de maintien: 30 secondes',
    variable_3 = 'Niveau d''intensité: Modéré'
WHERE id IN (
    SELECT id FROM exercises LIMIT 3
);
*/

-- Vérification des changements
SELECT 'Migration terminée avec succès!' as status;

-- Vérifier les nouvelles colonnes
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'exercises' 
    AND column_name IN ('media_url', 'tags', 'variable_1', 'variable_2', 'variable_3')
ORDER BY column_name;

SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'custom_sessions' 
    AND column_name = 'status';

-- Vérifier la création de la table patient_sessions
SELECT 
    COUNT(*) as patient_sessions_table_exists 
FROM information_schema.tables 
WHERE table_name = 'patient_sessions';