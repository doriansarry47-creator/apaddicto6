#!/bin/bash

# Script de déploiement Apaddicto sur Vercel
echo "🚀 Déploiement d'Apaddicto sur Vercel..."

# Vérifier que le build fonctionne
echo "📦 Vérification du build..."
npm run client:build

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build. Arrêt du déploiement."
    exit 1
fi

echo "✅ Build réussi !"

# Instructions pour l'authentification
echo ""
echo "🔑 AUTHENTIFICATION VERCEL REQUISE"
echo "Pour déployer, vous devez d'abord vous authentifier :"
echo ""
echo "1. Exécutez : npx vercel login"
echo "2. Suivez les instructions pour vous connecter via navigateur"
echo "3. Puis exécutez : npx vercel --prod"
echo ""
echo "ALTERNATIVE - Variables d'environnement à configurer dans Vercel Dashboard :"
echo ""
echo "DATABASE_URL=postgresql://neondb_owner:npg_vRJU7LlnYG1y@ep-soft-bush-ab0hbww0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
echo "SESSION_SECRET=Apaddicto2024SecretKey" 
echo "NODE_ENV=production"
echo ""
echo "🌐 Une fois configuré, votre application sera disponible sur Vercel !"

# Démarrer le processus d'authentification
echo "Voulez-vous commencer l'authentification maintenant ? (y/n)"
read -r response
if [[ $response =~ ^[Yy]$ ]]; then
    npx vercel login
    echo "Maintenant, déployez avec : npx vercel --prod"
fi