# Nouveau Flux de Création de Séances - Documentation

## 🎯 Objectif
Mise en place d'un système avancé de création de séances avec protocoles sportifs professionnels (HIIT, TABATA, HICT, EMOM, AMRAP, etc.).

## ✅ Fonctionnalités Implémentées

### 1. Interface à 3 Colonnes

#### Colonne Gauche - Bibliothèque d'Exercices
- **Recherche instantanée** : Filtre les exercices par nom
- **Filtrage par catégorie** : Cardio, Force, Flexibilité, etc.
- **Ajout rapide** : Cliquer sur un exercice pour l'ajouter au bloc en cours
- **Affichage compact** : Carte avec titre, catégorie, et durée

#### Colonne Centrale - Constructeur de Séance
**Onglet "Construire"** :
1. **Sélection du protocole** (Radio buttons)
   - 🔴 HIIT (High-Intensity Interval Training)
   - 🟠 TABATA (20s/10s × 8)
   - 🟡 HICT (High-Intensity Circuit Training)
   - 🟢 EMOM (Every Minute On the Minute)
   - 🔵 E2MOM (Every 2 Minutes On the Minute)
   - 🟣 DEATH BY (Répétitions progressives)
   - 🟦 AMRAP (As Many Rounds As Possible)

2. **Configuration automatique des paramètres par défaut**
   - HIIT : 45s effort / 15s repos × 4 tours (personnalisable)
   - TABATA : 20s effort / 10s repos × 8 séries (fixe)
   - HICT : Nombre de répétitions par exercice (pas de timer)
   - EMOM : 10 reps/minute pendant 10 minutes
   - E2MOM : 15 reps toutes les 2 minutes pendant 10 minutes
   - DEATH BY : Répétitions incrémentales sur 10 minutes
   - AMRAP : Maximum de tours en 10 minutes

3. **Configuration du bloc**
   - Titre du bloc
   - Type : 🔥 Échauffement, 💪 Travail, 🌬️ Repos actif, 🧘 Retour au calme
   - Liste des exercices ajoutés
   - Notes optionnelles
   - Bouton "Ajouter le bloc à la séance"

**Onglet "Blocs"** :
- Vue d'ensemble de tous les blocs créés
- Carte colorée par protocole
- Actions rapides :
  - ⬆️ Monter / ⬇️ Descendre
  - 📋 Dupliquer
  - 🔀 Mélanger les exercices
  - 🗑️ Supprimer

#### Colonne Droite - Aperçu & Statistiques
**Statistiques en temps réel** :
- ⏱️ **Durée totale** (en minutes)
- ⚡ **Intensité moyenne** (% de temps de travail)
- 📊 **Ratio Travail/Repos** (ex: 3:1)
- 🎯 **Nombre de blocs**

**Timeline chronologique** :
- Vue séquentielle de tous les blocs
- Indicateurs visuels du type de bloc
- Badges du protocole utilisé

**Graphique d'effort/repos** :
- Barre de progression visuelle pour chaque bloc
- Gradient rouge-orange pour l'intensité
- Pourcentage d'effort par bloc

### 2. Protocoles Sportifs Implémentés

#### HIIT (High-Intensity Interval Training)
- ⚙️ Paramètres : Durée effort, durée repos, nombre de tours
- 📝 Format : `45s effort / 15s repos × 4 tours`
- 🎯 Usage : Entraînement cardio intense

#### TABATA
- ⚙️ Paramètres : Nombre de cycles (défaut : 8)
- 📝 Format : `20s effort / 10s repos × 8 séries`
- 🎯 Usage : Protocole standardisé haute intensité

#### HICT (High-Intensity Circuit Training)
- ⚙️ Paramètres : Répétitions par exercice
- 📝 Format : `10 répétitions par exercice`
- 🎯 Usage : Circuit training basé sur les reps, chronométré

#### EMOM (Every Minute On the Minute)
- ⚙️ Paramètres : Reps/minute, durée totale
- 📝 Format : `10 reps/minute pendant 10min`
- 🎯 Usage : Travail à intervalles réguliers

