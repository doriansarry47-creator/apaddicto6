#!/usr/bin/env node

// Script pour créer du contenu éducationnel de test
const sampleContent = [
  {
    title: "Comprendre le Cycle de l'Addiction",
    description: "Une introduction complète aux mécanismes neurologiques de l'addiction et comment l'exercice peut aider à briser ces cycles.",
    type: "text",
    content: `## Introduction
    
L'addiction est un trouble complexe qui affecte le cerveau de manière profonde. Comprendre ces mécanismes est la première étape vers la guérison.

## Le Cerveau et l'Addiction

L'addiction modifie les circuits de récompense du cerveau, notamment le système dopaminergique. Ces changements expliquent pourquoi les cravings peuvent être si intenses.

- La dopamine crée un sentiment de plaisir et de motivation
- L'addiction diminue la production naturelle de dopamine
- Le cerveau associe la substance à la survie

## Le Cycle Craving → Action → Soulagement

Comprendre ce cycle est essentiel pour le briser :

1. **Déclencheur** : Un stress, une émotion, une situation
2. **Craving** : L'envie irrésistible se manifeste
3. **Action** : La consommation ou le comportement addictif
4. **Soulagement temporaire** : Sentiment de bien-être éphémère
5. **Culpabilité/Regret** : Retour du mal-être
6. **Nouveau cycle** : Le processus recommence, souvent amplifié

## Points Clés à Retenir

- Les cravings sont temporaires et diminuent naturellement
- Chaque résistance renforce votre capacité de contrôle
- L'activité physique peut interrompre ce cycle efficacement`,
    difficulty: "easy",
    estimatedReadTime: 8,
    status: "published",
    isRecommended: true,
    tags: ["addiction", "cycle", "cerveau", "neuroscience"],
    thumbnailUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop"
  },
  {
    title: "Exercices de Respiration Anti-Craving",
    description: "Techniques de respiration pratiques pour gérer les moments de crise et réduire l'intensité des cravings.",
    type: "text",
    content: `## Introduction aux Techniques de Respiration

La respiration est un outil puissant pour gérer les cravings. Elle agit directement sur le système nerveux autonome.

## Technique 1 : Respiration 4-7-8

Cette méthode développée par le Dr. Andrew Weil est particulièrement efficace :

- Inspirez par le nez pendant 4 temps
- Retenez votre souffle pendant 7 temps  
- Expirez par la bouche pendant 8 temps
- Répétez 3 à 4 fois

## Technique 2 : Respiration Carrée

Simple et efficace pour les débutants :

- Inspirez pendant 4 temps
- Retenez pendant 4 temps
- Expirez pendant 4 temps
- Pause de 4 temps
- Répétez 5 à 10 fois

## Technique 3 : Respiration Diaphragmatique

Pour une relaxation profonde :

1. Placez une main sur la poitrine, une sur le ventre
2. Seule la main sur le ventre doit bouger
3. Inspirez lentement par le nez
4. Expirez doucement par la bouche
5. Continuez pendant 5-10 minutes

## Conseils Pratiques

- Pratiquez ces techniques quotidiennement
- Utilisez-les dès les premiers signes de craving
- Créez un environnement calme si possible
- La régularité est plus importante que la durée`,
    difficulty: "easy",
    estimatedReadTime: 6,
    status: "published", 
    isRecommended: true,
    tags: ["respiration", "techniques", "urgence", "pratique"],
    thumbnailUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=200&fit=crop"
  },
  {
    title: "L'Exercice Physique : Votre Allié Anti-Addiction",
    description: "Découvrez comment l'activité physique agit comme un médicament naturel contre les cravings et favorise la guérison.",
    type: "text", 
    content: `## Pourquoi l'Exercice Fonctionne

L'activité physique n'est pas qu'une distraction - c'est un véritable traitement neurobiologique.

## Les Mécanismes Scientifiques

### Liberation d'Endorphines
L'exercice stimule la production d'endorphines, les "hormones du bonheur" naturelles :
- Elles procurent une sensation de bien-être naturelle
- Réduisent la perception de la douleur et du stress
- L'effet peut durer plusieurs heures

### Régulation du Stress
L'activité physique régule l'axe hypothalamo-hypophyso-surrénalien :
- Réduit les niveaux de cortisol
- Améliore la résistance au stress
- Prévient les rechutes liées au stress

### Neuroplasticité
L'exercice favorise la récupération cérébrale :
- Stimule la croissance de nouveaux neurones
- Améliore les connexions entre zones cérébrales
- Accélère la récupération cognitive

## Types d'Exercices Recommandés

### Pour les Cravings Urgents (5-15 minutes)
- Course à pied ou marche rapide
- Pompes ou squats
- Montée d'escaliers
- Corde à sauter

### Pour la Récupération à Long Terme (30+ minutes)
- Course d'endurance
- Natation
- Cyclisme
- Sports d'équipe
- Yoga ou Pilates

## Programme Progressif

### Semaine 1-2 : Débutant
- 15-20 minutes, 3 fois par semaine
- Intensité légère à modérée
- Focus sur la régularité

### Semaine 3-4 : Intermédiaire  
- 25-30 minutes, 4 fois par semaine
- Augmentation graduelle de l'intensité
- Introduction d'exercices variés

### Semaine 5+ : Avancé
- 30-45 minutes, 5-6 fois par semaine
- Intensité modérée à élevée
- Programmes spécialisés selon les préférences`,
    difficulty: "intermediate",
    estimatedReadTime: 12,
    status: "published",
    isRecommended: false,
    tags: ["exercice", "science", "endorphines", "programme"],
    thumbnailUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop"
  }
];

console.log('📝 Contenu éducationnel de test disponible');
console.log('Pour créer ce contenu, utilisez l\'interface d\'administration à l\'adresse :');
console.log('https://3000-icawsd3iby3u7n20caxjv-6532622b.e2b.dev');
console.log('');
console.log('Contenus à créer :');
sampleContent.forEach((content, index) => {
  console.log(`${index + 1}. ${content.title}`);
  console.log(`   Description: ${content.description}`);
  console.log(`   Tags: ${content.tags.join(', ')}`);
  console.log(`   Difficulté: ${content.difficulty}`);
  console.log('');
});

console.log('✅ Prêt pour les tests!');