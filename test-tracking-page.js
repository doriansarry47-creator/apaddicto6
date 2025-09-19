#!/usr/bin/env node

import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';
const WEB_BASE_URL = 'http://localhost:5000';

// Test des API endpoints utilisées par la page tracking
async function testTrackingAPI() {
  console.log('🧪 Test des API endpoints de la page Tracking...\n');
  
  // Étape 1: Connexion admin
  console.log('1️⃣ Connexion admin...');
  const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'doriansarry@yahoo.fr',
      password: 'admin123'
    })
  });

  if (!loginResponse.ok) {
    console.error('❌ Échec de la connexion:', loginResponse.status);
    return;
  }

  // Extraire les cookies de session
  const cookies = loginResponse.headers.raw()['set-cookie'];
  const sessionCookie = cookies ? cookies.join('; ') : '';
  console.log('✅ Connexion réussie, cookies:', sessionCookie ? 'présents' : 'absents');

  // Étape 2: Test des endpoints utilisés par la page tracking
  const endpoints = [
    '/auth/me',
    '/cravings',
    '/dashboard/stats',
    '/exercise-sessions',
    '/beck-analyses',
    '/strategies'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Test ${endpoint}...`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Cookie': sessionCookie,
          'Content-Type': 'application/json'
        }
      });

      const status = response.status;
      const contentType = response.headers.get('content-type');
      
      if (status === 200) {
        const data = await response.text();
        try {
          const jsonData = JSON.parse(data);
          const isArray = Array.isArray(jsonData);
          const count = isArray ? jsonData.length : (typeof jsonData === 'object' ? Object.keys(jsonData).length : '1 item');
          console.log(`✅ ${endpoint}: ${status} OK (${count} ${isArray ? 'éléments' : 'propriétés'})`);
        } catch (e) {
          console.log(`✅ ${endpoint}: ${status} OK (données non-JSON: ${data.substring(0, 100)}...)`);
        }
      } else {
        const errorData = await response.text();
        console.log(`❌ ${endpoint}: ${status} ${response.statusText}`);
        console.log(`   Erreur: ${errorData.substring(0, 200)}`);
      }
    } catch (error) {
      console.log(`💥 ${endpoint}: Erreur réseau - ${error.message}`);
    }
  }

  // Étape 3: Test de création de données de test si nécessaire
  console.log('\n📊 Création de données de test si nécessaire...');
  
  // Créer un craving de test
  try {
    const cravingResponse = await fetch(`${API_BASE_URL}/cravings`, {
      method: 'POST',
      headers: {
        'Cookie': sessionCookie,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intensity: 5,
        triggers: ['Stress', 'Ennui'],
        emotions: ['Anxiété', 'Frustration'],
        notes: 'Test de suivi'
      })
    });

    if (cravingResponse.ok) {
      console.log('✅ Craving de test créé');
    } else {
      console.log('⚠️ Impossible de créer un craving de test:', cravingResponse.status);
    }
  } catch (error) {
    console.log('⚠️ Erreur création craving:', error.message);
  }

  // Créer une session d'exercice de test
  try {
    const sessionResponse = await fetch(`${API_BASE_URL}/exercise-sessions`, {
      method: 'POST',
      headers: {
        'Cookie': sessionCookie,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        exerciseId: 'test-exercise',
        exerciseTitle: 'Exercice de test',
        duration: 300,
        completed: true,
        cravingBefore: 7,
        cravingAfter: 4
      })
    });

    if (sessionResponse.ok) {
      console.log('✅ Session d\'exercice de test créée');
    } else {
      console.log('⚠️ Impossible de créer une session de test:', sessionResponse.status);
    }
  } catch (error) {
    console.log('⚠️ Erreur création session:', error.message);
  }

  console.log('\n🎯 Test complet terminé!\n');
}

// Lancer le test
testTrackingAPI().catch(error => {
  console.error('💥 Erreur générale:', error);
});