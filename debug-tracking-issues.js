#!/usr/bin/env node
/**
 * Script de débogage pour diagnostiquer les problèmes de la page de suivi
 * Teste les API endpoints et vérifie les données retournées
 */

import fetch from 'node-fetch';
import { config } from 'dotenv';

config();

const BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

// Fonction utilitaire pour faire des requêtes authentifiées
async function makeAuthenticatedRequest(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Fonction pour créer un utilisateur de test
async function createTestUser() {
  try {
    console.log('📝 Création d\'un utilisateur de test...');
    
    const testUser = {
      email: `test-debug-${Date.now()}@example.com`,
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'Debug',
      role: 'patient'
    };

    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    if (!response.ok) {
      throw new Error(`Registration failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Utilisateur créé avec succès:', result.user.email);
    
    return { response, cookies: response.headers.get('set-cookie') };
  } catch (error) {
    console.error('❌ Erreur création utilisateur:', error.message);
    throw error;
  }
}

// Fonction pour se connecter
async function loginUser(email, password) {
  try {
    console.log('🔐 Connexion utilisateur...');
    
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Connexion réussie:', result.user.email);
    
    return { response, cookies: response.headers.get('set-cookie') };
  } catch (error) {
    console.error('❌ Erreur connexion:', error.message);
    throw error;
  }
}

// Fonction pour créer des données de test
async function createTestData(cookies) {
  try {
    console.log('📊 Création de données de test...');

    // Créer des cravings de test
    for (let i = 0; i < 5; i++) {
      await fetch(`${BASE_URL}/api/cravings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies
        },
        body: JSON.stringify({
          intensity: Math.floor(Math.random() * 10) + 1,
          triggers: ['Stress', 'Ennui'],
          emotions: ['Anxiété', 'Frustration'],
          notes: `Test craving entry ${i + 1}`
        })
      });
    }

    // Créer des sessions d'exercices de test
    for (let i = 0; i < 3; i++) {
      await fetch(`${BASE_URL}/api/exercise-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies
        },
        body: JSON.stringify({
          exerciseId: `exercise-${i + 1}`,
          duration: Math.floor(Math.random() * 1800) + 300, // 5-35 minutes
          completed: true,
          cravingBefore: Math.floor(Math.random() * 10) + 1,
          cravingAfter: Math.floor(Math.random() * 5) + 1
        })
      });
    }

    // Créer des analyses Beck de test
    for (let i = 0; i < 2; i++) {
      await fetch(`${BASE_URL}/api/beck-analyses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies
        },
        body: JSON.stringify({
          situation: `Situation de test ${i + 1}`,
          automaticThoughts: `Pensée automatique ${i + 1}`,
          emotions: `Émotion ${i + 1}`,
          emotionIntensity: Math.floor(Math.random() * 10) + 1,
          rationalResponse: `Réponse rationnelle ${i + 1}`,
          newIntensity: Math.floor(Math.random() * 5) + 1
        })
      });
    }

    // Créer des stratégies de test
    await fetch(`${BASE_URL}/api/strategies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({
        strategies: [{
          context: 'home',
          exercise: 'Respiration profonde',
          effort: 'easy',
          duration: 10,
          cravingBefore: 8,
          cravingAfter: 3
        }, {
          context: 'work',
          exercise: 'Marche rapide',
          effort: 'medium',
          duration: 15,
          cravingBefore: 7,
          cravingAfter: 4
        }]
      })
    });

    console.log('✅ Données de test créées avec succès');
  } catch (error) {
    console.error('❌ Erreur création données test:', error.message);
    throw error;
  }
}

// Fonction pour tester tous les endpoints de suivi
async function testTrackingEndpoints(cookies) {
  console.log('\n🧪 Test des endpoints de suivi...\n');

  const endpoints = [
    '/api/auth/me',
    '/api/dashboard/stats',
    '/api/cravings',
    '/api/exercise-sessions',
    '/api/beck-analyses',
    '/api/strategies'
  ];

  const results = {};

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Test: GET ${endpoint}`);
      
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          'Cookie': cookies
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      results[endpoint] = {
        status: 'success',
        dataCount: Array.isArray(data) ? data.length : (data && typeof data === 'object' ? Object.keys(data).length : 1),
        sample: Array.isArray(data) ? data.slice(0, 1) : data
      };

      console.log(`✅ ${endpoint}: OK (${results[endpoint].dataCount} éléments)`);
      
    } catch (error) {
      results[endpoint] = {
        status: 'error',
        error: error.message
      };
      console.error(`❌ ${endpoint}: ERREUR - ${error.message}`);
    }
  }

  return results;
}

