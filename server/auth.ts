import bcrypt from 'bcryptjs';
import { storage } from './storage.js';
import type { InsertUser, User } from '../shared/schema.js';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static async register(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }): Promise<AuthUser> {
    // Validation des entrées
    if (!userData.email || !userData.password) {
      throw new Error('Email et mot de passe requis');
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Format d\'email invalide');
    }

    // Validation mot de passe
    if (userData.password.length < 8) {
      throw new Error('Le mot de passe doit contenir au moins 8 caractères');
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await storage.getUserByEmail(userData.email.toLowerCase().trim());
    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    // SÉCURITÉ: Empêcher l'inscription en tant qu'admin sauf pour l'email autorisé
    const authorizedAdminEmail = 'doriansarry@yahoo.fr';
    const requestedRole = userData.role || 'patient';

    if (requestedRole === 'admin' && userData.email.toLowerCase() !== authorizedAdminEmail.toLowerCase()) {
      throw new Error('Accès administrateur non autorisé pour cet email');
    }

    // Hacher le mot de passe
    const hashedPassword = await this.hashPassword(userData.password);

    // Créer l'utilisateur
    const newUser: InsertUser = {
      email: userData.email.toLowerCase().trim(),
      password: hashedPassword,
      firstName: userData.firstName?.trim() || null,
      lastName: userData.lastName?.trim() || null,
      role: requestedRole,
    };

    const user = await storage.createUser(newUser);
    
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }

  static async login(email: string, password: string): Promise<AuthUser> {
    // Validation des entrées
    if (!email || !password) {
      throw new Error('Email et mot de passe requis');
    }

    // Normalisation de l'email
    const normalizedEmail = email.toLowerCase().trim();

    // Trouver l'utilisateur par email
    const user = await storage.getUserByEmail(normalizedEmail);
    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isValidPassword = await this.verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      throw new Error('Compte désactivé');
    }

    // Mettre à jour la dernière connexion
    await storage.updateUserLastLogin(user.id);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }

  static async getUserById(id: string): Promise<AuthUser | null> {
    const user = await storage.getUser(id);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }

  static async updateUser(userId: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }): Promise<AuthUser> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    if (data.email && data.email !== user.email) {
      const existing = await storage.getUserByEmail(data.email);
      if (existing) {
        throw new Error("Cet email est déjà utilisé par un autre compte.");
      }
    }

    const updatedUser = await storage.updateUser(userId, {
      firstName: data.firstName ?? user.firstName,
      lastName: data.lastName ?? user.lastName,
      email: data.email ?? user.email,
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
    };
  }

  static async updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    if (!oldPassword || !newPassword) {
      throw new Error("L'ancien et le nouveau mot de passe sont requis.");
    }
    if (newPassword.length < 6) {
      throw new Error("Le nouveau mot de passe doit contenir au moins 6 caractères.");
    }

    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé.");
    }

    const isMatch = await this.verifyPassword(oldPassword, user.password);
    if (!isMatch) {
      throw new Error("L'ancien mot de passe est incorrect.");
    }

    const hashedNewPassword = await this.hashPassword(newPassword);
    await storage.updatePassword(userId, hashedNewPassword);
  }
}

// Middleware pour vérifier l'authentification
export function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.user) {
    return res.status(401).json({ message: 'Authentification requise' });
  }
  next();
}

// Middleware pour vérifier le rôle admin
export function requireAdmin(req: any, res: any, next: any) {
  if (!req.session?.user) {
    return res.status(401).json({ message: 'Authentification requise' });
  }
  
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès administrateur requis' });
  }
  
  next();
}

