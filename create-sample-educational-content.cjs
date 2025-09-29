const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function createSampleContent() {
  try {
    const sql = neon(process.env.DATABASE_URL);

    console.log('📚 Création du contenu éducatif de démonstration...');

    // Récupérer les catégories existantes
    const categories = await sql`
      SELECT id, name FROM content_categories 
      WHERE is_active = true
      ORDER BY "order"
    `;

    console.log(`📋 Trouvé ${categories.length} catégories:`);
    categories.forEach(cat => console.log(`  - ${cat.name} (${cat.id})`));

    if (categories.length === 0) {
      console.error('❌ Aucune catégorie trouvée. Veuillez d\'abord créer les catégories.');
      return;
    }

    // Contenu éducatif pour chaque catégorie
    const sampleContents = [
      // Comprendre l'Addiction
      {
        title: "Les Mécanismes Neurobiologiques de l'Addiction",
        description: "Découvrez comment l'addiction modifie les circuits cérébraux et pourquoi la récupération est un processus neuroplastique.",
        categoryName: "Comprendre l'Addiction",
        type: "text",
        difficulty: "intermediate",
        estimatedReadTime: 15,
        content: `## Qu'est-ce que l'Addiction au Niveau Neurobiologique ?

L'addiction est une maladie neurobiologique complexe qui affecte principalement le système de récompense du cerveau. Comprendre ces mécanismes peut vous aider à mieux appréhender votre parcours de récupération.

## Le Circuit de Récompense

Le cerveau possède un circuit naturel de récompense centré sur la dopamine, un neurotransmetteur clé. Dans des conditions normales, ce circuit nous motive à rechercher des activités bénéfiques pour notre survie.

- La dopamine est libérée lors d'activités plaisantes naturelles
- Elle créée un sentiment de satisfaction et de motivation
- Ce système guide nos comportements vers des activités bénéfiques

## Impact de l'Addiction sur le Cerveau

L'usage répété de substances addictives provoque des changements structurels et fonctionnels dans le cerveau :

- Dysfonctionnement du système de récompense
- Diminution de la production naturelle de dopamine
- Modification des récepteurs dopaminergiques
- Affaiblissement du contrôle inhibiteur

## La Neuroplasticité : Espoir de Guérison

Heureusement, le cerveau possède une capacité remarquable d'adaptation appelée neuroplasticité. Avec le temps et les bonnes stratégies, il peut se "réparer" :

- Formation de nouvelles connexions neuronales
- Restauration progressive de l'équilibre chimique
- Renforcement des circuits de contrôle inhibiteur
- Amélioration des fonctions exécutives`,
        tags: ["neurobiologie", "dopamine", "récupération", "cerveau"],
        isRecommended: true
      },
      
      // Science de l'Exercice
      {
        title: "Comment l'Exercice Combat les Cravings : Les Preuves Scientifiques",
        description: "Explorez les mécanismes scientifiques par lesquels l'activité physique réduit efficacement l'intensité des cravings.",
        categoryName: "Science de l'Exercice",
        type: "text", 
        difficulty: "intermediate",
        estimatedReadTime: 12,
        content: `## L'Exercice : Une Médecine Naturelle Contre les Cravings

La recherche scientifique démontre de plus en plus que l'exercice physique constitue l'une des interventions les plus efficaces pour réduire les cravings et soutenir la récupération.

## Mécanismes Neurochimiques

### Libération d'Endorphines
L'exercice stimule la production d'endorphines, souvent appelées "hormones du bonheur" :

- Activation des mêmes récepteurs que certaines substances addictives
- Procure une sensation de bien-être naturelle et durable
- Réduit l'anxiété et la dépression

### Régulation de la Dopamine
L'activité physique aide à restaurer l'équilibre dopaminergique :

- Augmentation naturelle de la dopamine
- Amélioration de la sensibilité des récepteurs
- Restauration du circuit de récompense naturel

## Impact sur le Stress et l'Anxiété

L'exercice agit comme un puissant régulateur du stress :

- Réduction des niveaux de cortisol
- Activation du système nerveux parasympathique
- Amélioration de la résistance au stress

## Recommandations Pratiques

Pour maximiser les bénéfices anti-craving :

- Pratiquer une activité modérée pendant 30-45 minutes
- Choisir des exercices que vous appréciez
- Maintenir une régularité (3-4 fois par semaine)
- Combiner cardio et renforcement musculaire`,
        tags: ["endorphines", "dopamine", "stress", "exercice"],
        isRecommended: true
      },

      // Psychologie Cognitive
      {
        title: "Techniques de Restructuration Cognitive pour Gérer les Pensées Automatiques",
        description: "Apprenez à identifier et modifier les schémas de pensée négatifs qui alimentent les cravings et les comportements addictifs.",
        categoryName: "Psychologie Cognitive",
        type: "text",
        difficulty: "advanced", 
        estimatedReadTime: 18,
        content: `## Comprendre les Pensées Automatiques

Les pensées automatiques sont des réflexes mentaux qui surgissent spontanément en réponse à certaines situations. Dans l'addiction, ces pensées peuvent déclencher ou intensifier les cravings.

## Identification des Schémas Problématiques

### Types de Pensées Dysfonctionnelles
- **Pensée tout-ou-rien** : "Si je craque une fois, tout est fichu"
- **Catastrophisation** : "Je ne m'en sortirai jamais"
- **Personnalisation** : "C'est entièrement de ma faute"
- **Lecture de pensée** : "Tout le monde me juge"

## Techniques de Restructuration

### 1. La Technique ABCDE
- **A**dversité : Identifier la situation déclenchante
- **B**eliefs : Reconnaître les pensées automatiques
- **C**onséquences : Observer les émotions et comportements
- **D**isputation : Challenger la pensée
- **E**nergisation : Nouvelle réponse émotionnelle

### 2. Questionnement Socratique
Posez-vous ces questions critiques :
- Cette pensée est-elle basée sur des faits ou des opinions ?
- Quelle preuve ai-je que cette pensée est vraie ?
- Existe-t-il une explication alternative ?
- Que dirais-je à un ami dans la même situation ?

## Développement de Pensées Alternatives

### Construction de Réponses Rationnelles
- Rechercher des preuves objectives
- Adopter une perspective équilibrée
- Développer des affirmations réalistes et encourageantes
- Pratiquer la bienveillance envers soi-même

## Exercices Pratiques

### Journal de Pensées
Tenez un journal quotidien incluant :
- Situations déclenchantes
- Pensées automatiques
- Émotions ressenties
- Pensées alternatives développées
- Nouveau ressenti émotionnel`,
        tags: ["pensées automatiques", "restructuration cognitive", "thérapie cognitive", "émotions"],
        isRecommended: false
      },

      // Techniques Pratiques
      {
        title: "Techniques de Respiration d'Urgence : Votre Kit Anti-Craving",
        description: "Maîtrisez des techniques de respiration simples et efficaces pour réduire immédiatement l'intensité des cravings.",
        categoryName: "Techniques Pratiques",
        type: "text",
        difficulty: "easy",
        estimatedReadTime: 8,
        content: `## Pourquoi la Respiration est-elle si Efficace ?

La respiration contrôlée active le système nerveux parasympathique, induisant immédiatement un état de calme et de relaxation. Ces techniques peuvent être utilisées n'importe où, à tout moment.

## Technique 1 : Respiration 4-7-8 (Urgence Immédiate)

### Instructions
1. Expirez complètement par la bouche
2. Fermez la bouche, inspirez par le nez en comptant jusqu'à 4
3. Retenez votre souffle en comptant jusqu'à 7
4. Expirez par la bouche en comptant jusqu'à 8
5. Répétez 4 cycles maximum

### Bénéfices
- Activation rapide du système parasympathique
- Réduction immédiate de l'anxiété
- Effet sédatif naturel

## Technique 2 : Respiration Carrée (Stabilisation)

### Instructions
1. Inspirez pendant 4 temps
2. Retenez pendant 4 temps
3. Expirez pendant 4 temps
4. Pause pendant 4 temps
5. Répétez 5-10 cycles

### Utilisation
- Moments de stress anticipé
- Préparation aux situations difficiles
- Pratique quotidienne préventive

## Technique 3 : Respiration Abdominale Profonde

### Instructions
1. Placez une main sur la poitrine, une sur l'abdomen
2. Inspirez lentement par le nez (seule la main sur l'abdomen doit bouger)
3. Expirez lentement par la bouche
4. Concentrez-vous sur le mouvement abdominal
5. Continuez 5-10 minutes

### Applications
- Relaxation générale
- Préparation au sommeil
- Gestion du stress chronique

## Conseils pour une Pratique Efficace

- Pratiquez ces techniques quotidiennement, même sans craving
- Créez des rappels sur votre téléphone
- Utilisez des applications de respiration guidée
- Combinez avec une visualisation apaisante
- Adaptez la durée selon vos besoins`,
        tags: ["respiration", "relaxation", "techniques d'urgence", "gestion du stress"],
        isRecommended: true
      }
    ];

    // Créer le contenu pour chaque catégorie
    let createdCount = 0;
    for (const content of sampleContents) {
      // Trouver la catégorie correspondante
      const category = categories.find(cat => cat.name === content.categoryName);
      if (!category) {
        console.warn(`⚠️ Catégorie "${content.categoryName}" non trouvée, contenu ignoré`);
        continue;
      }

      // Vérifier si le contenu existe déjà
      const existing = await sql`
        SELECT id FROM educational_contents 
        WHERE title = ${content.title}
      `;

      if (existing.length > 0) {
        console.log(`📄 Contenu "${content.title}" existe déjà, ignoré`);
        continue;
      }

      // Créer le contenu
      await sql`
        INSERT INTO educational_contents (
          title, description, type, category_id, tags, content,
          difficulty, estimated_read_time, status, is_recommended,
          view_count, like_count, is_active
        ) VALUES (
          ${content.title},
          ${content.description},
          ${content.type},
          ${category.id},
          ${JSON.stringify(content.tags)},
          ${content.content},
          ${content.difficulty},
          ${content.estimatedReadTime},
          'published',
          ${content.isRecommended},
          0,
          0,
          true
        )
      `;

      console.log(`✅ Contenu créé: "${content.title}" dans "${category.name}"`);
      createdCount++;
    }

    console.log(`\n🎉 ${createdCount} nouveaux contenus éducatifs créés avec succès !`);

    // Afficher un résumé
    const totalContents = await sql`
      SELECT 
        cc.name as category_name,
        COUNT(ec.id) as content_count
      FROM content_categories cc
      LEFT JOIN educational_contents ec ON cc.id = ec.category_id AND ec.is_active = true
      WHERE cc.is_active = true
      GROUP BY cc.id, cc.name, cc."order"
      ORDER BY cc."order"
    `;

    console.log('\n📊 Résumé des contenus par catégorie:');
    totalContents.forEach(item => {
      console.log(`  - ${item.category_name}: ${item.content_count} contenu(s)`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création du contenu:', error);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  createSampleContent()
    .then(() => {
      console.log('✨ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { createSampleContent };