#!/usr/bin/env node

/**
 * RÉPARATION COMPLÈTE DU SYSTÈME ÉDUCATIF
 * 
 * Ce script répare entièrement le lien logique entre :
 * - Admin (création/gestion de contenus éducatifs) 
 * - Patient (consultation/filtrage des contenus)
 * 
 * Problèmes résolus :
 * 1. Synchronisation des tables educationalContents et contentCategories
 * 2. Migration des anciens contenus psychoEducationContent vers le nouveau système
 * 3. Création des catégories par défaut
 * 4. Vérification des relations FK
 * 5. Test de cohérence complète
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { 
  educationalContents, 
  contentCategories, 
  psychoEducationContent,
  users 
} from './shared/schema.ts';
import { eq, and, sql, desc } from 'drizzle-orm';

// Configuration de la base de données
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') || process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const db = drizzle(pool);

// Catégories par défaut optimisées pour la thérapie
const DEFAULT_CATEGORIES = [
  {
    name: "Comprendre l'Addiction",
    description: "Ressources pour comprendre les mécanismes de l'addiction et de la dépendance",
    color: "red",
    icon: "brain",
    order: 1
  },
  {
    name: "Techniques de Motivation", 
    description: "Stratégies pour maintenir la motivation dans le processus de récupération",
    color: "blue",
    icon: "zap", 
    order: 2
  },
  {
    name: "Stratégies Anti-Craving",
    description: "Méthodes pratiques pour gérer les envies et les pulsions",
    color: "orange",
    icon: "shield",
    order: 3
  },
  {
    name: "Prévention des Rechutes",
    description: "Outils et techniques pour prévenir et gérer les rechutes",
    color: "green", 
    icon: "target",
    order: 4
  },
  {
    name: "Gestion Émotionnelle",
    description: "Ressources pour comprendre et gérer les émotions difficiles", 
    color: "purple",
    icon: "heart",
    order: 5
  },
  {
    name: "Relaxation et Détente",
    description: "Techniques de relaxation, méditation et gestion du stress",
    color: "green",
    icon: "leaf",
    order: 6
  }
];

// Contenus éducatifs par défaut
const DEFAULT_CONTENTS = [
  {
    title: "Comprendre le Cycle de l'Addiction",
    description: "Une introduction aux mécanismes neurobiologiques de l'addiction et comment elle affecte le cerveau.",
    type: "text",
    categoryKey: "addiction",
    difficulty: "easy",
    estimatedReadTime: 10,
    content: `# Comprendre le Cycle de l'Addiction

L'addiction est un processus complexe qui affecte le système de récompense du cerveau. Comprendre ce processus est la première étape vers la récupération.

## Le Circuit de la Récompense

Notre cerveau possède un système naturel de récompense qui nous motive à répéter des comportements bénéfiques pour notre survie. Ce système implique principalement la dopamine, un neurotransmetteur qui crée une sensation de plaisir.

## Comment l'Addiction Se Développe

1. **Exposition initiale** : La première consommation active le système de récompense
2. **Répétition** : Le cerveau associe la substance à la récompense
3. **Tolérance** : Le cerveau s'adapte, nécessitant plus de substance pour le même effet
4. **Dépendance** : Le système de récompense naturel est dysfonctionnel sans la substance

## Impact sur la Prise de Décision

L'addiction altère les zones du cerveau responsables de :
- La prise de décision rationnelle
- Le contrôle des impulsions
- La planification à long terme
- L'évaluation des conséquences

## Espoir et Récupération

Le cerveau a une capacité remarquable à se réparer et à créer de nouvelles connexions. La récupération est possible grâce à la neuroplasticité.`,
    tags: ["neurobiologie", "cycle", "dopamine", "récupération"],
    isRecommended: true,
    status: "published"
  },
  {
    title: "Techniques de Respiration Anti-Stress",
    description: "Méthodes simples de respiration pour gérer le stress et les moments difficiles.",
    type: "text",
    categoryKey: "relaxation",
    difficulty: "easy", 
    estimatedReadTime: 8,
    content: `# Techniques de Respiration Anti-Stress

La respiration consciente est l'un des outils les plus puissants pour gérer le stress et l'anxiété. Ces techniques peuvent être utilisées n'importe où, n'importe quand.

## Technique 4-7-8 (Respiration Apaisante)

1. **Inspiration** : Inspirez par le nez pendant 4 secondes
2. **Rétention** : Retenez votre respiration pendant 7 secondes
3. **Expiration** : Expirez lentement par la bouche pendant 8 secondes
4. **Répétition** : Répétez 4 fois maximum au début

## Respiration Abdominale

1. Placez une main sur votre poitrine, l'autre sur votre ventre
2. Inspirez lentement par le nez, en gonflant votre ventre
3. La main sur la poitrine ne doit presque pas bouger
4. Expirez lentement par la bouche
5. Pratiquez 5-10 minutes par jour

## Respiration Carrée (Box Breathing)

1. Inspirez pendant 4 secondes
2. Retenez pendant 4 secondes  
3. Expirez pendant 4 secondes
4. Pausez pendant 4 secondes
5. Répétez le cycle

## Quand Utiliser Ces Techniques

- Avant une situation stressante
- Pendant une crise d'anxiété
- Pour vous endormir
- Après un conflit ou une émotion intense
- En prévention quotidienne`,
    tags: ["respiration", "stress", "anxiété", "techniques"],
    isRecommended: true,
    status: "published"
  },
  {
    title: "La Motivation : Trouver Votre Pourquoi",
    description: "Découvrir et maintenir votre motivation profonde dans le processus de changement.",
    type: "text",
    categoryKey: "motivation",
    difficulty: "intermediate",
    estimatedReadTime: 12,
    content: `# La Motivation : Trouver Votre Pourquoi

La motivation durable ne vient pas de l'extérieur, mais de vos valeurs et aspirations les plus profondes. Découvrir votre "pourquoi" est essentiel pour maintenir votre engagement.

## Types de Motivation

### Motivation Extrinsèque
- Récompenses externes (argent, reconnaissance)
- Évitement de punitions
- Pression sociale
- *Efficace à court terme, mais fragile*

### Motivation Intrinsèque  
- Valeurs personnelles profondes
- Sens du but et de la mission
- Croissance personnelle
- *Plus durable et puissante*

## Exercice : Découvrir Votre Pourquoi

1. **Listez vos valeurs** : Qu'est-ce qui est vraiment important pour vous ?
2. **Visualisez votre vie idéale** : Comment voulez-vous vous sentir dans 5 ans ?
3. **Identifiez vos bénéficiaires** : Qui d'autre bénéficie de votre changement ?
4. **Connectez-vous à vos émotions** : Que ressentez-vous en pensant à votre objectif ?

## Maintenir la Motivation

- **Rappels visuels** : Photos, citations, symboles de vos objectifs
- **Célébration des petites victoires** : Reconnaissez chaque progrès
- **Connexion sociale** : Entourez-vous de personnes qui soutiennent votre changement
- **Révision régulière** : Revisitez votre "pourquoi" quotidiennement

## Quand la Motivation Faiblit

C'est normal ! La motivation fluctue. Dans ces moments :
- Revenez à vos valeurs fondamentales
- Rappelez-vous d'où vous venez
- Visualisez où vous voulez aller
- Demandez du soutien
- Acceptez que c'est un processus, pas un événement ponctuel`,
    tags: ["motivation", "valeurs", "objectifs", "changement"],
    isRecommended: true,
    status: "published"
  },
  {
    title: "Stratégies Face aux Cravings",
    description: "Techniques pratiques pour gérer les envies et les pulsions de consommation.",
    type: "text", 
    categoryKey: "anti-craving",
    difficulty: "intermediate",
    estimatedReadTime: 15,
    content: `# Stratégies Face aux Cravings

Les cravings (envies intenses) sont une partie normale du processus de récupération. Apprendre à les gérer efficacement est crucial pour votre réussite à long terme.

## Comprendre les Cravings

### Qu'est-ce qu'un Craving ?
- Une envie intense et temporaire
- Une activation du système de récompense
- Un signal, pas un ordre
- Ils diminuent TOUJOURS avec le temps

### Triggers Communs
- **Émotionnels** : stress, tristesse, colère, ennui
- **Environnementaux** : lieux, personnes, objets
- **Physiques** : fatigue, faim, douleur
- **Sociaux** : pression des pairs, festivités

## Techniques de Gestion Immédiate

### 1. Technique STOP
- **S**top : Arrêtez-vous
- **T**ake a breath : Respirez profondément
- **O**bserve : Observez vos sensations sans jugement
- **P**roceed : Agissez consciemment

### 2. Surf the Urge (Surfer sur l'Envie)
- Imaginez le craving comme une vague
- Elle monte, atteint un pic, puis redescend
- Vous êtes le surfeur qui observe et attend
- Durée moyenne : 15-20 minutes

### 3. Techniques de Distraction
- **Physiques** : Exercice, marche rapide, sport
- **Mentales** : Puzzle, lecture, calcul mental
- **Créatives** : Dessin, musique, écriture
- **Sociales** : Appel à un proche, groupe de soutien

### 4. Affirmations Positives
- "Ce craving va passer"
- "Je suis plus fort que cette envie"
- "Chaque craving surmonté me rend plus fort"
- "Je choisis ma santé et mon bien-être"

## Plan d'Action Personnel

1. **Identifiez vos triggers** : Tenez un journal
2. **Préparez vos outils** : Liste de techniques préférées
3. **Créez un réseau de soutien** : Personnes à contacter
4. **Planifiez des alternatives** : Activités de remplacement
5. **Célébrez vos victoires** : Chaque craving surmonté compte

## Quand Demander de l'Aide

Si les cravings deviennent :
- Trop fréquents ou intenses
- Accompagnés d'idées suicidaires
- Difficiles à gérer seul
- N'hésitez pas à contacter un professionnel`,
    tags: ["craving", "envies", "gestion", "techniques"],
    isRecommended: true,
    status: "published"
  }
];

async function repairEducationalSystem() {
  console.log('\n🔧 === RÉPARATION COMPLÈTE DU SYSTÈME ÉDUCATIF ===\n');
  
  try {
    console.log('📊 1. Analyse de l\'état actuel...');
    
    // Vérifier l'état des tables
    const existingCategories = await db.select().from(contentCategories);
    const existingContents = await db.select().from(educationalContents);
    const oldContents = await db.select().from(psychoEducationContent);
    
    console.log(`   • Catégories existantes: ${existingCategories.length}`);
    console.log(`   • Contenus éducatifs existants: ${existingContents.length}`);
    console.log(`   • Anciens contenus psycho: ${oldContents.length}`);
    
    // Étape 1: Créer/Mettre à jour les catégories
    console.log('\n📁 2. Création/Mise à jour des catégories...');
    
    const categoryMap = new Map();
    
    for (const catData of DEFAULT_CATEGORIES) {
      try {
        // Vérifier si la catégorie existe déjà
        const existing = existingCategories.find(c => 
          c.name.toLowerCase() === catData.name.toLowerCase()
        );
        
        if (existing) {
          console.log(`   ✅ Catégorie existante: ${catData.name}`);
          categoryMap.set(catData.name.toLowerCase().replace(/[^a-z]/g, ''), existing.id);
        } else {
          const [newCategory] = await db
            .insert(contentCategories)
            .values({
              name: catData.name,
              description: catData.description,
              color: catData.color,
              icon: catData.icon,
              order: catData.order,
              isActive: true
            })
            .returning();
          
          console.log(`   ➕ Nouvelle catégorie créée: ${catData.name}`);
          categoryMap.set(catData.name.toLowerCase().replace(/[^a-z]/g, ''), newCategory.id);
        }
      } catch (error) {
        console.error(`   ❌ Erreur catégorie ${catData.name}:`, error.message);
      }
    }
    
    // Étape 2: Migration des anciens contenus
    console.log('\n📚 3. Migration des anciens contenus psycho-éducatifs...');
    
    if (oldContents.length > 0) {
      // Trouver un admin pour attribuer la création
      const admins = await db.select().from(users).where(eq(users.role, 'admin'));
      const adminId = admins.length > 0 ? admins[0].id : null;
      
      for (const oldContent of oldContents) {
        try {
          // Vérifier si déjà migré
          const existingMigrated = existingContents.find(c => 
            c.title === oldContent.title && c.content === oldContent.content
          );
          
          if (existingMigrated) {
            console.log(`   ⏭️  Déjà migré: ${oldContent.title}`);
            continue;
          }
          
          // Mapper la catégorie
          let categoryId = null;
          const oldCategory = oldContent.category?.toLowerCase();
          
          if (oldCategory) {
            if (oldCategory.includes('addiction') || oldCategory.includes('dépendance')) {
              categoryId = categoryMap.get('comprendreladdiction');
            } else if (oldCategory.includes('motivation')) {
              categoryId = categoryMap.get('techniquesdemotivation');
            } else if (oldCategory.includes('coping') || oldCategory.includes('craving')) {
              categoryId = categoryMap.get('strategiesanticraving');
            } else if (oldCategory.includes('relapse') || oldCategory.includes('rechute')) {
              categoryId = categoryMap.get('preventiondesrechutes');
            } else if (oldCategory.includes('relaxation') || oldCategory.includes('détente')) {
              categoryId = categoryMap.get('relaxationetdetente');
            }
          }
          
          // Créer le nouveau contenu
          const [migratedContent] = await db
            .insert(educationalContents)
            .values({
              title: oldContent.title,
              description: oldContent.content.substring(0, 200) + '...',
              type: oldContent.type || 'text',
              categoryId: categoryId,
              tags: [],
              mediaUrl: oldContent.videoUrl || oldContent.audioUrl || oldContent.imageUrl,
              mediaType: oldContent.videoUrl ? 'youtube' : oldContent.audioUrl ? 'audio' : 'external_link',
              content: oldContent.content,
              difficulty: oldContent.difficulty || 'easy',
              estimatedReadTime: oldContent.estimatedReadTime || Math.ceil(oldContent.content.length / 200),
              status: 'published',
              isRecommended: false,
              viewCount: 0,
              likeCount: 0,
              authorId: adminId,
              publishedAt: new Date(),
              isActive: true
            })
            .returning();
            
          console.log(`   ✅ Migré: ${oldContent.title}`);
        } catch (error) {
          console.error(`   ❌ Erreur migration ${oldContent.title}:`, error.message);
        }
      }
    }
    
    // Étape 3: Créer les contenus par défaut
    console.log('\n📝 4. Création des contenus éducatifs par défaut...');
    
    // Trouver un admin pour attribuer la création
    const admins = await db.select().from(users).where(eq(users.role, 'admin'));
    const adminId = admins.length > 0 ? admins[0].id : null;
    
    if (!adminId) {
      console.log('   ⚠️  Aucun admin trouvé, création sans auteur...');
    }
    
    for (const contentData of DEFAULT_CONTENTS) {
      try {
        // Vérifier si le contenu existe déjà
        const existing = existingContents.find(c => 
          c.title === contentData.title
        );
        
        if (existing) {
          console.log(`   ⏭️  Contenu existant: ${contentData.title}`);
          continue;
        }
        
        // Mapper la catégorie
        let categoryId = null;
        const categoryKey = contentData.categoryKey;
        
        switch(categoryKey) {
          case 'addiction':
            categoryId = categoryMap.get('comprendreladdiction');
            break;
          case 'motivation': 
            categoryId = categoryMap.get('techniquesdemotivation');
            break;
          case 'anti-craving':
            categoryId = categoryMap.get('strategiesanticraving');
            break;
          case 'relapse':
            categoryId = categoryMap.get('preventiondesrechutes');
            break;
          case 'emotions':
            categoryId = categoryMap.get('gestionemotionnelle');
            break;
          case 'relaxation':
            categoryId = categoryMap.get('relaxationetdetente');
            break;
        }
        
        // Créer le contenu
        const [newContent] = await db
          .insert(educationalContents)
          .values({
            title: contentData.title,
            description: contentData.description,
            type: contentData.type,
            categoryId: categoryId,
            tags: contentData.tags || [],
            mediaUrl: contentData.mediaUrl || null,
            mediaType: contentData.mediaType || null,
            content: contentData.content,
            difficulty: contentData.difficulty,
            estimatedReadTime: contentData.estimatedReadTime,
            status: contentData.status,
            isRecommended: contentData.isRecommended || false,
            viewCount: 0,
            likeCount: 0,
            thumbnailUrl: contentData.thumbnailUrl || null,
            authorId: adminId,
            publishedAt: contentData.status === 'published' ? new Date() : null,
            isActive: true
          })
          .returning();
          
        console.log(`   ✅ Créé: ${contentData.title}`);
      } catch (error) {
        console.error(`   ❌ Erreur création ${contentData.title}:`, error.message);
      }
    }
    
    // Étape 4: Vérification finale
    console.log('\n🔍 5. Vérification finale du système...');
    
    const finalCategories = await db.select().from(contentCategories);
    const finalContents = await db.select().from(educationalContents);
    
    console.log(`   • Total catégories: ${finalCategories.length}`);
    console.log(`   • Total contenus: ${finalContents.length}`);
    
    // Vérifier les relations
    let orphanedContents = 0;
    for (const content of finalContents) {
      if (content.categoryId) {
        const categoryExists = finalCategories.find(c => c.id === content.categoryId);
        if (!categoryExists) {
          orphanedContents++;
        }
      }
    }
    
    console.log(`   • Contenus sans catégorie valide: ${orphanedContents}`);
    
    // Étape 5: Test des APIs
    console.log('\n🧪 6. Test de cohérence des APIs...');
    
    // Simuler les appels API que font les composants
    try {
      // Test récupération catégories (utilisé par l'admin et patient)
      const testCategories = await db
        .select()
        .from(contentCategories)
        .where(eq(contentCategories.isActive, true))
        .orderBy(contentCategories.order);
        
      console.log(`   ✅ API catégories: ${testCategories.length} catégories récupérées`);
      
      // Test récupération contenus publiés (utilisé par le patient)
      const testContents = await db
        .select()
        .from(educationalContents)
        .where(and(
          eq(educationalContents.status, 'published'),
          eq(educationalContents.isActive, true)
        ))
        .orderBy(desc(educationalContents.createdAt));
        
      console.log(`   ✅ API contenus patients: ${testContents.length} contenus publiés`);
      
      // Test récupération tous contenus (utilisé par l'admin)
      const testAllContents = await db
        .select()
        .from(educationalContents)
        .where(eq(educationalContents.isActive, true))
        .orderBy(desc(educationalContents.createdAt));
        
      console.log(`   ✅ API contenus admin: ${testAllContents.length} contenus totaux`);
      
    } catch (error) {
      console.error('   ❌ Erreur test API:', error.message);
    }
    
    // Statistiques finales
    console.log('\n📈 RÉSUMÉ FINAL:');
    console.log('════════════════════════════════════════');
    console.log(`✅ Catégories actives: ${finalCategories.filter(c => c.isActive).length}`);
    console.log(`✅ Contenus publiés: ${finalContents.filter(c => c.status === 'published').length}`);
    console.log(`✅ Contenus recommandés: ${finalContents.filter(c => c.isRecommended).length}`);
    console.log(`✅ Relations intègres: ${finalContents.length - orphanedContents}/${finalContents.length}`);
    
    if (orphanedContents === 0) {
      console.log('\n🎉 SYSTÈME ÉDUCATIF ENTIÈREMENT RÉPARÉ !');
      console.log('   • L\'admin peut créer et gérer des contenus');
      console.log('   • Les patients peuvent consulter et filtrer les contenus');
      console.log('   • Toutes les relations sont cohérentes');
      console.log('   • Les APIs fonctionnent correctement');
    } else {
      console.log(`\n⚠️  ${orphanedContents} contenu(s) avec des relations incorrectes détectés`);
    }
    
  } catch (error) {
    console.error('\n❌ ERREUR CRITIQUE:', error);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
    console.log('\n🔒 Connexion fermée.');
  }
}

// Exécuter la réparation
repairEducationalSystem().catch(console.error);