const { Client } = require('pg');

// Configuration de la base de données depuis les variables d'environnement ou valeurs par défaut
function getDatabaseConfig() {
  return {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME || 'mindbridge_db',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'admin',
  };
}

async function fixEducationCategories() {
  console.log('🔧 Starting education categories fix...');
  
  const client = new Client(getDatabaseConfig());
  
  try {
    await client.connect();
    console.log('🔌 Connected to database');
    
    // 1. Analyser les catégories actuelles
    console.log('📊 Analyzing current categories...');
    
    // Récupérer les catégories de contenus éducatifs
    const categoriesResult = await client.query(`
      SELECT * FROM content_categories 
      ORDER BY "order", name
    `);
    console.log('📁 Current content categories:', categoriesResult.rows.length, 'categories');
    
    // Récupérer les contenus avec leurs catégories
    const contentsResult = await client.query(`
      SELECT 
        ec.id, 
        ec.title, 
        ec."categoryId", 
        cc.name as category_name
      FROM educational_contents ec
      LEFT JOIN content_categories cc ON ec."categoryId" = cc.id
      ORDER BY ec.title
    `);
    console.log('📚 Current educational contents:', contentsResult.rows.length, 'items');
    
    // Identifier les contenus sans catégorie
    const orphanedContents = contentsResult.rows.filter(c => !c.categoryId || !c.category_name);
    console.log('🚨 Orphaned contents (no category):', orphanedContents.length, 'items');
    
    // 2. Créer des catégories cohérentes pour l'éducation
    console.log('🏗️ Creating coherent education categories...');
    
    const standardCategories = [
      {
        name: 'Comprendre l\'Addiction',
        description: 'Contenus sur les mécanismes de l\'addiction et ses effets',
        color: 'red',
        icon: 'brain',
        order: 1
      },
      {
        name: 'Techniques de Relaxation',
        description: 'Exercices et méthodes pour gérer le stress et l\'anxiété',
        color: 'blue',
        icon: 'shield',
        order: 2
      },
      {
        name: 'Motivation et Objectifs',
        description: 'Stratégies pour maintenir la motivation et atteindre ses objectifs',
        color: 'orange',
        icon: 'zap',
        order: 3
      },
      {
        name: 'Techniques de Coping',
        description: 'Stratégies pour faire face aux situations difficiles',
        color: 'green',
        icon: 'target',
        order: 4
      },
      {
        name: 'Prévention des Rechutes',
        description: 'Méthodes pour éviter et gérer les rechutes',
        color: 'purple',
        icon: 'lightbulb',
        order: 5
      }
    ];
    
    const createdCategories = {};
    
    for (const category of standardCategories) {
      // Vérifier si la catégorie existe déjà
      const existingResult = await client.query(`
        SELECT id FROM content_categories WHERE name = $1
      `, [category.name]);
      
      if (existingResult.rows.length > 0) {
        createdCategories[category.name] = existingResult.rows[0].id;
        console.log(`✅ Category already exists: ${category.name}`);
      } else {
        // Créer la catégorie
        const insertResult = await client.query(`
          INSERT INTO content_categories (name, description, color, icon, "order", "isActive")
          VALUES ($1, $2, $3, $4, $5, true)
          RETURNING id
        `, [category.name, category.description, category.color, category.icon, category.order]);
        
        createdCategories[category.name] = insertResult.rows[0].id;
        console.log(`✅ Created category: ${category.name} (ID: ${insertResult.rows[0].id})`);
      }
    }
    
    // 3. Assigner les contenus orphelins à des catégories appropriées
    console.log('🎯 Assigning orphaned contents to categories...');
    
    for (const content of orphanedContents) {
      let targetCategory = null;
      
      // Logique d'assignation basée sur le titre/contenu
      const title = content.title.toLowerCase();
      
      if (title.includes('addiction') || title.includes('dépendance') || title.includes('comprendre')) {
        targetCategory = createdCategories["Comprendre l'Addiction"];
      } else if (title.includes('relaxation') || title.includes('stress') || title.includes('anxiété') || title.includes('respiration')) {
        targetCategory = createdCategories["Techniques de Relaxation"];
      } else if (title.includes('motivation') || title.includes('objectif') || title.includes('but')) {
        targetCategory = createdCategories["Motivation et Objectifs"];
      } else if (title.includes('coping') || title.includes('faire face') || title.includes('gérer') || title.includes('technique')) {
        targetCategory = createdCategories["Techniques de Coping"];
      } else if (title.includes('rechute') || title.includes('prévention') || title.includes('éviter')) {
        targetCategory = createdCategories["Prévention des Rechutes"];
      } else {
        // Assigner par défaut à "Techniques de Coping"
        targetCategory = createdCategories["Techniques de Coping"];
      }
      
      if (targetCategory) {
        await client.query(`
          UPDATE educational_contents 
          SET "categoryId" = $1, "updatedAt" = NOW()
          WHERE id = $2
        `, [targetCategory, content.id]);
        
        console.log(`✅ Assigned "${content.title}" to category ID: ${targetCategory}`);
      }
    }
    
    // 4. Vérifier et nettoyer les catégories non utilisées
    console.log('🧹 Cleaning up unused categories...');
    
    const unusedCategoriesResult = await client.query(`
      SELECT cc.id, cc.name
      FROM content_categories cc
      LEFT JOIN educational_contents ec ON cc.id = ec."categoryId"
      WHERE ec."categoryId" IS NULL AND cc."isActive" = true
    `);
    
    console.log('🗑️ Found unused categories:', unusedCategoriesResult.rows.length);
    
    for (const unusedCategory of unusedCategoriesResult.rows) {
      // Ne pas supprimer, juste désactiver
      await client.query(`
        UPDATE content_categories 
        SET "isActive" = false, "updatedAt" = NOW()
        WHERE id = $1
      `, [unusedCategory.id]);
      
      console.log(`⚠️ Deactivated unused category: ${unusedCategory.name}`);
    }
    
    // 5. Vérification finale
    console.log('✅ Final verification...');
    
    const finalVerificationResult = await client.query(`
      SELECT 
        cc.name as category_name,
        COUNT(ec.id) as content_count
      FROM content_categories cc
      LEFT JOIN educational_contents ec ON cc.id = ec."categoryId"
      WHERE cc."isActive" = true
      GROUP BY cc.id, cc.name, cc."order"
      ORDER BY cc."order"
    `);
    
    console.log('📈 Final category distribution:');
    finalVerificationResult.rows.forEach(row => {
      console.log(`  - ${row.category_name}: ${row.content_count} contenus`);
    });
    
    const totalContentsAfter = await client.query(`
      SELECT COUNT(*) as total FROM educational_contents WHERE "categoryId" IS NOT NULL
    `);
    
    console.log(`✅ Total contents with categories: ${totalContentsAfter.rows[0].total}`);
    
    console.log('🎉 Education categories fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing education categories:', error);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Exécuter si le script est appelé directement
if (require.main === module) {
  fixEducationCategories()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixEducationCategories };