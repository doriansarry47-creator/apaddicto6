#!/usr/bin/env node

/**
 * Script de diagnostic pour identifier les problèmes de l'onglet Education
 * et de l'interface admin de gestion de contenu
 */

import fetch from 'node-fetch';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// Test credentials
const ADMIN_CREDS = {
  email: 'admin@apaddicto.com',
  password: 'password123'
};

class EducationDiagnostic {
  constructor() {
    this.sessionCookie = null;
  }

  async login() {
    try {
      console.log('🔐 Tentative de connexion admin...');
      
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ADMIN_CREDS)
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
      }

      // Récupérer les cookies de session
      const setCookieHeader = response.headers.get('set-cookie');
      if (setCookieHeader) {
        this.sessionCookie = setCookieHeader;
      }

      const result = await response.json();
      console.log('✅ Connexion réussie:', result.user?.email);
      return true;
    } catch (error) {
      console.error('❌ Erreur de connexion:', error.message);
      return false;
    }
  }

  async testContentCategories() {
    try {
      console.log('\n📁 Test des catégories de contenu...');
      
      const response = await fetch(`${BASE_URL}/api/content-categories`, {
        headers: {
          'Cookie': this.sessionCookie || ''
        }
      });

      if (!response.ok) {
        throw new Error(`Categories request failed: ${response.status} ${response.statusText}`);
      }

      const categories = await response.json();
      console.log('📊 Catégories trouvées:', categories.length);
      
      if (categories.length > 0) {
        console.log('📋 Exemple de catégorie:', {
          id: categories[0].id,
          name: categories[0].name,
          isActive: categories[0].isActive
        });
      } else {
        console.log('⚠️ Aucune catégorie trouvée - cela peut expliquer les problèmes d\'affichage');
      }

      return categories;
    } catch (error) {
      console.error('❌ Erreur récupération catégories:', error.message);
      return [];
    }
  }

  async testEducationalContents() {
    try {
      console.log('\n📚 Test des contenus éducationnels...');
      
      const response = await fetch(`${BASE_URL}/api/educational-contents?status=published`, {
        headers: {
          'Cookie': this.sessionCookie || ''
        }
      });

      if (!response.ok) {
        throw new Error(`Educational contents request failed: ${response.status} ${response.statusText}`);
      }

      const contents = await response.json();
      console.log('📊 Contenus trouvés:', contents.length);
      
      if (contents.length > 0) {
        console.log('📋 Exemple de contenu:', {
          id: contents[0].id,
          title: contents[0].title,
          categoryId: contents[0].categoryId,
          category: contents[0].category,
          type: contents[0].type,
          status: contents[0].status
        });
      } else {
        console.log('⚠️ Aucun contenu éducationnel publié trouvé');
      }

      return contents;
    } catch (error) {
      console.error('❌ Erreur récupération contenus éducationnels:', error.message);
      return [];
    }
  }

  async testCreateContent() {
    try {
      console.log('\n➕ Test de création de contenu...');
      
      const testContent = {
        title: 'Test de Diagnostic - Contenu Temporaire',
        categoryId: 'craving_management',
        type: 'text',
        difficulty: 'easy',
        content: 'Ceci est un contenu de test pour diagnostiquer les problèmes.',
        description: 'Description de test',
        estimatedReadTime: 5,
        status: 'draft',
        isRecommended: false
      };

      const response = await fetch(`${BASE_URL}/api/educational-contents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': this.sessionCookie || ''
        },
        body: JSON.stringify(testContent)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur création contenu:', response.status, errorText);
        return null;
      }

      const createdContent = await response.json();
      console.log('✅ Contenu créé avec succès:', createdContent.id);
      return createdContent;
    } catch (error) {
      console.error('❌ Erreur création contenu:', error.message);
      return null;
    }
  }

  async testAdminContentList() {
    try {
      console.log('\n👩‍💼 Test de la liste admin des contenus...');
      
      const response = await fetch(`${BASE_URL}/api/educational-contents`, {
        headers: {
          'Cookie': this.sessionCookie || ''
        }
      });

      if (!response.ok) {
        throw new Error(`Admin content list failed: ${response.status} ${response.statusText}`);
      }

      const allContents = await response.json();
      console.log('📊 Contenus totaux (admin):', allContents.length);
      
      const statusBreakdown = allContents.reduce((acc, content) => {
        acc[content.status] = (acc[content.status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📈 Répartition par statut:', statusBreakdown);
      return allContents;
    } catch (error) {
      console.error('❌ Erreur liste admin contenus:', error.message);
      return [];
    }
  }

  async cleanupTestContent() {
    try {
      console.log('\n🧹 Nettoyage des contenus de test...');
      
      const contents = await this.testAdminContentList();
      const testContents = contents.filter(c => 
        c.title && c.title.includes('Test de Diagnostic')
      );

      for (const content of testContents) {
        try {
          const response = await fetch(`${BASE_URL}/api/educational-contents/${content.id}`, {
            method: 'DELETE',
            headers: {
              'Cookie': this.sessionCookie || ''
            }
          });

          if (response.ok) {
            console.log('🗑️ Contenu de test supprimé:', content.id);
          }
        } catch (error) {
          console.log('⚠️ Impossible de supprimer:', content.id);
        }
      }
    } catch (error) {
      console.error('❌ Erreur nettoyage:', error.message);
    }
  }

  async runFullDiagnostic() {
    console.log('🏥 === DIAGNOSTIC DES PROBLÈMES EDUCATION ===\n');
    
    // 1. Connexion
    const loginSuccess = await this.login();
    if (!loginSuccess) {
      console.log('❌ Impossible de continuer sans connexion admin');
      return;
    }

    // 2. Test des catégories
    const categories = await this.testContentCategories();

    // 3. Test des contenus éducationnels
    const contents = await this.testEducationalContents();

    // 4. Test de la création de contenu
    const createdContent = await this.testCreateContent();

    // 5. Test de la liste admin
    const adminContents = await this.testAdminContentList();

    // 6. Analyse des problèmes
    console.log('\n🔍 === ANALYSE DES PROBLÈMES ===');
    
    if (categories.length === 0) {
      console.log('❌ PROBLÈME 1: Aucune catégorie de contenu trouvée');
      console.log('   - Cela empêche l\'onglet Education de se charger correctement');
      console.log('   - L\'admin ne peut pas créer de contenu sans catégories');
    }

    if (contents.length === 0) {
      console.log('❌ PROBLÈME 2: Aucun contenu éducationnel publié');
      console.log('   - L\'onglet Education apparaît vide aux utilisateurs');
    }

    if (!createdContent) {
      console.log('❌ PROBLÈME 3: Création de contenu échoue');
      console.log('   - Les admins ne peuvent pas créer de nouveau contenu');
    }

    const draftContents = adminContents.filter(c => c.status === 'draft');
    if (draftContents.length > 0 && contents.length === 0) {
      console.log('⚠️ PROBLÈME 4: Contenus créés mais non publiés');
      console.log(`   - ${draftContents.length} contenus en brouillon ne sont pas visibles`);
    }

    // 7. Suggestions de solutions
    console.log('\n💡 === SUGGESTIONS DE SOLUTIONS ===');
    
    if (categories.length === 0) {
      console.log('1. Créer les catégories de contenu par défaut');
    }
    
    if (contents.length === 0 && adminContents.length > 0) {
      console.log('2. Publier les contenus en brouillon existants');
    }
    
    if (contents.length === 0 && adminContents.length === 0) {
      console.log('3. Créer du contenu éducationnel de démonstration');
    }

    // 8. Nettoyage
    await this.cleanupTestContent();
    
    console.log('\n✅ Diagnostic terminé');
  }
}

// Exécution du diagnostic
const diagnostic = new EducationDiagnostic();
diagnostic.runFullDiagnostic().catch(console.error);