// Fonction pour vérifier les exercices disponibles
async function testExercisesEndpoint() {
  console.log('\n🏃‍♂️ Test des exercices disponibles...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/exercises`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const exercises = await response.json();
    console.log(`✅ Exercices récupérés: ${exercises.length} disponibles`);
    
    if (exercises.length > 0) {
      console.log('📋 Exemple d\'exercice:');
      console.log(JSON.stringify(exercises[0], null, 2));
    } else {
      console.log('⚠️  Aucun exercice trouvé - cela pourrait expliquer le problème "Exercice introuvable"');
    }
    
    return exercises;
  } catch (error) {
    console.error('❌ Erreur récupération exercices:', error.message);
    return [];
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Démarrage du diagnostic de la page de suivi\n');
  console.log(`🌐 URL de base: ${BASE_URL}\n`);

  try {
    // Étape 1: Vérifier les exercices (peut être fait sans authentification)
    const exercises = await testExercisesEndpoint();

    // Étape 2: Créer un utilisateur de test
    const { cookies } = await createTestUser();

    // Étape 3: Créer des données de test
    await createTestData(cookies);

    // Étape 4: Tester tous les endpoints
    const results = await testTrackingEndpoints(cookies);

    // Étape 5: Résumé détaillé
    console.log('\n📊 RÉSUMÉ DU DIAGNOSTIC\n');
    console.log('='.repeat(50));
    
    console.log('\n🎯 Problèmes identifiés:');
    
    // Vérifier le problème des exercices
    if (exercises.length === 0) {
      console.log('❌ PROBLÈME MAJEUR: Aucun exercice disponible');
      console.log('   → Cela explique le message "Exercice introuvable"');
      console.log('   → Solution: Ajouter des exercices par défaut');
    } else {
      console.log('✅ Exercices disponibles: OK');
    }
    
    // Vérifier les endpoints d'API
    const failedEndpoints = Object.entries(results).filter(([_, result]) => result.status === 'error');
    if (failedEndpoints.length > 0) {
      console.log('\n❌ ENDPOINTS EN ÉCHEC:');
      failedEndpoints.forEach(([endpoint, result]) => {
        console.log(`   → ${endpoint}: ${result.error}`);
      });
    } else {
      console.log('✅ Tous les endpoints API fonctionnent correctement');
    }
    
    // Vérifier les données
    console.log('\n📈 Données disponibles:');
    Object.entries(results).forEach(([endpoint, result]) => {
      if (result.status === 'success') {
        console.log(`   → ${endpoint}: ${result.dataCount} éléments`);
      }
    });

    console.log('\n✅ Diagnostic terminé avec succès');
    
    // Recommandations
    console.log('\n💡 RECOMMANDATIONS:');
    if (exercises.length === 0) {
      console.log('1. Exécuter le script de création d\'exercices');
      console.log('2. Vérifier la base de données pour les exercices manquants');
    }
    
    console.log('3. Vérifier les logs du navigateur pour les erreurs côté client');
    console.log('4. Tester manuellement la page de suivi avec les données créées');

  } catch (error) {
    console.error('❌ ÉCHEC CRITIQUE du diagnostic:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Lancer le script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as runTrackingDiagnostic };