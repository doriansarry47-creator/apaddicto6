const axios = require('axios');

const BASE_URL = 'https://3000-ii7kjn56nxl1o3b8jakwm-5634da27.sandbox.novita.ai';

async function main() {
    console.log('🔧 Diagnostic et correction de l\'API des séances protocolisées...');
    
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

    // 2. Vérifier les exercices disponibles
    console.log('\\n2️⃣ Vérification des exercices disponibles...');
    const exercisesResponse = await client.get('/api/exercises');
    
    if (exercisesResponse.status === 200) {
        const exercises = exercisesResponse.data;
        console.log(`✅ ${exercises.length} exercices trouvés`);
        
        // Afficher les premiers exercices avec leur structure
        console.log('\\nPremiers exercices:');
        exercises.slice(0, 5).forEach(ex => {
            console.log(`   - ID: ${ex.id}, Titre: ${ex.title}, Catégorie: ${ex.category}`);
        });

        if (exercises.length > 0) {
            // 3. Test de création de séance avec un exercice valide
            console.log('\\n3️⃣ Test de création de séance protocolisée...');
            
            const firstExercise = exercises[0];
            console.log(`Utilisation de l'exercice: ${firstExercise.title} (ID: ${firstExercise.id})`);
            
            const testSession = {
                title: 'Séance Test - Cardio Adapté',
                description: 'Séance de test pour diagnostiquer l\'API',
                category: 'cardio',
                protocol: 'standard',
                exercises: [
                    {
                        exerciseId: firstExercise.id, // Utiliser un ID d'exercice valide
                        duration: 300, // 5 minutes en secondes
                        repetitions: 3,
                        sets: 1,
                        restTime: 60, // 1 minute de repos
                        notes: 'Exercice de test avec ID valide'
                    }
                ],
                totalDuration: 15,
                difficulty: 'beginner',
                tags: ['cardio', 'test', 'adapté'],
                isPublic: true,
                status: 'published',
                authorId: loginResponse.data.id
            };

            const sessionResponse = await client.post('/api/sessions', testSession);
            
            if (sessionResponse.status === 201 || sessionResponse.status === 200) {
                console.log('✅ Séance protocolisée créée avec succès!');
                console.log(`   ID: ${sessionResponse.data.id}`);
                console.log(`   Titre: ${sessionResponse.data.title}`);
                console.log(`   Exercices: ${sessionResponse.data.exercises?.length || 'N/A'}`);
            } else {
                console.error('❌ Échec création séance:', sessionResponse.data);
                
                // Essayons avec une structure simplifiée
                console.log('\\n🔄 Test avec structure simplifiée...');
                const simpleSession = {
                    title: 'Séance Simple Test',
                    description: 'Test avec structure minimale',
                    category: 'general',
                    difficulty: 'beginner',
                    totalDuration: 10,
                    isPublic: true,
                    status: 'published'
                };

                const simpleResponse = await client.post('/api/sessions', simpleSession);
                
                if (simpleResponse.status === 201 || simpleResponse.status === 200) {
                    console.log('✅ Séance simple créée avec succès!');
                } else {
                    console.error('❌ Échec séance simple:', simpleResponse.data);
                }
            }

        } else {
            console.log('⚠️ Aucun exercice disponible - création d\'un exercice test...');
            
            // Créer un exercice simple pour les tests
            const testExercise = {
                title: 'Marche rapide - Test',
                description: 'Exercice de marche rapide pour test API',
                category: 'cardio',
                difficulty: 'beginner',
                duration: 15,
                instructions: 'Marchez à un rythme soutenu pendant la durée indiquée.',
                benefits: 'Améliore le cardio et la circulation.',
                tags: ['cardio', 'marche', 'test']
            };

            const exerciseResponse = await client.post('/api/exercises', testExercise);
            
            if (exerciseResponse.status === 201 || exerciseResponse.status === 200) {
                console.log('✅ Exercice test créé:', exerciseResponse.data.title);
            } else {
                console.error('❌ Échec création exercice:', exerciseResponse.data);
            }
        }

        // 4. Vérifier les séances existantes
        console.log('\\n4️⃣ Vérification des séances existantes...');
        const sessionsResponse = await client.get('/api/sessions');
        
        if (sessionsResponse.status === 200) {
            console.log(`✅ ${sessionsResponse.data.length} séances trouvées`);
            sessionsResponse.data.slice(0, 3).forEach(session => {
                console.log(`   - ${session.title} (${session.category}, ${session.difficulty})`);
            });
        } else {
            console.error('❌ Échec récupération séances:', sessionsResponse.data);
        }

    } else {
        console.error('❌ Échec récupération exercices:', exercisesResponse.data);
    }
}

main().catch(console.error);