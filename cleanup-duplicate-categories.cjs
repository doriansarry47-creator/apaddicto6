const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function cleanupDuplicateCategories() {
  try {
    const sql = neon(process.env.DATABASE_URL);

    console.log('🧹 Nettoyage des catégories en double...');

    // Récupérer toutes les catégories avec leurs contenus
    const categories = await sql`
      SELECT 
        cc.id,
        cc.name,
        cc.description,
        cc.color,
        cc.icon,
        cc."order",
        cc.created_at,
        COUNT(ec.id) as content_count
      FROM content_categories cc
      LEFT JOIN educational_contents ec ON cc.id = ec.category_id
      WHERE cc.is_active = true
      GROUP BY cc.id, cc.name, cc.description, cc.color, cc.icon, cc."order", cc.created_at
      ORDER BY cc.name, cc.created_at
    `;

    console.log(`📋 Trouvé ${categories.length} catégories:`);
    
    // Grouper par nom
    const categoryGroups = {};
    categories.forEach(cat => {
      if (!categoryGroups[cat.name]) {
        categoryGroups[cat.name] = [];
      }
      categoryGroups[cat.name].push(cat);
    });

    // Traiter chaque groupe de catégories
    for (const [name, group] of Object.entries(categoryGroups)) {
      console.log(`\n🔍 Traitement de "${name}": ${group.length} entrée(s)`);
      
      if (group.length > 1) {
        // Trier par ordre de préférence : avec contenu d'abord, puis par date de création
        group.sort((a, b) => {
          if (a.content_count !== b.content_count) {
            return b.content_count - a.content_count; // Plus de contenu en premier
          }
          return new Date(a.created_at) - new Date(b.created_at); // Plus ancien en premier
        });

        const keepCategory = group[0];
        const duplicateCategories = group.slice(1);

        console.log(`  ✅ Garder: ${keepCategory.id} (${keepCategory.content_count} contenu(s))`);
        
        for (const duplicate of duplicateCategories) {
          console.log(`  🗑️ Supprimer: ${duplicate.id} (${duplicate.content_count} contenu(s))`);
          
          // Déplacer les contenus vers la catégorie principale
          if (duplicate.content_count > 0) {
            await sql`
              UPDATE educational_contents 
              SET category_id = ${keepCategory.id}
              WHERE category_id = ${duplicate.id}
            `;
            console.log(`    📦 ${duplicate.content_count} contenu(s) déplacé(s)`);
          }
          
          // Supprimer la catégorie en double
          await sql`
            DELETE FROM content_categories 
            WHERE id = ${duplicate.id}
          `;
          console.log(`    ✅ Catégorie supprimée`);
        }
      } else {
        console.log(`  ✅ Aucun doublon pour "${name}"`);
      }
    }

    // Vérifier le résultat final
    const finalCategories = await sql`
      SELECT 
        cc.name,
        cc.color,
        cc.icon,
        cc."order",
        COUNT(ec.id) as content_count
      FROM content_categories cc
      LEFT JOIN educational_contents ec ON cc.id = ec.category_id AND ec.is_active = true
      WHERE cc.is_active = true
      GROUP BY cc.id, cc.name, cc.color, cc.icon, cc."order"
      ORDER BY cc."order", cc.name
    `;

    console.log('\n📊 Catégories finales:');
    finalCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} - ${cat.content_count} contenu(s) - Couleur: ${cat.color} - Icône: ${cat.icon || 'aucune'}`);
    });

    console.log(`\n🎉 Nettoyage terminé ! ${finalCategories.length} catégories uniques maintenues.`);

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  cleanupDuplicateCategories()
    .then(() => {
      console.log('✨ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { cleanupDuplicateCategories };