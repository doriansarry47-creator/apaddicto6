import { eq, desc, count, avg, and, sql } from 'drizzle-orm';
import { getDB } from './db.js';
import type { 
  User, 
  InsertUser, 
  Exercise,
  InsertExercise,
  PsychoEducationContent,
  InsertPsychoEducationContent,
  CravingEntry,
  InsertCravingEntry,
  ExerciseSession,
  InsertExerciseSession,
  BeckAnalysis,
  InsertBeckAnalysis,
  AntiCravingStrategy,
  InsertAntiCravingStrategy,
  UserStats
} from '../shared/schema.js';
import { 
  users, 
  exercises,
  psychoEducationContent,
  cravingEntries,
  exerciseSessions,
  beckAnalyses,
  antiCravingStrategies,
  userStats,
  userBadges
} from '../shared/schema.js';

class Storage {
  private db = getDB();

  // === USERS ===
  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || null;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(userData).returning();
    return result[0];
  }

  async getUser(id: string): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  }

  // Alias pour la compatibilité
  async getUserById(id: string): Promise<User | null> {
    return this.getUser(id);
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User> {
    const result = await this.db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async updateUserLastLogin(id: string): Promise<void> {
    await this.db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, id));
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    const result = await this.db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      isActive: users.isActive,
      level: users.level,
      points: users.points,
      profileImageUrl: users.profileImageUrl,
      lastLoginAt: users.lastLoginAt,
      inactivityThreshold: users.inactivityThreshold,
      notes: users.notes,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users);
    return result;
  }

  async getAllUsersWithStats(): Promise<Omit<User, 'password'>[]> {
    // Pour l'instant, retourner la même chose que getAllUsers
    // Peut être étendu plus tard pour inclure des statistiques
    return this.getAllUsers();
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await this.db
        .delete(users)
        .where(eq(users.id, id))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // === EXERCISES ===
  async getAllExercises(): Promise<Exercise[]> {
    const result = await this.db
      .select()
      .from(exercises)
      .where(eq(exercises.isActive, true))
      .orderBy(desc(exercises.createdAt));
    return result;
  }

  async createExercise(exerciseData: InsertExercise): Promise<Exercise> {
    const result = await this.db.insert(exercises).values(exerciseData).returning();
    return result[0];
  }

  async getExercise(id: string): Promise<Exercise | null> {
    const result = await this.db.select().from(exercises).where(eq(exercises.id, id)).limit(1);
    return result[0] || null;
  }

  // Alias pour la compatibilité
  async getExerciseById(id: string): Promise<Exercise | null> {
    return this.getExercise(id);
  }

  async getRelaxationExercises(): Promise<Exercise[]> {
    const result = await this.db
      .select()
      .from(exercises)
      .where(and(
        eq(exercises.isActive, true),
        eq(exercises.category, 'relaxation')
      ))
      .orderBy(desc(exercises.createdAt));
    return result;
  }

  // === PSYCHO EDUCATION CONTENT ===
  async getAllPsychoEducationContent(): Promise<PsychoEducationContent[]> {
    const result = await this.db
      .select()
      .from(psychoEducationContent)
      .where(eq(psychoEducationContent.isActive, true))
      .orderBy(desc(psychoEducationContent.createdAt));
    return result;
  }

  async createPsychoEducationContent(contentData: InsertPsychoEducationContent): Promise<PsychoEducationContent> {
    const result = await this.db.insert(psychoEducationContent).values(contentData).returning();
    return result[0];
  }

  // === CRAVING ENTRIES ===
  async createCravingEntry(cravingData: InsertCravingEntry): Promise<CravingEntry> {
    try {
      console.log('💾 Creating craving entry:', cravingData);
      
      const insertData: InsertCravingEntry = {
        userId: cravingData.userId,
        intensity: cravingData.intensity,
        triggers: Array.isArray(cravingData.triggers) ? cravingData.triggers as string[] : [],
        emotions: Array.isArray(cravingData.emotions) ? cravingData.emotions as string[] : [],
        notes: cravingData.notes
      };
      
      console.log('💾 Processed insert data:', insertData);
      
      const result = await this.db.insert(cravingEntries).values(insertData).returning();
      
      if (!result || result.length === 0) {
        throw new Error('Aucune donnée retournée après insertion du craving');
      }
      
      console.log('✅ Craving entry created in database:', result[0]);
      return result[0];
    } catch (error: any) {
      console.error('❌ Database error creating craving entry:', error);
      throw new Error(`Erreur de base de données lors de la création du craving: ${error.message}`);
    }
  }

  async getCravingEntriesByUser(userId: string, limit?: number): Promise<CravingEntry[]> {
    const baseQuery = this.db
      .select()
      .from(cravingEntries)
      .where(eq(cravingEntries.userId, userId))
      .orderBy(desc(cravingEntries.createdAt));
    
    if (limit) {
      return await baseQuery.limit(limit);
    }
    
    return await baseQuery;
  }

  // === EXERCISE SESSIONS ===
  async createExerciseSession(sessionData: InsertExerciseSession): Promise<ExerciseSession> {
    const result = await this.db.insert(exerciseSessions).values(sessionData).returning();
    return result[0];
  }

  async getExerciseSessionsByUser(userId: string, limit?: number): Promise<ExerciseSession[]> {
    try {
      const baseQuery = this.db
        .select({
          id: exerciseSessions.id,
          userId: exerciseSessions.userId,
          exerciseId: exerciseSessions.exerciseId,
          duration: exerciseSessions.duration,
          completed: exerciseSessions.completed,
          cravingBefore: exerciseSessions.cravingBefore,
          cravingAfter: exerciseSessions.cravingAfter,
          notes: exerciseSessions.notes,
          createdAt: exerciseSessions.createdAt,
          updatedAt: exerciseSessions.updatedAt,
          // Ajout des informations de l'exercice (peut être null)
          exerciseTitle: exercises.title,
          exerciseCategory: exercises.category
        })
        .from(exerciseSessions)
        .leftJoin(exercises, eq(exerciseSessions.exerciseId, exercises.id))
        .where(eq(exerciseSessions.userId, userId))
        .orderBy(desc(exerciseSessions.createdAt));
      
      const result = limit ? await baseQuery.limit(limit) : await baseQuery;
      
      return result.map(session => ({
        ...session,
        exerciseTitle: session.exerciseTitle || session.exerciseId || 'Exercice',
        exerciseCategory: session.exerciseCategory || 'general'
      })) as ExerciseSession[];
    } catch (error) {
      console.error('Error in getExerciseSessionsByUser:', error);
      // Fallback : récupérer sans jointure
      const fallbackQuery = this.db
        .select()
        .from(exerciseSessions)
        .where(eq(exerciseSessions.userId, userId))
        .orderBy(desc(exerciseSessions.createdAt));
      
      return limit ? await fallbackQuery.limit(limit) : await fallbackQuery;
    }
  }

  // === BECK ANALYSES ===
  async createBeckAnalysis(analysisData: InsertBeckAnalysis): Promise<BeckAnalysis> {
    try {
      console.log('💾 Creating Beck analysis:', analysisData);
      
      const result = await this.db.insert(beckAnalyses).values(analysisData).returning();
      
      if (!result || result.length === 0) {
        throw new Error('Aucune donnée retournée après insertion de l\'analyse Beck');
      }
      
      console.log('✅ Beck analysis created in database:', result[0]);
      return result[0];
    } catch (error: any) {
      console.error('❌ Database error creating Beck analysis:', error);
      throw new Error(`Erreur de base de données lors de la création de l'analyse Beck: ${error.message}`);
    }
  }

  async getBeckAnalysesByUser(userId: string, limit?: number): Promise<BeckAnalysis[]> {
    const baseQuery = this.db
      .select()
      .from(beckAnalyses)
      .where(eq(beckAnalyses.userId, userId))
      .orderBy(desc(beckAnalyses.createdAt));
    
    if (limit) {
      return await baseQuery.limit(limit);
    }
    
    return await baseQuery;
  }

  // === ANTI-CRAVING STRATEGIES ===
  async createStrategy(strategyData: InsertAntiCravingStrategy): Promise<AntiCravingStrategy> {
    try {
      console.log('💾 Creating anti-craving strategy:', strategyData);
      
      const result = await this.db.insert(antiCravingStrategies).values(strategyData).returning();
      
      if (!result || result.length === 0) {
        throw new Error('Aucune donnée retournée après insertion de la stratégie');
      }
      
      console.log('✅ Strategy created in database:', result[0]);
      return result[0];
    } catch (error: any) {
      console.error('❌ Database error creating strategy:', error);
      throw new Error(`Erreur de base de données lors de la création de la stratégie: ${error.message}`);
    }
  }

  async getStrategiesByUser(userId: string): Promise<AntiCravingStrategy[]> {
    const result = await this.db
      .select()
      .from(antiCravingStrategies)
      .where(eq(antiCravingStrategies.userId, userId))
      .orderBy(desc(antiCravingStrategies.createdAt));
    return result;
  }

  async updateStrategy(
    id: string, 
    userId: string, 
    data: Partial<InsertAntiCravingStrategy>
  ): Promise<AntiCravingStrategy | null> {
    const result = await this.db
      .update(antiCravingStrategies)
      .set({ ...data, updatedAt: new Date() })
      .where(and(
        eq(antiCravingStrategies.id, id),
        eq(antiCravingStrategies.userId, userId)
      ))
      .returning();
    return result[0] || null;
  }

  async deleteStrategy(id: string, userId: string): Promise<boolean> {
    const result = await this.db
      .delete(antiCravingStrategies)
      .where(and(
        eq(antiCravingStrategies.id, id),
        eq(antiCravingStrategies.userId, userId)
      ))
      .returning();
    return result.length > 0;
  }

  // === USER STATS ===
  async getUserStats(userId: string): Promise<any> {
    try {
      // Récupérer les statistiques de base
      const userStatsResult = await this.db
        .select()
        .from(userStats)
        .where(eq(userStats.userId, userId))
        .limit(1);

      // Récupérer les données additionnelles
      const [
        totalCravings,
        totalExerciseSessions,
        totalBeckAnalyses,
        totalStrategies,
        avgCravingIntensity,
        recentCravings,
        recentSessions,
        recentAnalyses,
        recentStrategies
      ] = await Promise.all([
        // Total de cravings
        this.db
          .select({ count: count() })
          .from(cravingEntries)
          .where(eq(cravingEntries.userId, userId)),
        
        // Total de sessions d'exercices
        this.db
          .select({ count: count() })
          .from(exerciseSessions)
          .where(eq(exerciseSessions.userId, userId)),
        
        // Total d'analyses Beck
        this.db
          .select({ count: count() })
          .from(beckAnalyses)
          .where(eq(beckAnalyses.userId, userId)),
        
        // Total de stratégies
        this.db
          .select({ count: count() })
          .from(antiCravingStrategies)
          .where(eq(antiCravingStrategies.userId, userId)),
        
        // Intensité moyenne des cravings
        this.db
          .select({ avg: avg(cravingEntries.intensity) })
          .from(cravingEntries)
          .where(eq(cravingEntries.userId, userId)),
        
        // Cravings récents (7 derniers jours)
        this.db
          .select()
          .from(cravingEntries)
          .where(eq(cravingEntries.userId, userId))
          .orderBy(desc(cravingEntries.createdAt))
          .limit(10),
        
        // Sessions récentes
        this.db
          .select()
          .from(exerciseSessions)
          .where(eq(exerciseSessions.userId, userId))
          .orderBy(desc(exerciseSessions.createdAt))
          .limit(10),
        
        // Analyses Beck récentes
        this.db
          .select()
          .from(beckAnalyses)
          .where(eq(beckAnalyses.userId, userId))
          .orderBy(desc(beckAnalyses.createdAt))
          .limit(5),
        
        // Stratégies récentes
        this.db
          .select()
          .from(antiCravingStrategies)
          .where(eq(antiCravingStrategies.userId, userId))
          .orderBy(desc(antiCravingStrategies.createdAt))
          .limit(5)
      ]);

      const stats = userStatsResult[0] || {
        exercisesCompleted: 0,
        totalDuration: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageCraving: 0,
        beckAnalysesCompleted: 0
      };

      return {
        ...stats,
        totalCravings: totalCravings[0]?.count || 0,
        totalExerciseSessions: totalExerciseSessions[0]?.count || 0,
        totalBeckAnalyses: totalBeckAnalyses[0]?.count || 0,
        totalStrategies: totalStrategies[0]?.count || 0,
        avgCravingIntensity: avgCravingIntensity[0]?.avg || 0,
        recentData: {
          cravings: recentCravings,
          sessions: recentSessions,
          beckAnalyses: recentAnalyses,
          strategies: recentStrategies
        }
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        exercisesCompleted: 0,
        totalDuration: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageCraving: 0,
        beckAnalysesCompleted: 0,
        totalCravings: 0,
        totalExerciseSessions: 0,
        totalBeckAnalyses: 0,
        totalStrategies: 0,
        avgCravingIntensity: 0,
        recentData: {
          cravings: [],
          sessions: [],
          beckAnalyses: [],
          strategies: []
        }
      };
    }
  }

  // === UTILITY METHODS ===
  async initializeUserStats(userId: string): Promise<UserStats> {
    const result = await this.db
      .insert(userStats)
      .values({
        userId,
        exercisesCompleted: 0,
        totalDuration: 0,
        currentStreak: 0,
        longestStreak: 0,
        beckAnalysesCompleted: 0
      })
      .onConflictDoNothing()
      .returning();
    
    if (result.length === 0) {
      // Si l'utilisateur a déjà des stats, les récupérer
      const existing = await this.db
        .select()
        .from(userStats)
        .where(eq(userStats.userId, userId))
        .limit(1);
      return existing[0];
    }
    
    return result[0];
  }

  async updateUserStats(userId: string, updates: Partial<UserStats>): Promise<void> {
    await this.db
      .update(userStats)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userStats.userId, userId));
  }

  // === DEBUGGING HELPERS ===
  async debugGetAllTables(): Promise<Record<string, any[]>> {
    try {
      const [
        allUsers,
        allExercises,
        allCravings,
        allSessions,
        allBeckAnalyses,
        allStrategies,
        allStats
      ] = await Promise.all([
        this.getAllUsers(),
        this.getAllExercises(),
        this.db.select().from(cravingEntries),
        this.db.select().from(exerciseSessions),
        this.db.select().from(beckAnalyses),
        this.db.select().from(antiCravingStrategies),
        this.db.select().from(userStats)
      ]);

      return {
        users: allUsers,
        exercises: allExercises,
        cravingEntries: allCravings,
        exerciseSessions: allSessions,
        beckAnalyses: allBeckAnalyses,
        strategies: allStrategies,
        userStats: allStats
      };
    } catch (error) {
      console.error('Error in debugGetAllTables:', error);
      return {};
    }
  }

  // Les méthodes getAllUsersWithStats, getUserById et deleteUser sont déjà définies plus haut
}

export const storage = new Storage();