#!/usr/bin/env node

/**
 * Script simple de correction des problèmes de l'onglet Education
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🔧 === CORRECTION SIMPLE DES PROBLÈMES EDUCATION ===\n');

// 1. Créer des catégories par défaut via SQL
const createCategoriesSQL = `
-- Insertion des catégories de contenu par défaut
INSERT INTO content_categories (id, name, description, color, icon, "order", is_active, created_at, updated_at) 
VALUES 
  ('craving_management', '🧠 Comprendre le Craving', 'Comprendre et gérer les envies compulsives', 'blue', 'brain', 1, true, NOW(), NOW()),
  ('emergency_strategies', '🚨 Stratégies d''Urgence', 'Techniques rapides pour gérer les crises', 'red', 'alert-triangle', 2, true, NOW(), NOW()),
  ('apa_mental_health', '💪 APA et Santé Mentale', 'Activité physique adaptée pour le bien-être mental', 'green', 'activity', 3, true, NOW(), NOW()),
  ('breathing_relaxation', '🫁 Respiration & Relaxation', 'Techniques de respiration et de détente', 'purple', 'wind', 4, true, NOW(), NOW()),
  ('motivation', '🎯 Motivation et Objectifs', 'Maintenir la motivation dans le parcours de récupération', 'orange', 'target', 5, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  icon = EXCLUDED.icon,
  "order" = EXCLUDED."order",
  is_active = true,
  updated_at = NOW();
`;

// 2. Créer du contenu éducationnel de base
const createContentSQL = `
-- Insertion de contenu éducationnel de base
INSERT INTO educational_contents (title, category_id, type, difficulty, content, description, estimated_read_time, status, is_recommended, author_id, created_at, updated_at)
VALUES 
  (
    'Comprendre le mécanisme du craving',
    'craving_management',
    'text',
    'easy',
    '# Le mécanisme du craving

Le craving, ou envie compulsive, est une expérience neurobiologique complexe qui implique plusieurs circuits cérébraux.

## Qu''est-ce que le craving ?

Le craving se caractérise par :
- Une envie intense et soudaine
- Des pensées obsédantes
- Une sensation d''urgence
- Une difficulté à se concentrer sur autre chose

## Les déclencheurs

Les principaux déclencheurs incluent :
- **Environnementaux** : lieux, personnes, objets
- **Émotionnels** : stress, ennui, tristesse
- **Physiques** : fatigue, faim, douleur
- **Sociaux** : pressions, situations sociales

## La réponse neurobiologique

Quand un déclencheur active le circuit de récompense :
1. Libération de dopamine dans le cerveau
2. Activation du système de motivation
3. Focalisation de l''attention sur l''objet du craving
4. Diminution des capacités de contrôle inhibiteur

## Points clés à retenir

- Le craving est temporaire et diminue naturellement
- Comprendre ses déclencheurs permet de mieux les anticiper
- Des techniques spécifiques peuvent aider à gérer l''intensité',
    'Introduction aux mécanismes neurobiologiques du craving',
    8,
    'published',
    true,
    'system',
    NOW(),
    NOW()
  ),
  (
    'Technique STOP en situation de crise',
    'emergency_strategies',
    'text',
    'easy',
    '# La technique STOP

Une méthode simple et efficace pour gérer les moments de crise intense.

## Les 4 étapes de STOP

### S - STOP (Arrêtez-vous)
- Interrompez immédiatement ce que vous faites
- Prenez une pause physique et mentale
- Posez-vous et restez immobile quelques secondes

### T - TAKE A BREATH (Respirez)
- Prenez 3 respirations profondes et lentes
- Inspirez par le nez (4 secondes)
- Retenez votre souffle (4 secondes)
- Expirez par la bouche (6 secondes)

### O - OBSERVE (Observez)
- Que se passe-t-il dans votre corps ?
- Quelles émotions ressentez-vous ?
- Quelles pensées traversent votre esprit ?
- Où vous trouvez-vous ? Qui est présent ?

### P - PROCEED (Continuez en pleine conscience)
- Choisissez consciemment votre prochaine action
- Utilisez une stratégie de coping appropriée
- Agissez en fonction de vos valeurs, pas de l''impulsion

## Quand utiliser STOP ?

- Sensation de craving intense
- Montée d''émotions difficiles
- Pensées obsédantes
- Envie d''agir impulsivement
- Moments de stress aigu

## Conseil pratique

Entraînez-vous à utiliser STOP dans des situations moins intenses pour que cette technique devienne automatique.',
    'Méthode rapide pour gérer les crises et reprendre le contrôle',
    5,
    'published',
    true,
    'system',
    NOW(),
    NOW()
  ),
  (
    'Respiration 4-7-8 pour l''anxiété',
    'breathing_relaxation',
    'text',
    'easy',
    '# La technique de respiration 4-7-8

Une méthode simple et scientifiquement prouvée pour réduire rapidement l''anxiété et favoriser la relaxation.

## Comment pratiquer ?

### La séquence 4-7-8

1. **Inspirez par le nez** pendant **4 secondes**
2. **Retenez votre souffle** pendant **7 secondes**  
3. **Expirez par la bouche** pendant **8 secondes**

### Répétition
- Commencez par 4 cycles complets
- Augmentez progressivement jusqu''à 8 cycles
- Pratiquez 2-3 fois par jour

## Bénéfices observés

### Immédiats (après 2-3 minutes)
- Réduction de la fréquence cardiaque
- Diminution de la tension musculaire
- Calme mental

### À long terme (après quelques semaines)
- Meilleure gestion du stress
- Amélioration du sommeil
- Réduction de l''anxiété générale

## Conseils pratiques

- Ne forcez jamais le rythme
- Si vous ressentez un vertige, ralentissez
- La pratique régulière améliore l''efficacité',
    'Technique de respiration simple pour calmer l''anxiété rapidement',
    6,
    'published',
    true,
    'system',
    NOW(),
    NOW()
  )
ON CONFLICT (title, author_id) DO NOTHING;
`;

// 3. Corriger les contenus existants sans categoryId
const fixContentSQL = `
-- Mettre à jour les contenus qui ont une catégorie mais pas de category_id
UPDATE educational_contents 
SET category_id = 'craving_management', updated_at = NOW()
WHERE category_id IS NULL AND (category = 'craving_management' OR category ILIKE '%craving%');

UPDATE educational_contents 
SET category_id = 'emergency_strategies', updated_at = NOW()
WHERE category_id IS NULL AND (category = 'emergency_strategies' OR category ILIKE '%emergency%' OR category ILIKE '%urgence%');

UPDATE educational_contents 
SET category_id = 'apa_mental_health', updated_at = NOW()
WHERE category_id IS NULL AND (category = 'apa_mental_health' OR category ILIKE '%apa%' OR category ILIKE '%mental%');

UPDATE educational_contents 
SET category_id = 'breathing_relaxation', updated_at = NOW()
WHERE category_id IS NULL AND (category = 'breathing_relaxation' OR category ILIKE '%breathing%' OR category ILIKE '%relaxation%');

UPDATE educational_contents 
SET category_id = 'motivation', updated_at = NOW()
WHERE category_id IS NULL AND (category = 'motivation' OR category ILIKE '%motivation%');

-- Publier les contenus en brouillon
UPDATE educational_contents 
SET status = 'published', published_at = NOW(), updated_at = NOW()
WHERE status = 'draft';

-- S'assurer que tous les contenus ont une category_id valide
UPDATE educational_contents 
SET category_id = 'craving_management', updated_at = NOW()
WHERE category_id IS NULL OR category_id = '';
`;

// Écrire les scripts SQL dans des fichiers temporaires
fs.writeFileSync('/tmp/create_categories.sql', createCategoriesSQL);
fs.writeFileSync('/tmp/create_content.sql', createContentSQL);
fs.writeFileSync('/tmp/fix_content.sql', fixContentSQL);

console.log('📁 Étape 1: Création des catégories par défaut...');

try {
  // Vérifier si nous avons une base de données PostgreSQL configurée
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('❌ DATABASE_URL non configurée. Vérifiez votre fichier .env');
    process.exit(1);
  }

  console.log('💾 Connexion à la base de données...');

  // Exécuter les scripts SQL via psql si disponible
  try {
    execSync(`psql "${dbUrl}" -f /tmp/create_categories.sql`, { stdio: 'pipe' });
    console.log('✅ Catégories créées avec succès');
  } catch (error) {
    console.log('⚠️ Erreur création catégories (peut-être qu\'elles existent déjà)');
  }

  try {
    execSync(`psql "${dbUrl}" -f /tmp/fix_content.sql`, { stdio: 'pipe' });
    console.log('✅ Contenus existants corrigés');
  } catch (error) {
    console.log('⚠️ Erreur correction contenus existants');
  }

  try {
    execSync(`psql "${dbUrl}" -f /tmp/create_content.sql`, { stdio: 'pipe' });
    console.log('✅ Contenu éducationnel de base créé');
  } catch (error) {
    console.log('⚠️ Erreur création contenu de base (peut-être qu\'il existe déjà)');
  }

  // Vérification finale
  console.log('\n🔍 Vérification finale...');
  
  const checkSQL = `
    SELECT 
      (SELECT COUNT(*) FROM content_categories WHERE is_active = true) as categories_count,
      (SELECT COUNT(*) FROM educational_contents WHERE status = 'published') as published_content_count,
      (SELECT COUNT(*) FROM educational_contents WHERE category_id IS NULL) as content_without_category;
  `;

  fs.writeFileSync('/tmp/check_results.sql', checkSQL);
  
  try {
    const result = execSync(`psql "${dbUrl}" -t -f /tmp/check_results.sql`, { encoding: 'utf-8' });
    const [categories, published, without_category] = result.trim().split('|').map(s => parseInt(s.trim()));
    
    console.log(`📊 Résultats:`);
    console.log(`   - ${categories} catégories actives`);
    console.log(`   - ${published} contenus publiés`);
    console.log(`   - ${without_category} contenus sans catégorie`);
    
    if (categories > 0 && published > 0 && without_category === 0) {
      console.log('\n🎉 SUCCÈS : Les problèmes ont été corrigés !');
      console.log('   - L\'onglet Education devrait maintenant se charger');
      console.log('   - L\'interface admin devrait afficher les contenus');
      console.log('   - Les utilisateurs peuvent voir le contenu éducationnel');
    } else {
      console.log('\n⚠️ Des améliorations sont nécessaires :');
      if (categories === 0) console.log('   - Aucune catégorie trouvée');
      if (published === 0) console.log('   - Aucun contenu publié');
      if (without_category > 0) console.log(`   - ${without_category} contenus sans catégorie`);
    }
    
  } catch (error) {
    console.log('⚠️ Impossible de vérifier les résultats');
  }

} catch (error) {
  console.error('❌ Erreur lors de l\'exécution:', error.message);
  
  // Fallback : afficher les instructions manuelles
  console.log('\n📋 INSTRUCTIONS MANUELLES :');
  console.log('1. Connectez-vous à votre base de données PostgreSQL');
  console.log('2. Exécutez les commandes suivantes :');
  console.log('\n-- Créer les catégories :');
  console.log(createCategoriesSQL);
  console.log('\n-- Corriger les contenus :');
  console.log(fixContentSQL);
  console.log('\n-- Créer du contenu de base :');
  console.log(createContentSQL);
}

// Nettoyer les fichiers temporaires
try {
  fs.unlinkSync('/tmp/create_categories.sql');
  fs.unlinkSync('/tmp/create_content.sql');
  fs.unlinkSync('/tmp/fix_content.sql');
  fs.unlinkSync('/tmp/check_results.sql');
} catch (error) {
  // Ignorer les erreurs de nettoyage
}

console.log('\n✅ Script de correction terminé');