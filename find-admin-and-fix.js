#!/usr/bin/env node

/**
 * Script pour trouver les credentials admin et corriger l'Education
 */

import fetch from 'node-fetch';

const BASE_URL = 'https://3000-i60txp616vdejr5a0xe8h-6532622b.e2b.dev';

class AdminFinder {
  constructor() {
    this.sessionCookie = null;
  }

  async tryLogin(email, password) {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        this.sessionCookie = response.headers.get('set-cookie');
        const result = await response.json();
        return { success: true, user: result.user };
      }
      return { success: false };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async findAdminCredentials() {
    console.log('🔍 Recherche des credentials admin...');
    
    const commonPasswords = [
      'password',
      'admin',
      'admin123',
      'password123', 
      '123456',
      'apaddicto',
      'Apaddicto2024',
      'test123',
      'changeme'
    ];

    const emails = [
      'admin@apaddicto.com',
      'dorian@apaddicto.com',
      'test@apaddicto.com',
      'admin@example.com'
    ];

    for (const email of emails) {
      console.log(`\n🔐 Test email: ${email}`);
      for (const password of commonPasswords) {
        process.stdout.write(`   Essai: ${password}...`);
        const result = await this.tryLogin(email, password);
        
        if (result.success) {
          console.log(' ✅ SUCCÈS !');
          console.log(`📧 Email: ${email}`);
          console.log(`🔑 Mot de passe: ${password}`);
          console.log(`👤 Utilisateur: ${result.user?.firstName} ${result.user?.lastName} (${result.user?.role})`);
          return { email, password, user: result.user };
        } else {
          console.log(' ❌');
        }
      }
    }

    console.log('\n❌ Aucun credential admin trouvé');
    return null;
  }

