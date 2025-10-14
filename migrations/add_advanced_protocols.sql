-- Migration pour ajouter les protocoles avancés et les séances favorites
-- Date: 2025-10-14

-- Ajouter les champs de protocole à custom_sessions
ALTER TABLE custom_sessions ADD COLUMN IF NOT EXISTS protocol VARCHAR DEFAULT 'standard';
ALTER TABLE custom_sessions ADD COLUMN IF NOT EXISTS protocol_config JSONB;

-- Ajouter les champs pour les répétitions et sets à session_elements  
ALTER TABLE session_elements ADD COLUMN IF NOT EXISTS sets INTEGER DEFAULT 1;
ALTER TABLE session_elements ADD COLUMN IF NOT EXISTS work_time INTEGER;
ALTER TABLE session_elements ADD COLUMN IF NOT EXISTS rest_interval INTEGER;

-- Modifier la valeur par défaut de repetitions (était 1, devient 0)
ALTER TABLE session_elements ALTER COLUMN repetitions SET DEFAULT 0;

-- Créer la table des séances favorites des patients
CREATE TABLE IF NOT EXISTS favorite_sessions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_session_id VARCHAR REFERENCES custom_sessions(id) ON DELETE SET NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  category VARCHAR NOT NULL,
  protocol VARCHAR DEFAULT 'standard',
  protocol_config JSONB,
  total_duration INTEGER,
  difficulty VARCHAR DEFAULT 'beginner',
  exercises JSONB NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  image_url VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_favorite_sessions_user_id ON favorite_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_sessions_category ON favorite_sessions(category);
CREATE INDEX IF NOT EXISTS idx_favorite_sessions_protocol ON favorite_sessions(protocol);
CREATE INDEX IF NOT EXISTS idx_custom_sessions_protocol ON custom_sessions(protocol);

-- Commentaires pour documentation
COMMENT ON COLUMN custom_sessions.protocol IS 'Type de protocole: standard, hiit, tabata, hict, emom, e2mom, amrap';
COMMENT ON COLUMN custom_sessions.protocol_config IS 'Configuration JSON spécifique au protocole choisi';
COMMENT ON COLUMN session_elements.repetitions IS 'Nombre de répétitions (obligatoire pour HICT, EMOM, AMRAP)';
COMMENT ON COLUMN session_elements.sets IS 'Nombre de séries';
COMMENT ON COLUMN session_elements.work_time IS 'Durée d''effort en secondes (pour protocoles intervalles)';
COMMENT ON COLUMN session_elements.rest_interval IS 'Durée de repos en secondes (pour protocoles intervalles)';
COMMENT ON TABLE favorite_sessions IS 'Séances personnalisées et sauvegardées par les patients';
