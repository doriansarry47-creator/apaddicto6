#!/usr/bin/env node

/**
 * Script de correction des problèmes de l'onglet Education
 * et de l'interface admin de gestion de contenu
 */

import { db } from './server/storage.js';
import { 
  contentCategories, 
  educationalContents 
} from './shared/schema.js';
import { eq, and } from 'drizzle-orm';

class EducationFixer {
  constructor() {
    this.storage = db;
  }

  async createDefaultCategories() {
    console.log('📁 Création des catégories par défaut...');
    
    const defaultCategories = [
      {
        id: 'craving_management',
        name: '🧠 Comprendre le Craving',
        description: 'Comprendre et gérer les envies compulsives',
        color: 'blue',
        icon: 'brain',
        order: 1,
        isActive: true
      },
      {
        id: 'emergency_strategies',
        name: '🚨 Stratégies d\'Urgence',
        description: 'Techniques rapides pour gérer les crises',
        color: 'red',
        icon: 'alert-triangle',
        order: 2,
        isActive: true
      },
      {
        id: 'apa_mental_health',
        name: '💪 APA et Santé Mentale',
        description: 'Activité physique adaptée pour le bien-être mental',
        color: 'green',
        icon: 'activity',
        order: 3,
        isActive: true
      },
      {
        id: 'breathing_relaxation',
        name: '🫁 Respiration & Relaxation',
        description: 'Techniques de respiration et de détente',
        color: 'purple',
        icon: 'wind',
        order: 4,
        isActive: true
      },
      {
        id: 'motivation',
        name: '🎯 Motivation et Objectifs',
        description: 'Maintenir la motivation dans le parcours de récupération',
        color: 'orange',
        icon: 'target',
        order: 5,
        isActive: true
      }
    ];

    const createdCategories = [];
    
    for (const categoryData of defaultCategories) {
      try {
        // Vérifier si la catégorie existe déjà
        const existing = await this.storage
          .select()
          .from(contentCategories)
          .where(eq(contentCategories.id, categoryData.id))
          .limit(1);
        
        if (existing.length === 0) {
          const result = await this.storage
            .insert(contentCategories)
            .values(categoryData)
            .returning();
          
          createdCategories.push(result[0]);
          console.log('✅ Catégorie créée:', categoryData.name);
        } else {
          // Mettre à jour si nécessaire
          await this.storage
            .update(contentCategories)
            .set({ isActive: true })
            .where(eq(contentCategories.id, categoryData.id));
          
          console.log('🔄 Catégorie mise à jour:', categoryData.name);
        }
      } catch (error) {
        console.error('❌ Erreur création catégorie:', categoryData.name, error.message);
      }
    }
    
    return createdCategories;
  }

