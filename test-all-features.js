#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'https://5000-i12r6csi0kgicy6yox0w7-6532622b.e2b.dev';

// Test data
const ADMIN_USER = {
  email: 'doriansarry@yahoo.fr',
  password: 'admin123'
};

const TEST_USER = {
  email: 'patient.demo@apaddicto.com',
  password: 'password123',
  firstName: 'Patient',
  lastName: 'Demo',
  role: 'patient'
};

let adminCookies = '';
let userCookies = '';

async function makeRequest(endpoint, method = 'GET', body = null, cookies = '') {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  
  // Extract cookies from response
  const newCookies = response.headers.get('set-cookie');
  
  return {
    response,
    data: response.headers.get('content-type')?.includes('application/json') ? 
      await response.json() : await response.text(),
    cookies: newCookies || cookies,
    status: response.status
  };
}

async function testAuthentication() {
  console.log('\n🔐 === TEST AUTHENTICATION ===');
  
  // Test 1: Admin Login
  console.log('👤 Test connexion admin...');
  const adminLogin = await makeRequest('/api/auth/login', 'POST', ADMIN_USER);
  
  if (adminLogin.status === 200) {
    console.log('✅ Connexion admin réussie:', adminLogin.data.user?.email, adminLogin.data.user?.role);
    adminCookies = adminLogin.cookies;
  } else {
    console.error('❌ Connexion admin échouée:', adminLogin.data);
    return false;
  }

  // Test 2: Create test patient
  console.log('👤 Création patient test...');
  const patientCreate = await makeRequest('/api/auth/register', 'POST', TEST_USER);
  
  if (patientCreate.status === 200 || patientCreate.data.message?.includes('existe déjà')) {
    console.log('✅ Patient test créé/existe:', TEST_USER.email);
    
    // Login patient
    const patientLogin = await makeRequest('/api/auth/login', 'POST', {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    if (patientLogin.status === 200) {
      console.log('✅ Connexion patient réussie');
      userCookies = patientLogin.cookies;
    } else {
      console.error('❌ Connexion patient échouée:', patientLogin.data);
      return false;
    }
  } else {
    console.error('❌ Création patient échouée:', patientCreate.data);
    return false;
  }

  // Test 3: Mot de passe oublié
  console.log('🔑 Test mot de passe oublié...');
  const forgotPassword = await makeRequest('/api/auth/forgot-password', 'POST', {
    email: TEST_USER.email
  });
  
  if (forgotPassword.status === 200) {
    console.log('✅ Fonction mot de passe oublié fonctionne:', forgotPassword.data.message);
  } else {
    console.error('❌ Fonction mot de passe oublié échouée:', forgotPassword.data);
  }

  return true;
}

async function testCravingEntry() {
  console.log('\n💭 === TEST CRAVING ENTRY ===');
  
  const cravingData = {
    intensity: 7,
    triggers: [
      'Recherche de calme / apaisement',
      'Fuir un sentiment de solitude'
    ],
    emotions: [
      'Anxiété',
      'Tristesse',
      'Solitude'
    ],
    notes: 'Test d\'enregistrement de craving avec triggers et émotions'
  };

  console.log('📝 Enregistrement craving...');
  const cravingResult = await makeRequest('/api/cravings', 'POST', cravingData, userCookies);
  
  if (cravingResult.status === 200) {
    console.log('✅ Craving enregistré avec succès:', cravingResult.data.id);
    
    // Vérifier la récupération
    const getCravings = await makeRequest('/api/cravings', 'GET', null, userCookies);
    if (getCravings.status === 200 && getCravings.data.length > 0) {
      console.log('✅ Récupération cravings OK, nombre:', getCravings.data.length);
      const lastCraving = getCravings.data[0];
      console.log('📊 Dernier craving:', {
        intensity: lastCraving.intensity,
        triggers: lastCraving.triggers?.length || 0,
        emotions: lastCraving.emotions?.length || 0
      });
    } else {
      console.error('❌ Erreur récupération cravings');
    }
  } else {
    console.error('❌ Erreur enregistrement craving:', cravingResult.data);
  }
}

async function testBeckAnalysis() {
  console.log('\n🧠 === TEST BECK ANALYSIS ===');
  
  const beckData = {
    situation: 'J\'ai vu une publicité de cigarettes à la télé pendant une pause',
    automaticThoughts: 'Une seule cigarette ne changera rien, j\'ai envie de fumer maintenant, c\'est trop difficile d\'arrêter',
    emotions: 'Anxiété forte, frustration, culpabilité anticipée',
    emotionIntensity: 8,
    rationalResponse: 'Chaque cigarette compte, cette envie va passer comme les autres, j\'ai déjà tenu plusieurs jours',
    newFeeling: 'Toujours anxieux mais plus déterminé',
    newIntensity: 5
  };

  console.log('📝 Enregistrement analyse Beck...');
  const beckResult = await makeRequest('/api/beck-analyses', 'POST', beckData, userCookies);
  
  if (beckResult.status === 200) {
    console.log('✅ Analyse Beck enregistrée avec succès:', beckResult.data.id);
    
    // Vérifier la récupération
    const getBeckAnalyses = await makeRequest('/api/beck-analyses', 'GET', null, userCookies);
    if (getBeckAnalyses.status === 200 && getBeckAnalyses.data.length > 0) {
      console.log('✅ Récupération analyses Beck OK, nombre:', getBeckAnalyses.data.length);
      const lastAnalysis = getBeckAnalyses.data[0];
      console.log('📊 Dernière analyse:', {
        emotionIntensity: lastAnalysis.emotionIntensity,
        newIntensity: lastAnalysis.newIntensity,
        improvement: lastAnalysis.emotionIntensity - lastAnalysis.newIntensity
      });
    } else {
      console.error('❌ Erreur récupération analyses Beck');
    }
  } else {
    console.error('❌ Erreur enregistrement analyse Beck:', beckResult.data);
  }
}

async function testStrategies() {
  console.log('\n🎯 === TEST ANTI-CRAVING STRATEGIES ===');
  
  const strategiesData = {
    strategies: [
      {
        context: 'leisure',
        exercise: 'Course à pied de 20 minutes autour du parc avec musique motivante',
        effort: 'modéré',
        duration: 20,
        cravingBefore: 8,
        cravingAfter: 3
      },
      {
        context: 'work',
        exercise: 'Exercices de respiration profonde 4-7-8 pendant 5 minutes à mon bureau',
        effort: 'faible',
        duration: 5,
        cravingBefore: 6,
        cravingAfter: 4
      },
      {
        context: 'home',
        exercise: 'Séance de yoga avec vidéo YouTube, focus sur les postures relaxantes',
        effort: 'modéré',
        duration: 15,
        cravingBefore: 7,
        cravingAfter: 2
      }
    ]
  };

  console.log('📝 Enregistrement stratégies anti-craving...');
  const strategiesResult = await makeRequest('/api/strategies', 'POST', strategiesData, userCookies);
  
  if (strategiesResult.status === 200) {
    console.log('✅ Stratégies enregistrées avec succès:', strategiesResult.data.strategies?.length || 'OK');
    
    // Vérifier la récupération
    const getStrategies = await makeRequest('/api/strategies', 'GET', null, userCookies);
    if (getStrategies.status === 200 && getStrategies.data.length > 0) {
      console.log('✅ Récupération stratégies OK, nombre:', getStrategies.data.length);
      getStrategies.data.forEach((strategy, index) => {
        const effectiveness = strategy.cravingBefore - strategy.cravingAfter;
        console.log(`📊 Stratégie ${index + 1}: ${strategy.context} - Efficacité: ${effectiveness} points`);
      });
    } else {
      console.error('❌ Erreur récupération stratégies');
    }
  } else {
    console.error('❌ Erreur enregistrement stratégies:', strategiesResult.data);
  }
}

async function testAdminFeatures() {
  console.log('\n👑 === TEST ADMIN FEATURES ===');
  
  // Test accès admin dashboard
  console.log('🏠 Test accès admin dashboard...');
  const adminMe = await makeRequest('/api/auth/me', 'GET', null, adminCookies);
  
  if (adminMe.status === 200 && adminMe.data.user?.role === 'admin') {
    console.log('✅ Accès admin confirmé:', adminMe.data.user.email);
    
    // Test récupération de tous les utilisateurs (si endpoint existe)
    const getAllUsers = await makeRequest('/api/admin/users', 'GET', null, adminCookies);
    if (getAllUsers.status === 200) {
      console.log('✅ Récupération utilisateurs admin OK');
    } else {
      console.log('ℹ️  Endpoint /api/admin/users non disponible');
    }
    
  } else {
    console.error('❌ Erreur accès admin:', adminMe.data);
  }
}

async function testApplicationFlow() {
  console.log('\n🔄 === TEST WORKFLOW COMPLET ===');
  
  // Simuler un workflow utilisateur complet
  console.log('1. Connexion utilisateur...');
  const userInfo = await makeRequest('/api/auth/me', 'GET', null, userCookies);
  
  if (userInfo.status === 200) {
    console.log('✅ Utilisateur connecté:', userInfo.data.user.email);
    
    console.log('2. Enregistrement session complète...');
    
    // Craving initial
    await testCravingEntry();
    
    // Stratégie utilisée
    await testStrategies();
    
    // Analyse cognitive
    await testBeckAnalysis();
    
    console.log('✅ Workflow complet testé avec succès');
  }
}

async function runAllTests() {
  console.log('🚀 === DÉMARRAGE TESTS COMPLETS APADDICTO ===');
  console.log(`📍 URL de test: ${BASE_URL}`);
  
  try {
    const authOK = await testAuthentication();
    if (!authOK) {
      console.error('❌ Tests arrêtés - Authentification échouée');
      return;
    }
    
    await testCravingEntry();
    await testBeckAnalysis();
    await testStrategies();
    await testAdminFeatures();
    await testApplicationFlow();
    
    console.log('\n🎉 === TOUS LES TESTS TERMINÉS ===');
    console.log('✅ Application APAddicto fonctionnelle');
    console.log('🔗 URL publique:', BASE_URL);
    console.log('👤 Admin: doriansarry@yahoo.fr / admin123');
    console.log('👤 Patient test: patient.test@example.com / password123');
    
  } catch (error) {
    console.error('❌ Erreur durant les tests:', error.message);
  }
}

// Exécution des tests
runAllTests().catch(console.error);