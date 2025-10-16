const axios = require('axios');

const BASE_URL = 'https://3000-ii7kjn56nxl1o3b8jakwm-5634da27.sandbox.novita.ai';

async function main() {
    console.log('🔧 Diagnostic et correction de l\'API de contenu éducatif...');
    
    const client = axios.create({
        baseURL: BASE_URL,
        timeout: 10000,
        withCredentials: true,
        validateStatus: () => true
    });

    // 1. Connexion admin
    console.log('1️⃣ Connexion admin...');
    const loginResponse = await client.post('/api/auth/login', {
        email: 'doriansarry@yahoo.fr',
        password: 'admin123'
    });

    if (loginResponse.status !== 200) {
        console.error('❌ Échec connexion:', loginResponse.data);
        return;
    }

    console.log('✅ Connexion réussie');
    
    // Configurer les cookies pour les requêtes suivantes
    if (loginResponse.headers['set-cookie']) {
        const cookies = loginResponse.headers['set-cookie'].join('; ');
        client.defaults.headers.Cookie = cookies;
    }

    // 2. Vérifier les catégories disponibles
    console.log('\\n2️⃣ Vérification des catégories de contenu...');
    const categoriesResponse = await client.get('/api/content-categories');
    
    if (categoriesResponse.status === 200) {
        const categories = categoriesResponse.data;
        console.log(`✅ ${categories.length} catégories trouvées:`);
        categories.forEach(cat => {
            console.log(`   - ${cat.name} (ID: ${cat.id})`);
        });
        
        // 3. Créer une catégorie test si nécessaire
        const stressCategory = categories.find(c => c.name.toLowerCase().includes('stress'));
        let categoryId;
        
        if (!stressCategory) {
            console.log('\\n3️⃣ Création d\'une catégorie "Gestion du Stress"...');
            const newCategoryResponse = await client.post('/api/content-categories', {
                name: 'Gestion du Stress',
                description: 'Techniques et conseils pour gérer le stress',
                color: 'orange',
                icon: 'brain'
            });
            
            if (newCategoryResponse.status === 201 || newCategoryResponse.status === 200) {
                categoryId = newCategoryResponse.data.id;
                console.log(`✅ Catégorie créée avec ID: ${categoryId}`);
            } else {
                console.error('❌ Échec création catégorie:', newCategoryResponse.data);
                categoryId = categories[0]?.id; // Utiliser la première catégorie disponible
            }
        } else {
            categoryId = stressCategory.id;
            console.log(`✅ Catégorie "stress" trouvée avec ID: ${categoryId}`);
        }

        // 4. Test de création de contenu éducatif avec les bons paramètres
        console.log('\\n4️⃣ Test de création de contenu éducatif...');
        const testContent = {
            title: 'Guide de Gestion du Stress - Test',
            description: 'Un guide complet pour apprendre à gérer le stress au quotidien',
            type: 'text', // Types valides: 'text', 'video', 'audio', 'pdf', 'image'
            categoryId: categoryId, // Utiliser categoryId au lieu de category
            content: `
# Guide de Gestion du Stress

## Introduction
Le stress est une réaction naturelle de notre organisme face aux défis du quotidien.

## Techniques de relaxation
1. **Respiration profonde** : Inspirez lentement pendant 4 secondes
2. **Relaxation musculaire** : Contractez puis relâchez chaque groupe musculaire
3. **Méditation** : Prenez 10 minutes par jour pour méditer

## Conseils pratiques
- Organisez votre temps
- Prenez des pauses régulières
- Pratiquez une activité physique

## Conclusion
La gestion du stress s'apprend et s'améliore avec la pratique.
            `,
            difficulty: 'easy', // 'easy', 'intermediate', 'advanced'
            estimatedReadTime: 5,
            tags: ['stress', 'relaxation', 'bien-être', 'santé mentale'],
            status: 'published', // 'draft', 'published', 'archived'
            isRecommended: false,
            authorId: loginResponse.data.id // ID de l'admin connecté
        };

        const contentResponse = await client.post('/api/educational-contents', testContent);
        
        if (contentResponse.status === 201 || contentResponse.status === 200) {
            console.log('✅ Contenu éducatif créé avec succès!');
            console.log(`   ID: ${contentResponse.data.id}`);
            console.log(`   Titre: ${contentResponse.data.title}`);
        } else {
            console.error('❌ Échec création contenu:', contentResponse.data);
        }

        // 5. Tester la récupération des contenus
        console.log('\\n5️⃣ Test de récupération des contenus...');
        const contentsResponse = await client.get('/api/educational-contents');
        
        if (contentsResponse.status === 200) {
            console.log(`✅ ${contentsResponse.data.length} contenus éducatifs récupérés`);
            contentsResponse.data.slice(0, 3).forEach(content => {
                console.log(`   - ${content.title} (${content.type}, ${content.status})`);
            });
        } else {
            console.error('❌ Échec récupération contenus:', contentsResponse.data);
        }

    } else {
        console.error('❌ Échec récupération catégories:', categoriesResponse.data);
    }
}

main().catch(console.error);