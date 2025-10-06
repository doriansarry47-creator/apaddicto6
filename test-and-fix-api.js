#!/usr/bin/env node

/**
 * Script de test et correction via l'API en direct
 */

import fetch from 'node-fetch';

const BASE_URL = 'https://3000-i60txp616vdejr5a0xe8h-6532622b.e2b.dev';

// Credentials admin
const ADMIN_CREDS = {
  email: 'admin@apaddicto.com',
  password: 'admin123'
};

class APITester {
  constructor() {
    this.sessionCookie = null;
  }

  async login() {
    try {
      console.log('🔐 Connexion admin...');
      
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ADMIN_CREDS)
      });

      if (!response.ok) {
        console.log('❌ Échec de connexion avec admin@apaddicto.com, test avec credentials alternatifs...');
        
        // Essayer avec d'autres credentials
        const altResponse = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'dorian@apaddicto.com', 
            password: 'admin123'
          })
        });
        
        if (!altResponse.ok) {
          throw new Error(`Login failed: ${altResponse.status}`);
        }
        
        this.sessionCookie = altResponse.headers.get('set-cookie');
        const result = await altResponse.json();
        console.log('✅ Connexion réussie avec:', result.user?.email);
        return true;
      }

      this.sessionCookie = response.headers.get('set-cookie');
      const result = await response.json();
      console.log('✅ Connexion réussie avec:', result.user?.email);
      return true;
    } catch (error) {
      console.error('❌ Erreur de connexion:', error.message);
      return false;
    }
  }

  async testCategories() {
    try {
      console.log('\n📁 Test des catégories...');
      
      const response = await fetch(`${BASE_URL}/api/content-categories`, {
        headers: {
          'Cookie': this.sessionCookie || ''
        }
      });

      if (!response.ok) {
        throw new Error(`Categories failed: ${response.status}`);
      }

      const categories = await response.json();
      console.log(`📊 Catégories trouvées: ${categories.length}`);
      
      if (categories.length > 0) {
        categories.forEach(cat => {
          console.log(`   - ${cat.name} (${cat.id}) [${cat.isActive ? 'actif' : 'inactif'}]`);
        });
      }

      return categories;
    } catch (error) {
      console.error('❌ Erreur catégories:', error.message);
      return [];
    }
  }

  async createDefaultCategories() {
    console.log('\n➕ Création des catégories par défaut...');
    
    const defaultCategories = [
      {
        id: 'craving_management',
        name: '🧠 Comprendre le Craving',
        description: 'Comprendre et gérer les envies compulsives',
        color: 'blue',
        icon: 'brain',
        order: 1
      },
      {
        id: 'emergency_strategies',
        name: '🚨 Stratégies d\'Urgence',
        description: 'Techniques rapides pour gérer les crises',
        color: 'red',
        icon: 'alert-triangle',
        order: 2
      },
      {
        id: 'apa_mental_health',
        name: '💪 APA et Santé Mentale',
        description: 'Activité physique adaptée pour le bien-être mental',
        color: 'green',
        icon: 'activity',
        order: 3
      },
      {
        id: 'breathing_relaxation',
        name: '🫁 Respiration & Relaxation',
        description: 'Techniques de respiration et de détente',
        color: 'purple',
        icon: 'wind',
        order: 4
      }
    ];

    let created = 0;
    
    for (const category of defaultCategories) {
      try {
        const response = await fetch(`${BASE_URL}/api/content-categories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': this.sessionCookie || ''
          },
          body: JSON.stringify(category)
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Catégorie créée: ${category.name}`);
          created++;
        } else {
          console.log(`⚠️ Catégorie ${category.name} existe peut-être déjà`);
        }
      } catch (error) {
        console.log(`❌ Erreur catégorie ${category.name}:`, error.message);
      }
    }

    console.log(`📊 ${created} nouvelles catégories créées`);
    return created;
  }

  async testContents() {
    try {
      console.log('\n📚 Test des contenus...');
      
      // Tester tous les contenus (admin)
      const allResponse = await fetch(`${BASE_URL}/api/educational-contents`, {
        headers: {
          'Cookie': this.sessionCookie || ''
        }
      });

      if (!allResponse.ok) {
        throw new Error(`All contents failed: ${allResponse.status}`);
      }

      const allContents = await allResponse.json();
      console.log(`📊 Contenus totaux: ${allContents.length}`);
      
      // Tester contenus publiés
      const publishedResponse = await fetch(`${BASE_URL}/api/educational-contents?status=published`, {
        headers: {
          'Cookie': this.sessionCookie || ''
        }
      });

      if (publishedResponse.ok) {
        const publishedContents = await publishedResponse.json();
        console.log(`📊 Contenus publiés: ${publishedContents.length}`);
        
        const statusCounts = allContents.reduce((acc, content) => {
          acc[content.status] = (acc[content.status] || 0) + 1;
          return acc;
        }, {});
        
        console.log('📈 Statuts:', statusCounts);
      }

      return allContents;
    } catch (error) {
      console.error('❌ Erreur contenus:', error.message);
      return [];
    }
  }

  async createSampleContent() {
    console.log('\n➕ Création de contenu de démonstration...');
    
    const sampleContent = {
      title: 'Guide de démarrage - Comprendre le craving',
      categoryId: 'craving_management',
      type: 'text',
      difficulty: 'easy',
      content: `# Comprendre le craving

Le craving est une envie intense et soudaine. C'est normal et temporaire.

## Points clés :
- Le craving diminue naturellement avec le temps
- Des techniques existent pour le gérer
- Vous n'êtes pas seul dans cette expérience

## Prochaines étapes :
1. Identifiez vos déclencheurs
2. Apprenez des techniques de gestion
3. Pratiquez régulièrement`,
      description: 'Introduction simple au concept de craving',
      estimatedReadTime: 3,
      status: 'published',
      isRecommended: true
    };

    try {
      const response = await fetch(`${BASE_URL}/api/educational-contents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': this.sessionCookie || ''
        },
        body: JSON.stringify(sampleContent)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Contenu créé: ${sampleContent.title}`);
        return result;
      } else {
        const error = await response.text();
        console.log(`❌ Erreur création contenu: ${response.status} - ${error}`);
        return null;
      }
    } catch (error) {
      console.error('❌ Erreur création contenu:', error.message);
      return null;
    }
  }

  async publishDraftContents(contents) {
    console.log('\n📢 Publication des brouillons...');
    
    const drafts = contents.filter(c => c.status === 'draft');
    console.log(`📋 ${drafts.length} contenus en brouillon trouvés`);
    
    let published = 0;
    
    for (const draft of drafts) {
      try {
        const response = await fetch(`${BASE_URL}/api/educational-contents/${draft.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': this.sessionCookie || ''
          },
          body: JSON.stringify({
            ...draft,
            status: 'published',
            publishedAt: new Date().toISOString()
          })
        });

        if (response.ok) {
          console.log(`✅ Publié: ${draft.title}`);
          published++;
        }
      } catch (error) {
        console.log(`❌ Erreur publication ${draft.title}:`, error.message);
      }
    }

    console.log(`📊 ${published} contenus publiés`);
    return published;
  }

  async runFullTest() {
    console.log('🏥 === TEST ET CORRECTION AUTOMATIQUE ===\n');
    
    // 1. Connexion
    const loginSuccess = await this.login();
    if (!loginSuccess) {
      console.log('❌ Impossible de continuer sans connexion');
      return;
    }

    // 2. Test catégories
    let categories = await this.testCategories();
    
    // 3. Créer catégories si nécessaires
    if (categories.length === 0) {
      console.log('⚠️ Aucune catégorie trouvée, création automatique...');
      await this.createDefaultCategories();
      categories = await this.testCategories();
    }

    // 4. Test contenus
    let contents = await this.testContents();
    
    // 5. Publier brouillons
    const publishedCount = await this.publishDraftContents(contents);
    
    // 6. Créer du contenu si nécessaire
    const publishedContents = contents.filter(c => c.status === 'published');
    if (publishedContents.length === 0) {
      console.log('⚠️ Aucun contenu publié, création de contenu de démonstration...');
      await this.createSampleContent();
      contents = await this.testContents();
    }

    // 7. Résumé final
    console.log('\n🎯 === RÉSUMÉ FINAL ===');
    const finalCategories = await this.testCategories();
    const finalContents = await this.testContents();
    const finalPublished = finalContents.filter(c => c.status === 'published');
    
    console.log(`📊 État final:`);
    console.log(`   - ${finalCategories.length} catégories`);
    console.log(`   - ${finalContents.length} contenus totaux`);
    console.log(`   - ${finalPublished.length} contenus publiés`);
    
    if (finalCategories.length > 0 && finalPublished.length > 0) {
      console.log('\n🎉 SUCCÈS ! L\'onglet Education devrait maintenant fonctionner');
      console.log(`\n🌐 Testez l'application ici: ${BASE_URL}`);
      console.log('   1. Connectez-vous avec vos identifiants');
      console.log('   2. Allez dans l\'onglet Education');
      console.log('   3. Vérifiez que les catégories et contenus s\'affichent');
    } else {
      console.log('\n⚠️ Des problèmes persistent. Vérification manuelle nécessaire.');
    }
  }
}

// Exécution
const tester = new APITester();
tester.runFullTest().catch(console.error);