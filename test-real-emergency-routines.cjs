const axios = require('axios');

const BASE_URL = 'https://3000-ii7kjn56nxl1o3b8jakwm-5634da27.sandbox.novita.ai';

async function testDirectAPI() {
    console.log('🔧 Test direct avec la vraie structure emergency_routines...');
    
    const client = axios.create({
        baseURL: BASE_URL,
        timeout: 10000,
        withCredentials: true,
        validateStatus: () => true
    });

    // 1. Connexion admin
    const loginResponse = await client.post('/api/auth/login', {
        email: 'doriansarry@yahoo.fr',
        password: 'admin123'
    });

    if (loginResponse.status !== 200) {
        console.error('❌ Échec connexion');
        return;
    }

    console.log('✅ Connexion réussie');
    
    if (loginResponse.headers['set-cookie']) {
        const cookies = loginResponse.headers['set-cookie'].join('; ');
        client.defaults.headers.Cookie = cookies;
    }

    // 2. Test avec la vraie structure emergency_routines
    console.log('\\n🧪 Test structure emergency_routines correcte...');
    
    const realRoutine = {
        title: 'Routine Anti-Stress d\'Urgence',
        description: 'Technique rapide pour gérer les crises de stress',
        steps: [
            'Asseyez-vous confortablement et fermez les yeux',
            'Respirez profondément pendant 4 secondes',
            'Retenez votre souffle pendant 4 secondes', 
            'Expirez lentement pendant 6 secondes',
            'Répétez ce cycle 5 fois',
            'Ouvrez les yeux et évaluez votre état'
        ],
        duration: 5, // 5 minutes
        category: 'breathing',
        isActive: true,
        isDefault: false
    };

    console.log('Structure envoyée:');
    console.log(`- Titre: ${realRoutine.title}`);
    console.log(`- Durée: ${realRoutine.duration} minutes`);
    console.log(`- Étapes: ${realRoutine.steps.length}`);
    console.log(`- Catégorie: ${realRoutine.category}`);

    const response = await client.post('/api/emergency-routines', realRoutine);
    
    console.log(`\\nRéponse serveur: ${response.status}`);
    
    if (response.status === 201 || response.status === 200) {
        console.log('✅ Routine créée avec succès!');
        console.log('Données retournées:', JSON.stringify(response.data, null, 2));
    } else {
        console.error('❌ Échec:', response.data);
        
        // Essayons de créer une routine encore plus simple
        console.log('\\n🔄 Test ultra-simplifié...');
        
        const ultraSimple = {
            title: 'Test Simple',
            steps: ['Respirez', 'Détendez-vous'],
            duration: 2,
            category: 'general'
        };

        const simpleResponse = await client.post('/api/emergency-routines', ultraSimple);
        console.log(`Réponse ultra-simple: ${simpleResponse.status}`);
        
        if (simpleResponse.status === 201 || simpleResponse.status === 200) {
            console.log('✅ Routine ultra-simple créée!');
        } else {
            console.error('❌ Échec ultra-simple:', simpleResponse.data);
        }
    }
}

testDirectAPI().catch(console.error);