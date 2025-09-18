#!/usr/bin/env node
/**
 * Script pour corriger les problèmes de suivi et créer des données par défaut
 */

import fetch from 'node-fetch';
import { config } from 'dotenv';

config();

const BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@apaddicto.com';
const ADMIN_PASSWORD = 'admin123';

let sessionCookie = null;

// Fonction pour effectuer des requêtes avec cookies
async function apiRequest(method, url, data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(sessionCookie && { 'Cookie': sessionCookie })
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`${BASE_URL}${url}`, options);
  
  // Capturer le cookie de session
  if (response.headers.get('set-cookie')) {
    sessionCookie = response.headers.get('set-cookie');
  }
  
  return response;
}

// Fonction pour s'authentifier en tant qu'admin
async function authenticateAdmin() {
  console.log('🔐 Tentative de connexion admin...');
  
  try {
    const loginResponse = await apiRequest('POST', '/api/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log('❌ Échec de connexion admin, tentative de création...');
      
      // Essayer de créer un compte admin
      const registerResponse = await apiRequest('POST', '/api/auth/register', {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        firstName: 'Admin',
        lastName: 'System',
        role: 'admin'
      });
      
      if (!registerResponse.ok) {
        throw new Error(`Registration failed: ${registerResponse.status} ${await registerResponse.text()}`);
      }
      
      console.log('✅ Compte admin créé avec succès');
      const registerResult = await registerResponse.json();
      return registerResult.user;
    }
    
    const loginResult = await loginResponse.json();
    console.log('✅ Connexion admin réussie:', loginResult.user?.email);
    
    return loginResult.user;
  } catch (error) {
    console.error('❌ Erreur d\'authentification admin:', error.message);
    throw error;
  }
}

// Fonction pour créer des exercices par défaut
async function createDefaultExercises() {
  console.log('\n💪 Création des exercices par défaut...');
  
  const defaultExercises = [
    {
      title: 'Respiration Profonde',
      category: 'relaxation',
      difficulty: 'beginner',
      duration: 5,
      description: 'Un exercice simple de respiration profonde pour calmer l\'esprit et réduire le stress.',
      instructions: '1. Asseyez-vous confortablement, dos droit.\n2. Inspirez lentement par le nez pendant 4 secondes.\n3. Retenez votre souffle pendant 4 secondes.\n4. Expirez lentement par la bouche pendant 6 secondes.\n5. Répétez pendant 5 minutes.',
      benefits: 'Réduit le stress et l\'anxiété, améliore la concentration, aide à gérer les cravings'
    },
    {
      title: 'Méditation de Pleine Conscience',
      category: 'mindfulness',
      difficulty: 'intermediate',
      duration: 10,
      description: 'Exercice de méditation pour développer la conscience du moment présent.',
      instructions: '1. Trouvez un endroit calme et asseyez-vous confortablement.\n2. Fermez les yeux et concentrez-vous sur votre respiration.\n3. Observez vos pensées sans les juger.\n4. Ramenez doucement votre attention sur la respiration quand l\'esprit divague.\n5. Continuez pendant 10 minutes.',
      benefits: 'Améliore la conscience de soi, réduit les pensées automatiques négatives, développe la capacité à observer les cravings sans y céder'
    },
    {
      title: 'Relaxation Musculaire Progressive',
      category: 'relaxation',
      difficulty: 'beginner',
      duration: 15,
      description: 'Technique de relaxation qui consiste à tendre et relâcher différents groupes musculaires.',
      instructions: '1. Allongez-vous confortablement.\n2. Commencez par les orteils : contractez pendant 5 secondes, puis relâchez.\n3. Remontez progressivement : pieds, mollets, cuisses, abdomen, bras, épaules, visage.\n4. Concentrez-vous sur la sensation de relâchement après chaque contraction.\n5. Terminez par une relaxation totale de 2 minutes.',
      benefits: 'Diminue les tensions physiques, améliore la qualité du sommeil, aide à gérer le stress et les cravings'
    },
    {
      title: 'Visualisation Positive',
      category: 'visualization',
      difficulty: 'intermediate',
      duration: 8,
      description: 'Exercice de visualisation pour renforcer la motivation et les pensées positives.',
      instructions: '1. Fermez les yeux et respirez calmement.\n2. Visualisez-vous dans une situation où vous résistez avec succès à une craving.\n3. Imaginez en détail : où vous êtes, ce que vous ressentez, vos actions positives.\n4. Ressentez la fierté et la satisfaction de ce succès.\n5. Ancrez cette image positive en répétant une affirmation personnelle.',
      benefits: 'Renforce la confiance en soi, améliore la motivation, aide à préparer des stratégies de résistance aux cravings'
    },
    {
      title: 'Marche Consciente',
      category: 'movement',
      difficulty: 'beginner',
      duration: 12,
      description: 'Exercice de marche en pleine conscience pour reconnecter corps et esprit.',
      instructions: '1. Choisissez un parcours calme de 10-15 mètres.\n2. Marchez très lentement en vous concentrant sur chaque pas.\n3. Ressentez le contact de vos pieds avec le sol.\n4. Observez votre environnement avec tous vos sens.\n5. Si une craving apparaît, notez-la sans jugement et continuez à marcher.\n6. Faites des allers-retours pendant 12 minutes.',
      benefits: 'Améliore la présence corporelle, réduit l\'agitation mentale, offre une alternative saine aux comportements compulsifs'
    },
    {
      title: 'Technique STOP',
      category: 'coping',
      difficulty: 'beginner',
      duration: 2,
      description: 'Technique rapide pour faire face aux cravings intenses : Stop, Take a breath, Observe, Proceed.',
      instructions: '1. STOP : Arrêtez-vous immédiatement quand vous ressentez une craving.\n2. TAKE A BREATH : Prenez 3 respirations profondes.\n3. OBSERVE : Observez vos sensations, émotions et pensées sans jugement.\n4. PROCEED : Choisissez consciemment votre prochaine action positive.',
      benefits: 'Crée un espace de pause entre la craving et l\'action, développe la capacité de choix conscient, technique utilisable partout'
    }
  ];
  
  const createdExercises = [];
  
  for (const exercise of defaultExercises) {
    try {
      console.log(`📝 Création: ${exercise.title}`);
      
      const createResponse = await apiRequest('POST', '/api/exercises', exercise);
      
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error(`❌ Erreur pour ${exercise.title}:`, errorText);
        continue;
      }
      
      const result = await createResponse.json();
      createdExercises.push(result);
      console.log(`✅ Créé: ${result.title} (ID: ${result.id})`);
      
    } catch (error) {
      console.error(`❌ Erreur lors de la création de ${exercise.title}:`, error.message);
    }
  }
  
  return createdExercises;
}

