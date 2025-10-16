const axios = require('axios');

const BASE_URL = 'https://3000-ii7kjn56nxl1o3b8jakwm-5634da27.sandbox.novita.ai';
const ADMIN_EMAIL = 'doriansarry@yahoo.fr';
const ADMIN_PASSWORD = 'admin123';

class ApaddictoTester {
    constructor() {
        this.axiosInstance = axios.create({
            baseURL: BASE_URL,
            timeout: 10000,
            withCredentials: true,
            validateStatus: () => true // Ne pas throw sur les codes d'erreur
        });
        this.cookies = '';
        this.testResults = [];
    }

    log(message, status = 'info') {
        const timestamp = new Date().toISOString().slice(11, 19);
        const emoji = {
            'info': 'ℹ️',
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'test': '🧪'
        }[status] || 'ℹ️';
        
        console.log(`[${timestamp}] ${emoji} ${message}`);
        this.testResults.push({ timestamp, status, message });
    }

    async testLogin() {
        this.log('Test de connexion admin', 'test');
        
        try {
            const response = await this.axiosInstance.post('/api/auth/login', {
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD
            });

            if (response.status === 200) {
                this.log('Connexion admin réussie', 'success');
                // Extraire les cookies pour les requêtes suivantes
                if (response.headers['set-cookie']) {
                    this.cookies = response.headers['set-cookie'].join('; ');
                    this.axiosInstance.defaults.headers.Cookie = this.cookies;
                }
                return { success: true, user: response.data };
            } else {
                this.log(`Échec de connexion: ${response.status} - ${response.data?.message || 'Erreur inconnue'}`, 'error');
                return { success: false, error: response.data };
            }
        } catch (error) {
            this.log(`Erreur lors de la connexion: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    async testEducationalContentCreation() {
        this.log('Test de création de contenu éducatif', 'test');
        
        const testContent = {
            title: 'Test - Gestion du Stress',
            content: 'Contenu de test pour évaluer la création de contenu éducatif.',
            summary: 'Résumé de test',
            category: 'stress',
            difficulty: 'beginner',
            estimatedReadTime: 5,
            tags: ['stress', 'gestion', 'test'],
            status: 'published'
        };

        try {
            const response = await this.axiosInstance.post('/api/educational-contents', testContent);
            
            if (response.status === 201 || response.status === 200) {
                this.log('Création de contenu éducatif réussie', 'success');
                return { success: true, contentId: response.data?.id };
            } else {
                this.log(`Échec création contenu: ${response.status} - ${JSON.stringify(response.data)}`, 'error');
                return { success: false, error: response.data };
            }
        } catch (error) {
            this.log(`Erreur création contenu: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    async testSessionCreation() {
        this.log('Test de création de séance protocolisée', 'test');
        
        const testSession = {
            title: 'Test - Séance Cardio Adaptée',
            description: 'Séance de test pour évaluer la création de protocoles',
            category: 'cardio',
            protocol: 'standard',
            exercises: [
                {
                    exerciseId: 1,
                    duration: 300, // 5 minutes
                    repetitions: 3,
                    sets: 1,
                    restTime: 60,
                    notes: 'Exercice de test'
                }
            ],
            totalDuration: 15,
            difficulty: 'beginner',
            tags: ['cardio', 'test'],
            isPublic: true,
            status: 'published'
        };

        try {
            const response = await this.axiosInstance.post('/api/sessions', testSession);
            
            if (response.status === 201 || response.status === 200) {
                this.log('Création de séance protocolisée réussie', 'success');
                return { success: true, sessionId: response.data?.id };
            } else {
                this.log(`Échec création séance: ${response.status} - ${JSON.stringify(response.data)}`, 'error');
                return { success: false, error: response.data };
            }
        } catch (error) {
            this.log(`Erreur création séance: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    async testEmergencyRoutineCreation() {
        this.log('Test de création de routine d\'urgence', 'test');
        
        const testRoutine = {
            name: 'Test - Routine Anti-Stress',
            description: 'Routine de test pour gérer les situations d\'urgence',
            exercises: [1, 2], // IDs d'exercices
            customSessions: [1], // IDs de séances personnalisées
            isActive: true
        };

        try {
            const response = await this.axiosInstance.post('/api/emergency-routines', testRoutine);
            
            if (response.status === 201 || response.status === 200) {
                this.log('Création de routine d\'urgence réussie', 'success');
                return { success: true, routineId: response.data?.id };
            } else {
                this.log(`Échec création routine: ${response.status} - ${JSON.stringify(response.data)}`, 'error');
                return { success: false, error: response.data };
            }
        } catch (error) {
            this.log(`Erreur création routine: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    async testAdminDashboard() {
        this.log('Test d\'accès au tableau de bord admin', 'test');
        
        try {
            const response = await this.axiosInstance.get('/api/admin/dashboard');
            
            if (response.status === 200) {
                this.log('Accès au tableau de bord admin réussi', 'success');
                this.log(`Données dashboard: ${JSON.stringify(response.data, null, 2)}`);
                return { success: true, data: response.data };
            } else {
                this.log(`Échec accès dashboard: ${response.status} - ${response.data?.message}`, 'error');
                return { success: false, error: response.data };
            }
        } catch (error) {
            this.log(`Erreur accès dashboard: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    async testPatientsList() {
        this.log('Test d\'accès à la liste des patients', 'test');
        
        try {
            const response = await this.axiosInstance.get('/api/admin/patients');
            
            if (response.status === 200) {
                this.log(`Liste des patients récupérée: ${response.data?.length || 0} patients`, 'success');
                return { success: true, patients: response.data };
            } else {
                this.log(`Échec accès patients: ${response.status} - ${response.data?.message}`, 'error');
                return { success: false, error: response.data };
            }
        } catch (error) {
            this.log(`Erreur accès patients: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    async runCompleteTest() {
        this.log('🚀 Démarrage du test complet d\'Apaddicto', 'info');
        
        // 1. Test de connexion
        const loginResult = await this.testLogin();
        if (!loginResult.success) {
            this.log('Test arrêté - échec de connexion', 'error');
            return this.generateReport();
        }

        // 2. Test du tableau de bord admin
        await this.testAdminDashboard();

        // 3. Test de la liste des patients
        await this.testPatientsList();

        // 4. Test de création de contenu éducatif
        await this.testEducationalContentCreation();

        // 5. Test de création de séance protocolisée
        await this.testSessionCreation();

        // 6. Test de création de routine d'urgence
        await this.testEmergencyRoutineCreation();

        this.log('🏁 Test complet terminé', 'info');
        return this.generateReport();
    }

    generateReport() {
        const successCount = this.testResults.filter(r => r.status === 'success').length;
        const errorCount = this.testResults.filter(r => r.status === 'error').length;
        const totalTests = this.testResults.filter(r => r.status === 'test').length;

        console.log('\n' + '='.repeat(60));
        console.log('📊 RAPPORT DE TEST APADDICTO');
        console.log('='.repeat(60));
        console.log(`🧪 Tests exécutés: ${totalTests}`);
        console.log(`✅ Succès: ${successCount}`);
        console.log(`❌ Échecs: ${errorCount}`);
        console.log(`📈 Taux de réussite: ${Math.round((successCount / totalTests) * 100)}%`);
        console.log('='.repeat(60));

        return {
            totalTests,
            successCount,
            errorCount,
            successRate: Math.round((successCount / totalTests) * 100),
            results: this.testResults
        };
    }
}

// Exécuter le test si appelé directement
if (require.main === module) {
    const tester = new ApaddictoTester();
    tester.runCompleteTest();
}

module.exports = ApaddictoTester;