#### E2MOM (Every 2 Minutes On the Minute)
- ⚙️ Paramètres : Reps toutes les 2 minutes, durée totale
- 📝 Format : `15 reps toutes les 2 minutes pendant 10min`
- 🎯 Usage : Intervalles plus longs pour exercices complexes

#### DEATH BY
- ⚙️ Paramètres : Durée totale
- 📝 Format : `10min avec répétitions progressives`
- 🎯 Usage : Minute 1: 1 rep, Minute 2: 2 reps, etc.

#### AMRAP (As Many Rounds As Possible)
- ⚙️ Paramètres : Durée totale
- 📝 Format : `Maximum de tours en 10min`
- 🎯 Usage : Compléter le plus de tours possibles

### 3. Système de Blocs Visuels

#### Types de Blocs
1. **🔥 Échauffement** : Préparation physique
2. **💪 Travail** : Phase intensive principale
3. **🌬️ Repos actif** : Récupération active
4. **🧘 Retour au calme** : Étirements et relaxation

#### Actions sur les Blocs
- **Dupliquer** : Créer une copie identique
- **Mélanger** : Randomiser l'ordre des exercices
- **Déplacer** : Réorganiser la séquence
- **Supprimer** : Retirer un bloc

#### Affichage Visuel
- Bordure colorée selon le protocole
- Icône du type de bloc
- Badge du protocole
- Description condensée
- Liste des exercices inclus
- Notes personnalisées

### 4. Auto-Calculs et Statistiques

#### Calculs Automatiques
**Durée totale** :
- HIIT : `(effort + repos) × tours × nb_exercices`
- TABATA : `30s × 8 × nb_exercices = 4min par exercice`
- HICT : `(reps × 3s) + repos entre exercices`
- EMOM/E2MOM : `durée_totale × intervalle`
- DEATH BY : `durée_totale × 60s`
- AMRAP : `durée_totale × 60s`

**Intensité moyenne** :
- Ratio temps de travail / durée totale × 100
- Mise à jour en temps réel

**Ratio Travail/Repos** :
- Calcul : `temps_travail / temps_repos`
- Format : `3:1` (3 unités de travail pour 1 de repos)

### 5. Gestion des Patients

#### Publication de Séances
- Modal de sélection des patients
- Checkboxes pour choisir les destinataires
- Option de publication globale (tous les patients)
- Compteur de patients sélectionnés

#### Assignation
- Liaison entre séance et patients
- Statut : "Assignée", "Terminée", "Ignorée"
- Suivi des feedbacks patients

### 6. Intégration avec l'Existant

#### Non-Breaking Changes
- ✅ L'ancien `EnhancedSessionBuilder` reste fonctionnel
- ✅ Nouvel onglet "Protocoles Avancés" ajouté
- ✅ Système de sauvegarde compatible
- ✅ Même API de publication

#### Navigation
- Page : `/admin/manage-exercises-sessions`
- Onglets :
  1. Exercices
  2. Séances
  3. Créer une Séance (ancien builder)
  4. **Protocoles Avancés** (nouveau builder) ⭐
  5. Assignations Patients

## 🎨 Design & Ergonomie

### Palette de Couleurs par Protocole
- **HIIT** : Rouge (bg-red-100, text-red-800)
- **TABATA** : Orange (bg-orange-100, text-orange-800)
- **HICT** : Jaune (bg-yellow-100, text-yellow-800)
- **EMOM** : Vert (bg-green-100, text-green-800)
- **E2MOM** : Sarcelle (bg-teal-100, text-teal-800)
- **DEATH BY** : Violet (bg-purple-100, text-purple-800)
- **AMRAP** : Bleu (bg-blue-100, text-blue-800)

### Style Professionnel
- Interface bleue/anthracite
- Cartes avec ombres douces
- Timeline animée avec points de progression
- Barres de progression avec gradients
- Badges et icônes expressives

### Responsive
- Interface adaptative en 3 colonnes sur desktop
- Réduction progressive sur tablette
- ScrollArea pour éviter le défilement excessif

## 📊 Statistiques et Visualisations

### Cartes de Statistiques
1. **Durée Totale** (bleu)
   - Valeur en minutes
   - Icône : ⏱️ Clock

