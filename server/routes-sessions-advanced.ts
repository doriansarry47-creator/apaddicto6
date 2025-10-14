import { Application } from 'express';
import { requireAuth, requireAdmin } from './auth.js';
import { storage } from './storage.js';

/**
 * Routes pour la gestion avancée des séances (protocoles HIIT, TABATA, etc.)
 * et des séances favorites des patients
 */
export function registerAdvancedSessionRoutes(app: Application) {
  
  // === ROUTES ADMIN - GESTION DES SÉANCES CRÉÉES ===
  
  /**
   * GET /api/admin/created-sessions
   * Récupérer toutes les séances créées par l'admin
   */
  app.get('/api/admin/created-sessions', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { status, category, protocol } = req.query;
      
      const sessions = await storage.getCreatedSessions({
        creatorId: req.session.user!.id,
        status: status as string,
        category: category as string,
        protocol: protocol as string
      });
      
      res.json(sessions);
    } catch (error: any) {
      console.error('Error fetching created sessions:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des séances' });
    }
  });

  /**
   * POST /api/admin/sessions/:sessionId/assign
   * Assigner une séance à un ou plusieurs patients
   */
  app.post('/api/admin/sessions/:sessionId/assign', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { patientIds } = req.body;

      if (!patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
        return res.status(400).json({ message: 'Liste de patients requise' });
      }

      const results = await storage.assignSessionToPatients(sessionId, patientIds);
      
      res.json({ 
        message: `Séance assignée à ${patientIds.length} patient(s)`,
        results 
      });
    } catch (error: any) {
      console.error('Error assigning session:', error);
      res.status(500).json({ message: 'Erreur lors de l\'assignation' });
    }
  });

  /**
   * PUT /api/admin/sessions/:sessionId
   * Modifier une séance créée
   */
  app.put('/api/admin/sessions/:sessionId', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const sessionData = req.body;

      const updatedSession = await storage.updateSession(sessionId, sessionData);
      
      res.json(updatedSession);
    } catch (error: any) {
      console.error('Error updating session:', error);
      res.status(500).json({ message: 'Erreur lors de la modification' });
    }
  });

  /**
   * DELETE /api/admin/sessions/:sessionId
   * Supprimer une séance créée
   */
  app.delete('/api/admin/sessions/:sessionId', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { sessionId } = req.params;

      await storage.deleteSession(sessionId);
      
      res.json({ message: 'Séance supprimée avec succès' });
    } catch (error: any) {
      console.error('Error deleting session:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
  });

  /**
   * POST /api/admin/sessions/:sessionId/duplicate
   * Dupliquer une séance existante
   */
  app.post('/api/admin/sessions/:sessionId/duplicate', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { sessionId } = req.params;

      const duplicatedSession = await storage.duplicateSession(sessionId, req.session.user!.id);
      
      res.json(duplicatedSession);
    } catch (error: any) {
      console.error('Error duplicating session:', error);
      res.status(500).json({ message: 'Erreur lors de la duplication' });
    }
  });

  /**
   * POST /api/admin/sessions/:sessionId/archive
   * Archiver une séance
   */
  app.post('/api/admin/sessions/:sessionId/archive', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { sessionId } = req.params;

      const archivedSession = await storage.archiveSession(sessionId);
      
      res.json(archivedSession);
    } catch (error: any) {
      console.error('Error archiving session:', error);
      res.status(500).json({ message: 'Erreur lors de l\'archivage' });
    }
  });

  // === ROUTES PATIENT - BIBLIOTHÈQUE ET FAVORIS ===

  /**
   * GET /api/patient/session-library
   * Récupérer toutes les séances publiques disponibles pour le patient
   */
  app.get('/api/patient/session-library', requireAuth, async (req, res) => {
    try {
      const { category, protocol, difficulty, search } = req.query;
      
      const sessions = await storage.getPublicSessions({
        category: category as string,
        protocol: protocol as string,
        difficulty: difficulty as string,
        search: search as string
      });
      
      res.json(sessions);
    } catch (error: any) {
      console.error('Error fetching session library:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des séances' });
    }
  });

  /**
   * GET /api/patient/favorite-sessions
   * Récupérer les séances favorites du patient
   */
  app.get('/api/patient/favorite-sessions', requireAuth, async (req, res) => {
    try {
      const favoriteSessions = await storage.getFavoriteSessions(req.session.user!.id);
      
      res.json(favoriteSessions);
    } catch (error: any) {
      console.error('Error fetching favorite sessions:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des favoris' });
    }
  });

  /**
   * POST /api/patient/favorite-sessions
   * Sauvegarder une séance personnalisée comme favorite
   */
  app.post('/api/patient/favorite-sessions', requireAuth, async (req, res) => {
    try {
      const { session, customName } = req.body;

      if (!session) {
        return res.status(400).json({ message: 'Données de séance requises' });
      }

      const favoriteSession = await storage.saveFavoriteSession({
        userId: req.session.user!.id,
        sourceSessionId: session.id,
        title: customName || session.title,
        description: session.description,
        category: session.category,
        protocol: session.protocol,
        protocolConfig: session.protocolConfig,
        totalDuration: session.totalDuration,
        difficulty: session.difficulty,
        exercises: session.exercises,
        tags: session.tags || [],
        imageUrl: session.imageUrl
      });
      
      res.json(favoriteSession);
    } catch (error: any) {
      console.error('Error saving favorite session:', error);
      res.status(500).json({ message: 'Erreur lors de la sauvegarde' });
    }
  });

  /**
   * PUT /api/patient/favorite-sessions/:sessionId
   * Modifier une séance favorite
   */
  app.put('/api/patient/favorite-sessions/:sessionId', requireAuth, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const sessionData = req.body;

      // Vérifier que la séance appartient bien à l'utilisateur
      const existingSession = await storage.getFavoriteSession(sessionId);
      if (!existingSession || existingSession.userId !== req.session.user!.id) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      const updatedSession = await storage.updateFavoriteSession(sessionId, sessionData);
      
      res.json(updatedSession);
    } catch (error: any) {
      console.error('Error updating favorite session:', error);
      res.status(500).json({ message: 'Erreur lors de la modification' });
    }
  });

  /**
   * DELETE /api/patient/favorite-sessions/:sessionId
   * Supprimer une séance favorite
   */
  app.delete('/api/patient/favorite-sessions/:sessionId', requireAuth, async (req, res) => {
    try {
      const { sessionId } = req.params;

      // Vérifier que la séance appartient bien à l'utilisateur
      const existingSession = await storage.getFavoriteSession(sessionId);
      if (!existingSession || existingSession.userId !== req.session.user!.id) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      await storage.deleteFavoriteSession(sessionId);
      
      res.json({ message: 'Séance favorite supprimée avec succès' });
    } catch (error: any) {
      console.error('Error deleting favorite session:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
  });

  /**
   * GET /api/patient/assigned-sessions
   * Récupérer les séances assignées au patient
   */
  app.get('/api/patient/assigned-sessions', requireAuth, async (req, res) => {
    try {
      const { status } = req.query;
      
      const assignedSessions = await storage.getPatientAssignedSessions(
        req.session.user!.id,
        status as string
      );
      
      res.json(assignedSessions);
    } catch (error: any) {
      console.error('Error fetching assigned sessions:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des séances assignées' });
    }
  });

  /**
   * GET /api/admin/patients
   * Récupérer la liste de tous les patients (pour assignation)
   */
  app.get('/api/admin/patients', requireAuth, requireAdmin, async (req, res) => {
    try {
      const patients = await storage.getAllPatients();
      
      // Ne retourner que les informations nécessaires
      const patientsData = patients.map(p => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        isActive: p.isActive
      }));
      
      res.json(patientsData);
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des patients' });
    }
  });

  console.log('✅ Advanced session routes registered');
}