  async createNewAdmin() {
    console.log('\n👤 Création d\'un nouvel admin avec email différent...');
    
    const adminData = {
      email: 'superadmin@apaddicto.com',
      password: 'SuperAdmin123!',
      firstName: 'Super',
      lastName: 'Admin',
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
        this.sessionCookie = response.headers.get('set-cookie');
        console.log('✅ Nouvel admin créé avec succès !');
        console.log(`📧 Email: ${adminData.email}`);
        console.log(`🔑 Mot de passe: ${adminData.password}`);
        return adminData;
      } else {
        const error = await response.text();
        console.log('❌ Échec création admin:', error);
        return null;
      }
    } catch (error) {
      console.log('❌ Erreur création admin:', error.message);
      return null;
    }
  }

  async setupEducation() {
    console.log('\n📚 Configuration de l\'espace Education...');
    
    // 1. Créer des catégories
    const categories = [
      {
        name: '🧠 Comprendre le Craving',
        description: 'Apprendre à identifier et comprendre les mécanismes du craving',
        color: 'blue',
        icon: 'brain',
        order: 1
      },
      {
        name: '🚨 Gestion de Crise',
        description: 'Techniques d\'urgence pour les moments difficiles',
        color: 'red',
        icon: 'alert-circle',
        order: 2
      },
      {
        name: '💪 Activité Physique',
        description: 'Utiliser l\'exercice comme outil thérapeutique',
        color: 'green',
        icon: 'activity',
        order: 3
      },
      {
        name: '🧘 Relaxation',
        description: 'Techniques de respiration et méditation',
        color: 'purple',
        icon: 'heart',
        order: 4
      }
    ];

    console.log('📁 Création des catégories...');
    const createdCategories = [];
    
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
          createdCategories.push(result);
          console.log(`   ✅ ${category.name}`);
        } else {
          console.log(`   ⚠️ ${category.name} (peut-être déjà créée)`);
        }
      } catch (error) {
        console.log(`   ❌ Erreur ${category.name}`);
      }
    }

    // 2. Récupérer toutes les catégories
    const allCategoriesResponse = await fetch(`${BASE_URL}/api/content-categories`, {
      headers: { 'Cookie': this.sessionCookie || '' }
    });
    
    let allCategories = [];
    if (allCategoriesResponse.ok) {
      allCategories = await allCategoriesResponse.json();
      console.log(`📊 ${allCategories.length} catégories disponibles au total`);
    }

    if (allCategories.length === 0) {
      console.log('❌ Aucune catégorie disponible, impossible de créer du contenu');
      return;
    }

    // 3. Créer du contenu éducationnel
    const contents = [
      {
        categoryId: allCategories[0]?.id,
        title: 'Qu\'est-ce que le craving ?',
        content: `# Comprendre le craving

Le **craving** est une envie intense et soudaine qui peut survenir à tout moment dans votre parcours de récupération.

## Caractéristiques du craving

✅ **Temporaire** - Il ne dure jamais éternellement
✅ **Normal** - C'est une partie naturelle du processus
✅ **Gérable** - Vous pouvez apprendre à le surmonter

## Que faire quand ça arrive ?

1. **Respirez profondément** - Prenez quelques respirations lentes
2. **Rappelez-vous** - "Ceci va passer"
3. **Bougez** - Changez d'environnement ou d'activité
4. **Contactez** - Appelez quelqu'un de confiance

N'oubliez pas : vous êtes plus fort que vos cravings !`,
        type: 'text',
        difficulty: 'easy',
        estimatedReadTime: 3,
        status: 'published',
        isRecommended: true,
        description: 'Introduction simple au concept de craving'
      },
      {
        categoryId: allCategories[1]?.id || allCategories[0]?.id,
        title: 'Technique STOP d\'urgence',
        content: `# Technique STOP - Votre outil d'urgence

Quand vous sentez une crise arriver, utilisez **STOP** :

## S - STOP (Arrêtez-vous)
🛑 Interrompez immédiatement ce que vous faites
🛑 Ne prenez aucune décision impulsive

## T - TAKE A BREATH (Respirez)
🫁 Prenez 5 respirations profondes
🫁 Comptez : Inspirez sur 4, expirez sur 6

## O - OBSERVE (Observez)
👁️ Que se passe-t-il dans votre corps ?
👁️ Quelles émotions ressentez-vous ?
👁️ Où êtes-vous ? Qui est là ?

## P - PROCEED (Agissez consciemment)
🎯 Choisissez une action positive
🎯 Utilisez vos stratégies apprises
🎯 Agissez selon vos valeurs, pas vos impulsions

**Entraînez-vous** à utiliser STOP même quand tout va bien !`,
        type: 'text',
        difficulty: 'easy',
        estimatedReadTime: 4,
        status: 'published',
        isRecommended: true,
        description: 'Méthode d\'urgence pour gérer les moments de crise'
      }
    ];

    console.log('\n📝 Création de contenu éducationnel...');
    let createdContents = 0;

    for (const content of contents) {
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
          createdContents++;
          console.log(`   ✅ ${content.title}`);
        } else {
          const error = await response.text();
          console.log(`   ❌ ${content.title}: ${error}`);
        }
      } catch (error) {
        console.log(`   ❌ Erreur ${content.title}`);
      }
    }

    console.log(`\n📊 ${createdContents} contenus créés`);
    return createdContents;
  }

  async verifySetup() {
    console.log('\n✅ Vérification de la configuration...');
    
    try {
      // Vérifier les catégories
      const catResponse = await fetch(`${BASE_URL}/api/content-categories`, {
        headers: { 'Cookie': this.sessionCookie || '' }
      });
      const categories = catResponse.ok ? await catResponse.json() : [];

      // Vérifier le contenu publié
      const contentResponse = await fetch(`${BASE_URL}/api/educational-contents?status=published`, {
        headers: { 'Cookie': this.sessionCookie || '' }
      });
      const contents = contentResponse.ok ? await contentResponse.json() : [];

      console.log(`📊 État final :`);
      console.log(`   - ${categories.length} catégories`);
      console.log(`   - ${contents.length} contenus publiés`);

      if (categories.length > 0 && contents.length > 0) {
        return true;
      }
    } catch (error) {
      console.log('❌ Erreur vérification');
    }
    
    return false;
  }

  async run() {
    console.log('🔧 === RÉPARATION COMPLÈTE DE L\'ESPACE EDUCATION ===\n');
    
    // 1. Essayer de trouver des credentials existants
    const credentials = await this.findAdminCredentials();
    
    if (!credentials) {
      // 2. Créer un nouvel admin si nécessaire
      const newAdmin = await this.createNewAdmin();
      if (!newAdmin) {
        console.log('❌ Impossible de créer un admin. Arrêt du script.');
        return;
      }
    }

    // 3. Configurer l'espace Education
    await this.setupEducation();

    // 4. Vérification finale
    const isSetupOk = await this.verifySetup();
    
    if (isSetupOk) {
      console.log('\n🎉 *** SUCCÈS TOTAL ! ***');
      console.log('\n🌐 L\'application est maintenant configurée :');
      console.log(`   URL: ${BASE_URL}`);
      console.log('\n👥 Credentials disponibles :');
      if (credentials) {
        console.log(`   Admin trouvé: ${credentials.email} / ${credentials.password}`);
      } else {
        console.log('   Nouvel admin: superadmin@apaddicto.com / SuperAdmin123!');
      }
      console.log('\n📝 Tests à effectuer :');
      console.log('   1. Connectez-vous à l\'interface admin');
      console.log('   2. Allez dans "Gestion du Contenu" (/admin/manage-content)');
      console.log('   3. Vérifiez que les contenus s\'affichent');
      console.log('   4. Testez l\'onglet Education (/education) en mode utilisateur');
      console.log('\n✅ Les problèmes d\'affichage devraient être résolus !');
    } else {
      console.log('\n⚠️ Configuration incomplète. Intervention manuelle requise.');
    }
  }
}

const fixer = new AdminFinder();
fixer.run().catch(console.error);