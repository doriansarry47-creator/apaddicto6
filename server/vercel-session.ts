// server/vercel-session.ts - Session middleware compatible avec Vercel
import session from 'express-session';

// Configuration session adaptée pour Vercel (serverless)
export const vercelSessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'Apaddicto2024SecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS en production
    httpOnly: true, // Protection XSS
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 jours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // Pour les cookies cross-site en production
  },
  // En mode serverless, les sessions ne persistent pas entre les invocations
  // Il faudrait idéalement utiliser un store Redis ou similaire pour la production
  store: undefined // Utilise le store par défaut (memory) pour l'instant
});

// Pour Vercel, on pourrait implémenter un store personnalisé qui utilise
// une base de données ou un service externe comme Redis ou DynamoDB
export default vercelSessionMiddleware;