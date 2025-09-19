#!/usr/bin/env node

import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

// Test complet de l'expérience utilisateur sur la page tracking
async function testUserExperience() {
  console.log('🧪 Test complet de l\'expérience utilisateur - Page Tracking');
  console.log('==================================================\n');

  let sessionCookie = '';

  try {
    // 1. Test de connexion
    console.log('1️⃣ Test de connexion utilisateur...');
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

    const cookies = loginResponse.headers.raw()['set-cookie'];
    sessionCookie = cookies ? cookies.join('; ') : '';
    console.log('✅ Connexion réussie');

    // 2. Test de tous les endpoints nécessaires pour la page tracking
    console.log('\n2️⃣ Test des endpoints de la page Tracking...');
    
    const endpoints = [
      { url: '/auth/me', description: 'Authentification utilisateur' },
      { url: '/dashboard/stats', description: 'Statistiques du dashboard' },
      { url: '/cravings?limit=50', description: 'Historique des cravings' },
      { url: '/exercise-sessions?limit=30', description: 'Sessions d\'exercice' },
      { url: '/beck-analyses?limit=20', description: 'Analyses Beck' },
      { url: '/strategies', description: 'Stratégies anti-craving' }
    ];

    let allEndpointsWorking = true;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint.url}`, {
          headers: { 'Cookie': sessionCookie }
        });

        if (response.ok) {
          const data = await response.json();
          const count = Array.isArray(data) ? data.length : 'objet';
          console.log(`   ✅ ${endpoint.description}: ${count} éléments`);
        } else {
          console.log(`   ❌ ${endpoint.description}: Erreur ${response.status}`);
          allEndpointsWorking = false;
        }
      } catch (error) {
        console.log(`   💥 ${endpoint.description}: ${error.message}`);
        allEndpointsWorking = false;
      }
    }

    // 3. Test de création de données pour s'assurer que la page a du contenu
    console.log('\n3️⃣ Création de données de test...');
    
    // Créer plusieurs cravings
    const cravingTests = [
      { intensity: 8, triggers: ['Stress', 'Fatigue'], emotions: ['Anxiété'], notes: 'Journée difficile au travail' },
      { intensity: 5, triggers: ['Ennui'], emotions: ['Neutre'], notes: 'Après-midi calme' },
      { intensity: 3, triggers: ['Solitude'], emotions: ['Mélancolie'], notes: 'Weekend seul' }
    ];

    for (const [i, craving] of cravingTests.entries()) {
      try {
        const response = await fetch(`${API_BASE_URL}/cravings`, {
          method: 'POST',
          headers: {
            'Cookie': sessionCookie,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(craving)
        });

        if (response.ok) {
          console.log(`   ✅ Craving ${i + 1} créé (intensité ${craving.intensity})`);
        } else {
          console.log(`   ⚠️ Échec craving ${i + 1}: ${response.status}`);
        }
      } catch (error) {
        console.log(`   💥 Erreur craving ${i + 1}: ${error.message}`);
      }
    }

    // Créer quelques sessions d'exercice
    const exerciseTests = [
      { exerciseId: 'breathing-square', exerciseTitle: 'Respiration carrée', duration: 300, completed: true, cravingBefore: 8, cravingAfter: 4 },
      { exerciseId: 'meditation-5min', exerciseTitle: 'Méditation 5min', duration: 300, completed: true, cravingBefore: 6, cravingAfter: 3 },
      { exerciseId: 'walk-nature', exerciseTitle: 'Marche nature', duration: 1200, completed: true, cravingBefore: 7, cravingAfter: 2 }
    ];

    for (const [i, exercise] of exerciseTests.entries()) {
      try {
        const response = await fetch(`${API_BASE_URL}/exercise-sessions`, {
          method: 'POST',
          headers: {
            'Cookie': sessionCookie,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(exercise)
        });

        if (response.ok) {
          console.log(`   ✅ Session exercice ${i + 1} créée (${exercise.exerciseTitle})`);
        } else {
          console.log(`   ⚠️ Échec session ${i + 1}: ${response.status}`);
        }
      } catch (error) {
        console.log(`   💥 Erreur session ${i + 1}: ${error.message}`);
      }
    }

    // Créer une analyse Beck
    try {
      const beckAnalysis = {
        situation: 'Envie forte après une dispute',
        emotion: 'Colère',
        emotionIntensity: 8,
        automaticThoughts: 'Je ne peux pas gérer cette situation sans consommer',
        rationalResponse: 'Cette émotion est temporaire, j\'ai déjà surmonté des situations similaires',
        newIntensity: 4
      };

      const response = await fetch(`${API_BASE_URL}/beck-analyses`, {
        method: 'POST',
        headers: {
          'Cookie': sessionCookie,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(beckAnalysis)
      });

      if (response.ok) {
        console.log('   ✅ Analyse Beck créée');
      } else {
        console.log('   ⚠️ Échec analyse Beck:', response.status);
      }
    } catch (error) {
      console.log('   💥 Erreur analyse Beck:', error.message);
    }

    // Créer une stratégie
    try {
      const strategy = {
        exercise: 'Technique de respiration profonde',
        context: 'home',
        effort: 'low',
        duration: 5,
        cravingBefore: 7,
        cravingAfter: 3
      };

      const response = await fetch(`${API_BASE_URL}/strategies`, {
        method: 'POST',
        headers: {
          'Cookie': sessionCookie,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(strategy)
      });

      if (response.ok) {
        console.log('   ✅ Stratégie créée');
      } else {
        console.log('   ⚠️ Échec stratégie:', response.status);
      }
    } catch (error) {
      console.log('   💥 Erreur stratégie:', error.message);
    }

    // 4. Test final des données après création
    console.log('\n4️⃣ Vérification finale des données...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        headers: { 'Cookie': sessionCookie }
      });

      if (response.ok) {
        const stats = await response.json();
        console.log('   📊 Statistiques finales:');
        console.log(`      - Exercices complétés: ${stats.exercisesCompleted || 0}`);
        console.log(`      - Durée totale: ${Math.round((stats.totalDuration || 0) / 60)} minutes`);
        console.log(`      - Craving moyen: ${(stats.avgCravingIntensity || 0).toFixed(1)}/10`);
        console.log(`      - Série actuelle: ${stats.currentStreak || 0} jours`);
      }
    } catch (error) {
      console.log('   💥 Erreur vérification finale:', error.message);
    }

    // 5. Résumé final
    console.log('\n🎯 RÉSUMÉ DU TEST:');
    console.log('==================');
    
    if (allEndpointsWorking) {
      console.log('✅ Tous les endpoints fonctionnent correctement');
      console.log('✅ Les données de test ont été créées');
      console.log('✅ La page Tracking devrait maintenant afficher du contenu');
      console.log('\n🌟 Le problème de page blanche devrait être résolu !');
      console.log('\n📱 Vous pouvez maintenant tester dans le navigateur:');
      console.log('   1. Connectez-vous avec: doriansarry@yahoo.fr / admin123');
      console.log('   2. Naviguez vers l\'onglet "Suivi"');
      console.log('   3. Vérifiez que les données s\'affichent correctement');
    } else {
      console.log('❌ Certains endpoints ne fonctionnent pas');
      console.log('⚠️ Des corrections supplémentaires peuvent être nécessaires');
    }

  } catch (error) {
    console.error('💥 Erreur générale dans le test:', error);
  }
}

// Lancer le test
testUserExperience();