2. **Intensité Moyenne** (orange)
   - Pourcentage de travail
   - Icône : ⚡ Zap

3. **Ratio Travail/Repos** (violet)
   - Format X:1
   - Icône : 📈 TrendingUp

4. **Nombre de Blocs** (vert)
   - Compteur
   - Icône : 🎯 Target

### Timeline Chronologique
- Liste verticale avec ligne de connexion
- Points de progression animés
- Icônes de type de bloc
- Badges de protocole
- Informations condensées

### Graphique Effort/Repos
- Barre horizontale par bloc
- Gradient rouge-orange
- Pourcentage d'intensité
- Légende avec titre et protocole

## 🔧 Aspects Techniques

### Technologies Utilisées
- **React** + **TypeScript**
- **Shadcn/UI** : Composants UI (Card, Button, Input, Select, Tabs, Dialog, etc.)
- **Tailwind CSS** : Styling
- **Lucide React** : Icônes

### Structure des Données

#### ProtocolConfig
```typescript
interface ProtocolConfig {
  type: 'HIIT' | 'TABATA' | 'HICT' | 'EMOM' | 'E2MOM' | 'DEATH_BY' | 'AMRAP';
  workDuration?: number;
  restDuration?: number;
  rounds?: number;
  cycles?: number;
  repsPerExercise?: number;
  repsPerMinute?: number;
  totalMinutes?: number;
  interval?: number;
  totalDuration?: number;
  incrementalReps?: boolean;
}
```

#### SessionBlock
```typescript
interface SessionBlock {
  id: string;
  type: 'warmup' | 'work' | 'active_rest' | 'cooldown';
  title: string;
  protocol: ProtocolConfig;
  exercises: SessionExercise[];
  order: number;
  notes?: string;
}
```

#### AdvancedSession
```typescript
interface AdvancedSession {
  id?: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'morning' | 'evening' | 'crisis' | 'maintenance' | 'recovery';
  blocks: SessionBlock[];
  totalDuration: number;
  totalIntensity: number;
  workRestRatio: string;
  tags: string[];
  isPublic: boolean;
  warmupVideo?: string;
  cooldownNotes?: string;
}
```

## 📝 Utilisation

### Pour l'Administrateur/Thérapeute

1. **Accéder au constructeur**
   - Se connecter en tant qu'admin
   - Aller dans "Gérer Exercices & Séances"
   - Cliquer sur l'onglet "Protocoles Avancés"

2. **Créer une séance**
   - Remplir le titre, difficulté, catégorie en haut
   - Aller dans l'onglet "Construire"

3. **Choisir un protocole**
   - Sélectionner parmi HIIT, TABATA, HICT, EMOM, E2MOM, DEATH BY, AMRAP

4. **Configurer les paramètres**
   - Ajuster les durées, répétitions, tours selon le protocole
   - Les valeurs par défaut sont pré-remplies

5. **Ajouter des exercices**
   - Utiliser la bibliothèque à gauche
   - Cliquer sur les exercices pour les ajouter au bloc

6. **Configurer le bloc**
   - Donner un titre (ex: "Échauffement dynamique")
   - Choisir le type de bloc
   - Ajouter des notes si nécessaire
   - Cliquer sur "Ajouter le bloc à la séance"

7. **Répéter pour créer plusieurs blocs**
   - Échauffement + Travail principal + Retour au calme

8. **Visualiser et ajuster**
   - Consulter les statistiques à droite
   - Vérifier la timeline
   - Réorganiser les blocs si nécessaire (onglet "Blocs")

9. **Sauvegarder**
   - Cliquer sur "Sauvegarder" en haut à droite

10. **Publier (optionnel)**
    - Cliquer sur "Publier"
    - Sélectionner les patients destinataires
    - Confirmer

### Pour le Patient

1. **Recevoir la séance**
   - Notification de nouvelle séance assignée
   - Apparaît dans "Mes Séances"

2. **Consulter la séance**
   - Voir la description, durée, difficulté
   - Lire les blocs et protocoles

3. **Commencer la séance**
   - Suivre les instructions de chaque bloc
   - Respecter les temps de travail/repos selon le protocole