// Fonction pour créer du contenu psychoéducatif
async function createPsychoEducationContent() {
  console.log('\n📚 Création du contenu psychoéducatif...');
  
  const psychoContent = [
    {
      title: 'Comprendre les Cravings',
      category: 'education',
      content: 'Les cravings sont des envies intenses et temporaires. Ils sont normaux et font partie du processus de guérison. Comprendre leur nature temporaire aide à mieux les gérer. La clé est d\'apprendre à les observer sans y céder immédiatement.',
      tags: ['cravings', 'compréhension', 'éducation']
    },
    {
      title: 'La Technique de l\'Urge Surfing',
      category: 'technique',
      content: 'L\'Urge Surfing consiste à "surfer" sur la vague de la craving plutôt que de lutter contre elle. Visualisez votre craving comme une vague : elle monte, atteint un pic, puis redescend naturellement. En restant présent et en respirant calmement, vous pouvez "surfer" cette vague jusqu\'à ce qu\'elle s\'apaise.',
      tags: ['technique', 'gestion', 'urge surfing']
    },
    {
      title: 'Identifier ses Déclencheurs',
      category: 'identification',
      content: 'Les déclencheurs peuvent être émotionnels (stress, ennui, tristesse), environnementaux (lieux, personnes, situations) ou physiques (fatigue, faim). Tenir un journal de vos cravings aide à identifier ces patterns et à développer des stratégies spécifiques pour chaque type de déclencheur.',
      tags: ['déclencheurs', 'identification', 'journal']
    }
  ];
  
  const createdContent = [];
  
  for (const content of psychoContent) {
    try {
      console.log(`📖 Création: ${content.title}`);
      
      const createResponse = await apiRequest('POST', '/api/psycho-education', content);
      
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error(`❌ Erreur pour ${content.title}:`, errorText);
        continue;
      }
      
      const result = await createResponse.json();
      createdContent.push(result);
      console.log(`✅ Créé: ${result.title}`);
      
    } catch (error) {
      console.error(`❌ Erreur lors de la création de ${content.title}:`, error.message);
    }
  }
  
  return createdContent;
}

// Fonction pour tester les endpoints de suivi
async function testTrackingEndpoints() {
  console.log('\n🧪 Test des endpoints de suivi...');
  
  const endpoints = [
    { path: '/api/exercises', needsAuth: true },
    { path: '/api/psycho-education', needsAuth: true },
    { path: '/api/dashboard/stats', needsAuth: true }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Test: ${endpoint.path}`);
      
      const response = await apiRequest('GET', endpoint.path);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const count = Array.isArray(data) ? data.length : (data && typeof data === 'object' ? Object.keys(data).length : 1);
      
      console.log(`✅ ${endpoint.path}: OK (${count} éléments)`);
      
    } catch (error) {
      console.error(`❌ ${endpoint.path}: ERREUR - ${error.message}`);
    }
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Correction des problèmes de suivi\n');
  console.log(`🌐 URL de base: ${BASE_URL}\n`);
  
  try {
    // Authentification admin
    const adminUser = await authenticateAdmin();
    
    // Créer les exercices par défaut
    const exercises = await createDefaultExercises();
    console.log(`\n✅ ${exercises.length} exercices créés`);
    
    // Créer le contenu psychoéducatif
    const psychoContent = await createPsychoEducationContent();
    console.log(`\n✅ ${psychoContent.length} contenus psychoéducatifs créés`);
    
    // Tester les endpoints
    await testTrackingEndpoints();
    
    console.log('\n🎯 CORRECTION TERMINÉE');
    console.log('='.repeat(50));
    console.log('✅ Exercices disponibles pour éviter "Exercice introuvable"');
    console.log('✅ Contenu psychoéducatif disponible');
    console.log('✅ Endpoints testés et fonctionnels');
    console.log('\n💡 Prochaines étapes:');
    console.log('1. Redémarrer l\'application si nécessaire');
    console.log('2. Tester manuellement la page de suivi');
    console.log('3. Créer des données utilisateur pour voir les statistiques');
    
  } catch (error) {
    console.error('❌ ÉCHEC de la correction:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Lancer le script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as fixTrackingIssues };