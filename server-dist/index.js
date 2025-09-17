var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import "dotenv/config";
import express from "express";
import session from "express-session";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// server/auth.ts
import bcrypt from "bcryptjs";

// server/storage.ts
import { eq, desc, count, avg, and } from "drizzle-orm";

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  antiCravingStrategies: () => antiCravingStrategies,
  audioContent: () => audioContent,
  beckAnalyses: () => beckAnalyses,
  cravingEntries: () => cravingEntries,
  emergencyRoutines: () => emergencyRoutines,
  exerciseEnhancements: () => exerciseEnhancements,
  exerciseSessions: () => exerciseSessions,
  exercises: () => exercises,
  insertAntiCravingStrategySchema: () => insertAntiCravingStrategySchema,
  insertAudioContentSchema: () => insertAudioContentSchema,
  insertBeckAnalysisSchema: () => insertBeckAnalysisSchema,
  insertCravingEntrySchema: () => insertCravingEntrySchema,
  insertEmergencyRoutineSchema: () => insertEmergencyRoutineSchema,
  insertExerciseEnhancementSchema: () => insertExerciseEnhancementSchema,
  insertExerciseSchema: () => insertExerciseSchema,
  insertExerciseSessionSchema: () => insertExerciseSessionSchema,
  insertProfessionalReportSchema: () => insertProfessionalReportSchema,
  insertPsychoEducationContentSchema: () => insertPsychoEducationContentSchema,
  insertQuickResourceSchema: () => insertQuickResourceSchema,
  insertTimerSessionSchema: () => insertTimerSessionSchema,
  insertUserBadgeSchema: () => insertUserBadgeSchema,
  insertUserSchema: () => insertUserSchema,
  insertVisualizationContentSchema: () => insertVisualizationContentSchema,
  professionalReports: () => professionalReports,
  psychoEducationContent: () => psychoEducationContent,
  quickResources: () => quickResources,
  timerSessions: () => timerSessions,
  userBadges: () => userBadges,
  userStats: () => userStats,
  users: () => users,
  visualizationContent: () => visualizationContent
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("patient"),
  // 'patient' or 'admin'
  level: integer("level").default(1),
  points: integer("points").default(0),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  inactivityThreshold: integer("inactivity_threshold").default(30),
  // jours avant considéré inactif
  notes: text("notes"),
  // notes du thérapeute sur le patient
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  // 'cardio', 'strength', 'flexibility', 'mindfulness'
  difficulty: varchar("difficulty").default("beginner"),
  // 'beginner', 'intermediate', 'advanced'
  duration: integer("duration"),
  // in minutes
  instructions: text("instructions"),
  benefits: text("benefits"),
  imageUrl: varchar("image_url"),
  videoUrl: varchar("video_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var psychoEducationContent = pgTable("psycho_education_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  category: varchar("category").notNull(),
  // 'addiction', 'motivation', 'coping', 'relapse_prevention'
  type: varchar("type").default("article"),
  // 'article', 'video', 'audio', 'interactive'
  difficulty: varchar("difficulty").default("beginner"),
  estimatedReadTime: integer("estimated_read_time"),
  // in minutes
  imageUrl: varchar("image_url"),
  videoUrl: varchar("video_url"),
  audioUrl: varchar("audio_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var cravingEntries = pgTable("craving_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  intensity: integer("intensity").notNull(),
  // 0-10 scale
  triggers: jsonb("triggers").$type().default([]),
  emotions: jsonb("emotions").$type().default([]),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var exerciseSessions = pgTable("exercise_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  exerciseId: varchar("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
  duration: integer("duration"),
  // in seconds
  completed: boolean("completed").default(false),
  cravingBefore: integer("craving_before"),
  // 0-10 scale
  cravingAfter: integer("craving_after"),
  // 0-10 scale
  createdAt: timestamp("created_at").defaultNow()
});
var beckAnalyses = pgTable("beck_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  situation: text("situation"),
  automaticThoughts: text("automatic_thoughts"),
  emotions: text("emotions"),
  emotionIntensity: integer("emotion_intensity"),
  rationalResponse: text("rational_response"),
  newFeeling: text("new_feeling"),
  newIntensity: integer("new_intensity"),
  createdAt: timestamp("created_at").defaultNow()
});
var userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  badgeType: varchar("badge_type").notNull(),
  // '7_days', '50_exercises', 'craving_reduction'
  earnedAt: timestamp("earned_at").defaultNow()
});
var userStats = pgTable("user_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  exercisesCompleted: integer("exercises_completed").default(0),
  totalDuration: integer("total_duration").default(0),
  // in seconds
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  averageCraving: integer("average_craving"),
  // calculated average
  beckAnalysesCompleted: integer("beck_analyses_completed").default(0),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertPsychoEducationContentSchema = createInsertSchema(psychoEducationContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCravingEntrySchema = createInsertSchema(cravingEntries).omit({
  id: true,
  createdAt: true
});
var insertExerciseSessionSchema = createInsertSchema(exerciseSessions).omit({
  id: true,
  createdAt: true
});
var insertBeckAnalysisSchema = createInsertSchema(beckAnalyses).omit({
  id: true,
  createdAt: true
});
var insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  earnedAt: true
});
var emergencyRoutines = pgTable("emergency_routines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  steps: jsonb("steps").notNull(),
  // Array of steps for the routine
  duration: integer("duration"),
  // in minutes
  category: varchar("category").default("general"),
  // 'breathing', 'grounding', 'distraction', 'general'
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),
  // One routine can be marked as default
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertEmergencyRoutineSchema = createInsertSchema(emergencyRoutines).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var quickResources = pgTable("quick_resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  category: varchar("category").notNull(),
  // 'coping', 'motivation', 'emergency', 'relaxation'
  type: varchar("type").default("tip"),
  // 'tip', 'technique', 'reminder', 'affirmation'
  icon: varchar("icon"),
  // Icon name for UI
  color: varchar("color").default("blue"),
  // Color theme
  isActive: boolean("is_active").default(true),
  isPinned: boolean("is_pinned").default(false),
  // Pinned resources appear first
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertQuickResourceSchema = createInsertSchema(quickResources).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var antiCravingStrategies = pgTable("anti_craving_strategies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  context: varchar("context").notNull(),
  // 'leisure', 'home', 'work'
  exercise: text("exercise").notNull(),
  effort: varchar("effort").notNull(),
  // 'faible', 'modéré', 'intense'
  duration: integer("duration").notNull(),
  // in minutes
  cravingBefore: integer("craving_before").notNull(),
  // 0-10 scale
  cravingAfter: integer("craving_after").notNull(),
  // 0-10 scale
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertAntiCravingStrategySchema = createInsertSchema(antiCravingStrategies).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var timerSessions = pgTable("timer_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  exerciseId: varchar("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(),
  // 'interval', 'continuous', 'breathing'
  duration: integer("duration").notNull(),
  // in seconds
  intervals: jsonb("intervals"),
  // for interval timers
  audioUrl: varchar("audio_url"),
  // background audio/music
  completed: boolean("completed").default(false),
  heartRateBefore: integer("heart_rate_before"),
  heartRateAfter: integer("heart_rate_after"),
  stressLevelBefore: integer("stress_level_before"),
  // 1-10 scale
  stressLevelAfter: integer("stress_level_after"),
  // 1-10 scale
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var professionalReports = pgTable("professional_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  therapistId: varchar("therapist_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reportType: varchar("report_type").notNull(),
  // 'weekly', 'monthly', 'session', 'progress'
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  data: jsonb("data"),
  // structured data (charts, stats, etc.)
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isPrivate: boolean("is_private").default(true),
  tags: jsonb("tags").$type().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var visualizationContent = pgTable("visualization_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(),
  // 'guided_imagery', 'meditation', 'breathing', 'visualization'
  category: varchar("category").notNull(),
  // 'relaxation', 'stress_reduction', 'pain_management', 'emotional_regulation'
  difficulty: varchar("difficulty").default("beginner"),
  duration: integer("duration"),
  // in minutes
  audioUrl: varchar("audio_url"),
  videoUrl: varchar("video_url"),
  imageUrl: varchar("image_url"),
  script: text("script"),
  // text script for the visualization
  instructions: text("instructions"),
  benefits: text("benefits"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var audioContent = pgTable("audio_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(),
  // 'relaxation', 'nature_sounds', 'meditation', 'breathing_guide', 'asmr'
  category: varchar("category").notNull(),
  duration: integer("duration"),
  // in seconds
  audioUrl: varchar("audio_url").notNull(),
  thumbnailUrl: varchar("thumbnail_url"),
  isLoopable: boolean("is_loopable").default(false),
  volumeRecommendation: varchar("volume_recommendation").default("medium"),
  tags: jsonb("tags").$type().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var exerciseEnhancements = pgTable("exercise_enhancements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  exerciseId: varchar("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
  audioUrls: jsonb("audio_urls").$type().default([]),
  // multiple audio tracks
  videoUrls: jsonb("video_urls").$type().default([]),
  imageUrls: jsonb("image_urls").$type().default([]),
  timerSettings: jsonb("timer_settings"),
  // interval timer configuration
  breathingPattern: jsonb("breathing_pattern"),
  // for breathing exercises
  visualizationScript: text("visualization_script"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertTimerSessionSchema = createInsertSchema(timerSessions).omit({
  id: true,
  createdAt: true
});
var insertProfessionalReportSchema = createInsertSchema(professionalReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertVisualizationContentSchema = createInsertSchema(visualizationContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertAudioContentSchema = createInsertSchema(audioContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertExerciseEnhancementSchema = createInsertSchema(exerciseEnhancements).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// server/db.ts
var { Pool } = pkg;
var pool = null;
var db = null;
function getDB() {
  if (!db) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    db = drizzle(pool, { schema: schema_exports });
  }
  return db;
}

// server/storage.ts
var Storage = class {
  db = getDB();
  // === USERS ===
  async getUserByEmail(email) {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || null;
  }
  async createUser(userData) {
    const result = await this.db.insert(users).values(userData).returning();
    return result[0];
  }
  async getUser(id) {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  }
  async updateUser(id, data) {
    const result = await this.db.update(users).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return result[0];
  }
  async updateUserLastLogin(id) {
    await this.db.update(users).set({ lastLoginAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id));
  }
  async updatePassword(id, hashedPassword) {
    await this.db.update(users).set({ password: hashedPassword, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id));
  }
  async getAllUsers() {
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
  // === EXERCISES ===
  async getAllExercises() {
    const result = await this.db.select().from(exercises).where(eq(exercises.isActive, true)).orderBy(desc(exercises.createdAt));
    return result;
  }
  async createExercise(exerciseData) {
    const result = await this.db.insert(exercises).values(exerciseData).returning();
    return result[0];
  }
  async getExercise(id) {
    const result = await this.db.select().from(exercises).where(eq(exercises.id, id)).limit(1);
    return result[0] || null;
  }
  async getRelaxationExercises() {
    const result = await this.db.select().from(exercises).where(and(
      eq(exercises.isActive, true),
      eq(exercises.category, "relaxation")
    )).orderBy(desc(exercises.createdAt));
    return result;
  }
  // === PSYCHO EDUCATION CONTENT ===
  async getAllPsychoEducationContent() {
    const result = await this.db.select().from(psychoEducationContent).where(eq(psychoEducationContent.isActive, true)).orderBy(desc(psychoEducationContent.createdAt));
    return result;
  }
  async createPsychoEducationContent(contentData) {
    const result = await this.db.insert(psychoEducationContent).values(contentData).returning();
    return result[0];
  }
  // === CRAVING ENTRIES ===
  async createCravingEntry(cravingData) {
    const result = await this.db.insert(cravingEntries).values(cravingData).returning();
    return result[0];
  }
  async getCravingEntriesByUser(userId) {
    const result = await this.db.select().from(cravingEntries).where(eq(cravingEntries.userId, userId)).orderBy(desc(cravingEntries.createdAt));
    return result;
  }
  // === EXERCISE SESSIONS ===
  async createExerciseSession(sessionData) {
    const result = await this.db.insert(exerciseSessions).values(sessionData).returning();
    return result[0];
  }
  async getExerciseSessionsByUser(userId) {
    const result = await this.db.select().from(exerciseSessions).where(eq(exerciseSessions.userId, userId)).orderBy(desc(exerciseSessions.createdAt));
    return result;
  }
  // === BECK ANALYSES ===
  async createBeckAnalysis(analysisData) {
    const result = await this.db.insert(beckAnalyses).values(analysisData).returning();
    return result[0];
  }
  async getBeckAnalysesByUser(userId) {
    const result = await this.db.select().from(beckAnalyses).where(eq(beckAnalyses.userId, userId)).orderBy(desc(beckAnalyses.createdAt));
    return result;
  }
  // === ANTI-CRAVING STRATEGIES ===
  async createStrategy(strategyData) {
    const result = await this.db.insert(antiCravingStrategies).values(strategyData).returning();
    return result[0];
  }
  async getStrategiesByUser(userId) {
    const result = await this.db.select().from(antiCravingStrategies).where(eq(antiCravingStrategies.userId, userId)).orderBy(desc(antiCravingStrategies.createdAt));
    return result;
  }
  async updateStrategy(id, userId, data) {
    const result = await this.db.update(antiCravingStrategies).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(and(
      eq(antiCravingStrategies.id, id),
      eq(antiCravingStrategies.userId, userId)
    )).returning();
    return result[0] || null;
  }
  async deleteStrategy(id, userId) {
    const result = await this.db.delete(antiCravingStrategies).where(and(
      eq(antiCravingStrategies.id, id),
      eq(antiCravingStrategies.userId, userId)
    )).returning();
    return result.length > 0;
  }
  // === USER STATS ===
  async getUserStats(userId) {
    try {
      const userStatsResult = await this.db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
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
        this.db.select({ count: count() }).from(cravingEntries).where(eq(cravingEntries.userId, userId)),
        // Total de sessions d'exercices
        this.db.select({ count: count() }).from(exerciseSessions).where(eq(exerciseSessions.userId, userId)),
        // Total d'analyses Beck
        this.db.select({ count: count() }).from(beckAnalyses).where(eq(beckAnalyses.userId, userId)),
        // Total de stratégies
        this.db.select({ count: count() }).from(antiCravingStrategies).where(eq(antiCravingStrategies.userId, userId)),
        // Intensité moyenne des cravings
        this.db.select({ avg: avg(cravingEntries.intensity) }).from(cravingEntries).where(eq(cravingEntries.userId, userId)),
        // Cravings récents (7 derniers jours)
        this.db.select().from(cravingEntries).where(eq(cravingEntries.userId, userId)).orderBy(desc(cravingEntries.createdAt)).limit(10),
        // Sessions récentes
        this.db.select().from(exerciseSessions).where(eq(exerciseSessions.userId, userId)).orderBy(desc(exerciseSessions.createdAt)).limit(10),
        // Analyses Beck récentes
        this.db.select().from(beckAnalyses).where(eq(beckAnalyses.userId, userId)).orderBy(desc(beckAnalyses.createdAt)).limit(5),
        // Stratégies récentes
        this.db.select().from(antiCravingStrategies).where(eq(antiCravingStrategies.userId, userId)).orderBy(desc(antiCravingStrategies.createdAt)).limit(5)
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
      console.error("Error fetching user stats:", error);
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
  async initializeUserStats(userId) {
    const result = await this.db.insert(userStats).values({
      userId,
      exercisesCompleted: 0,
      totalDuration: 0,
      currentStreak: 0,
      longestStreak: 0,
      beckAnalysesCompleted: 0
    }).onConflictDoNothing().returning();
    if (result.length === 0) {
      const existing = await this.db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
      return existing[0];
    }
    return result[0];
  }
  async updateUserStats(userId, updates) {
    await this.db.update(userStats).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(userStats.userId, userId));
  }
  // === DEBUGGING HELPERS ===
  async debugGetAllTables() {
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
      console.error("Error in debugGetAllTables:", error);
      return {};
    }
  }
};
var storage = new Storage();

// server/auth.ts
var AuthService = class {
  static async hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
  static async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
  static async register(userData) {
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error("Un utilisateur avec cet email existe d\xE9j\xE0");
    }
    const authorizedAdminEmail = "doriansarry@yahoo.fr";
    const requestedRole = userData.role || "patient";
    if (requestedRole === "admin" && userData.email.toLowerCase() !== authorizedAdminEmail.toLowerCase()) {
      throw new Error("Acc\xE8s administrateur non autoris\xE9 pour cet email");
    }
    const hashedPassword = await this.hashPassword(userData.password);
    const newUser = {
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      role: requestedRole
    };
    const user = await storage.createUser(newUser);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };
  }
  static async login(email, password) {
    const user = await storage.getUserByEmail(email);
    if (!user) {
      throw new Error("Email ou mot de passe incorrect");
    }
    const isValidPassword = await this.verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new Error("Email ou mot de passe incorrect");
    }
    if (!user.isActive) {
      throw new Error("Compte d\xE9sactiv\xE9");
    }
    await storage.updateUserLastLogin(user.id);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };
  }
  static async getUserById(id) {
    const user = await storage.getUser(id);
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };
  }
  static async updateUser(userId, data) {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("Utilisateur non trouv\xE9");
    }
    if (data.email && data.email !== user.email) {
      const existing = await storage.getUserByEmail(data.email);
      if (existing) {
        throw new Error("Cet email est d\xE9j\xE0 utilis\xE9 par un autre compte.");
      }
    }
    const updatedUser = await storage.updateUser(userId, {
      firstName: data.firstName ?? user.firstName,
      lastName: data.lastName ?? user.lastName,
      email: data.email ?? user.email
    });
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role
    };
  }
  static async updatePassword(userId, oldPassword, newPassword) {
    if (!oldPassword || !newPassword) {
      throw new Error("L'ancien et le nouveau mot de passe sont requis.");
    }
    if (newPassword.length < 6) {
      throw new Error("Le nouveau mot de passe doit contenir au moins 6 caract\xE8res.");
    }
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("Utilisateur non trouv\xE9.");
    }
    const isMatch = await this.verifyPassword(oldPassword, user.password);
    if (!isMatch) {
      throw new Error("L'ancien mot de passe est incorrect.");
    }
    const hashedNewPassword = await this.hashPassword(newPassword);
    await storage.updatePassword(userId, hashedNewPassword);
  }
};
function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Authentification requise" });
  }
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Authentification requise" });
  }
  if (req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Acc\xE8s administrateur requis" });
  }
  next();
}

// server/routes.ts
function registerRoutes(app2) {
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, role } = req.body;
      console.log("\u{1F4DD} Registration attempt for:", email);
      if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caract\xE8res" });
      }
      const user = await AuthService.register({
        email,
        password,
        firstName,
        lastName,
        role: role || "patient"
      });
      req.session.user = user;
      console.log("\u2705 User registered successfully:", email);
      res.json({
        user: req.session.user,
        message: "Inscription r\xE9ussie"
      });
    } catch (error) {
      console.error("\u274C Registration error:", error);
      res.status(500).json({
        message: error.message || "Erreur lors de l'inscription"
      });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("\u{1F510} Login attempt for:", email);
      if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis" });
      }
      const user = await AuthService.login(email, password);
      req.session.user = user;
      console.log("\u2705 User logged in successfully:", email);
      res.json({
        user: req.session.user,
        message: "Connexion r\xE9ussie"
      });
    } catch (error) {
      console.error("\u274C Login error:", error);
      res.status(401).json({
        message: error.message || "Erreur lors de la connexion"
      });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    const userEmail = req.session?.user?.email;
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Erreur lors de la d\xE9connexion" });
      }
      console.log("\u{1F44B} User logged out:", userEmail);
      res.json({ message: "D\xE9connexion r\xE9ussie" });
    });
  });
  app2.get("/api/auth/me", requireAuth, (req, res) => {
    res.json({ user: req.session.user });
  });
  app2.put("/api/auth/profile", requireAuth, async (req, res) => {
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
        message: "Profil mis \xE0 jour avec succ\xE8s"
      });
    } catch (error) {
      console.error("\u274C Profile update error:", error);
      res.status(400).json({
        message: error.message || "Erreur lors de la mise \xE0 jour"
      });
    }
  });
  app2.put("/api/auth/password", requireAuth, async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      await AuthService.updatePassword(req.session.user.id, oldPassword, newPassword);
      res.json({ message: "Mot de passe mis \xE0 jour avec succ\xE8s" });
    } catch (error) {
      console.error("\u274C Password update error:", error);
      res.status(400).json({
        message: error.message || "Erreur lors du changement de mot de passe"
      });
    }
  });
  app2.get("/api/users", requireAdmin, async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      res.json(users2);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des utilisateurs" });
    }
  });
  app2.get("/api/exercises", requireAuth, async (req, res) => {
    try {
      const exercises2 = await storage.getAllExercises();
      res.json(exercises2);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des exercices" });
    }
  });
  app2.post("/api/exercises", requireAdmin, async (req, res) => {
    try {
      const { title, description, duration, difficulty, category, instructions } = req.body;
      if (!title || !description) {
        return res.status(400).json({ message: "Titre et description requis" });
      }
      const exercise = await storage.createExercise({
        title,
        description,
        duration: duration || 15,
        difficulty: difficulty || "beginner",
        category: category || "general",
        instructions: instructions || null
      });
      res.json(exercise);
    } catch (error) {
      console.error("Error creating exercise:", error);
      res.status(500).json({ message: "Erreur lors de la cr\xE9ation de l'exercice" });
    }
  });
  app2.post("/api/cravings", requireAuth, async (req, res) => {
    try {
      const { intensity, triggers, notes, strategy } = req.body;
      const craving = await storage.createCravingEntry({
        userId: req.session.user.id,
        intensity: intensity || 1,
        triggers: triggers || null,
        notes: notes || null,
        strategy: strategy || null
      });
      res.json(craving);
    } catch (error) {
      console.error("Error creating craving entry:", error);
      res.status(500).json({ message: "Erreur lors de l'enregistrement" });
    }
  });
  app2.get("/api/cravings", requireAuth, async (req, res) => {
    try {
      const cravings = await storage.getCravingEntriesByUser(req.session.user.id);
      res.json(cravings);
    } catch (error) {
      console.error("Error fetching cravings:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration" });
    }
  });
  app2.post("/api/exercise-sessions", requireAuth, async (req, res) => {
    try {
      const { exerciseId, duration, completed, notes } = req.body;
      const session2 = await storage.createExerciseSession({
        userId: req.session.user.id,
        exerciseId: exerciseId || null,
        duration: duration || 0,
        completed: completed || false,
        notes: notes || null
      });
      res.json(session2);
    } catch (error) {
      console.error("Error creating exercise session:", error);
      res.status(500).json({ message: "Erreur lors de l'enregistrement" });
    }
  });
  app2.get("/api/exercise-sessions", requireAuth, async (req, res) => {
    try {
      const sessions = await storage.getExerciseSessionsByUser(req.session.user.id);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching exercise sessions:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration" });
    }
  });
  app2.get("/api/psycho-education", requireAuth, async (req, res) => {
    try {
      const content = await storage.getAllPsychoEducationContent();
      res.json(content);
    } catch (error) {
      console.error("Error fetching psycho-education content:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration du contenu" });
    }
  });
  app2.post("/api/psycho-education", requireAdmin, async (req, res) => {
    try {
      const { title, content, category, tags } = req.body;
      if (!title || !content) {
        return res.status(400).json({ message: "Titre et contenu requis" });
      }
      const newContent = await storage.createPsychoEducationContent({
        title,
        content,
        category: category || "general",
        tags: tags || null
      });
      res.json(newContent);
    } catch (error) {
      console.error("Error creating psycho-education content:", error);
      res.status(500).json({ message: "Erreur lors de la cr\xE9ation du contenu" });
    }
  });
  app2.post("/api/beck-analyses", requireAuth, async (req, res) => {
    try {
      const { situation, automaticThought, emotion, behavior, alternativeThought, notes } = req.body;
      if (!situation || !automaticThought) {
        return res.status(400).json({ message: "Situation et pens\xE9e automatique requises" });
      }
      const analysis = await storage.createBeckAnalysis({
        userId: req.session.user.id,
        situation,
        automaticThought,
        emotion: emotion || null,
        behavior: behavior || null,
        alternativeThought: alternativeThought || null,
        notes: notes || null
      });
      res.json(analysis);
    } catch (error) {
      console.error("Error creating Beck analysis:", error);
      res.status(500).json({ message: "Erreur lors de la cr\xE9ation de l'analyse" });
    }
  });
  app2.get("/api/beck-analyses", requireAuth, async (req, res) => {
    try {
      const analyses = await storage.getBeckAnalysesByUser(req.session.user.id);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching Beck analyses:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des analyses" });
    }
  });
  app2.post("/api/strategies", requireAuth, async (req, res) => {
    try {
      const { title, description, category, effectiveness } = req.body;
      if (!title || !description) {
        return res.status(400).json({ message: "Titre et description requis" });
      }
      const strategy = await storage.createStrategy({
        userId: req.session.user.id,
        title,
        description,
        category: category || "general",
        effectiveness: effectiveness || null
      });
      res.json(strategy);
    } catch (error) {
      console.error("Error creating strategy:", error);
      res.status(500).json({ message: "Erreur lors de la cr\xE9ation de la strat\xE9gie" });
    }
  });
  app2.get("/api/strategies", requireAuth, async (req, res) => {
    try {
      const strategies = await storage.getStrategiesByUser(req.session.user.id);
      res.json(strategies);
    } catch (error) {
      console.error("Error fetching strategies:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des strat\xE9gies" });
    }
  });
  app2.put("/api/strategies/:id", requireAuth, async (req, res) => {
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
        return res.status(404).json({ message: "Strat\xE9gie non trouv\xE9e" });
      }
      res.json(strategy);
    } catch (error) {
      console.error("Error updating strategy:", error);
      res.status(500).json({ message: "Erreur lors de la mise \xE0 jour de la strat\xE9gie" });
    }
  });
  app2.delete("/api/strategies/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteStrategy(id, req.session.user.id);
      if (!success) {
        return res.status(404).json({ message: "Strat\xE9gie non trouv\xE9e" });
      }
      res.json({ message: "Strat\xE9gie supprim\xE9e avec succ\xE8s" });
    } catch (error) {
      console.error("Error deleting strategy:", error);
      res.status(500).json({ message: "Erreur lors de la suppression de la strat\xE9gie" });
    }
  });
  app2.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.session.user.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des statistiques" });
    }
  });
  app2.get("/api/relaxation-exercises", requireAuth, async (req, res) => {
    try {
      const exercises2 = await storage.getRelaxationExercises();
      res.json(exercises2);
    } catch (error) {
      console.error("Error fetching relaxation exercises:", error);
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des exercices de relaxation" });
    }
  });
  console.log("\u2705 All routes registered successfully");
}

