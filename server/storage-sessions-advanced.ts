import { db } from '../shared/db.js';
import { 
  customSessions, 
  sessionElements, 
  patientSessions, 
  favoriteSessions,
  users 
} from '../shared/schema.js';
import { eq, and, or, like, desc, sql, inArray } from 'drizzle-orm';

/**
 * Fonctions de storage pour la gestion avancée des séances
 */

interface SessionFilters {
  creatorId?: string;
  status?: string;
  category?: string;
  protocol?: string;
}

interface PublicSessionFilters {
  category?: string;
  protocol?: string;
  difficulty?: string;
  search?: string;
}

export const advancedSessionsStorage = {
  
  /**
   * Récupérer les séances créées avec filtres
   */
  async getCreatedSessions(filters: SessionFilters) {
    try {
      let query = db
        .select()
        .from(customSessions)
        .orderBy(desc(customSessions.updatedAt));

      const conditions = [];

      if (filters.creatorId) {
        conditions.push(eq(customSessions.creatorId, filters.creatorId));
      }
      if (filters.status) {
        conditions.push(eq(customSessions.status, filters.status));
      }
      if (filters.category) {
        conditions.push(eq(customSessions.category, filters.category));
      }
      if (filters.protocol) {
        conditions.push(eq(customSessions.protocol, filters.protocol));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      const sessions = await query;

      // Pour chaque séance, récupérer les exercices et compter les assignations
      const sessionsWithDetails = await Promise.all(
        sessions.map(async (session) => {
          const exercises = await db
            .select()
            .from(sessionElements)
            .where(eq(sessionElements.sessionId, session.id))
            .orderBy(sessionElements.order);

          const assignedCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(patientSessions)
            .where(eq(patientSessions.sessionId, session.id));

          return {
            ...session,
            exercises,
            assignedCount: Number(assignedCount[0]?.count || 0)
          };
        })
      );

      return sessionsWithDetails;
    } catch (error) {
      console.error('Error getting created sessions:', error);
      throw error;
    }
  },

  /**
   * Assigner une séance à plusieurs patients
   */
  async assignSessionToPatients(sessionId: string, patientIds: string[]) {
    try {
      const assignments = await Promise.all(
        patientIds.map(async (patientId) => {
          // Vérifier si déjà assigné
          const existing = await db
            .select()
            .from(patientSessions)
            .where(
              and(
                eq(patientSessions.sessionId, sessionId),
                eq(patientSessions.patientId, patientId)
              )
            );

          if (existing.length > 0) {
            return { patientId, status: 'already_assigned' };
          }

          // Créer l'assignation
          const [assignment] = await db
            .insert(patientSessions)
            .values({
              sessionId,
              patientId,
              status: 'assigned'
            })
            .returning();

          return { patientId, status: 'assigned', assignment };
        })
      );

      return assignments;
    } catch (error) {
      console.error('Error assigning session to patients:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour une séance
   */
  async updateSession(sessionId: string, sessionData: any) {
    try {
      const [updatedSession] = await db
        .update(customSessions)
        .set({
          ...sessionData,
          updatedAt: new Date()
        })
        .where(eq(customSessions.id, sessionId))
        .returning();

      // Si des exercices sont fournis, mettre à jour
      if (sessionData.exercises) {
        // Supprimer les anciens éléments
        await db
          .delete(sessionElements)
          .where(eq(sessionElements.sessionId, sessionId));

        // Insérer les nouveaux
        if (sessionData.exercises.length > 0) {
          await db.insert(sessionElements).values(
            sessionData.exercises.map((ex: any, index: number) => ({
              sessionId,
              exerciseId: ex.exerciseId,
              variationId: ex.variationId,
              order: ex.order || index,
              duration: ex.duration,
              repetitions: ex.repetitions || 0,
              sets: ex.sets || 1,
              restTime: ex.restTime || 0,
              workTime: ex.workTime,
              restInterval: ex.restInterval,
              notes: ex.notes,
              isOptional: ex.isOptional || false
            }))
          );
        }
      }

      return updatedSession;
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  },

  /**
   * Supprimer une séance
   */
  async deleteSession(sessionId: string) {
    try {
      await db
        .delete(customSessions)
        .where(eq(customSessions.id, sessionId));
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  },

  /**
   * Dupliquer une séance
   */
  async duplicateSession(sessionId: string, creatorId: string) {
    try {
      // Récupérer la séance originale
      const [originalSession] = await db
        .select()
        .from(customSessions)
        .where(eq(customSessions.id, sessionId));

      if (!originalSession) {
        throw new Error('Session not found');
      }

      // Récupérer les exercices
      const exercises = await db
        .select()
        .from(sessionElements)
        .where(eq(sessionElements.sessionId, sessionId))
        .orderBy(sessionElements.order);

      // Créer la nouvelle séance
      const [newSession] = await db
        .insert(customSessions)
        .values({
          ...originalSession,
          id: undefined as any,
          creatorId,
          title: `${originalSession.title} (copie)`,
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      // Copier les exercices
      if (exercises.length > 0) {
        await db.insert(sessionElements).values(
          exercises.map((ex) => ({
            ...ex,
            id: undefined as any,
            sessionId: newSession.id,
            createdAt: new Date()
          }))
        );
      }

      return newSession;
    } catch (error) {
      console.error('Error duplicating session:', error);
      throw error;
    }
  },

  /**
   * Archiver une séance
   */
  async archiveSession(sessionId: string) {
    try {
      const [archivedSession] = await db
        .update(customSessions)
        .set({
          status: 'archived',
          updatedAt: new Date()
        })
        .where(eq(customSessions.id, sessionId))
        .returning();

      return archivedSession;
    } catch (error) {
      console.error('Error archiving session:', error);
      throw error;
    }
  },

  /**
   * Récupérer les séances publiques pour les patients
   */
  async getPublicSessions(filters: PublicSessionFilters) {
    try {
      let query = db
        .select()
        .from(customSessions)
        .where(
          and(
            eq(customSessions.isPublic, true),
            eq(customSessions.status, 'published'),
            eq(customSessions.isActive, true)
          )
        )
        .orderBy(desc(customSessions.updatedAt));

      const conditions = [
        eq(customSessions.isPublic, true),
        eq(customSessions.status, 'published'),
        eq(customSessions.isActive, true)
      ];

      if (filters.category) {
        conditions.push(eq(customSessions.category, filters.category));
      }
      if (filters.protocol) {
        conditions.push(eq(customSessions.protocol, filters.protocol));
      }
      if (filters.difficulty) {
        conditions.push(eq(customSessions.difficulty, filters.difficulty));
      }
      if (filters.search) {
        conditions.push(
          or(
            like(customSessions.title, `%${filters.search}%`),
            like(customSessions.description, `%${filters.search}%`)
          ) as any
        );
      }

      query = query.where(and(...conditions)) as any;

      const sessions = await query;

      // Récupérer les exercices pour chaque séance
      const sessionsWithExercises = await Promise.all(
        sessions.map(async (session) => {
          const exercises = await db
            .select()
            .from(sessionElements)
            .where(eq(sessionElements.sessionId, session.id))
            .orderBy(sessionElements.order);

          return {
            ...session,
            exercises
          };
        })
      );

      return sessionsWithExercises;
    } catch (error) {
      console.error('Error getting public sessions:', error);
      throw error;
    }
  },

  /**
   * Récupérer les séances favorites d'un patient
   */
  async getFavoriteSessions(userId: string) {
    try {
      const favorites = await db
        .select()
        .from(favoriteSessions)
        .where(
          and(
            eq(favoriteSessions.userId, userId),
            eq(favoriteSessions.isActive, true)
          )
        )
        .orderBy(desc(favoriteSessions.updatedAt));

      return favorites;
    } catch (error) {
      console.error('Error getting favorite sessions:', error);
      throw error;
    }
  },

  /**
   * Récupérer une séance favorite spécifique
   */
  async getFavoriteSession(sessionId: string) {
    try {
      const [session] = await db
        .select()
        .from(favoriteSessions)
        .where(eq(favoriteSessions.id, sessionId));

      return session;
    } catch (error) {
      console.error('Error getting favorite session:', error);
      throw error;
    }
  },

  /**
   * Sauvegarder une séance comme favorite
   */
  async saveFavoriteSession(sessionData: any) {
    try {
      const [favoriteSession] = await db
        .insert(favoriteSessions)
        .values({
          userId: sessionData.userId,
          sourceSessionId: sessionData.sourceSessionId,
          title: sessionData.title,
          description: sessionData.description,
          category: sessionData.category,
          protocol: sessionData.protocol || 'standard',
          protocolConfig: sessionData.protocolConfig,
          totalDuration: sessionData.totalDuration,
          difficulty: sessionData.difficulty || 'beginner',
          exercises: sessionData.exercises,
          tags: sessionData.tags || [],
          imageUrl: sessionData.imageUrl
        })
        .returning();

      return favoriteSession;
    } catch (error) {
      console.error('Error saving favorite session:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour une séance favorite
   */
  async updateFavoriteSession(sessionId: string, sessionData: any) {
    try {
      const [updatedSession] = await db
        .update(favoriteSessions)
        .set({
          ...sessionData,
          updatedAt: new Date()
        })
        .where(eq(favoriteSessions.id, sessionId))
        .returning();

      return updatedSession;
    } catch (error) {
      console.error('Error updating favorite session:', error);
      throw error;
    }
  },

  /**
   * Supprimer une séance favorite
   */
  async deleteFavoriteSession(sessionId: string) {
    try {
      await db
        .delete(favoriteSessions)
        .where(eq(favoriteSessions.id, sessionId));
    } catch (error) {
      console.error('Error deleting favorite session:', error);
      throw error;
    }
  },

  /**
   * Récupérer les séances assignées à un patient
   */
  async getPatientAssignedSessions(patientId: string, status?: string) {
    try {
      let query = db
        .select({
          assignment: patientSessions,
          session: customSessions
        })
        .from(patientSessions)
        .innerJoin(customSessions, eq(patientSessions.sessionId, customSessions.id))
        .where(eq(patientSessions.patientId, patientId))
        .orderBy(desc(patientSessions.assignedAt));

      if (status) {
        query = query.where(
          and(
            eq(patientSessions.patientId, patientId),
            eq(patientSessions.status, status)
          )
        ) as any;
      }

      const results = await query;

      // Récupérer les exercices pour chaque séance
      const sessionsWithExercises = await Promise.all(
        results.map(async (result) => {
          const exercises = await db
            .select()
            .from(sessionElements)
            .where(eq(sessionElements.sessionId, result.session.id))
            .orderBy(sessionElements.order);

          return {
            ...result.assignment,
            session: {
              ...result.session,
              exercises
            }
          };
        })
      );

      return sessionsWithExercises;
    } catch (error) {
      console.error('Error getting patient assigned sessions:', error);
      throw error;
    }
  },

  /**
   * Récupérer tous les patients (pour l'admin)
   */
  async getAllPatients() {
    try {
      const patients = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.role, 'patient'),
            eq(users.isActive, true)
          )
        )
        .orderBy(users.firstName, users.lastName);

      return patients;
    } catch (error) {
      console.error('Error getting all patients:', error);
      throw error;
    }
  }
};
