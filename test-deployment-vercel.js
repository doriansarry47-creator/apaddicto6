/**
 * Script de test du déploiement Vercel
 * Teste l'inscription, connexion et accès aux fonctionnalités principales
 */

import axios from 'axios';

const BASE_URL = 'https://webapp-ochre-theta.vercel.app';
const API_URL = `${BASE_URL}/api`;

// Créer une instance axios avec support de cookies
const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Données de test
const testUser = {
  email: `test_user_${Date.now()}@vercel-test.com`,
  password: 'TestPassword123!',
  name: 'Test User Vercel',
  role: 'user'
};

async function testHealthCheck() {
  console.log('\n🏥 Test 1: Health Check');
  try {
    const response = await axios.get(`${API_URL}/health`);
    console.log('✅ API est en ligne:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Erreur Health Check:', error.message);
    return false;
  }
}

async function testRegistration() {
  console.log('\n📝 Test 2: Inscription utilisateur');
  try {
    const response = await client.post('/auth/register', testUser);
    console.log('✅ Inscription réussie:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur inscription:', error.response?.data || error.message);
    return null;
  }
}

async function testLogin() {
  console.log('\n🔐 Test 3: Connexion utilisateur');
  try {
    const response = await client.post('/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Connexion réussie:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur connexion:', error.response?.data || error.message);
    return null;
  }
}

async function testGetProfile() {
  console.log('\n👤 Test 4: Récupération du profil');
  try {
    const response = await client.get('/auth/me');
    console.log('✅ Profil récupéré:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur profil:', error.response?.data || error.message);
    return null;
  }
}

async function testExercises() {
  console.log('\n💪 Test 5: Liste des exercices');
  try {
    const response = await client.get('/exercises');
    console.log(`✅ ${response.data.length} exercices récupérés`);
    if (response.data.length > 0) {
      console.log('   Premier exercice:', response.data[0].title);
    }
    return response.data;
  } catch (error) {
    console.error('❌ Erreur exercices:', error.response?.data || error.message);
    return [];
  }
}

async function testPsychoEducation() {
  console.log('\n📚 Test 6: Contenu psychoéducatif');
  try {
    const response = await client.get('/psycho-education');
    console.log(`✅ ${response.data.length} contenus psychoéducatifs récupérés`);
    if (response.data.length > 0) {
      console.log('   Premier contenu:', response.data[0].title);
    }
    return response.data;
  } catch (error) {
    console.error('❌ Erreur contenu psychoéducatif:', error.response?.data || error.message);
    return [];
  }
}

async function testCravingEntry() {
  console.log('\n😰 Test 7: Enregistrement d\'une envie');
  try {
    const response = await client.post('/cravings', {
      intensity: 7,
      trigger: 'Test de déploiement Vercel',
      timestamp: new Date().toISOString()
    });
    console.log('✅ Envie enregistrée:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur enregistrement envie:', error.response?.data || error.message);
    return null;
  }
}

async function testStats() {
  console.log('\n📊 Test 8: Statistiques utilisateur');
  try {
    const response = await client.get('/user/stats');
    console.log('✅ Statistiques récupérées:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur statistiques:', error.response?.data || error.message);
    return null;
  }
}

async function testLogout() {
  console.log('\n🚪 Test 9: Déconnexion');
  try {
    const response = await client.post('/auth/logout');
    console.log('✅ Déconnexion réussie:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Erreur déconnexion:', error.response?.data || error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('===========================================');
  console.log('🧪 TESTS DU DÉPLOIEMENT VERCEL');
  console.log('URL:', BASE_URL);
  console.log('===========================================');

  const results = {
    healthCheck: await testHealthCheck(),
    registration: await testRegistration(),
    login: await testLogin(),
    profile: await testGetProfile(),
    exercises: await testExercises(),
    psychoEducation: await testPsychoEducation(),
    cravingEntry: await testCravingEntry(),
    stats: await testStats(),
    logout: await testLogout(),
  };

  console.log('\n===========================================');
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('===========================================');
  
  let passed = 0;
  let total = 0;
  
  Object.entries(results).forEach(([test, result]) => {
    total++;
    if (result) {
      passed++;
      console.log(`✅ ${test}: RÉUSSI`);
    } else {
      console.log(`❌ ${test}: ÉCHOUÉ`);
    }
  });

  console.log('\n===========================================');
  console.log(`Résultat: ${passed}/${total} tests réussis (${Math.round(passed/total*100)}%)`);
  console.log('===========================================');

  if (passed === total) {
    console.log('\n🎉 Tous les tests sont passés avec succès!');
    console.log('✅ L\'application est correctement déployée sur Vercel');
    console.log(`🌐 URL de production: ${BASE_URL}`);
  } else {
    console.log('\n⚠️ Certains tests ont échoué');
    console.log('Vérifiez les logs ci-dessus pour plus de détails');
  }
}

// Exécuter tous les tests
runAllTests().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
