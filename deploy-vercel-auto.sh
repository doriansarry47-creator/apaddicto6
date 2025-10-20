#!/bin/bash

echo "🚀 Déploiement Apaddicto sur Vercel"
echo "===================================="

# Configuration
export VERCEL_TOKEN="hIcZzJfKyVMFAGh2QVfMzXc6"
export VERCEL_ORG_ID=""  # Sera rempli automatiquement
export VERCEL_PROJECT_ID=""  # Sera rempli automatiquement

# Étape 1 : Vérifier que le build est OK
echo ""
echo "📦 Étape 1/4 : Vérification du build..."
if [ ! -d "dist" ]; then
    echo "❌ Le dossier dist/ n'existe pas. Lancement du build..."
    npm run build:client || exit 1
fi
echo "✅ Build vérifié"

# Étape 2 : Créer le fichier .vercel/project.json si nécessaire
echo ""
echo "⚙️  Étape 2/4 : Configuration du projet..."
mkdir -p .vercel

# Étape 3 : Déployer avec Vercel CLI
echo ""
echo "🚀 Étape 3/4 : Déploiement sur Vercel..."
echo "Utilisation du token fourni..."

npx vercel --token="$VERCEL_TOKEN" --yes --prod

# Étape 4 : Afficher le résultat
echo ""
echo "✅ Étape 4/4 : Déploiement terminé!"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Allez sur https://vercel.com/dashboard"
echo "2. Configurez les variables d'environnement :"
echo "   - DATABASE_URL"
echo "   - SESSION_SECRET"
echo "   - NODE_ENV=production"
echo "3. Testez votre application"
echo ""
echo "🔗 Documentation : voir VERCEL_DEPLOY_GUIDE.md"

