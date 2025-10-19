import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerRoutes } from './routes.js';
import './migrate.js';
import { debugTablesRouter } from './debugTables.js';
import { Pool } from 'pg';

// Logger amélioré pour la production
const logger = {
  info: (message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO: ${message}`, meta ? JSON.stringify(meta) : '');
  },
  error: (message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`, error?.stack || error);
  },
  warn: (message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] WARN: ${message}`, meta ? JSON.stringify(meta) : '');
  }
};

// Pour obtenir __dirname dans ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === INITIALISATION EXPRESS ===
const app = express();

// === CONFIG CORS ===
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(','),
  credentials: true,
}));

// === PARSING JSON ===
app.use(express.json());

// === SERVIR LES FICHIERS STATIQUES ===
const distPath = path.join(__dirname, '..', 'dist');
console.log('📁 Serving static files from:', distPath);
app.use(express.static(distPath));

// === SESSION ===
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'lax',
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}));

// === ENDPOINTS DE BASE ===
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// === ROUTES DE L'APPLICATION ===
registerRoutes(app);
app.use('/api', debugTablesRouter);

// === CONNEXION POSTGRES ===
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// === ENDPOINT POUR LISTER LES TABLES ===
app.get('/api/tables', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    res.json(result.rows.map(r => r.table_name));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// === ENDPOINT POUR RENVOYER LE CONTENU DE TOUTES LES TABLES ===
app.get('/api/data', async (_req, res) => {
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

    const data: Record<string, any[]> = {};

    for (const table of tables) {
      const result = await pool.query(`SELECT * FROM ${table};`);
      data[table] = result.rows;
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// === MIDDLEWARE DE GESTION D'ERREURS ===
app.use((err: any, req: any, res: any, _next: any) => {
  logger.error('Erreur serveur non gérée', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.session?.user?.id,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  // Ne pas exposer les détails d'erreur en production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const errorResponse = {
    message: isDevelopment ? err.message : 'Erreur interne du serveur',
    ...(isDevelopment && { stack: err.stack })
  };

  res.status(err.status || 500).json(errorResponse);
});

// === FALLBACK POUR SPA (Single Page Application) ===
// Toutes les routes non-API doivent servir le fichier index.html pour React Router
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// === DEBUG ROUTES DISPONIBLES ===
console.log("Routes disponibles :");
app._router.stack.forEach((r: any) => {
  if (r.route && r.route.path) {
    console.log(r.route.path);
  }
});

// === LANCEMENT DU SERVEUR ===
const port = parseInt(process.env.PORT || '3000', 10);
app.listen(port, '0.0.0.0', () => {
  logger.info(`🚀 Server running at http://localhost:${port}`, {
    port,
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});
