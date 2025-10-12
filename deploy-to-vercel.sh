#!/bin/bash

# Script de déploiement Apaddicto sur Vercel
# Token Vercel fourni : kTa8wiql0stR0ej18sz0FwQf

echo "🚀 Déploiement d'Apaddicto sur Vercel..."

# Vérifier que le build fonctionne
echo "📦 Vérification du build..."
npm run client:build

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build. Arrêt du déploiement."
    exit 1
fi

echo "✅ Build réussi !"

# Authentification avec Vercel
echo "🔑 Authentification avec Vercel..."
echo "kTa8wiql0stR0ej18sz0FwQf" | npx vercel login --token

# Configuration du projet pour Vercel
echo "⚙️ Configuration du projet Vercel..."

# Définir les variables d'environnement
echo "🌍 Configuration des variables d'environnement..."
npx vercel env add DATABASE_URL production --token kTa8wiql0stR0ej18sz0FwQf
npx vercel env add SESSION_SECRET production --token kTa8wiql0stR0ej18sz0FwQf  
npx vercel env add NODE_ENV production --token kTa8wiql0stR0ej18sz0FwQf

# Déploiement
echo "🚀 Déploiement en cours..."
npx vercel --prod --token kTa8wiql0stR0ej18sz0FwQf

echo "✅ Déploiement terminé !"
echo "🌐 Votre application sera bientôt disponible sur l'URL fournie par Vercel"