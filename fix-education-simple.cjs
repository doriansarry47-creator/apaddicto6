const { Client } = require("pg");

// Configuration de la base de données
const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_vRJU7LlnYG1y@ep-soft-bush-ab0hbww0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require",
});

// Categories with proper IDs that match the admin interface
const defaultCategories = [
  {
    id: "craving_management",
    name: "🧠 Comprendre le Craving",
    description: "Concepts fondamentaux sur les mécanismes du craving et comment le gérer",
    color: "red",
    icon: "brain",
    order: 1,
    isActive: true
  },
  {
    id: "emergency_strategies", 
    name: "🚨 Stratégies d'Urgence",
    description: "Techniques immédiates pour gérer les crises et moments difficiles",
    color: "red",
    icon: "shield",
    order: 2,
    isActive: true
  },
  {
    id: "apa_mental_health",
    name: "💪 APA et Santé Mentale", 
    description: "Activité physique adaptée et son impact sur le bien-être mental",
    color: "blue",
    icon: "fitness_center",
    order: 3,
    isActive: true
  },
  {
    id: "exercise_benefits",
    name: "🏃 Bénéfices de l'Exercice",
    description: "Les avantages scientifiquement prouvés de l'exercice physique",
    color: "green",
    icon: "directions_run",
    order: 4,
    isActive: true
  },
  {
    id: "breathing_relaxation",
    name: "🫁 Respiration & Relaxation",
    description: "Techniques de respiration et de relaxation pour gérer le stress",
    color: "cyan",
    icon: "self_improvement",
    order: 5,
    isActive: true
  },
  {
    id: "stress_management",
    name: "😌 Gestion du Stress",
    description: "Méthodes pour identifier et gérer les sources de stress",
    color: "purple",
    icon: "psychology",
    order: 6,
    isActive: true
  },
  {
    id: "motivation",
    name: "🎯 Motivation et Objectifs",
    description: "Techniques pour maintenir la motivation et atteindre ses objectifs",
    color: "orange",
    icon: "star",
    order: 7,
    isActive: true
  },
  {
    id: "cognitive_therapy",
    name: "🤔 Thérapie Cognitive",
    description: "Techniques de restructuration cognitive et gestion des pensées",
    color: "indigo",
    icon: "lightbulb",
    order: 8,
    isActive: true
  }
];

