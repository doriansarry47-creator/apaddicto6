const axios = require('axios');

const BASE_URL = 'https://3000-ii7kjn56nxl1o3b8jakwm-5634da27.sandbox.novita.ai';

async function main() {
    console.log('🔧 Diagnostic et correction de l\'API des routines d\'urgence...');
    
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

    // 2. Vérifier les exercices et séances disponibles
    console.log('\\n2️⃣ Récupération des ressources disponibles...');
    
    const [exercisesRes, sessionsRes] = await Promise.all([
        client.get('/api/exercises'),
        client.get('/api/sessions')
    ]);
    
    if (exercisesRes.status !== 200 || sessionsRes.status !== 200) {
        console.error('❌ Erreur récupération ressources');
        return;
    }
    
    const exercises = exercisesRes.data;
    const sessions = sessionsRes.data;
    
    console.log(`✅ Ressources disponibles:`);
    console.log(`   - ${exercises.length} exercices`);
    console.log(`   - ${sessions.length} séances`);

    // 3. Test de création de routine d'urgence avec structure correcte
    console.log('\\n3️⃣ Test de création de routine d\'urgence...');
    
    // Créer une routine simple d'abord
    const simpleRoutine = {
        name: 'Routine Anti-Stress - Test Simple',
        description: 'Routine basique pour tester l\'API',
        exercises: [], // Commencer sans exercices
        customSessions: [], // Commencer sans séances
        isActive: true
    };

    let routineResponse = await client.post('/api/emergency-routines', simpleRoutine);
    
    if (routineResponse.status === 201 || routineResponse.status === 200) {
        console.log('✅ Routine simple créée avec succès!');
        console.log(`   ID: ${routineResponse.data.id}`);
        console.log(`   Nom: ${routineResponse.data.name}`);
    } else {
        console.error('❌ Échec routine simple:', routineResponse.data);
        
        // Essayons avec la structure selon l'ancien schéma emergency_routines
        console.log('\\n🔄 Test avec structure emergency_routines...');
        
        const emergencyRoutine = {
            title: 'Routine d\'Urgence Test',
            description: 'Routine de test pour situations d\'urgence',
            steps: [
                'Respirez profondément 3 fois',
                'Comptez jusqu\'à 10 lentement',
                'Focalisez-vous sur votre environnement immédiat',
                'Répétez un mantra apaisant'
            ],
            duration: 5, // 5 minutes
            category: 'breathing',
            isActive: true,
            isDefault: false
        };

        routineResponse = await client.post('/api/emergency-routines', emergencyRoutine);
        
        if (routineResponse.status === 201 || routineResponse.status === 200) {
            console.log('✅ Routine d\'urgence créée avec succès!');
            console.log(`   ID: ${routineResponse.data.id}`);
            console.log(`   Titre: ${routineResponse.data.title}`);
        } else {
            console.error('❌ Échec routine d\'urgence:', routineResponse.data);
        }
    }

    // 4. Tester avec des IDs valides si disponibles
    if (exercises.length > 0 && sessions.length > 0) {
        console.log('\\n4️⃣ Test avec exercices et séances valides...');
        
        const advancedRoutine = {
            name: 'Routine Complète - Test Avancé',
            description: 'Routine avec exercices et séances pour test complet',
            exercises: [exercises[0].id, exercises[1]?.id].filter(Boolean), // IDs valides d'exercices
            customSessions: [sessions[0].id], // ID valide de séance
            isActive: true
        };

        const advancedResponse = await client.post('/api/emergency-routines', advancedRoutine);
        
        if (advancedResponse.status === 201 || advancedResponse.status === 200) {
            console.log('✅ Routine avancée créée avec succès!');
            console.log(`   ID: ${advancedResponse.data.id}`);
            console.log(`   Exercices: ${advancedResponse.data.exercises?.length || 0}`);
            console.log(`   Séances: ${advancedResponse.data.customSessions?.length || 0}`);
        } else {
            console.error('❌ Échec routine avancée:', advancedResponse.data);
        }
    }

    // 5. Vérifier les routines existantes
    console.log('\\n5️⃣ Vérification des routines existantes...');
    const routinesResponse = await client.get('/api/emergency-routines');
    
    if (routinesResponse.status === 200) {
        console.log(`✅ ${routinesResponse.data.length} routines d'urgence trouvées`);
        routinesResponse.data.slice(0, 3).forEach(routine => {
            const name = routine.name || routine.title || 'Sans nom';
            const category = routine.category || 'general';
            console.log(`   - ${name} (${category})`);
        });
    } else {
        console.error('❌ Échec récupération routines:', routinesResponse.data);
    }
}

main().catch(console.error);