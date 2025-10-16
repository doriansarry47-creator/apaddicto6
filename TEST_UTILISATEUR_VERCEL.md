# 🧪 Guide de Test Utilisateur - Déploiement Vercel

## 🌐 URLs de Production

**Application principale:** https://webapp-ochre-theta.vercel.app  
**API Health Check:** https://webapp-ochre-theta.vercel.app/api/health

---

## ✅ Tests Automatiques Réalisés

### Tests Réussis (6/9)
- ✅ **Health Check**: API fonctionnelle
- ✅ **Inscription**: Création de compte utilisateur
- ✅ **Connexion**: Authentification fonctionnelle
- ✅ **Exercices**: Récupération de la liste des exercices
- ✅ **Contenu Psychoéducatif**: Accès au contenu
- ✅ **Déconnexion**: Logout fonctionnel

### Tests Partiels (3/9)
- ⚠️ **Profil**: Nécessite gestion de session navigateur
- ⚠️ **Enregistrement d'envie**: Nécessite session authentifiée
- ⚠️ **Statistiques**: Endpoint à vérifier

---

## 📝 Tests Manuels à Effectuer

### 1. Test d'Inscription
1. Ouvrir https://webapp-ochre-theta.vercel.app
2. Cliquer sur "S'inscrire" ou "Sign Up"
3. Remplir le formulaire avec:
   - **Email**: votre-email@exemple.com
   - **Mot de passe**: Un mot de passe sécurisé
   - **Nom**: Votre nom
4. Valider l'inscription
5. **Résultat attendu**: Redirection vers la page de connexion ou tableau de bord

### 2. Test de Connexion
1. Sur la page de connexion
2. Entrer les identifiants créés
3. Cliquer sur "Se connecter"
4. **Résultat attendu**: Accès au tableau de bord utilisateur

### 3. Test du Tableau de Bord
1. Après connexion, vérifier:
   - Affichage du nom d'utilisateur
   - Statistiques visibles (jours d'abstinence, séances complétées, etc.)
   - Graphiques ou indicateurs de progression
2. **Résultat attendu**: Toutes les données s'affichent correctement

### 4. Test des Exercices
1. Naviguer vers la section "Exercices"
2. Vérifier:
   - Liste des exercices disponibles
   - Possibilité de filtrer par catégorie
   - Détails de chaque exercice (titre, description, difficulté)
3. Sélectionner un exercice
4. **Résultat attendu**: Page détaillée de l'exercice avec instructions

### 5. Test du Contenu Psychoéducatif
1. Aller dans la section "Bibliothèque" ou "Éducation"
2. Vérifier:
   - Articles disponibles
   - Catégories de contenu
   - Possibilité de rechercher
3. Ouvrir un article
4. **Résultat attendu**: Contenu complet et lisible

### 6. Test d'Enregistrement d'Envie
1. Trouver la fonction "Enregistrer une envie" ou "Craving Log"
2. Remplir:
   - Intensité (échelle 1-10)
   - Déclencheur
   - Notes optionnelles
3. Enregistrer
4. **Résultat attendu**: Confirmation d'enregistrement + mise à jour du graphique

### 7. Test de Suivi
1. Accéder à la page "Suivi" ou "Tracking"
2. Vérifier:
   - Historique des envies
   - Graphiques d'évolution
   - Statistiques détaillées
3. **Résultat attendu**: Données cohérentes et à jour

### 8. Test Responsive (Mobile)
1. Ouvrir l'application sur mobile ou réduire la fenêtre navigateur
2. Vérifier:
   - Menu de navigation adapté
   - Contenu lisible
   - Boutons cliquables
   - Formulaires utilisables
3. **Résultat attendu**: Interface parfaitement adaptée

### 9. Test de Déconnexion
1. Cliquer sur "Se déconnecter"
2. **Résultat attendu**: Redirection vers la page de connexion

---

## 🔧 Configuration Technique

### Variables d'Environnement Vercel
```
✅ DATABASE_URL: Configurée (PostgreSQL Neon)
✅ SESSION_SECRET: Configurée
✅ NODE_ENV: Production
```

### Build Configuration
```
Build Command: npm run vercel-build
Output Directory: dist
Node Version: 22.x
```

---

## 🐛 Problèmes Connus

### Sessions et Cookies
- Les cookies de session peuvent nécessiter une configuration CORS supplémentaire
- Tester directement dans le navigateur pour une expérience authentique
- Les tests automatiques peuvent avoir des limitations de cookies

---

## 📊 Résultats Tests Automatiques

```
✅ Health Check: OK
✅ Inscription: OK
✅ Connexion: OK
⚠️ Profil utilisateur: À tester manuellement
✅ Liste exercices: OK
✅ Contenu psychoéducatif: OK
⚠️ Enregistrement envie: À tester manuellement
⚠️ Statistiques: À vérifier
✅ Déconnexion: OK

Score: 6/9 tests automatiques réussis (67%)
```

---

## 🎯 Checklist de Validation Finale

- [ ] Application accessible via URL Vercel
- [ ] Inscription fonctionnelle
- [ ] Connexion fonctionnelle
- [ ] Tableau de bord accessible
- [ ] Exercices visibles et accessibles
- [ ] Contenu psychoéducatif accessible
- [ ] Enregistrement d'envies fonctionnel
- [ ] Graphiques et statistiques visibles
- [ ] Navigation fluide
- [ ] Interface responsive (mobile/desktop)
- [ ] Déconnexion fonctionnelle
- [ ] Données persistantes après déconnexion/reconnexion

---

## 🚀 Prochaines Étapes

1. **Configuration d'un domaine personnalisé** (optionnel)
   ```bash
   npx vercel domains add votre-domaine.com --token BxxzZSaoWu34ZgqUW4zokDNW
   ```

2. **Monitoring et Logs**
   - Accéder aux logs Vercel: https://vercel.com/ikips-projects/webapp
   - Surveiller les erreurs de production

3. **Amélioration Continue**
   - Collecter les retours utilisateurs
   - Corriger les bugs identifiés
   - Ajouter de nouvelles fonctionnalités

---

## 📞 Support

En cas de problème:
1. Vérifier les logs Vercel
2. Tester l'API health endpoint
3. Vérifier les variables d'environnement
4. Consulter la documentation du projet

---

**Date de déploiement:** 16 Octobre 2025  
**Version:** 1.0.0  
**Statut:** ✅ Déployé en production