4. **Terminer et donner feedback**
   - Indiquer la durée réelle
   - Noter l'effort ressenti
   - Ajouter un commentaire

## 🚀 Déploiement

### GitHub
- ✅ Repository : `doriansarry47-creator/apaddicto`
- ✅ Branch : `main`
- ✅ Commit : `87d6263` - "feat: add advanced session builder with protocol support"

### Vercel
- ✅ URL Production : https://webapp-bi751ugjp-ikips-projects.vercel.app
- ✅ Build réussi
- ✅ Déploiement automatique activé

## 📦 Fichiers Créés/Modifiés

### Nouveaux Fichiers
1. `client/src/components/advanced-session-builder.tsx` (1194 lignes)
   - Composant principal du nouveau builder
   - Toute la logique de protocoles et blocs

### Fichiers Modifiés
1. `client/src/pages/admin/manage-exercises-sessions.tsx`
   - Ajout de l'import `AdvancedSessionBuilder`
   - Modification des TabsList (4 → 5 onglets)
   - Ajout du TabsContent "advanced-builder"

## 🎓 Concepts Métier

### Protocoles d'Entraînement
Les protocoles implémentés sont basés sur des méthodologies sportives reconnues :

- **HIIT** : Populaire pour la perte de poids et l'amélioration cardiovasculaire
- **TABATA** : Protocole scientifique de 4 minutes (étude Dr. Izumi Tabata)
- **HICT** : Recommandé par l'ACSM pour fitness général
- **EMOM** : Utilisé en CrossFit pour maintenir un rythme constant
- **DEATH BY** : Challenge progressif pour tester l'endurance
- **AMRAP** : Permet de mesurer la progression en comptant les tours

### Adaptation au Niveau
Chaque protocole peut être ajusté :
- **Débutant** : Temps de travail réduit, repos augmenté
- **Intermédiaire** : Paramètres standards
- **Avancé** : Temps de travail augmenté, repos réduit, plus de tours

## 🔮 Améliorations Futures Suggérées

### Fonctionnalités Bonus (Non implémentées)
1. **Génération automatique de séance**
   - "Créer un HIIT de 30 min axé bas du corps niveau intermédiaire"
   - IA pour suggérer les exercices et paramètres

2. **Mode visualisation mobile patient**
   - Chronomètre intégré
   - Audio "3…2…1…Go!"
   - Notifications de transition

3. **Export PDF**
   - Fiche imprimable de la séance
   - QR code pour accès mobile

4. **Import de modèles Invictus**
   - Bibliothèque de séances pré-configurées
   - Import depuis des templates

5. **Exercices de substitution automatiques**
   - Burpees → Air Squat pour niveau bas
   - Adaptation selon le niveau patient

6. **Graphiques avancés**
   - Courbe d'intensité sur toute la séance
   - Histogramme des groupes musculaires sollicités

## ✨ Points Forts de l'Implémentation

1. **Interface intuitive** : Flux logique en 3 étapes claires
2. **Visuels attractifs** : Couleurs, icônes, badges expressifs
3. **Feedback immédiat** : Statistiques en temps réel
4. **Flexibilité** : 7 protocoles différents, personnalisables
5. **Scalabilité** : Ajout facile de nouveaux protocoles
6. **Compatibilité** : N'affecte pas l'ancien système
7. **Professionnel** : Respecte les standards sportifs
8. **Ergonomique** : ScrollArea, responsive, navigation fluide

## 🎉 Conclusion

Le nouveau système de création de séances offre une **expérience professionnelle et complète** pour les thérapeutes sportifs. Il combine :

- ✅ Protocoles scientifiquement validés
- ✅ Interface moderne et intuitive
- ✅ Calculs automatiques précis
- ✅ Visualisations claires
- ✅ Gestion simplifiée des patients
- ✅ Déploiement réussi

**L'application est maintenant prête à être utilisée en production !** 🚀

---

**Date de création** : 13 octobre 2025
**Version** : 1.0.0
**Auteur** : GenSpark AI Developer
**Contact** : doriansarry47-creator/apaddicto