// server/migrate.ts
import "dotenv/config";
import { drizzle as drizzle2 } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pkg2 from "pg";
import fs from "fs";
var { Pool: Pool2, Client } = pkg2;
async function ensureAntiCravingTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  try {
    await client.connect();
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'anti_craving_strategies'
      );
    `);
    if (tableExists.rows[0].exists) {
      console.log("\u2705 Table anti_craving_strategies existe");
    } else {
      console.log("\u26A0\uFE0F Cr\xE9ation de la table anti_craving_strategies...");
      await client.query(`
        CREATE TABLE IF NOT EXISTS "anti_craving_strategies" (
          "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "user_id" varchar NOT NULL,
          "context" varchar NOT NULL,
          "exercise" text NOT NULL,
          "effort" varchar NOT NULL,
          "duration" integer NOT NULL,
          "craving_before" integer NOT NULL,
          "craving_after" integer NOT NULL,
          "created_at" timestamp DEFAULT now(),
          "updated_at" timestamp DEFAULT now()
        );
      `);
      await client.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'anti_craving_strategies_user_id_users_id_fk'
          ) THEN
            ALTER TABLE "anti_craving_strategies" 
            ADD CONSTRAINT "anti_craving_strategies_user_id_users_id_fk" 
            FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
            ON DELETE cascade ON UPDATE no action;
          END IF;
        END $$;
      `);
      console.log("\u2705 Table anti_craving_strategies cr\xE9\xE9e");
    }
  } catch (error) {
    console.error("\u274C Erreur lors de la v\xE9rification de la table anti_craving_strategies:", error);
  } finally {
    await client.end();
  }
}
async function run() {
  if (!process.env.DATABASE_URL) {
    console.error("\u274C DATABASE_URL manquant");
    return;
  }
  if (!fs.existsSync("migrations")) {
    console.log("\u2139\uFE0F Dossier migrations/ absent, ex\xE9cution ignor\xE9e.");
    return;
  }
  console.log("\u{1F527} Migration runner: d\xE9marrage");
  const pool3 = new Pool2({ connectionString: process.env.DATABASE_URL });
  const db2 = drizzle2(pool3);
  try {
    await migrate(db2, { migrationsFolder: "migrations" });
    console.log("\u2705 Migrations Drizzle appliqu\xE9es (ou d\xE9j\xE0 \xE0 jour)");
    await ensureAntiCravingTable();
  } catch (e) {
    console.error("\u274C Erreur migrations:", e);
  } finally {
    await pool3.end();
  }
}
run();

