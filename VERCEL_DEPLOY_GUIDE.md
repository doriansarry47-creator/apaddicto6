# Guide de Déploiement Vercel - Apaddicto

## ✅ État Actuel du Projet

Le projet est **prêt à être déployé** sur Vercel. Voici ce qui a été préparé :

### 📦 Build Réussi
- ✅ Client construit avec succès (dist/)
- ✅ Serveur compilé (server-dist/)
- ✅ Configuration Vercel en place (vercel.json)
- ✅ API endpoint configuré (api/index.js)

### 🔐 Token Vercel
Votre token Vercel : `hIcZzJfKyVMFAGh2QVfMzXc6`

## 🚀 Options de Déploiement

### Option 1 : Déploiement via Interface Web Vercel (RECOMMANDÉ)

1. **Allez sur** [vercel.com](https://vercel.com)
2. **Connectez-vous** avec votre compte
3. **Cliquez sur** "Add New Project"
4. **Importez** votre dépôt Git ou uploadez le dossier

#### Configuration du Projet :
```
Project Name: apaddicto
Framework Preset: Other
Build Command: npm run vercel-build
Output Directory: dist
Install Command: npm install
Node Version: 20.x
```

#### Variables d'Environnement (Settings > Environment Variables) :
```
DATABASE_URL=postgresql://neondb_owner:npg_vRJU7LlnYG1y@ep-soft-bush-ab0hbww0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
SESSION_SECRET=Apaddicto2024SecretKey
NODE_ENV=production
CORS_ORIGIN=https://votre-domaine.vercel.app
```

5. **Cliquez sur** "Deploy"

### Option 2 : Déploiement via CLI

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter avec le token
vercel login --token hIcZzJfKyVMFAGh2QVfMzXc6

# Déployer en production
vercel --prod
```

### Option 3 : Déploiement via Git (GitHub/GitLab)

1. Poussez votre code sur un dépôt Git
2. Sur Vercel, importez le dépôt
3. Vercel déploiera automatiquement à chaque push

## 📋 Checklist Post-Déploiement

Après le déploiement, vérifiez :

- [ ] L'URL de l'application est accessible
- [ ] `/api/health` retourne un statut OK
- [ ] La connexion à la base de données fonctionne
- [ ] Les sessions utilisateur fonctionnent
- [ ] L'authentification marche

## 🔧 Structure des Fichiers Importants

```
webapp/
├── dist/                    # Frontend compilé (servé par Vercel)
├── api/
│   └── index.js            # Serverless function pour l'API
├── server-dist/
│   └── index.js            # Serveur compilé
├── vercel.json             # Configuration Vercel
└── package.json            # Scripts et dépendances
```

## 🐛 Résolution de Problèmes

### Erreur : "Module not found"
- Vérifiez que toutes les dépendances sont dans `dependencies` (pas `devDependencies`)
- Relancez `npm install`

### Erreur : "Database connection failed"
- Vérifiez que `DATABASE_URL` est bien définie dans les variables d'environnement Vercel
- Testez la connexion avec `/api/debug`

### Erreur : "Build failed"
- Vérifiez les logs de build dans Vercel
- Testez localement : `npm run vercel-build`

## 📞 Support

Pour toute question, consultez :
- [Documentation Vercel](https://vercel.com/docs)
- [Guide Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)

## ✨ Prochaines Étapes

Une fois déployé :
1. Configurez un nom de domaine personnalisé (optionnel)
2. Configurez les variables d'environnement
3. Testez toutes les fonctionnalités
4. Créez un compte administrateur
5. Initialisez les données de base

---

**Date de préparation** : 20 octobre 2025
**Status** : ✅ Prêt pour le déploiement