// Sample educational content for each category
const sampleContents = [
  {
    title: "Comprendre les mécanismes du craving",
    description: "Découvrez les bases neurologiques et psychologiques du craving pour mieux le gérer.",
    type: "text",
    categoryId: "craving_management",
    difficulty: "easy",
    estimatedReadTime: 10,
    status: "published",
    isRecommended: true,
    content: `# Comprendre les mécanismes du craving

## Qu'est-ce que le craving ?

Le craving est une envie intense et irrésistible de consommer une substance. Il s'agit d'un phénomène complexe qui implique plusieurs circuits cérébraux.

## Les circuits neurologiques impliqués

### Le circuit de récompense
- **Dopamine** : Neurotransmetteur clé dans la sensation de plaisir
- **Nucleus accumbens** : Zone du cerveau activée lors de l'anticipation du plaisir
- **Cortex préfrontal** : Région responsable de la prise de décision

### Pourquoi le craving est-il si puissant ?

1. **Conditionnement** : Votre cerveau associe certains stimuli à la consommation
2. **Neuroplasticité** : Les connexions neurales se renforcent avec la répétition
3. **Stress** : Le stress peut déclencher des cravings intenses

## Stratégies de gestion

### Techniques immédiates
- **Respiration profonde** : 4 secondes inspiration, 7 secondes rétention, 8 secondes expiration
- **Diversion** : Rediriger votre attention vers une activité différente
- **Visualisation** : Imaginer les conséquences négatives de la consommation

### Techniques à long terme
- **Exercice régulier** : Stimule la production naturelle de dopamine
- **Méditation** : Renforce le cortex préfrontal
- **Thérapie cognitive** : Modifie les schémas de pensée automatiques

> 💡 **Rappelez-vous** : Les cravings sont temporaires et diminuent naturellement avec le temps si vous ne cédez pas.`
  },
  {
    title: "Technique STOP en urgence",
    description: "Une technique simple et efficace à utiliser lors de cravings intenses.",
    type: "text", 
    categoryId: "emergency_strategies",
    difficulty: "easy",
    estimatedReadTime: 5,
    status: "published",
    isRecommended: true,
    content: `# Technique STOP : Votre bouclier d'urgence

## Qu'est-ce que la technique STOP ?

STOP est un acronyme qui représente une séquence d'actions simples mais puissantes pour gérer les moments de crise.

## Les 4 étapes de STOP

### S - STOP (Arrêtez-vous)
- **Pause immédiate** : Cessez toute activité en cours
- **Prise de conscience** : "Je suis en train de vivre un craving"
- **Pas d'action impulsive** : Ne bougez pas pendant 30 secondes

### T - TAKE a breath (Respirez)
- **Respiration profonde** : Inspirez lentement par le nez
- **Comptez jusqu'à 4** : Retenez votre souffle
- **Expirez lentement** : Par la bouche, comptez jusqu'à 8
- **Répétez 3 fois**

### O - OBSERVE (Observez)
- **Vos sensations corporelles** : Où ressentez-vous la tension ?
- **Vos pensées** : Quelles pensées traversent votre esprit ?
- **Vos émotions** : Nommez ce que vous ressentez
- **Votre environnement** : Qu'est-ce qui vous entoure ?

### P - PROCEED mindfully (Continuez en pleine conscience)
- **Choix conscient** : "Qu'est-ce qui m'aiderait vraiment maintenant ?"
- **Action alternative** : Choisissez une activité saine
- **Engagement** : Engagez-vous pleinement dans cette activité

> ⚡ **Astuce** : Plus vous pratiquez STOP dans des moments calmes, plus ce sera automatique en situation de crise !`
  },
  {
    title: "L'exercice comme antidépresseur naturel",
    description: "Comment l'activité physique agit sur votre chimie cérébrale pour améliorer votre humeur.",
    type: "text",
    categoryId: "apa_mental_health", 
    difficulty: "intermediate",
    estimatedReadTime: 15,
    status: "published",
    isRecommended: false,
    content: `# L'exercice : Votre antidépresseur naturel

## La science derrière l'effet antidépresseur

L'exercice physique agit sur plusieurs neurotransmetteurs pour améliorer naturellement votre humeur et réduire les cravings.

### Les neurotransmetteurs impliqués

#### Endorphines
- **Production** : Augmente de 5x pendant l'exercice
- **Effet** : Sensation de bien-être, réduction de la douleur
- **Durée** : Jusqu'à 24h après l'effort

#### Sérotonine  
- **Impact exercice** : Augmentation de 25-30%
- **Bénéfices** : Moins d'anxiété, sommeil amélioré

#### Dopamine
- **Effet de l'exercice** : Augmentation significative
- **Conséquence** : Réduction des cravings, motivation accrue

## Types d'exercices les plus efficaces

### Exercices cardiovasculaires
**Intensité modérée** (60-70% FC max) :
- **Marche rapide** : 30 min, 5x/semaine
- **Jogging léger** : 20 min, 3x/semaine  
- **Vélo** : 45 min, 3x/semaine
- **Natation** : 30 min, 3x/semaine

### Exercices de force
- Améliore l'estime de soi
- Renforce la discipline
- 2-3 séances/semaine recommandées

> 💊 **Important** : L'exercice complète mais ne remplace pas les traitements médicaux.`
  },
  {
    title: "Respiration 4-7-8 pour calmer les cravings",
    description: "Technique de respiration scientifiquement prouvée pour réduire le stress et les cravings.",
    type: "text",
    categoryId: "breathing_relaxation",
    difficulty: "easy",
    estimatedReadTime: 7,
    status: "published",
    isRecommended: true,
    content: `# La technique 4-7-8 : Votre allié anti-craving

## Pourquoi cette technique fonctionne-t-elle ?

La respiration 4-7-8 active votre système nerveux parasympathique, responsable de la relaxation.

## Comment pratiquer la technique 4-7-8

### La séquence
1. **Expiration complète** par la bouche
2. **Inspiration** par le nez pendant 4 secondes
3. **Rétention** de l'air pendant 7 secondes
4. **Expiration** par la bouche pendant 8 secondes
5. Répétez 4 cycles pour commencer

## Utilisation en situation de craving

### Protocole d'urgence
1. **Arrêtez** ce que vous faites
2. **Trouvez** un endroit calme
3. **Pratiquez** 4 cycles de 4-7-8
4. **Évaluez** votre niveau de craving
5. **Répétez** si nécessaire

> 🎯 **Astuce** : Pratiquez régulièrement pour que ce soit automatique en situation de crise !`
  }
];

async function fixEducationVisibility() {
  try {
    console.log('🔧 Démarrage de la correction de la visibilité du contenu éducatif...\n');
    
    await client.connect();
    console.log('✅ Connexion à la base de données établie');

    // Step 1: Create content categories table if not exists
    console.log('\n🔧 Vérification de la table content_categories...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS content_categories (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR NOT NULL UNIQUE,
        description TEXT,
        color VARCHAR DEFAULT 'blue',
        icon VARCHAR,
        "order" INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Step 2: Create educational_contents table if not exists
    console.log('🔧 Vérification de la table educational_contents...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS educational_contents (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR NOT NULL,
        description TEXT,
        type VARCHAR NOT NULL,
        category_id VARCHAR REFERENCES content_categories(id) ON DELETE SET NULL,
        tags JSONB DEFAULT '[]'::jsonb,
        media_url VARCHAR,
        media_type VARCHAR,
        content TEXT,
        difficulty VARCHAR DEFAULT 'easy',
        estimated_read_time INTEGER,
        status VARCHAR DEFAULT 'draft',
        is_recommended BOOLEAN DEFAULT false,
        view_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        thumbnail_url VARCHAR,
        author_id VARCHAR,
        published_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Step 3: Insert/Update categories
    console.log('\n📋 Création/Vérification des catégories de contenu');
    for (const category of defaultCategories) {
      try {
        // Try to insert, on conflict update
        await client.query(`
          INSERT INTO content_categories (id, name, description, color, icon, "order", is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            color = EXCLUDED.color,
            icon = EXCLUDED.icon,
            "order" = EXCLUDED."order",
            is_active = EXCLUDED.is_active
        `, [
          category.id,
          category.name,
          category.description,
          category.color,
          category.icon,
          category.order,
          category.isActive
        ]);
        console.log(`✅ Catégorie créée/mise à jour: ${category.name} (ID: ${category.id})`);
      } catch (error) {
        console.error(`❌ Erreur catégorie ${category.name}:`, error.message);
      }
    }

    // Step 4: Check and fix existing contents
    console.log('\n📚 Vérification du contenu éducatif existant');
    const existingContentsResult = await client.query('SELECT * FROM educational_contents');
    const existingContents = existingContentsResult.rows;
    console.log(`Trouvé ${existingContents.length} contenu(s) éducatif(s) existant(s)`);

    // Step 5: Fix contents without categories
    const contentsWithoutCategory = existingContents.filter(c => !c.category_id);
    if (contentsWithoutCategory.length > 0) {
      console.log(`\n🔧 Correction de ${contentsWithoutCategory.length} contenu(s) sans catégorie`);
      
      for (const content of contentsWithoutCategory) {
        let suggestedCategoryId = 'craving_management';
        
        const title = content.title.toLowerCase();
        if (title.includes('craving') || title.includes('envie')) {
          suggestedCategoryId = 'craving_management';
        } else if (title.includes('urgence') || title.includes('crise')) {
          suggestedCategoryId = 'emergency_strategies';
        } else if (title.includes('exercice') || title.includes('sport')) {
          suggestedCategoryId = 'apa_mental_health';
        } else if (title.includes('respiration') || title.includes('relaxation')) {
          suggestedCategoryId = 'breathing_relaxation';
        }

        await client.query(`
          UPDATE educational_contents 
          SET category_id = $1, status = 'published', is_active = true
          WHERE id = $2
        `, [suggestedCategoryId, content.id]);
        
        console.log(`🔗 Contenu "${content.title}" lié à: ${suggestedCategoryId}`);
      }
    }

    // Step 6: Create sample content if needed
    console.log('\n📝 Vérification du contenu publié');
    const publishedResult = await client.query(
      'SELECT * FROM educational_contents WHERE status = $1',
      ['published']
    );

    if (publishedResult.rows.length < 4) {
      console.log('Création de contenu d\'exemple...');
      for (const content of sampleContents) {
        try {
          await client.query(`
            INSERT INTO educational_contents (
              title, description, type, category_id, difficulty, estimated_read_time,
              status, is_recommended, content, published_at, is_active, view_count, like_count
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          `, [
            content.title,
            content.description,
            content.type,
            content.categoryId,
            content.difficulty,
            content.estimatedReadTime,
            content.status,
            content.isRecommended,
            content.content,
            new Date(),
            true,
            0,
            0
          ]);
          console.log(`✅ Contenu créé: "${content.title}"`);
        } catch (error) {
          console.error(`❌ Erreur création "${content.title}":`, error.message);
        }
      }
    } else {
      console.log(`ℹ️ Contenu suffisant existe (${publishedResult.rows.length} contenus publiés)`);
    }

    // Step 7: Final verification
    console.log('\n🔍 Vérification finale');
    
    const categoriesResult = await client.query(
      'SELECT * FROM content_categories WHERE is_active = true ORDER BY "order"'
    );
    const categories = categoriesResult.rows;
    
    const contentsResult = await client.query(
      'SELECT * FROM educational_contents WHERE status = $1 AND is_active = true',
      ['published']
    );
    const contents = contentsResult.rows;

    console.log(`\n✅ État final:`);
    console.log(`   📋 ${categories.length} catégories actives`);
    console.log(`   📚 ${contents.length} contenus publiés`);
    
    console.log('\n📋 Distribution du contenu par catégorie:');
    for (const cat of categories) {
      const count = contents.filter(c => c.category_id === cat.id).length;
      console.log(`   ${cat.name}: ${count} contenu(s)`);
    }

    console.log('\n🎉 Correction terminée avec succès !');
    console.log('\n📱 Prochaines étapes:');
    console.log('   1. Redémarrer le serveur');
    console.log('   2. Tester l\'onglet "Espace Éducatif" côté patient');
    console.log('   3. Vérifier que les catégories et contenus s\'affichent correctement');

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    await client.end();
  }
}

// Execute the fix
fixEducationVisibility().then(() => {
  console.log('\n✨ Script terminé');
  process.exit(0);
}).catch(error => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});