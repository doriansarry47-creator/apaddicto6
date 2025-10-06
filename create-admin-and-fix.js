#!/usr/bin/env node

/**
 * Script pour créer un admin et corriger les problèmes Education
 */

import fetch from 'node-fetch';

const BASE_URL = 'https://3000-i60txp616vdejr5a0xe8h-6532622b.e2b.dev';

class AdminCreatorAndFixer {
  constructor() {
    this.sessionCookie = null;
  }

  async createAdmin() {
    console.log('👤 Création de l\'utilisateur admin...');
    
    const adminData = {
      email: 'admin@apaddicto.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'Système',
      role: 'admin'
    };

    try {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Admin créé:', result.user?.email);
        this.sessionCookie = response.headers.get('set-cookie');
        return true;
      } else {
        const error = await response.text();
        console.log('⚠️ Admin existe peut-être déjà ou erreur:', error);
        
        // Essayer de se connecter
        return await this.login();
      }
    } catch (error) {
      console.error('❌ Erreur création admin:', error.message);
      return false;
    }
  }

  async login() {
    try {
      console.log('🔐 Tentative de connexion...');
      
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@apaddicto.com',
          password: 'admin123'
        })
      });

      if (response.ok) {
        this.sessionCookie = response.headers.get('set-cookie');
        const result = await response.json();
        console.log('✅ Connexion réussie:', result.user?.email);
        return true;
      } else {
        console.log('❌ Échec connexion admin@apaddicto.com');
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur connexion:', error.message);
      return false;
    }
  }

  async checkHealth() {
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      if (response.ok) {
        console.log('✅ Serveur en ligne');
        return true;
      }
    } catch (error) {
      console.log('❌ Serveur inaccessible');
      return false;
    }
  }

  async createCategories() {
    console.log('\n📁 Création des catégories...');
    
    const categories = [
      {
        name: '🧠 Comprendre le Craving',
        description: 'Comprendre et gérer les envies compulsives',
        color: 'blue',
        icon: 'brain',
        order: 1
      },
      {
        name: '🚨 Stratégies d\'Urgence',
        description: 'Techniques rapides pour gérer les crises',
        color: 'red', 
        icon: 'alert-triangle',
        order: 2
      },
      {
        name: '💪 APA et Santé Mentale',
        description: 'Activité physique adaptée pour le bien-être mental',
        color: 'green',
        icon: 'activity',
        order: 3
      }
    ];

    let created = 0;
    
    for (const category of categories) {
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
          console.log(`✅ Catégorie créée: ${category.name} (${result.id})`);
          created++;
        } else {
          const error = await response.text();
          console.log(`⚠️ ${category.name}: ${error}`);
        }
      } catch (error) {
        console.log(`❌ Erreur ${category.name}:`, error.message);
      }
    }

    return created;
  }

  async listCategories() {
    try {
      const response = await fetch(`${BASE_URL}/api/content-categories`, {
        headers: {
          'Cookie': this.sessionCookie || ''
        }
      });

      if (response.ok) {
        const categories = await response.json();
        console.log(`\n📊 Catégories trouvées: ${categories.length}`);
        categories.forEach(cat => {
          console.log(`   - ${cat.name} (ID: ${cat.id})`);
        });
        return categories;
      }
    } catch (error) {
      console.log('❌ Erreur récupération catégories');
    }
    return [];
  }

  async createContent() {
    console.log('\n📚 Création de contenu de base...');
    
    // D'abord récupérer les catégories pour avoir les IDs
    const categories = await this.listCategories();
    
    if (categories.length === 0) {
      console.log('❌ Aucune catégorie disponible pour créer du contenu');
      return 0;
    }

    const firstCategoryId = categories[0].id;
    
    const content = {
      title: 'Comprendre le mécanisme du craving',
      categoryId: firstCategoryId,
      type: 'text',
      difficulty: 'easy',
      content: `# Le craving : comprendre pour mieux gérer

Le craving est une expérience normale dans le processus de récupération.

## Qu'est-ce que le craving ?

Le craving se caractérise par :
- Une envie intense et soudaine
- Des pensées obsédantes
- Une sensation d'urgence

## Points importants

✅ **Le craving est temporaire** - il diminue naturellement

✅ **C'est normal** - vous n'êtes pas seul(e) à vivre cela

✅ **Des techniques existent** - vous pouvez apprendre à le gérer

## Prochaines étapes

1. Identifiez vos déclencheurs personnels
2. Apprenez des techniques de gestion
3. Pratiquez régulièrement ces techniques`,
      description: 'Introduction au concept de craving et premiers conseils',
      estimatedReadTime: 5,
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
        body: JSON.stringify(content)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Contenu créé: ${content.title}`);
        return 1;
      } else {
        const error = await response.text();
        console.log(`❌ Erreur création contenu: ${error}`);
        return 0;
      }
    } catch (error) {
      console.log('❌ Erreur création contenu:', error.message);
      return 0;
    }
  }

  async listContents() {
    try {
      const response = await fetch(`${BASE_URL}/api/educational-contents?status=published`, {
        headers: {
          'Cookie': this.sessionCookie || ''
        }
      });

      if (response.ok) {
        const contents = await response.json();
        console.log(`\n📊 Contenus publiés: ${contents.length}`);
        contents.forEach(content => {
          console.log(`   - ${content.title} (${content.difficulty})`);
        });
        return contents;
      }
    } catch (error) {
      console.log('❌ Erreur récupération contenus');
    }
    return [];
  }

  async runFullSetup() {
    console.log('🚀 === CONFIGURATION COMPLÈTE DE L\'ESPACE EDUCATION ===\n');
    
    // 1. Vérifier que le serveur répond
    const serverOk = await this.checkHealth();
    if (!serverOk) {
      console.log('❌ Le serveur ne répond pas. Vérifiez qu\'il est démarré.');
      return;
    }

    // 2. Créer l'admin ou se connecter
    const adminOk = await this.createAdmin();
    if (!adminOk) {
      console.log('❌ Impossible de créer/connecter l\'admin');
      return;
    }

    // 3. Créer les catégories
    console.log('\n📁 === GESTION DES CATÉGORIES ===');
    const categories = await this.listCategories();
    
    if (categories.length === 0) {
      console.log('Aucune catégorie trouvée, création...');
      await this.createCategories();
    } else {
      console.log('Des catégories existent déjà');
    }

    // 4. Créer du contenu
    console.log('\n📚 === GESTION DU CONTENU ===');
    const contents = await this.listContents();
    
    if (contents.length === 0) {
      console.log('Aucun contenu trouvé, création...');
      await this.createContent();
    } else {
      console.log('Du contenu existe déjà');
    }

    // 5. Vérification finale
    console.log('\n✅ === VÉRIFICATION FINALE ===');
    const finalCategories = await this.listCategories();
    const finalContents = await this.listContents();
    
    console.log(`\n📊 État final:`);
    console.log(`   - ${finalCategories.length} catégories`);
    console.log(`   - ${finalContents.length} contenus publiés`);
    
    if (finalCategories.length > 0 && finalContents.length > 0) {
      console.log('\n🎉 SUCCÈS ! Configuration terminée');
      console.log('\n🌐 Testez maintenant l\'application :');
      console.log(`   URL: ${BASE_URL}`);
      console.log('   Admin: admin@apaddicto.com / admin123');
      console.log('\n📝 Étapes de test :');
      console.log('   1. Connectez-vous en tant qu\'admin');
      console.log('   2. Allez dans /admin/manage-content pour créer plus de contenu');
      console.log('   3. Testez l\'onglet Education en tant qu\'utilisateur');
    } else {
      console.log('\n⚠️ Configuration incomplète. Intervention manuelle nécessaire.');
    }
  }
}

// Exécution
const setupTool = new AdminCreatorAndFixer();
setupTool.runFullSetup().catch(console.error);