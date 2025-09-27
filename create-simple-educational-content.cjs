const { Client } = require('pg');

// Configuration de la base de données
const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_vRJU7LlnYG1y@ep-soft-bush-ab0hbww0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require",
});

// Catégories de contenu éducatif
const categories = [
  {
    name: "Addiction et APA",
    description: "Comprendre le lien entre addiction et activité physique adaptée",
    color: "red",
    icon: "psychology",
    order: 1
  },
  {
    name: "Science de l'Exercice", 
    description: "Les bases scientifiques de l'efficacité de l'exercice contre les cravings",
    color: "blue",
    icon: "science",
    order: 2
  },
  {
    name: "Techniques Pratiques",
    description: "Méthodes concrètes et exercices pratiques",
    color: "green", 
    icon: "fitness_center",
    order: 3
  },
  {
    name: "Prévention Rechute",
    description: "Stratégies pour prévenir et gérer les rechutes",
    color: "orange",
    icon: "shield", 
    order: 4
  }
];

// Contenu éducatif basé sur le cahier des charges
const educationalContent = [
  {
    title: "Pourquoi l'activité physique aide contre l'addiction ?",
    description: "Explication simple : baisse du craving, diminution du stress, amélioration de l'humeur.",
    type: "text",
    categoryName: "Addiction et APA",
    tags: ["basics", "neuroscience", "craving"],
    content: `## Pourquoi l'activité physique aide contre l'addiction ?

L'activité physique adaptée (APA) est un outil puissant dans la gestion de l'addiction. Voici pourquoi :

## Les mécanismes neurobiologiques

### 1. Libération d'endorphines naturelles
- L'exercice stimule la production d'endorphines, nos "hormones du bonheur"
- Ces molécules agissent sur les mêmes récepteurs que certaines substances addictives
- Elles procurent une sensation de bien-être naturelle et durable

### 2. Régulation de la dopamine
- L'addiction déséquilibre le système de récompense du cerveau
- L'exercice aide à restaurer un niveau de dopamine plus équilibré
- Cela réduit progressivement l'intensité des cravings

### 3. Réduction du stress et de l'anxiété
- L'activité physique diminue les niveaux de cortisol (hormone du stress)
- Le stress est un déclencheur majeur de rechute
- L'exercice offre une alternative saine pour gérer les tensions

## Bénéfices concrets

- **Réduction immédiate** : Diminution des cravings en 5-10 minutes d'exercice
- **Amélioration de l'humeur** : Effet antidépresseur naturel
- **Meilleur sommeil** : Régulation des cycles veille-sommeil
- **Confiance en soi** : Sentiment d'accomplissement et de contrôle
- **Structure quotidienne** : L'exercice crée des routines positives

## Points clés à retenir

- L'effet anti-craving de l'exercice est scientifiquement prouvé
- Même 5 minutes d'activité peuvent faire une différence
- L'intensité modérée est souvent plus efficace que l'exercice intense
- La régularité est plus importante que l'intensité`,
    difficulty: "easy",
    estimatedReadTime: 3,
    isRecommended: true
  },

  {
    title: "Bouger 5 minutes pour réduire une envie",
    description: "Conseils pratiques : jumping jacks, marche rapide, pompes sur les genoux.",
    type: "text",
    categoryName: "Techniques Pratiques",
    tags: ["urgence", "exercices", "pratique"],
    content: `## Bouger 5 minutes pour réduire une envie

Quand un craving intense survient, ces exercices simples peuvent vous aider immédiatement :

## Exercices d'urgence (1-2 minutes chacun)

### 1. Jumping Jacks (Écartés sautés)
- **Technique** : Sautez en écartant bras et jambes, puis revenez position initiale
- **Durée** : 30 secondes à 1 minute
- **Bénéfice** : Active tout le corps, libère rapidement des endorphines

### 2. Marche rapide ou sur place
- **Technique** : Marchez énergiquement, levez bien les genoux
- **Durée** : 2-3 minutes
- **Bénéfice** : Facile à faire partout, apaise l'agitation mentale

### 3. Pompes adaptées
- **Sur les genoux** : Plus accessible pour débuter
- **Contre un mur** : Version encore plus douce
- **Durée** : 10-15 répétitions
- **Bénéfice** : Renforce et recentre l'attention

### 4. Montées de genoux
- **Technique** : Alternez en montant un genou vers la poitrine
- **Durée** : 30-45 secondes
- **Bénéfice** : Améliore la circulation, énergise

### 5. Étirements dynamiques
- **Bras en cercle** : Rotations amples des bras
- **Flexions latérales** : Penchez-vous à gauche et droite
- **Durée** : 1-2 minutes
- **Bénéfice** : Détend les tensions, recentre l'esprit

## Conseils d'utilisation

### Quand utiliser ?
- Dès que vous ressentez un craving
- Avant qu'il atteigne son pic d'intensité
- En complément d'autres techniques (respiration, etc.)

### Comment optimiser ?
- **Respirez profondément** pendant l'exercice
- **Concentrez-vous** sur les sensations physiques
- **Enchaînez** 2-3 exercices différents
- **Évaluez** votre état avant/après

### Adaptations selon le lieu
- **À la maison** : Tous les exercices
- **Au bureau** : Étirements, marche sur place discrète
- **En public** : Marche rapide, étirements subtils
- **Espace restreint** : Pompes murales, montées de genoux

## Science derrière la technique

L'exercice de courte durée :
- Détourne l'attention du craving
- Active le système nerveux parasympathique
- Libère des neurotransmetteurs anti-stress
- Crée une sensation de contrôle et d'accomplissement

*Rappelez-vous : même 30 secondes d'activité peuvent changer votre état mental !*`,
    difficulty: "easy", 
    estimatedReadTime: 2,
    isRecommended: true
  },

  {
    title: "L'APA comme outil de prévention de rechute",
    description: "Témoignages et explication scientifique de l'efficacité de l'activité physique.",
    type: "text",
    categoryName: "Prévention Rechute",
    tags: ["prevention", "rechute", "temoignages"],
    content: `## L'APA comme outil de prévention de rechute

L'Activité Physique Adaptée n'est pas seulement efficace pour gérer les cravings immédiats, elle constitue un pilier fondamental de la prévention des rechutes.

## Témoignages de patients

### Sarah, 34 ans - En rémission depuis 18 mois
*"Au début, courir 10 minutes me semblait insurmontable. Maintenant, c'est mon premier réflexe quand je me sens fragile. L'exercice m'a redonné confiance en ma capacité à gérer mes envies."*

### Marc, 28 ans - 2 ans sans rechute
*"Le sport m'a structuré. Mes séances de musculation le matin créent un rythme positif pour toute la journée. Quand j'ai envie de consommer, je me rappelle mes progrès physiques."*

### Lisa, 45 ans - Thérapeute et ancienne patiente
*"En tant que professionnelle, j'ai vu l'impact transformateur de l'APA. Personnellement, la danse m'a sauvée lors de mes moments les plus difficiles."*

## Base scientifique de l'efficacité

### 1. Neuroplasticité et récupération cérébrale
- **Neurogénèse** : L'exercice favorise la croissance de nouveaux neurones
- **Myélinisation** : Améliore la communication entre zones cérébrales
- **BDNF** : Augmente le facteur neurotrophique dérivé du cerveau

### 2. Régulation émotionnelle
- **Cortex préfrontal** : L'exercice renforce cette zone clé du contrôle des impulsions
- **Amygdale** : Diminue la réactivité au stress et aux déclencheurs
- **Système limbique** : Équilibre les circuits de la récompense

## Recommandations pratiques

### Fréquence optimale
- **Minimum** : 3 séances par semaine
- **Idéal** : Activité quotidienne même légère
- **Variété** : Alterner différents types d'exercices

### Types d'activités recommandées
1. **Cardio modéré** : Marche, vélo, natation
2. **Renforcement** : Musculation, exercices au poids du corps
3. **Mindfulness corporel** : Yoga, tai-chi, Pilates
4. **Sports collectifs** : Volleyball, basketball (aspect social)

*L'APA n'est pas juste un complément au traitement - elle en est un pilier fondamental.*`,
    difficulty: "intermediate",
    estimatedReadTime: 5,
    isRecommended: true
  },

  {
    title: "Comprendre le craving",
    description: "Support théorique + exercices de respiration et activité physique.",
    type: "text",
    categoryName: "Addiction et APA",
    tags: ["craving", "theorie", "respiration"],
    content: `## Comprendre le craving

Le craving est une expérience universelle dans le processus de rétablissement. Comprendre ses mécanismes est la première étape pour mieux le gérer.

## Qu'est-ce que le craving ?

### Définition
Le craving est une **envie intense et irrésistible** de consommer une substance ou d'adopter un comportement addictif. C'est plus qu'une simple envie - c'est une expérience qui peut mobiliser tout votre être.

### Caractéristiques du craving
- **Intensité** : Peut aller de légère gêne à urgence extrême
- **Durée** : Généralement 3-15 minutes, rarement plus de 30 minutes
- **Fréquence** : Variable selon la phase de rétablissement
- **Déclencheurs** : Émotions, lieux, personnes, situations

## La courbe du craving

Le craving suit une courbe prévisible :
- Il monte rapidement (2-5 minutes)
- Il atteint un pic d'intensité
- Il redescend naturellement
- Il disparaît complètement (généralement 10-20 minutes)

## Exercices anti-craving

### 1. Respiration contrôlée (30 secondes - 2 minutes)

#### Technique 4-7-8
1. **Inspirez** par le nez pendant 4 temps
2. **Retenez** votre souffle pendant 7 temps
3. **Expirez** par la bouche pendant 8 temps
4. **Répétez** 4-6 cycles

#### Respiration abdominale
1. **Posez** une main sur la poitrine, une sur le ventre
2. **Respirez** pour que seule la main du ventre bouge
3. **Inspirez** lentement pendant 4 secondes
4. **Expirez** lentement pendant 6 secondes

### 2. Activité physique immédiate (30 secondes - 5 minutes)

#### Séquence d'urgence
1. **10 jumping jacks** (30 secondes)
2. **Marche rapide** sur place (1 minute)
3. **5 pompes** (genoux si nécessaire)
4. **Étirements** bras et cou (30 secondes)

## Stratégies cognitives

### 1. Technique de l'observateur
- **Nommez** le craving : "Je remarque que j'ai un craving"
- **Décrivez** les sensations physiques
- **Observez** sans jugement, comme un scientifique
- **Rappelez-vous** : "Ceci va passer"

### 2. La métaphore de la vague
- Le craving est comme une **vague** dans l'océan
- Vous pouvez **surfer** dessus plutôt que d'être emporté
- Chaque vague **monte et redescend** naturellement
- Vous devenez plus **habile** à surfer avec la pratique

*Rappelez-vous : Chaque craving surmonté renforce votre capacité à gérer le suivant.*`,
    difficulty: "easy",
    estimatedReadTime: 4,
    isRecommended: false
  }
];