// server/debugTables.ts
import { Router } from "express";
import pkg3 from "pg";
var { Pool: Pool3 } = pkg3;
var debugTablesRouter = Router();
function ensureDbUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL manquant");
  return url;
}
function makePool() {
  return new Pool3({ connectionString: ensureDbUrl() });
}
debugTablesRouter.get("/debug/tables", async (_req, res) => {
  const pool3 = makePool();
  try {
    const tables = await pool3.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    res.json({ tables: tables.rows.map((r) => r.table_name) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await pool3.end();
  }
});
debugTablesRouter.get("/debug/tables/counts", async (_req, res) => {
  const pool3 = makePool();
  try {
    const tables = await pool3.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    const out = {};
    for (const row of tables.rows) {
      const tableName = row.table_name;
      const count2 = await pool3.query(`SELECT COUNT(*)::int AS c FROM "${tableName}";`);
      out[tableName] = count2.rows[0].c;
    }
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await pool3.end();
  }
});
debugTablesRouter.delete("/debug/tables/purge", async (_req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "Purge interdite en production" });
  }
  const pool3 = makePool();
  try {
    const tables = await pool3.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type='BASE TABLE'
      ORDER BY table_name;
    `);
    for (const row of tables.rows) {
      const tableName = row.table_name;
      await pool3.query(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`);
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await pool3.end();
  }
});

