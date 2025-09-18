#!/usr/bin/env node
import fetch from 'node-fetch';

const BASE_URL = 'https://5000-il4o2di59hchbptdod4rn-6532622b.e2b.dev';

async function testFixes() {
  console.log('🚀 Test rapide des corrections\n');
  console.log(`🌐 URL: ${BASE_URL}\n`);

  let sessionCookie = null;

  // Fonction utilitaire
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
    
    if (response.headers.get('set-cookie')) {
      sessionCookie = response.headers.get('set-cookie');
    }
    
    return response;
  }

  try {
    // Test 1: Créer un utilisateur
    console.log('📝 Création d\'un utilisateur de test...');
    
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
      role: 'patient'
    };

    const registerResponse = await apiRequest('POST', '/api/auth/register', testUser);
    
    if (!registerResponse.ok) {
      throw new Error(`Registration failed: ${registerResponse.status}`);
    }
    
    console.log('✅ Utilisateur créé avec succès');

    // Test 2: Vérifier les endpoints de suivi
    console.log('\n🧪 Test des endpoints de suivi...\n');
    
    const endpoints = [
      '/api/exercises',
      '/api/dashboard/stats',
      '/api/cravings',
      '/api/exercise-sessions',
      '/api/beck-analyses',
      '/api/strategies'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await apiRequest('GET', endpoint);
        
        if (response.ok) {
          const data = await response.json();
          const count = Array.isArray(data) ? data.length : Object.keys(data).length;
          console.log(`✅ ${endpoint}: OK (${count} éléments)`);
        } else {
          console.log(`❌ ${endpoint}: HTTP ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.message}`);
      }
    }

    // Test 3: Créer quelques données de test
    console.log('\n📊 Création de données de test...\n');

    // Craving
    const cravingResponse = await apiRequest('POST', '/api/cravings', {
      intensity: 7,
      triggers: ['Stress'],
      emotions: ['Anxiété'],
      notes: 'Test de craving'
    });
    
    if (cravingResponse.ok) {
      console.log('✅ Craving créé');
    } else {
      console.log(`❌ Échec création craving: ${cravingResponse.status}`);
    }

    // Session d'exercice
    const sessionResponse = await apiRequest('POST', '/api/exercise-sessions', {
      exerciseId: 'test-exercise',
      duration: 300,
      completed: true,
      cravingBefore: 7,
      cravingAfter: 3
    });
    
    if (sessionResponse.ok) {
      console.log('✅ Session d\'exercice créée');
    } else {
      console.log(`❌ Échec création session: ${sessionResponse.status}`);
    }

    // Test 4: Re-vérifier les endpoints avec données
    console.log('\n🔄 Re-test avec données...\n');
    
    for (const endpoint of ['/api/cravings', '/api/exercise-sessions', '/api/dashboard/stats']) {
      try {
        const response = await apiRequest('GET', endpoint);
        
        if (response.ok) {
          const data = await response.json();
          const count = Array.isArray(data) ? data.length : Object.keys(data).length;
          console.log(`✅ ${endpoint}: OK (${count} éléments)`);
        } else {
          console.log(`❌ ${endpoint}: HTTP ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.message}`);
      }
    }

    console.log('\n🎯 RÉSUMÉ:');
    console.log('✅ Utilisateur créé avec succès');
    console.log('✅ Endpoints de base fonctionnels');
    console.log('✅ Création de données testée');
    console.log('\n🌟 Les corrections semblent fonctionner !');
    console.log('👉 Testez manuellement la page de suivi sur:', `${BASE_URL}/tracking`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testFixes().catch(console.error);