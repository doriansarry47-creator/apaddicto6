const axios = require('axios');

const BASE_URL = 'https://3000-ii7kjn56nxl1o3b8jakwm-5634da27.sandbox.novita.ai';
const ADMIN_EMAIL = 'doriansarry@yahoo.fr';
const ADMIN_PASSWORD = 'admin123';

class ApaddictoTesterFixed {
    constructor() {
        this.axiosInstance = axios.create({
            baseURL: BASE_URL,
            timeout: 10000,
            withCredentials: true,
            validateStatus: () => true
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
                if (response.headers['set-cookie']) {
                    this.cookies = response.headers['set-cookie'].join('; ');
                    this.axiosInstance.defaults.headers.Cookie = this.cookies;
                }
                return { success: true, user: response.data };
            } else {
                this.log(`Échec de connexion: ${response.status}`, 'error');
                return { success: false, error: response.data };
            }
        } catch (error) {
            this.log(`Erreur lors de la connexion: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    async testEducationalContentCreation() {
        this.log('Test de création de contenu éducatif (structure corrigée)', 'test');
        
        // D'abord récupérer une catégorie valide
        const categoriesResponse = await this.axiosInstance.get('/api/content-categories');
        if (categoriesResponse.status !== 200) {
            this.log('Impossible de récupérer les catégories', 'error');
            return { success: false };
        }
        
        const categories = categoriesResponse.data;
        const categoryId = categories[0]?.id;
        
        if (!categoryId) {
            this.log('Aucune catégorie disponible', 'error');
            return { success: false };
        }

        const testContent = {
            title: 'Test - Guide Complet de Gestion du Stress',
            description: 'Un guide détaillé pour apprendre à gérer le stress efficacement',
            type: 'text', // Types valides: 'text', 'video', 'audio', 'pdf', 'image'
            categoryId: categoryId, // Utiliser categoryId, pas category
            content: `
# Guide Complet de Gestion du Stress

## Introduction
Le stress fait partie de notre vie quotidienne mais peut être géré efficacement.

## Techniques pratiques
1. **Respiration contrôlée** : 4-7-8 (inspire 4s, retient 7s, expire 8s)
2. **Relaxation progressive** : Contractez puis relâchez chaque muscle
3. **Méditation de pleine conscience** : 10 minutes par jour minimum
4. **Activité physique régulière** : 30 minutes, 3 fois par semaine

## Gestion émotionnelle
- Identifiez vos déclencheurs de stress
- Développez votre intelligence émotionnelle
- Pratiquez l'auto-compassion

## Conclusion
La gestion du stress s'améliore avec la pratique constante et la patience.
            `,
            difficulty: 'easy', // 'easy', 'intermediate', 'advanced'
            estimatedReadTime: 8,
            tags: ['stress', 'bien-être', 'relaxation', 'santé mentale', 'techniques'],
            status: 'published' // 'draft', 'published', 'archived'
        };

        try {
            const response = await this.axiosInstance.post('/api/educational-contents', testContent);
            
            if (response.status === 201 || response.status === 200) {
                this.log('Création de contenu éducatif réussie', 'success');
                this.log(`ID du contenu: ${response.data.id}`, 'info');
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
        this.log('Test de création de séance protocolisée (structure corrigée)', 'test');
        
        // D'abord récupérer un exercice valide
        const exercisesResponse = await this.axiosInstance.get('/api/exercises');
        if (exercisesResponse.status !== 200) {
            this.log('Impossible de récupérer les exercices', 'error');
            return { success: false };
        }
        
        const exercises = exercisesResponse.data;
        if (exercises.length === 0) {
            this.log('Aucun exercice disponible', 'error');
            return { success: false };
        }

        const testSession = {
            title: 'Séance Complète - Cardio Adapté',
            description: 'Séance de cardio adapté pour débutants avec progression graduelle',
            category: 'cardio',
            protocol: 'standard',
            exercises: [
                {
                    exerciseId: exercises[0].id, // Utiliser un ID valide
                    duration: 600, // 10 minutes
                    repetitions: 1,
                    sets: 1,
                    restTime: 120, // 2 minutes de repos
                    notes: 'Commencer doucement et augmenter l\'intensité progressivement'
                },
                {
                    exerciseId: exercises[1]?.id || exercises[0].id, // Deuxième exercice ou fallback
                    duration: 300, // 5 minutes
                    repetitions: 2,
                    sets: 1,
                    restTime: 60,
                    notes: 'Maintenir un rythme régulier'
                }
            ],
            totalDuration: 20, // 20 minutes au total
            difficulty: 'beginner',
            tags: ['cardio', 'débutant', 'adapté', 'progression'],
            isPublic: true,
            status: 'published'
        };

        try {
            const response = await this.axiosInstance.post('/api/sessions', testSession);
            
            if (response.status === 201 || response.status === 200) {
                this.log('Création de séance protocolisée réussie', 'success');
                this.log(`ID de la séance: ${response.data.id}`, 'info');
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
        this.log('Test de création de routine d\'urgence (structure corrigée)', 'test');
        
        const testRoutine = {
            title: 'Routine Complète Anti-Stress d\'Urgence',
            description: 'Technique rapide et efficace pour gérer les situations de crise de stress aigu',
            steps: [
                'Trouvez un endroit calme et asseyez-vous confortablement',
                'Fermez les yeux et prenez conscience de votre respiration',
                'Inspirez lentement par le nez pendant 4 secondes',
                'Retenez votre souffle pendant 4 secondes',
                'Expirez lentement par la bouche pendant 6 secondes',
                'Répétez ce cycle respiratoire 8 fois de suite',
                'Focalisez-vous sur 5 choses que vous pouvez voir',
                'Identifiez 4 choses que vous pouvez toucher',
                'Écoutez 3 sons différents autour de vous',
                'Sentez 2 odeurs distinctes',
                'Goûtez 1 saveur dans votre bouche',
                'Prenez 3 respirations profondes pour terminer',
                'Évaluez votre niveau de stress sur une échelle de 1 à 10'
            ],
            duration: 8, // 8 minutes - durée en MINUTES selon le schéma
            category: 'breathing', // 'breathing', 'grounding', 'distraction', 'general'
            isActive: true,
            isDefault: false
        };

        try {
            const response = await this.axiosInstance.post('/api/emergency-routines', testRoutine);
            
            if (response.status === 201 || response.status === 200) {
                this.log('Création de routine d\'urgence réussie', 'success');
                this.log(`ID de la routine: ${response.data.id}`, 'info');
                this.log(`Nombre d'étapes: ${response.data.steps?.length || 0}`, 'info');
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
                const data = response.data;
                this.log(`📊 Statistiques: ${data.totalPatients} patients, ${data.totalSessions} séances, ${data.totalExercises} exercices`, 'info');
                return { success: true, data: response.data };
            } else {
                this.log(`Échec accès dashboard: ${response.status}`, 'error');
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
                this.log(`Échec accès patients: ${response.status}`, 'error');
                return { success: false, error: response.data };
            }
        } catch (error) {
            this.log(`Erreur accès patients: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    async runCompleteTest() {
        this.log('🚀 Démarrage du test complet corrigé d\'Apaddicto', 'info');
        
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

        // 4. Test de création de contenu éducatif (corrigé)
        await this.testEducationalContentCreation();

        // 5. Test de création de séance protocolisée (corrigé)
        await this.testSessionCreation();

        // 6. Test de création de routine d'urgence (corrigé)
        await this.testEmergencyRoutineCreation();

        this.log('🏁 Test complet terminé', 'info');
        return this.generateReport();
    }

    generateReport() {
        const successCount = this.testResults.filter(r => r.status === 'success').length;
        const errorCount = this.testResults.filter(r => r.status === 'error').length;
        const totalTests = this.testResults.filter(r => r.status === 'test').length;

        console.log('\\n' + '='.repeat(60));
        console.log('📊 RAPPORT DE TEST APADDICTO (CORRIGÉ)');
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
    const tester = new ApaddictoTesterFixed();
    tester.runCompleteTest();
}

module.exports = ApaddictoTesterFixed;