// server/index.ts
import { Pool as Pool4 } from "pg";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
app.use(cors({
  origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN.split(","),
  credentials: true
}));
app.use(express.json());
var distPath = path.join(__dirname, "..", "dist");
console.log("\u{1F4C1} Serving static files from:", distPath);
app.use(express.static(distPath));
app.use(session({
  secret: process.env.SESSION_SECRET || "fallback-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1e3 * 60 * 60 * 24 * 7
  }
}));
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    env: process.env.NODE_ENV
  });
});
registerRoutes(app);
app.use("/api", debugTablesRouter);
var pool2 = new Pool4({
  connectionString: process.env.DATABASE_URL
});
app.get("/api/tables", async (_req, res) => {
  try {
    const result = await pool2.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    res.json(result.rows.map((r) => r.table_name));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
app.get("/api/data", async (_req, res) => {
  try {
    const tables = [
      "beck_analyses",
      "craving_entries",
      "exercise_sessions",
      "exercises",
      "psycho_education_content",
      "user_badges",
      "user_stats",
      "users"
    ];
    const data = {};
    for (const table of tables) {
      const result = await pool2.query(`SELECT * FROM ${table};`);
      data[table] = result.rows;
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
app.use((err, _req, res, _next) => {
  console.error("\u274C Erreur serveur:", err);
  res.status(500).json({ message: "Erreur interne" });
});
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});
console.log("Routes disponibles :");
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(r.route.path);
  }
});
var port = process.env.PORT || 3e3;
app.listen(port, "0.0.0.0", () => {
  console.log(`\u{1F680} Server running at http://localhost:${port}`);
});
