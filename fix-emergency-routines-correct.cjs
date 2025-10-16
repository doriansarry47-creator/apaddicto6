const axios = require('axios');

const BASE_URL = 'https://3000-ii7kjn56nxl1o3b8jakwm-5634da27.sandbox.novita.ai';

async function main() {
    console.log('🔧 Correction de l\'API des routines d\'urgence avec structure correcte...');
    
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
    
    // Configurer les cookies
    if (loginResponse.headers['set-cookie']) {
        const cookies = loginResponse.headers['set-cookie'].join('; ');
        client.defaults.headers.Cookie = cookies;
    }

    // 2. Récupérer des exercices pour la routine
    console.log('\\n2️⃣ Récupération des exercices...');
    const exercisesRes = await client.get('/api/exercises');
    
    if (exercisesRes.status !== 200) {
        console.error('❌ Erreur récupération exercices');
        return;
    }
    
    const exercises = exercisesRes.data;
    console.log(`✅ ${exercises.length} exercices disponibles`);

    // 3. Test avec structure userEmergencyRoutines correcte
    console.log('\\n3️⃣ Test de création avec structure correcte...');
    
    // Structure basée sur le schéma userEmergencyRoutines
    const correctRoutine = {
        name: 'Routine Anti-Stress Complète',
        description: 'Routine d\'urgence pour gérer les situations de stress intense',
        totalDuration: 300, // 5 minutes en secondes
        exercises: [
            {
                id: '1',
                exerciseId: exercises[0]?.id || 'default-exercise-id',
                title: exercises[0]?.title || 'Respiration profonde',
                duration: 120, // 2 minutes
                repetitions: 5,
                restTime: 30,
                intensity: 'medium',
                notes: 'Se concentrer sur la respiration',
                order: 1
            },
            {
                id: '2',
                exerciseId: exercises[1]?.id || exercises[0]?.id || 'default-exercise-id-2',
                title: exercises[1]?.title || exercises[0]?.title || 'Relaxation musculaire',
                duration: 180, // 3 minutes
                repetitions: 1,
                restTime: 0,
                intensity: 'low',
                notes: 'Détendre tous les muscles progressivement',
                order: 2
            }
        ],
        isDefault: false
    };

    console.log('Données de routine:');
    console.log(`- Nom: ${correctRoutine.name}`);
    console.log(`- Durée totale: ${correctRoutine.totalDuration}s`);
    console.log(`- Nombre d'exercices: ${correctRoutine.exercises.length}`);

    const routineResponse = await client.post('/api/emergency-routines', correctRoutine);
    
    if (routineResponse.status === 201 || routineResponse.status === 200) {
        console.log('\\n✅ Routine d\'urgence créée avec succès!');
        console.log(`   ID: ${routineResponse.data.id}`);
        console.log(`   Nom: ${routineResponse.data.name}`);
        console.log(`   Exercices: ${routineResponse.data.exercises?.length || 0}`);
        console.log(`   Durée: ${routineResponse.data.totalDuration}s`);
    } else {
        console.error('\\n❌ Échec création routine:', routineResponse.data);
        
        // Debug: afficher la structure attendue vs envoyée
        console.log('\\n🔍 Debug - Structure envoyée:');
        console.log(JSON.stringify(correctRoutine, null, 2));
    }

    // 4. Test d'une routine minimaliste
    console.log('\\n4️⃣ Test routine minimaliste...');
    
    const minimalRoutine = {
        name: 'Routine Minimale Test',
        description: 'Test avec structure minimale',
        totalDuration: 60, // 1 minute
        exercises: [
            {
                id: '1',
                exerciseId: exercises[0]?.id || 'test-id',
                title: 'Respiration simple',
                duration: 60,
                order: 1
            }
        ]
    };

    const minimalResponse = await client.post('/api/emergency-routines', minimalRoutine);
    
    if (minimalResponse.status === 201 || minimalResponse.status === 200) {
        console.log('✅ Routine minimaliste créée!');
        console.log(`   ID: ${minimalResponse.data.id}`);
    } else {
        console.error('❌ Échec routine minimaliste:', minimalResponse.data);
    }

    // 5. Vérifier les routines créées
    console.log('\\n5️⃣ Vérification des routines...');
    const routinesResponse = await client.get('/api/emergency-routines');
    
    if (routinesResponse.status === 200) {
        console.log(`✅ ${routinesResponse.data.length} routines trouvées:`);
        routinesResponse.data.forEach((routine, index) => {
            console.log(`   ${index + 1}. ${routine.name} (${routine.totalDuration}s, ${routine.exercises?.length || 0} exercices)`);
        });
    } else {
        console.error('❌ Échec récupération routines:', routinesResponse.data);
    }
}

main().catch(console.error);