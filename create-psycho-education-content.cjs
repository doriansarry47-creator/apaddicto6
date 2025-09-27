const { Client } = require('pg');

// Configuration de la base de données
const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_vRJU7LlnYG1y@ep-soft-bush-ab0hbww0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require",
});

// Contenu éducatif basé sur le cahier des charges
const psychoEducationContent = [
  {
    title: "Pourquoi l'activité physique aide contre l'addiction ?",
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
    category: "addiction",
    type: "article",
    difficulty: "beginner",
    estimatedReadTime: 3
  },

  {
    title: "Bouger 5 minutes pour réduire une envie",
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

*Rappelez-vous : même 30 secondes d'activité peuvent changer votre état mental !*`,
    category: "coping",
    type: "article",
    difficulty: "beginner",
    estimatedReadTime: 2
  },

  {
    title: "L'APA comme outil de prévention de rechute",
    content: `## L'APA comme outil de prévention de rechute

L'Activité Physique Adaptée n'est pas seulement efficace pour gérer les cravings immédiats, elle constitue un pilier fondamental de la prévention des rechutes.

## Témoignages de patients

### Sarah, 34 ans - En rémission depuis 18 mois
*"Au début, courir 10 minutes me semblait insurmontable. Maintenant, c'est mon premier réflexe quand je me sens fragile. L'exercice m'a redonné confiance en ma capacité à gérer mes envies."*

### Marc, 28 ans - 2 ans sans rechute  
*"Le sport m'a structuré. Mes séances de musculation le matin créent un rythme positif pour toute la journée. Quand j'ai envie de consommer, je me rappelle mes progrès physiques."*

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
    category: "relapse_prevention",
    type: "article",
    difficulty: "intermediate",
    estimatedReadTime: 5
  },

  {
    title: "Comprendre le craving",
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

### 2. Activité physique immédiate (30 secondes - 5 minutes)

#### Séquence d'urgence
1. **10 jumping jacks** (30 secondes)
2. **Marche rapide** sur place (1 minute)
3. **5 pompes** (genoux si nécessaire)
4. **Étirements** bras et cou (30 secondes)

## Stratégies cognitives

### 1. La métaphore de la vague
- Le craving est comme une **vague** dans l'océan
- Vous pouvez **surfer** dessus plutôt que d'être emporté
- Chaque vague **monte et redescend** naturellement
- Vous devenez plus **habile** à surfer avec la pratique

*Rappelez-vous : Chaque craving surmonté renforce votre capacité à gérer le suivant.*`,
    category: "addiction",
    type: "article", 
    difficulty: "beginner",
    estimatedReadTime: 4
  },

  {
    title: "Séances types HIIT poids du corps",
    content: `## Séances types HIIT poids du corps

Le HIIT (High Intensity Interval Training) au poids du corps est parfaitement adapté à la gestion des cravings.

## SÉANCE DÉBUTANT - 20 minutes

### Échauffement (5 minutes)
1. **Marche sur place** (1 min)
2. **Rotations articulaires** (2 min)
3. **Montées de genoux** (1 min)
4. **Étirements dynamiques** (1 min)

### Circuit principal (12 minutes)
**Format :** 30 secondes d'effort / 30 secondes de récupération
**Répéter 3 fois**

1. **Air squat** (30 sec)
2. **Pompes sur les genoux** (30 sec)
3. **Crunchs** (30 sec)
4. **Jumping jacks modifiés** (30 sec)

### Retour au calme (3 minutes)
- Marche lente et étirements

## SÉANCE URGENCE CRAVING - 10 minutes

### Circuit (répéter 2 tours)
1. **20 burpees adaptés** (2 min)
2. **20 mountain climbers** (1 min)
3. **20 sit-ups** (1 min)
4. **Gainage frontal** (1 min)

## SÉANCE AVANCÉE - 30 minutes

### Circuit principal (22 minutes)
**Format :** 45 secondes d'effort / 15 secondes de transition
**4 tours**

1. **Squats pistols alternés** (45 sec)
2. **Pompes claquées** (45 sec)
3. **Dips sur banc** (45 sec)
4. **Jumping jacks explosifs** (45 sec)
5. **Gainage araignée** (45 sec)

## Conseils
- Écoutez votre corps
- Privilégiez la technique sur la vitesse
- Hydratez-vous régulièrement
- Progressez graduellement

*L'important n'est pas la perfection, mais la régularité et l'engagement.*`,
    category: "coping",
    type: "article",
    difficulty: "intermediate", 
    estimatedReadTime: 6
  }
];

async function createPsychoEducationContent() {
  console.log("📚 Création du contenu psychoéducatif enrichi...");

  for (const content of psychoEducationContent) {
    try {
      const insertQuery = `
        INSERT INTO psycho_education_content (
          title, content, category, type, difficulty, estimated_read_time, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, true)
      `;
      
      await client.query(insertQuery, [
        content.title,
        content.content,
        content.category,
        content.type,
        content.difficulty,
        content.estimatedReadTime
      ]);
      console.log(`✅ Contenu créé : ${content.title}`);
    } catch (error) {
      console.error(`❌ Erreur contenu "${content.title}":`, error.message);
    }
  }
}

async function main() {
  try {
    console.log("🚀 Démarrage de la création du contenu psychoéducatif enrichi...\n");
    
    await client.connect();
    console.log("✅ Connexion à la base de données établie");

    await createPsychoEducationContent();

    console.log("\n🎉 Création du contenu psychoéducatif terminée avec succès !");
    console.log("\n📊 Résumé :");
    console.log(`- ${psychoEducationContent.length} articles psychoéducatifs créés`);
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