  async createSampleContent() {
    console.log('📚 Création de contenu éducationnel de démonstration...');
    
    const sampleContents = [
      {
        title: 'Comprendre le mécanisme du craving',
        categoryId: 'craving_management',
        type: 'text',
        difficulty: 'easy',
        content: `# Le mécanisme du craving

Le craving, ou envie compulsive, est une expérience neurobiologique complexe qui implique plusieurs circuits cérébraux.

## Qu'est-ce que le craving ?

Le craving se caractérise par :
- Une envie intense et soudaine
- Des pensées obsédantes
- Une sensation d'urgence
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
3. Focalisation de l'attention sur l'objet du craving
4. Diminution des capacités de contrôle inhibiteur

## Points clés à retenir

- Le craving est temporaire et diminue naturellement
- Comprendre ses déclencheurs permet de mieux les anticiper
- Des techniques spécifiques peuvent aider à gérer l'intensité`,
        description: 'Introduction aux mécanismes neurobiologiques du craving',
        estimatedReadTime: 8,
        status: 'published',
        isRecommended: true,
        authorId: 'system'
      },
      {
        title: 'Technique STOP en situation de crise',
        categoryId: 'emergency_strategies',
        type: 'text',
        difficulty: 'easy',
        content: `# La technique STOP

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
- Agissez en fonction de vos valeurs, pas de l'impulsion

## Quand utiliser STOP ?

- Sensation de craving intense
- Montée d'émotions difficiles
- Pensées obsédantes
- Envie d'agir impulsivement
- Moments de stress aigu

## Conseil pratique

Entraînez-vous à utiliser STOP dans des situations moins intenses pour que cette technique devienne automatique.`,
        description: 'Méthode rapide pour gérer les crises et reprendre le contrôle',
        estimatedReadTime: 5,
        status: 'published',
        isRecommended: true,
        authorId: 'system'
      },
      {
        title: 'Les bienfaits de l\'exercice sur l\'humeur',
        categoryId: 'apa_mental_health',
        type: 'text',
        difficulty: 'intermediate',
        content: `# L'exercice physique : un antidépresseur naturel

L'activité physique régulière est l'un des outils les plus puissants pour améliorer l'humeur et réduire les symptômes de dépression et d'anxiété.

## Les mécanismes d'action

### Neurochimiques
- **Endorphines** : "hormones du bonheur" libérées pendant l'effort
- **BDNF** : facteur neurotrophique qui favorise la neuroplasticité
- **Neurotransmetteurs** : augmentation de la sérotonine, dopamine et noradrénaline

### Psychologiques
- Amélioration de l'estime de soi
- Sentiment d'accomplissement
- Distraction des pensées négatives
- Augmentation de la confiance en soi

### Sociaux
- Opportunités de socialisation
- Soutien du groupe ou coach
- Sentiment d'appartenance

## Types d'exercices bénéfiques

### Exercices cardiovasculaires (30-45 min)
- Course à pied ou marche rapide
- Natation
- Cyclisme
- Danse

### Exercices de force (20-30 min)
- Musculation
- Exercices au poids du corps
- Yoga dynamique
- Pilates

### Activités douces (15-60 min)
- Marche contemplative
- Tai chi
- Yoga relaxant
- Étirements

## Recommandations pratiques

- **Fréquence** : Au moins 3-4 fois par semaine
- **Durée** : 20-60 minutes selon l'activité
- **Intensité** : Modérée (vous devez pouvoir tenir une conversation)
- **Régularité** : Plus important que l'intensité

## Conseils pour débuter

1. Commencez petit (10-15 minutes)
2. Choisissez une activité que vous aimez
3. Planifiez des créneaux fixes
4. Trouvez un partenaire d'entraînement
5. Célébrez vos progrès`,
        description: 'Comment l\'activité physique améliore naturellement l\'humeur',
        estimatedReadTime: 12,
        status: 'published',
        isRecommended: false,
        authorId: 'system'
      },
      {
        title: 'Respiration 4-7-8 pour l\'anxiété',
        categoryId: 'breathing_relaxation',
        type: 'text',
        difficulty: 'easy',
        content: `# La technique de respiration 4-7-8

Une méthode simple et scientifiquement prouvée pour réduire rapidement l'anxiété et favoriser la relaxation.

## Principe de base

Cette technique active le système nerveux parasympathique, responsable de la réponse de relaxation du corps.

## Comment pratiquer ?

### Position
- Asseyez-vous confortablement, dos droit
- Ou allongez-vous sur le dos
- Placez une main sur la poitrine, une sur le ventre

### La séquence 4-7-8

1. **Inspirez par le nez** pendant **4 secondes**
   - Le ventre doit se gonfler, pas la poitrine
   
2. **Retenez votre souffle** pendant **7 secondes**
   - Comptez mentalement et restez détendu
   
3. **Expirez par la bouche** pendant **8 secondes**
   - Videz complètement vos poumons
   - Faites un léger bruit en expirant

### Répétition
- Commencez par 4 cycles complets
- Augmentez progressivement jusqu'à 8 cycles
- Pratiquez 2-3 fois par jour

## Bénéfices observés

### Immédiats (après 2-3 minutes)
- Réduction de la fréquence cardiaque
- Diminution de la tension musculaire
- Calme mental

### À long terme (après quelques semaines)
- Meilleure gestion du stress
- Amélioration du sommeil
- Réduction de l'anxiété générale

## Quand utiliser cette technique ?

- Avant de s'endormir
- En période de stress
- Lors d'attaques d'anxiété
- Avant un événement stressant
- Pour se recentrer pendant la journée

## Conseils pratiques

- Ne forcez jamais le rythme
- Si vous ressentez un vertige, ralentissez
- La pratique régulière améliore l'efficacité
- Combinez avec la méditation pour plus de bénéfices`,
        description: 'Technique de respiration simple pour calmer l\'anxiété rapidement',
        estimatedReadTime: 6,
        status: 'published',
        isRecommended: true,
        authorId: 'system'
      }
    ];

    const createdContents = [];
    
    for (const contentData of sampleContents) {
      try {
        // Vérifier si le contenu existe déjà
        const existing = await this.storage
          .select()
          .from(educationalContents)
          .where(and(
            eq(educationalContents.title, contentData.title),
            eq(educationalContents.authorId, 'system')
          ))
          .limit(1);
        
        if (existing.length === 0) {
          const result = await this.storage
            .insert(educationalContents)
            .values({
              ...contentData,
              createdAt: new Date(),
              updatedAt: new Date()
            })
            .returning();
          
          createdContents.push(result[0]);
          console.log('✅ Contenu créé:', contentData.title);
        } else {
          console.log('⏭️ Contenu existe déjà:', contentData.title);
        }
      } catch (error) {
        console.error('❌ Erreur création contenu:', contentData.title, error.message);
      }
    }
    
    return createdContents;
  }

  async publishDraftContents() {
    console.log('📢 Publication des contenus en brouillon...');
    
    try {
      const draftContents = await this.storage
        .select()
        .from(educationalContents)
        .where(eq(educationalContents.status, 'draft'));
      
      console.log(`📋 ${draftContents.length} contenus en brouillon trouvés`);
      
      if (draftContents.length > 0) {
        await this.storage
          .update(educationalContents)
          .set({ 
            status: 'published',
            publishedAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(educationalContents.status, 'draft'));
        
        console.log(`✅ ${draftContents.length} contenus publiés`);
      }
      
      return draftContents.length;
    } catch (error) {
      console.error('❌ Erreur publication contenus:', error.message);
      return 0;
    }
  }

  async fixCategoryReferences() {
    console.log('🔧 Correction des références de catégories...');
    
    try {
      const contents = await this.storage
        .select()
        .from(educationalContents);
      
      let fixed = 0;
      
      for (const content of contents) {
        let needsUpdate = false;
        const updates = {};
        
        // Si categoryId est manquant mais category existe
        if (!content.categoryId && content.category) {
          updates.categoryId = content.category;
          needsUpdate = true;
        }
        
        // Si categoryId existe mais pas reconnu, utiliser une catégorie par défaut
        if (content.categoryId) {
          const validCategories = [
            'craving_management', 'emergency_strategies', 'apa_mental_health', 
            'breathing_relaxation', 'motivation'
          ];
          
          if (!validCategories.includes(content.categoryId)) {
            updates.categoryId = 'craving_management'; // Catégorie par défaut
            needsUpdate = true;
          }
        }
        
        if (needsUpdate) {
          await this.storage
            .update(educationalContents)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(educationalContents.id, content.id));
          
          fixed++;
        }
      }
      
      console.log(`🔧 ${fixed} contenus corrigés`);
      return fixed;
    } catch (error) {
      console.error('❌ Erreur correction références:', error.message);
      return 0;
    }
  }

  async runFullFix() {
    console.log('🔧 === CORRECTION DES PROBLÈMES EDUCATION ===\n');
    
    try {
      // 1. Créer les catégories par défaut
      console.log('📁 Étape 1: Création des catégories...');
      await this.createDefaultCategories();
      
      // 2. Corriger les références de catégories existantes
      console.log('\n🔧 Étape 2: Correction des références...');
      await this.fixCategoryReferences();
      
      // 3. Publier les contenus en brouillon
      console.log('\n📢 Étape 3: Publication des brouillons...');
      const publishedCount = await this.publishDraftContents();
      
      // 4. Créer du contenu de démonstration si nécessaire
      console.log('\n📚 Étape 4: Création de contenu de démonstration...');
      const publishedContents = await this.storage
        .select()
        .from(educationalContents)
        .where(eq(educationalContents.status, 'published'));
      
      if (publishedContents.length === 0) {
        await this.createSampleContent();
      } else {
        console.log(`⏭️ ${publishedContents.length} contenus publiés déjà présents`);
      }
      
      // 5. Vérification finale
      console.log('\n✅ Étape 5: Vérification finale...');
      const finalCategories = await this.storage
        .select()
        .from(contentCategories)
        .where(eq(contentCategories.isActive, true));
      
      const finalContents = await this.storage
        .select()
        .from(educationalContents)
        .where(eq(educationalContents.status, 'published'));
      
      console.log(`📊 Résultat final:`);
      console.log(`   - ${finalCategories.length} catégories actives`);
      console.log(`   - ${finalContents.length} contenus publiés`);
      
      if (finalCategories.length > 0 && finalContents.length > 0) {
        console.log('\n🎉 SUCCÈS : Les problèmes ont été corrigés !');
        console.log('   - L\'onglet Education devrait maintenant se charger');
        console.log('   - L\'interface admin devrait afficher les contenus');
        console.log('   - Les utilisateurs peuvent voir le contenu éducationnel');
      } else {
        console.log('\n⚠️ Des problèmes persistent. Vérification manuelle requise.');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la correction:', error.message);
      throw error;
    }
  }
}

// Exécution de la correction
const fixer = new EducationFixer();
fixer.runFullFix()
  .then(() => {
    console.log('\n✅ Script de correction terminé');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });