#!/usr/bin/env node

const defaultCategories = [
  {
    name: "Comprendre l'Addiction",
    description: "Concepts fondamentaux sur l'addiction et les mécanismes cérébraux",
    color: "red",
    icon: "psychology",
    order: 1
  },
  {
    name: "Exercice et Récupération",
    description: "Rôle de l'activité physique dans le processus de guérison",
    color: "blue",
    icon: "fitness_center",
    order: 2
  },
  {
    name: "Psychologie Cognitive",
    description: "Techniques psychologiques pour gérer les pensées et émotions",
    color: "green",
    icon: "lightbulb",
    order: 3
  },
  {
    name: "Techniques Pratiques",
    description: "Outils concrets pour la gestion quotidienne des cravings",
    color: "purple",
    icon: "self_improvement",
    order: 4
  },
  {
    name: "Prévention des Rechutes",
    description: "Stratégies pour maintenir la récupération à long terme",
    color: "orange",
    icon: "shield",
    order: 5
  }
];

const defaultTags = [
  { name: "addiction", description: "Contenu sur les mécanismes de l'addiction", color: "red" },
  { name: "motivation", description: "Contenu motivationnel pour la récupération", color: "green" },
  { name: "relaxation", description: "Techniques de relaxation et gestion du stress", color: "blue" },
  { name: "respiration", description: "Exercices de respiration", color: "cyan" },
  { name: "pleine-conscience", description: "Pratiques de mindfulness et méditation", color: "purple" },
  { name: "coping", description: "Stratégies d'adaptation aux difficultés", color: "yellow" },
  { name: "exercice", description: "Activité physique et sport", color: "orange" },
  { name: "urgence", description: "Techniques pour les moments de crise", color: "red" },
  { name: "cognitif", description: "Thérapie cognitive et restructuration des pensées", color: "indigo" },
  { name: "soutien-social", description: "Importance du soutien social et des relations", color: "pink" }
];

// Simuler les cookies de session (pour les besoins du script)
const loginAndCreateData = async () => {
  try {
    console.log('🔧 Connexion administrateur et création des données par défaut...');
    
    // Note: Pour ce script, nous assumons qu'un admin existe
    // Dans un environnement réel, il faudrait se connecter d'abord
    
    const baseUrl = 'http://localhost:3000';
    
    // Créer les catégories
    for (const category of defaultCategories) {
      try {
        const response = await fetch(`${baseUrl}/api/content-categories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Note: Dans un vrai environnement, il faudrait gérer la session
          },
          body: JSON.stringify(category)
        });

        if (response.ok) {
          console.log(`✅ Catégorie créée: ${category.name}`);
        } else if (response.status === 401) {
          console.log('❌ Erreur d\'authentification - veuillez vous connecter en tant qu\'admin d\'abord');
          return;
        } else {
          const error = await response.text();
          console.log(`⚠️ Erreur lors de la création de ${category.name}: ${error}`);
        }
      } catch (error) {
        console.error(`❌ Erreur réseau pour ${category.name}:`, error.message);
      }
    }

    // Créer les tags
    for (const tag of defaultTags) {
      try {
        const response = await fetch(`${baseUrl}/api/content-tags`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tag)
        });

        if (response.ok) {
          console.log(`✅ Tag créé: ${tag.name}`);
        } else if (response.status === 401) {
          console.log('❌ Erreur d\'authentification - veuillez vous connecter en tant qu\'admin d\'abord');
          return;
        } else {
          const error = await response.text();
          console.log(`⚠️ Erreur lors de la création du tag ${tag.name}: ${error}`);
        }
      } catch (error) {
        console.error(`❌ Erreur réseau pour ${tag.name}:`, error.message);
      }
    }

    console.log('✅ Script terminé! Les données par défaut ont été créées.');
    console.log('Note: Certaines données peuvent déjà exister et c\'est normal.');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
};

console.log('📌 Note: Ce script nécessite qu\'un administrateur soit connecté sur l\'application.');
console.log('Pour utiliser ce script efficacement:');
console.log('1. Connectez-vous à l\'application web en tant qu\'admin');
console.log('2. Utilisez directement l\'interface d\'administration pour créer les catégories et tags');
console.log('');
console.log('Tentative de création via API...');

loginAndCreateData();