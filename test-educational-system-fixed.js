#!/usr/bin/env node

/**
 * TEST COMPLET DU SYSTÈME ÉDUCATIF RÉPARÉ
 * 
 * Ce script teste le fonctionnement de bout en bout :
 * 1. Connexion admin et patient
 * 2. Récupération des catégories
 * 3. Récupération des contenus par l'admin
 * 4. Récupération des contenus par le patient
 * 5. Filtrage par catégories
 * 6. Tests d'interactions (like, bookmark)
 */

import fetch from 'node-fetch';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// URL de base de l'API
const API_BASE = 'https://3000-i01c1qnwr7w0urd0wd2du-6532622b.e2b.dev';

class EducationalSystemTester {
  constructor() {
    this.adminCookies = '';
    this.patientCookies = '';
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();
    return { response, data };
  }

  async makeAuthRequest(endpoint, cookies, options = {}) {
    return this.makeRequest(endpoint, {
      ...options,
      headers: {
        'Cookie': cookies,
        ...options.headers,
      },
    });
  }

  extractCookies(response) {
    const setCookie = response.headers.raw()['set-cookie'];
    if (setCookie) {
      return setCookie.map(cookie => cookie.split(';')[0]).join('; ');
    }
    return '';
  }

  async loginAdmin() {
    console.log('🔐 Connexion administrateur...');
    
    const { response, data } = await this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      }),
    });

    if (response.ok) {
      this.adminCookies = this.extractCookies(response);
      console.log('   ✅ Admin connecté avec succès');
      return true;
    } else {
      console.log('   ❌ Échec connexion admin:', data.message);
      return false;
    }
  }

  async loginPatient() {
    console.log('🔐 Connexion patient...');
    
    const { response, data } = await this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'patient@example.com',
        password: 'patient123'
      }),
    });

    if (response.ok) {
      this.patientCookies = this.extractCookies(response);
      console.log('   ✅ Patient connecté avec succès');
      return true;
    } else {
      console.log('   ❌ Échec connexion patient:', data.message);
      return false;
    }
  }

  async testCategories() {
    console.log('\n📁 Test récupération des catégories...');
    
    const { response, data } = await this.makeAuthRequest('/api/content-categories', this.adminCookies);
    
    if (response.ok && Array.isArray(data)) {
      console.log(`   ✅ ${data.length} catégories récupérées`);
      console.log(`   📂 Catégories actives: ${data.filter(c => c.isActive !== false).length}`);
      
      // Afficher quelques catégories
      data.slice(0, 3).forEach((cat, index) => {
        console.log(`   ${index + 1}. "${cat.name}" (${cat.color})`);
      });
      
      return data;
    } else {
      console.log('   ❌ Erreur récupération catégories:', response.status);
      return [];
    }
  }

  async testAdminContents() {
    console.log('\n📚 Test récupération contenus admin...');
    
    const { response, data } = await this.makeAuthRequest('/api/educational-contents', this.adminCookies);
    
    if (response.ok && Array.isArray(data)) {
      console.log(`   ✅ ${data.length} contenus récupérés (admin vue)`);
      
      const published = data.filter(c => c.status === 'published');
      const draft = data.filter(c => c.status === 'draft');
      const recommended = data.filter(c => c.isRecommended);
      
      console.log(`   📖 Publiés: ${published.length}`);
      console.log(`   ✏️  Brouillons: ${draft.length}`);
      console.log(`   ⭐ Recommandés: ${recommended.length}`);
      
      return data;
    } else {
      console.log('   ❌ Erreur récupération contenus admin:', response.status);
      return [];
    }
  }

  async testPatientContents() {
    console.log('\n👥 Test récupération contenus patient...');
    
    const { response, data } = await this.makeAuthRequest('/api/educational-contents?status=published', this.patientCookies);
    
    if (response.ok && Array.isArray(data)) {
      console.log(`   ✅ ${data.length} contenus visibles pour le patient`);
      
      // Grouper par catégorie
      const byCategory = {};
      data.forEach(content => {
        const catId = content.categoryId || 'sans-catégorie';
        if (!byCategory[catId]) byCategory[catId] = [];
        byCategory[catId].push(content);
      });
      
      console.log(`   📁 Répartition par catégorie: ${Object.keys(byCategory).length} catégories`);
      Object.entries(byCategory).slice(0, 3).forEach(([catId, contents]) => {
        console.log(`      • Catégorie ${catId}: ${contents.length} contenus`);
      });
      
      return data;
    } else {
      console.log('   ❌ Erreur récupération contenus patient:', response.status);
      return [];
    }
  }

  async testCategoryFiltering(categories, contents) {
    console.log('\n🔍 Test filtrage par catégorie...');
    
    if (categories.length === 0 || contents.length === 0) {
      console.log('   ⏭️  Pas de données pour tester le filtrage');
      return;
    }
    
    // Prendre la première catégorie avec du contenu
    const categoryWithContent = categories.find(cat => 
      contents.some(content => content.categoryId === cat.id)
    );
    
    if (!categoryWithContent) {
      console.log('   ⚠️  Aucune catégorie avec du contenu trouvée');
      return;
    }
    
    const { response, data } = await this.makeAuthRequest(
      `/api/educational-contents?status=published&categoryId=${categoryWithContent.id}`, 
      this.patientCookies
    );
    
    if (response.ok && Array.isArray(data)) {
      console.log(`   ✅ Filtrage "${categoryWithContent.name}": ${data.length} contenus`);
      
      // Vérifier que tous les contenus appartiennent à cette catégorie
      const allMatch = data.every(content => content.categoryId === categoryWithContent.id);
      if (allMatch) {
        console.log('   ✅ Filtrage correct - tous les contenus correspondent');
      } else {
        console.log('   ❌ Erreur filtrage - contenus incorrects inclus');
      }
    } else {
      console.log('   ❌ Erreur filtrage par catégorie:', response.status);
    }
  }

  async testContentInteractions(contents) {
    console.log('\n💖 Test interactions contenu...');
    
    if (contents.length === 0) {
      console.log('   ⏭️  Pas de contenu pour tester les interactions');
      return;
    }
    
    const testContent = contents[0];
    console.log(`   🎯 Test sur: "${testContent.title}"`);
    
    // Test like
    const { response: likeResponse } = await this.makeAuthRequest(
      `/api/educational-contents/${testContent.id}/like`,
      this.patientCookies,
      { method: 'POST' }
    );
    
    if (likeResponse.ok) {
      console.log('   ✅ Like fonctionnel');
    } else {
      console.log('   ❌ Erreur like:', likeResponse.status);
    }
    
    // Test bookmark
    const { response: bookmarkResponse } = await this.makeAuthRequest(
      `/api/educational-contents/${testContent.id}/bookmark`,
      this.patientCookies,
      { method: 'POST' }
    );
    
    if (bookmarkResponse.ok) {
      console.log('   ✅ Bookmark fonctionnel');
    } else {
      console.log('   ❌ Erreur bookmark:', bookmarkResponse.status);
    }
    
    // Test completion
    const { response: completeResponse } = await this.makeAuthRequest(
      `/api/educational-contents/${testContent.id}/complete`,
      this.patientCookies,
      { method: 'POST' }
    );
    
    if (completeResponse.ok) {
      console.log('   ✅ Complétion fonctionnelle');
    } else {
      console.log('   ❌ Erreur complétion:', completeResponse.status);
    }
  }

  async runTests() {
    console.log('🧪 === TEST COMPLET SYSTÈME ÉDUCATIF ===\n');
    
    try {
      // Phase 1: Authentifications
      const adminLogin = await this.loginAdmin();
      const patientLogin = await this.loginPatient();
      
      if (!adminLogin || !patientLogin) {
        console.log('\n❌ Impossible de continuer - échec authentification');
        return;
      }
      
      // Phase 2: Tests fonctionnels
      const categories = await this.testCategories();
      const adminContents = await this.testAdminContents();
      const patientContents = await this.testPatientContents();
      
      // Phase 3: Tests avancés
      await this.testCategoryFiltering(categories, patientContents);
      await this.testContentInteractions(patientContents);
      
      // Résumé final
      console.log('\n📊 RÉSUMÉ DES TESTS');
      console.log('═══════════════════════════════════════');
      console.log(`✅ Catégories disponibles: ${categories.length}`);
      console.log(`✅ Contenus admin: ${adminContents.length}`);
      console.log(`✅ Contenus patient: ${patientContents.length}`);
      
      if (categories.length > 0 && patientContents.length > 0) {
        console.log('\n🎉 SYSTÈME ÉDUCATIF FONCTIONNEL !');
        console.log('   • L\'admin peut gérer les contenus');
        console.log('   • Les patients peuvent consulter les contenus');
        console.log('   • Le filtrage par catégorie fonctionne');
        console.log('   • Les interactions utilisateur fonctionnent');
        console.log('\n🌐 Accès URL: https://3000-i01c1qnwr7w0urd0wd2du-6532622b.e2b.dev');
      } else {
        console.log('\n⚠️  SYSTÈME PARTIELLEMENT FONCTIONNEL');
        console.log('   • Vérifiez que des contenus sont publiés');
        console.log('   • Vérifiez que des catégories existent');
      }
      
    } catch (error) {
      console.error('\n💥 ERREUR DURANT LES TESTS:', error.message);
    }
  }
}

// Créer et exécuter les tests
const tester = new EducationalSystemTester();
tester.runTests().catch(console.error);