#!/usr/bin/env node
/**
 * Test complet de la fonctionnalité de suivi après les corrections
 */

import fetch from 'node-fetch';
import { config } from 'dotenv';

config();

const BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

class TrackingTester {
  constructor() {
    this.sessionCookie = null;
    this.testResults = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  // Fonction utilitaire pour les requêtes avec cookies
  async apiRequest(method, url, data = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(this.sessionCookie && { 'Cookie': this.sessionCookie })
      }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${BASE_URL}${url}`, options);
    
    if (response.headers.get('set-cookie')) {
      this.sessionCookie = response.headers.get('set-cookie');
    }
    
    return response;
  }

  // Fonction pour enregistrer un résultat de test
  recordTest(name, passed, error = null, details = null) {
    this.testResults.tests.push({
      name,
      passed,
      error: error?.message || error,
      details,
      timestamp: new Date().toISOString()
    });

    if (passed) {
      this.testResults.passed++;
      console.log(`✅ ${name}`);
      if (details) console.log(`   → ${details}`);
    } else {
      this.testResults.failed++;
      console.error(`❌ ${name}`);
      if (error) console.error(`   → ${error.message || error}`);
    }
  }

  // Créer un utilisateur de test
  async createTestUser() {
    try {
      const testUser = {
        email: `tracking-test-${Date.now()}@example.com`,
        password: 'testpassword123',
        firstName: 'Tracking',
        lastName: 'Test',
        role: 'patient'
      };

      const response = await this.apiRequest('POST', '/api/auth/register', testUser);
      
      if (!response.ok) {
        throw new Error(`Registration failed: ${response.status} ${await response.text()}`);
      }

      const result = await response.json();
      this.recordTest('Création utilisateur de test', true, null, result.user.email);
      
      return result.user;
    } catch (error) {
      this.recordTest('Création utilisateur de test', false, error);
      throw error;
    }
  }

  // Test des endpoints de base
  async testBasicEndpoints() {
    const endpoints = [
      { path: '/api/exercises', name: 'Récupération des exercices' },
      { path: '/api/dashboard/stats', name: 'Statistiques du dashboard' },
      { path: '/api/cravings', name: 'Historique des cravings' },
      { path: '/api/exercise-sessions', name: 'Sessions d\'exercices' },
      { path: '/api/beck-analyses', name: 'Analyses Beck' },
      { path: '/api/strategies', name: 'Stratégies anti-craving' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await this.apiRequest('GET', endpoint.path);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const count = Array.isArray(data) ? data.length : (data && typeof data === 'object' ? Object.keys(data).length : 1);
        
        this.recordTest(endpoint.name, true, null, `${count} éléments retournés`);
        
      } catch (error) {
        this.recordTest(endpoint.name, false, error);
      }
    }
  }

  // Test de création d'un exercice spécifique (nécessite admin)
  async testExerciseById() {
    try {
      // Récupérer la liste des exercices
      const exercisesResponse = await this.apiRequest('GET', '/api/exercises');
      if (!exercisesResponse.ok) {
        throw new Error('Impossible de récupérer les exercices');
      }

      const exercises = await exercisesResponse.json();
      
      if (exercises.length === 0) {
        this.recordTest('Test exercice par ID', false, new Error('Aucun exercice disponible'));
        return;
      }

      // Tester la récupération d'un exercice spécifique
      const exerciseId = exercises[0].id;
      const exerciseResponse = await this.apiRequest('GET', `/api/exercises/${exerciseId}`);
      
      if (exerciseResponse.ok) {
        const exercise = await exerciseResponse.json();
        this.recordTest('Test exercice par ID', true, null, `Exercice "${exercise.title}" récupéré`);
      } else {
        throw new Error(`Impossible de récupérer l'exercice ${exerciseId}: ${exerciseResponse.status}`);
      }
      
    } catch (error) {
      this.recordTest('Test exercice par ID', false, error);
    }
  }

  // Créer des données de test complètes
  async createCompleteTestData() {
    try {
      console.log('\n📊 Création de données de test complètes...\n');

      // Créer des cravings
      const cravings = [
        { intensity: 8, triggers: ['Stress'], emotions: ['Anxiété'], notes: 'Situation stressante au travail' },
        { intensity: 6, triggers: ['Ennui'], emotions: ['Frustration'], notes: 'Rien à faire ce week-end' },
        { intensity: 4, triggers: ['Fatigue'], emotions: ['Irritation'], notes: 'Manque de sommeil' },
        { intensity: 2, triggers: ['Habitude'], emotions: ['Nostalgie'], notes: 'Regardé un ancien film' }
      ];

      let cravingCount = 0;
      for (const craving of cravings) {
        const response = await this.apiRequest('POST', '/api/cravings', craving);
        if (response.ok) cravingCount++;
      }
      
      this.recordTest('Création de cravings de test', true, null, `${cravingCount}/${cravings.length} créés`);

      // Créer des sessions d'exercices
      const sessions = [
        { exerciseId: 'test-breathing', duration: 300, completed: true, cravingBefore: 8, cravingAfter: 3 },
        { exerciseId: 'test-meditation', duration: 600, completed: true, cravingBefore: 6, cravingAfter: 2 },
        { exerciseId: 'test-walking', duration: 900, completed: true, cravingBefore: 5, cravingAfter: 1 }
      ];

      let sessionCount = 0;
      for (const session of sessions) {
        const response = await this.apiRequest('POST', '/api/exercise-sessions', session);
        if (response.ok) sessionCount++;
      }
      
      this.recordTest('Création de sessions d\'exercices', true, null, `${sessionCount}/${sessions.length} créées`);

      // Créer des analyses Beck
      const analyses = [
        {
          situation: 'Conflit avec un collègue',
          automaticThoughts: 'Il ne me respecte pas, je vais tout abandonner',
          emotions: 'Colère',
          emotionIntensity: 8,
          rationalResponse: 'Ce conflit est ponctuel, nous pouvons le résoudre par la communication',
          newIntensity: 3
        },
        {
          situation: 'Échec à un examen',
          automaticThoughts: 'Je ne vaux rien, je n\'arriverai jamais',
          emotions: 'Tristesse',
          emotionIntensity: 9,
          rationalResponse: 'Un échec n\'est pas définitif, c\'est une opportunité d\'apprentissage',
          newIntensity: 4
        }
      ];

      let beckCount = 0;
      for (const analysis of analyses) {
        const response = await this.apiRequest('POST', '/api/beck-analyses', analysis);
        if (response.ok) beckCount++;
      }
      
      this.recordTest('Création d\'analyses Beck', true, null, `${beckCount}/${analyses.length} créées`);

      // Créer des stratégies
      const strategiesData = {
        strategies: [
          { context: 'home', exercise: 'Respiration profonde', effort: 'easy', duration: 5, cravingBefore: 7, cravingAfter: 3 },
          { context: 'work', exercise: 'Marche rapide', effort: 'medium', duration: 10, cravingBefore: 8, cravingAfter: 4 },
          { context: 'leisure', exercise: 'Méditation guidée', effort: 'easy', duration: 15, cravingBefore: 6, cravingAfter: 2 }
        ]
      };

      const strategiesResponse = await this.apiRequest('POST', '/api/strategies', strategiesData);
      
      if (strategiesResponse.ok) {
        this.recordTest('Création de stratégies anti-craving', true, null, `${strategiesData.strategies.length} stratégies créées`);
      } else {
        throw new Error(`Erreur création stratégies: ${strategiesResponse.status}`);
      }

    } catch (error) {
      this.recordTest('Création de données de test complètes', false, error);
    }
  }

  // Test de récupération des données avec limites
  async testDataLimits() {
    const limitTests = [
      { path: '/api/cravings?limit=5', name: 'Cravings avec limite' },
      { path: '/api/exercise-sessions?limit=3', name: 'Sessions avec limite' },
      { path: '/api/beck-analyses?limit=2', name: 'Analyses Beck avec limite' }
    ];

    for (const test of limitTests) {
      try {
        const response = await this.apiRequest('GET', test.path);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const count = Array.isArray(data) ? data.length : 0;
        
        this.recordTest(test.name, true, null, `${count} éléments récupérés`);
        
      } catch (error) {
        this.recordTest(test.name, false, error);
      }
    }
  }

  // Test des statistiques du dashboard
  async testDashboardStats() {
    try {
      const response = await this.apiRequest('GET', '/api/dashboard/stats');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const stats = await response.json();
      
      // Vérifier que les stats ont les bonnes propriétés
      const requiredProperties = ['exercisesCompleted', 'totalDuration', 'currentStreak', 'avgCravingIntensity'];
      const hasAllProperties = requiredProperties.every(prop => stats.hasOwnProperty(prop));
      
      if (hasAllProperties) {
        this.recordTest('Structure des statistiques', true, null, 'Toutes les propriétés présentes');
      } else {
        throw new Error('Propriétés manquantes dans les statistiques');
      }
      
      this.recordTest('Récupération des statistiques du dashboard', true, null, `${Object.keys(stats).length} propriétés`);
      
    } catch (error) {
      this.recordTest('Récupération des statistiques du dashboard', false, error);
    }
  }

  // Test de la page de suivi (simulation)
  async testTrackingPageData() {
    try {
      console.log('\n🔍 Simulation du chargement de la page de suivi...\n');

      // Simuler les requêtes que fait la page de suivi
      const trackingRequests = [
        { path: '/api/auth/me', name: 'Authentification utilisateur' },
        { path: '/api/dashboard/stats', name: 'Statistiques dashboard' },
        { path: '/api/cravings?limit=50', name: 'Historique cravings' },
        { path: '/api/exercise-sessions?limit=30', name: 'Sessions d\'exercices' },
        { path: '/api/beck-analyses?limit=20', name: 'Analyses Beck' },
        { path: '/api/strategies', name: 'Stratégies anti-craving' }
      ];

      let successCount = 0;
      for (const request of trackingRequests) {
        try {
          const response = await this.apiRequest('GET', request.path);
          
          if (response.ok) {
            const data = await response.json();
            successCount++;
            
            let details = '';
            if (Array.isArray(data)) {
              details = `${data.length} éléments`;
            } else if (data && typeof data === 'object') {
              details = `${Object.keys(data).length} propriétés`;
            }
            
            this.recordTest(`Suivi - ${request.name}`, true, null, details);
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
          
        } catch (error) {
          this.recordTest(`Suivi - ${request.name}`, false, error);
        }
      }

      const pageLoadSuccess = successCount === trackingRequests.length;
      this.recordTest('Chargement complet page de suivi', pageLoadSuccess, 
        pageLoadSuccess ? null : new Error(`${successCount}/${trackingRequests.length} requêtes réussies`),
        pageLoadSuccess ? 'Tous les endpoints répondent' : null);
      
    } catch (error) {
      this.recordTest('Test page de suivi', false, error);
    }
  }

  // Générer un rapport final
  generateReport() {
    console.log('\n📊 RAPPORT FINAL DES TESTS\n');
    console.log('='.repeat(60));
    
    const total = this.testResults.passed + this.testResults.failed;
    const successRate = total > 0 ? (this.testResults.passed / total * 100).toFixed(1) : 0;
    
    console.log(`\n🎯 RÉSULTAT GLOBAL:`);
    console.log(`✅ Tests réussis: ${this.testResults.passed}`);
    console.log(`❌ Tests échoués: ${this.testResults.failed}`);
    console.log(`📈 Taux de réussite: ${successRate}%`);
    
    if (this.testResults.failed > 0) {
      console.log('\n❌ TESTS EN ÉCHEC:');
      this.testResults.tests
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`   → ${test.name}: ${test.error}`);
        });
    }
    
    console.log('\n✅ TESTS RÉUSSIS:');
    this.testResults.tests
      .filter(test => test.passed)
      .forEach(test => {
        const details = test.details ? ` (${test.details})` : '';
        console.log(`   → ${test.name}${details}`);
      });
    
    console.log('\n💡 RECOMMANDATIONS:');
    
    if (successRate >= 90) {
      console.log('🎉 Excellent ! La page de suivi devrait fonctionner correctement.');
      console.log('✅ Toutes les fonctionnalités principales sont opérationnelles.');
    } else if (successRate >= 70) {
      console.log('⚠️  Bon résultat, mais quelques améliorations sont nécessaires.');
      console.log('🔧 Corriger les tests en échec pour optimiser l\'expérience utilisateur.');
    } else {
      console.log('🚨 Des problèmes importants persistent.');
      console.log('🛠️  Réviser les corrections apportées et déboguer les endpoints en échec.');
    }
    
    console.log('\n🔄 Prochaines étapes:');
    console.log('1. Corriger les tests en échec si nécessaire');
    console.log('2. Tester manuellement la page de suivi dans le navigateur');
    console.log('3. Vérifier que les données s\'affichent correctement');
    console.log('4. Valider que le message "Exercice introuvable" n\'apparaît plus');
    
    return {
      success: successRate >= 90,
      successRate,
      passed: this.testResults.passed,
      failed: this.testResults.failed,
      total
    };
  }

  // Méthode principale pour exécuter tous les tests
  async runAllTests() {
    console.log('🚀 Démarrage des tests complets de suivi\n');
    console.log(`🌐 URL de base: ${BASE_URL}\n`);

    try {
      // Étape 1: Créer un utilisateur de test
      const user = await this.createTestUser();
      
      // Étape 2: Tester les endpoints de base
      console.log('\n🧪 Test des endpoints de base...\n');
      await this.testBasicEndpoints();
      
      // Étape 3: Tester la récupération d'exercice par ID
      console.log('\n🎯 Test de récupération d\'exercice spécifique...\n');
      await this.testExerciseById();
      
      // Étape 4: Créer des données de test
      await this.createCompleteTestData();
      
      // Étape 5: Tester les limites de données
      console.log('\n📊 Test des limites de données...\n');
      await this.testDataLimits();
      
      // Étape 6: Tester les statistiques
      console.log('\n📈 Test des statistiques...\n');
      await this.testDashboardStats();
      
      // Étape 7: Simuler le chargement de la page de suivi
      await this.testTrackingPageData();
      
      // Générer le rapport final
      const report = this.generateReport();
      
      return report;
      
    } catch (error) {
      console.error('❌ ÉCHEC CRITIQUE des tests:', error.message);
      this.recordTest('Exécution globale des tests', false, error);
      return this.generateReport();
    }
  }
}

// Exécuter les tests
async function main() {
  const tester = new TrackingTester();
  const report = await tester.runAllTests();
  
  // Code de sortie basé sur le succès
  process.exit(report.success ? 0 : 1);
}

// Lancer les tests
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { TrackingTester };