import { config } from 'dotenv';
import { getDB } from './server/db.js';
import { 
  educationalContents, 
  contentCategories, 
  contentTags 
} from './shared/schema.js';

config();

const db = getDB();

async function createEducationalContentFromPDF() {
  console.log('🚀 Création des catégories de contenu...');
  
  try {
    // Créer les catégories de base
    const categories = [
      {
        name: "Activité Physique",
        description: "Contenus sur l'activité physique et le sport thérapeutique",
        color: "green",
        icon: "dumbbell",
        order: 1
      },
      {
        name: "Nutrition",
        description: "Conseils et ressources sur l'alimentation équilibrée",
        color: "orange",
        icon: "apple",
        order: 2
      },
      {
        name: "Gestion du Stress",
        description: "Techniques de relaxation et gestion du stress",
        color: "purple",
        icon: "brain",
        order: 3
      },
      {
        name: "Sommeil",
        description: "Amélioration de la qualité du sommeil",
        color: "blue",
        icon: "moon",
        order: 4
      },
      {
        name: "Psychoéducation",
        description: "Compréhension des mécanismes addictifs",
        color: "indigo",
        icon: "book",
        order: 5
      },
      {
        name: "Addictologie",
        description: "Ressources spécialisées sur les addictions",
        color: "red",
        icon: "alert-triangle",
        order: 6
      }
    ];

    const createdCategories = [];
    for (const categoryData of categories) {
      const [category] = await db.insert(contentCategories).values(categoryData).returning();
      createdCategories.push(category);
      console.log(`✅ Catégorie créée: ${category.name}`);
    }

    // Créer quelques tags de base
    const tags = [
      { name: "addiction", description: "Contenu lié aux addictions", color: "red" },
      { name: "sport", description: "Activité physique et sport", color: "green" },
      { name: "sedentarite", description: "Sédentarité et mode de vie", color: "orange" },
      { name: "therapie", description: "Approches thérapeutiques", color: "blue" },
      { name: "prevention", description: "Prévention et sensibilisation", color: "purple" },
      { name: "recherche", description: "Études et recherches scientifiques", color: "indigo" },
      { name: "motivation", description: "Motivation et changement comportemental", color: "yellow" },
      { name: "bien-etre", description: "Bien-être général", color: "teal" }
    ];

    const createdTags = [];
    for (const tagData of tags) {
      const [tag] = await db.insert(contentTags).values(tagData).returning();
      createdTags.push(tag);
      console.log(`✅ Tag créé: ${tag.name}`);
    }

    console.log('🚀 Création du contenu éducatif basé sur le PDF Mildeca...');

    // Trouver la catégorie "Activité Physique"
    const activityCategory = createdCategories.find(c => c.name === "Activité Physique");
    const addictionCategory = createdCategories.find(c => c.name === "Addictologie");
    
    // Contenu principal basé sur la revue de littérature Mildeca
    const mainContent = {
      title: "Activités Physiques et Sportives dans la Prise en Charge des Addictions",
      description: "Revue de littérature complète sur l'efficacité de l'activité physique dans le traitement des troubles addictifs, basée sur les recherches de la Mission interministérielle de lutte contre les drogues et les conduites addictives (Mildeca).",
      type: "text",
      categoryId: activityCategory?.id,
      tags: ["addiction", "sport", "therapie", "recherche", "prevention"],
      content: `# Activités Physiques et Sportives dans la Prise en Charge des Addictions

## Introduction

Cette revue de littérature, réalisée par l'Observatoire national de l'activité physique et de la sédentarité pour la Mission interministérielle de lutte contre les drogues et les conduites addictives (Mildeca), explore le rôle crucial de l'activité physique dans la prise en charge des troubles addictifs.

## Contexte Scientifique

Les recherches récentes démontrent l'efficacité de l'activité physique comme outil thérapeutique complémentaire dans le traitement des addictions. Cette approche s'inscrit dans une démarche globale de prise en charge qui prend en compte les aspects physiques, psychologiques et sociaux de la personne.

## Mécanismes d'Action

### 1. Effets Neurobiologiques

L'activité physique agit sur plusieurs neurotransmetteurs impliqués dans les mécanismes addictifs :

- **Dopamine** : L'exercice stimule la libération naturelle de dopamine, offrant une alternative saine au "reward system" perturbé par les substances
- **Endorphines** : La production d'endorphines naturelles contribue à la gestion du stress et de l'anxiété
- **GABA** : Amélioration de la régulation émotionnelle et réduction de l'impulsivité

### 2. Bénéfices Psychologiques

- Amélioration de l'estime de soi et de la confiance
- Réduction des symptômes dépressifs et anxieux
- Développement de stratégies de coping positives
- Renforcement du sentiment d'efficacité personnelle

### 3. Aspects Sociaux

- Création de nouveaux liens sociaux sains
- Intégration dans des groupes avec des objectifs positifs
- Développement d'une routine structurante
- Opportunités de valorisation et de reconnaissance

## Recommandations Pratiques

### Types d'Activités Recommandées

1. **Activités aérobies** (course, natation, cyclisme)
   - Fréquence : 3-5 fois par semaine
   - Durée : 30-45 minutes
   - Intensité : modérée à vigoureuse

2. **Activités de renforcement musculaire**
   - Fréquence : 2-3 fois par semaine
   - Focus : groupes musculaires majeurs
   - Progression graduelle

3. **Activités de bien-être** (yoga, tai-chi, méditation en mouvement)
   - Bénéfices : gestion du stress, relaxation, mindfulness
   - Complémentaires aux activités plus intenses

### Adaptation Individuelle

La prescription d'activité physique doit être personnalisée selon :
- Le type d'addiction
- L'état de santé général
- Les préférences personnelles
- Le niveau de condition physique initial
- Les comorbidités éventuelles

## Mise en Œuvre Thérapeutique

### Intégration dans le Parcours de Soins

1. **Évaluation initiale** : bilan médical, motivationnel et physique
2. **Définition d'objectifs** : réalistes et progressifs
3. **Accompagnement** : par des professionnels formés
4. **Suivi régulier** : adaptation du programme selon les progrès
5. **Prévention des rechutes** : maintien de l'engagement à long terme

### Professionnels Impliqués

- Médecins addictologues
- Éducateurs en activité physique adaptée (EAPA)
- Psychologues du sport
- Kinésithérapeutes
- Éducateurs spécialisés

## Preuves Scientifiques

Les études montrent des résultats prometteurs :

- **Réduction des rechutes** : jusqu'à 30% de diminution dans certaines études
- **Amélioration de la qualité de vie** : scores significativement améliorés
- **Réduction des symptômes de sevrage** : atténuation des effets physiques et psychologiques
- **Maintien de l'abstinence** : meilleure adhésion au traitement global

## Défis et Limites

### Obstacles à Surmonter

- Manque de motivation initial
- Problèmes de santé physique
- Stigmatisation
- Manque d'accessibilité aux structures

### Solutions Proposées

- Approche progressive et bienveillante
- Adaptation des activités aux capacités
- Création d'environnements non stigmatisants
- Développement de partenariats locaux

## Perspectives d'Avenir

L'activité physique s'impose comme un pilier essentiel de la prise en charge moderne des addictions. Les recherches futures devront préciser :

- Les protocoles optimaux selon les types d'addiction
- L'impact à long terme sur la prévention des rechutes
- L'intégration dans les parcours de soins coordonnés
- Le développement d'outils d'évaluation spécifiques

## Conclusion

Cette revue de littérature confirme l'intérêt majeur de l'activité physique comme outil thérapeutique dans la prise en charge des addictions. Son intégration dans les programmes de soins représente une approche prometteuse pour améliorer les résultats thérapeutiques et la qualité de vie des personnes concernées.

L'approche doit être holistique, personnalisée et s'inscrire dans une démarche pluridisciplinaire pour maximiser ses bénéfices.

---

*Basé sur la revue de littérature Mildeca 2023 - "Activités physiques et sportives, sédentarité, addictions"*`,
      difficulty: "intermediate",
      estimatedReadTime: 15,
      status: "published",
      isRecommended: true,
      publishedAt: new Date()
    };

    const [createdContent] = await db.insert(educationalContents).values(mainContent).returning();
    console.log(`✅ Contenu principal créé: ${createdContent.title}`);

    // Créer des contenus complémentaires plus courts
    const additionalContents = [
      {
        title: "Les Bénéfices Neurobiologiques de l'Exercice Physical contre l'Addiction",
        description: "Comprendre comment l'activité physique agit sur le cerveau pour combattre les mécanismes addictifs.",
        type: "text",
        categoryId: addictionCategory?.id,
        tags: ["addiction", "sport", "recherche"],
        content: `# Les Bénéfices Neurobiologiques de l'Exercice Physical

## Comment l'Exercice Rewire le Cerveau

L'activité physique provoque des changements profonds dans le cerveau qui peuvent aider à surmonter l'addiction :

### Système de Récompense
- Restauration de la sensibilité dopaminergique naturelle
- Création de nouvelles voies de plaisir saines
- Réduction de la tolérance aux substances

### Stress et Anxiété
- Diminution du cortisol (hormone du stress)
- Augmentation de la production de GABA
- Amélioration de la régulation émotionnelle

### Neuroplasticité
- Formation de nouvelles connexions neuronales
- Renforcement des circuits de contrôle exécutif
- Amélioration de la capacité de prise de décision

## Applications Pratiques

Ces mécanismes expliquent pourquoi l'exercice est si efficace comme thérapie complémentaire dans le traitement des addictions.`,
        difficulty: "advanced",
        estimatedReadTime: 8,
        status: "published",
        isRecommended: false
      },
      {
        title: "Programme d'Activité Physique pour Débutants en Récupération",
        description: "Un guide pratique pour commencer l'activité physique durant la phase de récupération d'une addiction.",
        type: "text",
        categoryId: activityCategory?.id,
        tags: ["sport", "therapie", "motivation"],
        content: `# Programme d'Activité Physique pour Débutants

## Semaine 1-2 : Démarrage en Douceur

### Objectifs
- Réhabituer le corps au mouvement
- Créer une routine positive
- Éviter le surmenage et la frustration

### Activités Recommandées
- **Marche** : 15-20 minutes par jour
- **Étirements** : 10 minutes matin et soir
- **Respiration** : exercices de cohérence cardiaque

## Semaine 3-4 : Progression Graduelle

### Augmentation Progressive
- Marche : 25-30 minutes
- Ajout d'exercices de renforcement léger
- Introduction d'activités plaisantes (danse, jardinage)

## Conseils Essentiels

### Écouter Son Corps
- Respecter les limites
- Adapter selon l'énergie du jour
- Célébrer chaque petit progrès

### Créer des Habitudes
- Choisir un moment fixe dans la journée
- Commencer petit mais régulièrement
- Se récompenser (sainement) après chaque séance

### Soutien Social
- Trouver un partenaire d'exercice
- Rejoindre un groupe adapté
- Partager ses progrès avec l'équipe soignante

## Signaux d'Alerte

Arrêter et consulter si :
- Douleurs persistantes
- Essoufflement excessif
- Vertiges ou malaises
- Perte de motivation totale

L'objectif est le bien-être, pas la performance !`,
        difficulty: "easy",
        estimatedReadTime: 6,
        status: "published",
        isRecommended: true
      },
      {
        title: "Sédentarité et Risques d'Addiction : Ce qu'il Faut Savoir",
        description: "Les liens entre mode de vie sédentaire et vulnérabilité aux addictions.",
        type: "text",
        categoryId: addictionCategory?.id,
        tags: ["sedentarite", "prevention", "addiction"],
        content: `# Sédentarité et Risques d'Addiction

## Le Cercle Vicieux

La sédentarité et l'addiction peuvent se renforcer mutuellement :

### Comment la Sédentarité Favorise l'Addiction
- Diminution de la production naturelle de dopamine
- Augmentation du stress et de l'ennui
- Réduction de l'estime de soi
- Isolement social

### Comment l'Addiction Renforce la Sédentarité
- Perte d'intérêt pour les activités physiques
- Fatigue chronique
- Problèmes de santé
- Cercle social moins actif

## Briser le Cycle

### Étapes Clés
1. **Prise de conscience** du lien sédentarité-addiction
2. **Petits changements** dans le quotidien
3. **Augmentation progressive** de l'activité
4. **Soutien professionnel** si nécessaire

### Actions Concrètes
- Se lever toutes les heures
- Prendre les escaliers
- Marcher pour les trajets courts
- Intégrer l'activité dans les loisirs

## Prévention

Pour les personnes à risque :
- Maintenir un minimum d'activité quotidienne
- Diversifier les sources de plaisir
- Cultiver les liens sociaux actifs
- Surveiller les signaux d'alerte`,
        difficulty: "easy",
        estimatedReadTime: 5,
        status: "published",
        isRecommended: false
      }
    ];

    for (const contentData of additionalContents) {
      const [content] = await db.insert(educationalContents).values(contentData).returning();
      console.log(`✅ Contenu additionnel créé: ${content.title}`);
    }

    console.log('🎉 Tous les contenus ont été créés avec succès !');
    console.log(`📊 Résumé :`);
    console.log(`   - ${createdCategories.length} catégories créées`);
    console.log(`   - ${createdTags.length} tags créés`);
    console.log(`   - ${additionalContents.length + 1} contenus éducatifs créés`);

  } catch (error) {
    console.error('❌ Erreur lors de la création du contenu:', error);
    throw error;
  }
}

// Exécuter le script
createEducationalContentFromPDF()
  .then(() => {
    console.log('✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });