const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function createDefaultCategories() {
  try {
    // Connexion à la base de données
    const sql = neon(process.env.DATABASE_URL);

    console.log('🗄️ Création des catégories par défaut...');

    // Catégories basées sur l'interface utilisateur de l'image
    const defaultCategories = [
      {
        name: 'Comprendre l\'Addiction',
        description: 'Modules éducatifs sur les mécanismes de l\'addiction et les processus neurobiologiques',
        color: 'purple',
        icon: 'psychology',
        order: 1
      },
      {
        name: 'Science de l\'Exercice', 
        description: 'Bases scientifiques de l\'activité physique et son impact sur les cravings',
        color: 'blue',
        icon: 'fitness_center',
        order: 2
      },
      {
        name: 'Psychologie Cognitive',
        description: 'Techniques psychologiques et stratégies cognitives pour la gestion émotionnelle',
        color: 'green',
        icon: 'lightbulb',
        order: 3
      },
      {
        name: 'Techniques Pratiques',
        description: 'Méthodes concrètes et outils pratiques pour la gestion des cravings au quotidien',
        color: 'orange',
        icon: 'self_improvement',
        order: 4
      }
    ];

    // Vérifier si les catégories existent déjà
    const existingCategories = await sql`
      SELECT name FROM content_categories 
      WHERE name IN (${defaultCategories.map(cat => cat.name)})
    `;

    const existingNames = existingCategories.map(cat => cat.name);

    // Insérer seulement les catégories qui n'existent pas encore
    const newCategories = defaultCategories.filter(cat => !existingNames.includes(cat.name));

    if (newCategories.length === 0) {
      console.log('✅ Toutes les catégories par défaut existent déjà');
      return;
    }

    for (const category of newCategories) {
      await sql`
        INSERT INTO content_categories (name, description, color, icon, "order", is_active)
        VALUES (${category.name}, ${category.description}, ${category.color}, ${category.icon}, ${category.order}, true)
      `;
      console.log(`✅ Catégorie créée: ${category.name}`);
    }

    console.log('🎉 Toutes les catégories par défaut ont été créées avec succès!');

    // Récupérer toutes les catégories pour vérification
    const allCategories = await sql`
      SELECT name, description, color, "order" 
      FROM content_categories 
      ORDER BY "order"
    `;

    console.log('\n📋 Catégories dans la base de données:');
    allCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} - ${cat.description}`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création des catégories:', error);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  createDefaultCategories()
    .then(() => {
      console.log('✨ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { createDefaultCategories };