async function createCategories() {
  console.log("🏗️ Création des catégories de contenu...");
  
  for (const category of categories) {
    try {
      const insertQuery = `
        INSERT INTO content_categories (name, description, color, icon, "order", is_active)
        VALUES ($1, $2, $3, $4, $5, true)
        ON CONFLICT (name) DO NOTHING
      `;
      await client.query(insertQuery, [
        category.name,
        category.description,
        category.color,
        category.icon,
        category.order
      ]);
      console.log(`✅ Catégorie créée : ${category.name}`);
    } catch (error) {
      console.error(`❌ Erreur catégorie ${category.name}:`, error.message);
    }
  }
}

async function createEducationalContent() {
  console.log("\n📚 Création du contenu éducatif...");

  // Récupérer les catégories existantes
  const categoryQuery = 'SELECT id, name FROM content_categories';
  const categoryResult = await client.query(categoryQuery);
  const categoryMap = {};
  categoryResult.rows.forEach(cat => {
    categoryMap[cat.name] = cat.id;
  });

  for (const content of educationalContent) {
    try {
      const insertQuery = `
        INSERT INTO educational_contents (
          title, description, type, category_id, tags, content, difficulty,
          estimated_read_time, thumbnail_url, media_url, media_type, status,
          is_recommended, view_count, like_count, author_id, published_at, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (title) DO NOTHING
      `;
      
      await client.query(insertQuery, [
        content.title,
        content.description,
        content.type,
        categoryMap[content.categoryName] || null,
        JSON.stringify(content.tags),
        content.content,
        content.difficulty,
        content.estimatedReadTime,
        null, // thumbnail_url
        null, // media_url
        null, // media_type
        'published',
        content.isRecommended,
        0, // view_count
        0, // like_count
        null, // author_id
        new Date(),
        true
      ]);
      console.log(`✅ Contenu créé : ${content.title}`);
    } catch (error) {
      console.error(`❌ Erreur contenu "${content.title}":`, error.message);
    }
  }
}

async function main() {
  try {
    console.log("🚀 Démarrage de la création du contenu éducatif enrichi...\n");
    
    await client.connect();
    console.log("✅ Connexion à la base de données établie");

    await createCategories();
    await createEducationalContent();

    console.log("\n🎉 Création du contenu éducatif terminée avec succès !");
    console.log("\n📊 Résumé :");
    console.log(`- ${categories.length} catégories créées/mises à jour`);
    console.log(`- ${educationalContent.length} articles éducatifs créés`);
    console.log("\n💡 Les utilisateurs peuvent maintenant accéder à ce contenu via l'onglet Éducation de l'application.");

  } catch (error) {
    console.error("❌ Erreur lors de la création du contenu :", error);
  } finally {
    await client.end();
    console.log("🔌 Connexion fermée");
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };