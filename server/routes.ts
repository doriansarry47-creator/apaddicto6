import { Application } from 'express';
import { AuthService, requireAuth, requireAdmin } from './auth.js';
import { storage } from './storage.js';

export function registerRoutes(app: Application) {
  // === ROUTES D'AUTHENTIFICATION ===
  
  // POST /api/auth/register - Inscription
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName, role } = req.body;
      
      console.log('📝 Registration attempt for:', email);
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
      }

      const user = await AuthService.register({
        email,
        password,
        firstName,
        lastName,
        role: role || 'patient'
      });

      // Set session
      req.session.user = user;

      console.log('✅ User registered successfully:', email);
      
      res.json({ 
        user: req.session.user, 
        message: "Inscription réussie" 
      });
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      res.status(500).json({ 
        message: error.message || "Erreur lors de l'inscription" 
      });
    }
  });

  // POST /api/auth/login - Connexion
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log('🔐 Login attempt for:', email);
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis" });
      }

      const user = await AuthService.login(email, password);

      // Set session
      req.session.user = user;

      console.log('✅ User logged in successfully:', email);

      res.json({ 
        user: req.session.user, 
        message: "Connexion réussie" 
      });
    } catch (error: any) {
      console.error('❌ Login error:', error);
      res.status(401).json({ 
        message: error.message || "Erreur lors de la connexion" 
      });
    }
  });

  // POST /api/auth/logout - Déconnexion
  app.post('/api/auth/logout', (req, res) => {
    const userEmail = req.session?.user?.email;
    req.session.destroy((err: any) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
      }
      console.log('👋 User logged out:', userEmail);
      res.json({ message: 'Déconnexion réussie' });
    });
  });

  // GET /api/auth/me - Profil utilisateur
  app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ user: req.session.user });
  });

  // POST /api/auth/forgot-password - Mot de passe oublié
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email requis" });
      }

      console.log('🔑 Forgot password request for:', email);

      // Récupérer l'utilisateur de la base de données
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Ne pas révéler si l'email existe ou non pour des raisons de sécurité
        return res.json({ message: "Si cet email existe, le mot de passe sera envoyé par email." });
      }

      // Pour cette implémentation simple, on renvoie directement le mot de passe
      // Dans un environnement de production, il faudrait:
      // 1. Générer un token de réinitialisation
      // 2. Envoyer un email avec un lien de réinitialisation
      // 3. Permettre à l'utilisateur de définir un nouveau mot de passe
      
      // Simulation d'envoi d'email (affichage console pour démonstration)
      console.log('📧 Simulated email sent to:', email);
      console.log('📧 Password would be sent to user email:', user.email);
      
      // Pour les besoins de démonstration, on suppose que le mot de passe est envoyé
      res.json({ 
        message: "Un email contenant votre mot de passe a été envoyé à votre adresse email.",
        // En production, ne jamais renvoyer le mot de passe dans la réponse
        demo_note: "Dans cette démo, votre mot de passe a été envoyé par email."
      });
      
    } catch (error: any) {
      console.error('❌ Forgot password error:', error);
      res.status(500).json({ 
        message: "Erreur lors de l'envoi de l'email" 
      });
    }
  });

  // PUT /api/auth/profile - Mise à jour du profil
  app.put('/api/auth/profile', requireAuth, async (req, res) => {
    try {
      const { firstName, lastName, email } = req.body;
      
      const updatedUser = await AuthService.updateUser(req.session.user.id, {
        firstName,
        lastName, 
        email
      });

      req.session.user = updatedUser;
      
      res.json({ 
        user: updatedUser,
        message: 'Profil mis à jour avec succès' 
      });
    } catch (error: any) {
      console.error('❌ Profile update error:', error);
      res.status(400).json({ 
        message: error.message || "Erreur lors de la mise à jour" 
      });
    }
  });

  // PUT /api/auth/password - Changement de mot de passe
  app.put('/api/auth/password', requireAuth, async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      
      await AuthService.updatePassword(req.session.user.id, oldPassword, newPassword);
      
      res.json({ message: 'Mot de passe mis à jour avec succès' });
    } catch (error: any) {
      console.error('❌ Password update error:', error);
      res.status(400).json({ 
        message: error.message || "Erreur lors du changement de mot de passe" 
      });
    }
  });

  // === ROUTES DE GESTION DES UTILISATEURS ===
  
  // GET /api/users - Liste des utilisateurs (admin)
  app.get('/api/users', requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
    }
  });

  // === ROUTES DES EXERCICES ===
  
  // GET /api/exercises - Liste des exercices
  app.get('/api/exercises', requireAuth, async (req, res) => {
    try {
      const exercises = await storage.getAllExercises();
      res.json(exercises);
    } catch (error: any) {
      console.error('Error fetching exercises:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des exercices' });
    }
  });

  // POST /api/exercises - Créer un exercice (admin)
  app.post('/api/exercises', requireAdmin, async (req, res) => {
    try {
      const { title, description, duration, difficulty, category, instructions } = req.body;
      
      if (!title || !description) {
        return res.status(400).json({ message: 'Titre et description requis' });
      }

      const exercise = await storage.createExercise({
        title,
        description,
        duration: duration || 15,
        difficulty: difficulty || 'beginner',
        category: category || 'general',
        instructions: instructions || null
      });

      res.json(exercise);
    } catch (error: any) {
      console.error('Error creating exercise:', error);
      res.status(500).json({ message: 'Erreur lors de la création de l\'exercice' });
    }
  });

  // === ROUTES DE SUIVI DES ENVIES ===
  
  // POST /api/cravings - Enregistrer une envie
  app.post('/api/cravings', requireAuth, async (req, res) => {
    try {
      const { intensity, triggers, emotions, notes } = req.body;
      
      const craving = await storage.createCravingEntry({
        userId: req.session.user.id,
        intensity: intensity || 1,
        triggers: triggers || [],
        emotions: emotions || [],
        notes: notes || null
      });

      res.json(craving);
    } catch (error: any) {
      console.error('Error creating craving entry:', error);
      res.status(500).json({ message: 'Erreur lors de l\'enregistrement' });
    }
  });

  // GET /api/cravings - Historique des envies
  app.get('/api/cravings', requireAuth, async (req, res) => {
    try {
      const cravings = await storage.getCravingEntriesByUser(req.session.user.id);
      res.json(cravings);
    } catch (error: any) {
      console.error('Error fetching cravings:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération' });
    }
  });

  // === ROUTES DES SESSIONS D'EXERCICES ===
  
  // POST /api/exercise-sessions - Enregistrer une session
  app.post('/api/exercise-sessions', requireAuth, async (req, res) => {
    try {
      const { exerciseId, duration, completed, notes } = req.body;
      
      const session = await storage.createExerciseSession({
        userId: req.session.user.id,
        exerciseId: exerciseId || null,
        duration: duration || 0,
        completed: completed || false,
        notes: notes || null
      });

      res.json(session);
    } catch (error: any) {
      console.error('Error creating exercise session:', error);
      res.status(500).json({ message: 'Erreur lors de l\'enregistrement' });
    }
  });

  // GET /api/exercise-sessions - Historique des sessions
  app.get('/api/exercise-sessions', requireAuth, async (req, res) => {
    try {
      const sessions = await storage.getExerciseSessionsByUser(req.session.user.id);
      res.json(sessions);
    } catch (error: any) {
      console.error('Error fetching exercise sessions:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération' });
    }
  });

  // === ROUTES DU CONTENU PSYCHOÉDUCATIF ===
  
  // GET /api/psycho-education - Liste du contenu
  app.get('/api/psycho-education', requireAuth, async (req, res) => {
    try {
      const content = await storage.getAllPsychoEducationContent();
      res.json(content);
    } catch (error: any) {
      console.error('Error fetching psycho-education content:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération du contenu' });
    }
  });

  // POST /api/psycho-education - Créer du contenu (admin)
  app.post('/api/psycho-education', requireAdmin, async (req, res) => {
    try {
      const { title, content, category, tags } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ message: 'Titre et contenu requis' });
      }

      const newContent = await storage.createPsychoEducationContent({
        title,
        content,
        category: category || 'general',
        tags: tags || null
      });

      res.json(newContent);
    } catch (error: any) {
      console.error('Error creating psycho-education content:', error);
      res.status(500).json({ message: 'Erreur lors de la création du contenu' });
    }
  });

  // === ROUTES DES ANALYSES BECK ===
  
  // POST /api/beck-analyses - Créer une analyse Beck
  app.post('/api/beck-analyses', requireAuth, async (req, res) => {
    try {
      const { situation, automaticThoughts, emotions, emotionIntensity, rationalResponse, newFeeling, newIntensity } = req.body;
      
      if (!situation || !automaticThoughts || !emotions) {
        return res.status(400).json({ message: 'Situation, pensées automatiques et émotions requises' });
      }

      const analysis = await storage.createBeckAnalysis({
        userId: req.session.user.id,
        situation,
        automaticThoughts,
        emotions,
        emotionIntensity: emotionIntensity || null,
        rationalResponse: rationalResponse || null,
        newFeeling: newFeeling || null,
        newIntensity: newIntensity || null
      });

      res.json(analysis);
    } catch (error: any) {
      console.error('Error creating Beck analysis:', error);
      res.status(500).json({ message: 'Erreur lors de la création de l\'analyse' });
    }
  });

  // GET /api/beck-analyses - Historique des analyses Beck
  app.get('/api/beck-analyses', requireAuth, async (req, res) => {
    try {
      const analyses = await storage.getBeckAnalysesByUser(req.session.user.id);
      res.json(analyses);
    } catch (error: any) {
      console.error('Error fetching Beck analyses:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des analyses' });
    }
  });

  // === ROUTES DES STRATÉGIES ===
  
  // POST /api/strategies - Sauvegarder des stratégies anti-craving
  app.post('/api/strategies', requireAuth, async (req, res) => {
    try {
      const { strategies } = req.body;
      
      if (!strategies || !Array.isArray(strategies) || strategies.length === 0) {
        return res.status(400).json({ message: 'Au moins une stratégie requise' });
      }

      console.log('Received strategies:', strategies);
      
      const savedStrategies = [];
      
      for (const strategyData of strategies) {
        const { context, exercise, effort, duration, cravingBefore, cravingAfter } = strategyData;
        
        if (!context || !exercise || !effort || duration === undefined || cravingBefore === undefined || cravingAfter === undefined) {
          return res.status(400).json({ message: 'Tous les champs requis: context, exercise, effort, duration, cravingBefore, cravingAfter' });
        }
        
        const strategy = await storage.createStrategy({
          userId: req.session.user.id,
          context,
          exercise,
          effort,
          duration: Number(duration),
          cravingBefore: Number(cravingBefore),
          cravingAfter: Number(cravingAfter)
        });
        
        savedStrategies.push(strategy);
      }

      res.json({ strategies: savedStrategies, message: `${savedStrategies.length} stratégies sauvegardées avec succès` });
    } catch (error: any) {
      console.error('Error creating strategies:', error);
      res.status(500).json({ message: 'Erreur lors de la création des stratégies' });
    }
  });

  // GET /api/strategies - Liste des stratégies
  app.get('/api/strategies', requireAuth, async (req, res) => {
    try {
      const strategies = await storage.getStrategiesByUser(req.session.user.id);
      res.json(strategies);
    } catch (error: any) {
      console.error('Error fetching strategies:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des stratégies' });
    }
  });

  // PUT /api/strategies/:id - Mettre à jour une stratégie
  app.put('/api/strategies/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, category, effectiveness } = req.body;
      
      const strategy = await storage.updateStrategy(id, req.session.user.id, {
        title,
        description,
        category,
        effectiveness
      });

      if (!strategy) {
        return res.status(404).json({ message: 'Stratégie non trouvée' });
      }

      res.json(strategy);
    } catch (error: any) {
      console.error('Error updating strategy:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de la stratégie' });
    }
  });

  // DELETE /api/strategies/:id - Supprimer une stratégie
  app.delete('/api/strategies/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      const success = await storage.deleteStrategy(id, req.session.user.id);
      
      if (!success) {
        return res.status(404).json({ message: 'Stratégie non trouvée' });
      }

      res.json({ message: 'Stratégie supprimée avec succès' });
    } catch (error: any) {
      console.error('Error deleting strategy:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression de la stratégie' });
    }
  });

  // === ROUTES DE STATISTIQUES ET DASHBOARD ===
  
  // GET /api/dashboard/stats - Statistiques pour le dashboard
  app.get('/api/dashboard/stats', requireAuth, async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.session.user.id);
      res.json(stats);
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
    }
  });

  // === ROUTES D'EXERCICES DE RELAXATION ===
  
  // GET /api/relaxation-exercises - Exercices de relaxation
  app.get('/api/relaxation-exercises', requireAuth, async (req, res) => {
    try {
      const exercises = await storage.getRelaxationExercises();
      res.json(exercises);
    } catch (error: any) {
      console.error('Error fetching relaxation exercises:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des exercices de relaxation' });
    }
  });

  // === ROUTES D'ADMINISTRATION ===
  
  // GET /api/admin/users - Liste de tous les utilisateurs (admin uniquement)
  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsersWithStats();
      res.json(users);
    } catch (error: any) {
      console.error('Error fetching admin users:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
    }
  });

  // DELETE /api/admin/users/:id - Supprimer un utilisateur (admin uniquement)
  app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Empêcher la suppression d'un admin par un autre admin
      const userToDelete = await storage.getUserById(id);
      if (userToDelete?.role === 'admin') {
        return res.status(403).json({ message: 'Impossible de supprimer un administrateur' });
      }
      
      const success = await storage.deleteUser(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
    }
  });

  console.log('✅ All routes registered successfully');
}