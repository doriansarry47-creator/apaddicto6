const { drizzle } = require("drizzle-orm/node-postgres");
const { Client } = require("pg");
const { educationalContents, contentCategories, contentTags } = require("./shared/schema");

// Configuration de la base de données
const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_vRJU7LlnYG1y@ep-soft-bush-ab0hbww0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require",
});

const db = drizzle(client);

// Catégories de contenu éducatif
const categories = [
  {
    name: "Addiction et APA",
    description: "Comprendre le lien entre addiction et activité physique adaptée",
    color: "red",
    icon: "psychology",
    order: 1
  },
  {
    name: "Science de l'Exercice",
    description: "Les bases scientifiques de l'efficacité de l'exercice contre les cravings",
    color: "blue",
    icon: "science",
    order: 2
  },
  {
    name: "Techniques Pratiques",
    description: "Méthodes concrètes et exercices pratiques",
    color: "green",
    icon: "fitness_center",
    order: 3
  },
  {
    name: "Prévention Rechute",
    description: "Stratégies pour prévenir et gérer les rechutes",
    color: "orange",
    icon: "shield",
    order: 4
  }
];

// Contenu éducatif basé sur le cahier des charges
const educationalContent = [
  {
    title: "Pourquoi l'activité physique aide contre l'addiction ?",
    description: "Explication simple : baisse du craving, diminution du stress, amélioration de l'humeur.",
    type: "text",
    categoryName: "Addiction et APA",
    tags: ["basics", "neuroscience", "craving"],
    content: `## Pourquoi l'activité physique aide contre l'addiction ?

L'activité physique adaptée (APA) est un outil puissant dans la gestion de l'addiction. Voici pourquoi :

## Les mécanismes neurobiologiques

### 1. Libération d'endorphines naturelles
- L'exercice stimule la production d'endorphines, nos "hormones du bonheur"
- Ces molécules agissent sur les mêmes récepteurs que certaines substances addictives
- Elles procurent une sensation de bien-être naturelle et durable

### 2. Régulation de la dopamine
- L'addiction déséquilibre le système de récompense du cerveau
- L'exercice aide à restaurer un niveau de dopamine plus équilibré
- Cela réduit progressivement l'intensité des cravings

### 3. Réduction du stress et de l'anxiété
- L'activité physique diminue les niveaux de cortisol (hormone du stress)
- Le stress est un déclencheur majeur de rechute
- L'exercice offre une alternative saine pour gérer les tensions

## Bénéfices concrets

- **Réduction immédiate** : Diminution des cravings en 5-10 minutes d'exercice
- **Amélioration de l'humeur** : Effet antidépresseur naturel
- **Meilleur sommeil** : Régulation des cycles veille-sommeil
- **Confiance en soi** : Sentiment d'accomplissement et de contrôle
- **Structure quotidienne** : L'exercice crée des routines positives

## Points clés à retenir

- L'effet anti-craving de l'exercice est scientifiquement prouvé
- Même 5 minutes d'activité peuvent faire une différence
- L'intensité modérée est souvent plus efficace que l'exercice intense
- La régularité est plus importante que l'intensité`,
    difficulty: "easy",
    estimatedReadTime: 3,
    thumbnailUrl: "",
    isRecommended: true
  },
  
  {
    title: "Bouger 5 minutes pour réduire une envie",
    description: "Conseils pratiques : jumping jacks, marche rapide, pompes sur les genoux.",
    type: "text",
    categoryName: "Techniques Pratiques",
    tags: ["urgence", "exercices", "pratique"],
    content: `## Bouger 5 minutes pour réduire une envie

Quand un craving intense survient, ces exercices simples peuvent vous aider immédiatement :

## Exercices d'urgence (1-2 minutes chacun)

### 1. Jumping Jacks (Écartés sautés)
- **Technique** : Sautez en écartant bras et jambes, puis revenez position initiale
- **Durée** : 30 secondes à 1 minute
- **Bénéfice** : Active tout le corps, libère rapidement des endorphines

### 2. Marche rapide ou sur place
- **Technique** : Marchez énergiquement, levez bien les genoux
- **Durée** : 2-3 minutes
- **Bénéfice** : Facile à faire partout, apaise l'agitation mentale

### 3. Pompes adaptées
- **Sur les genoux** : Plus accessible pour débuter
- **Contre un mur** : Version encore plus douce
- **Durée** : 10-15 répétitions
- **Bénéfice** : Renforce et recentre l'attention

### 4. Montées de genoux
- **Technique** : Alternez en montant un genou vers la poitrine
- **Durée** : 30-45 secondes
- **Bénéfice** : Améliore la circulation, énergise

### 5. Étirements dynamiques
- **Bras en cercle** : Rotations amples des bras
- **Flexions latérales** : Penchez-vous à gauche et droite
- **Durée** : 1-2 minutes
- **Bénéfice** : Détend les tensions, recentre l'esprit

## Conseils d'utilisation

### Quand utiliser ?
- Dès que vous ressentez un craving
- Avant qu'il atteigne son pic d'intensité
- En complément d'autres techniques (respiration, etc.)

### Comment optimiser ?
- **Respirez profondément** pendant l'exercice
- **Concentrez-vous** sur les sensations physiques
- **Enchaînez** 2-3 exercices différents
- **Évaluez** votre état avant/après

### Adaptations selon le lieu
- **À la maison** : Tous les exercices
- **Au bureau** : Étirements, marche sur place discrète
- **En public** : Marche rapide, étirements subtils
- **Espace restreint** : Pompes murales, montées de genoux

## Science derrière la technique

L'exercice de courte durée :
- Détourne l'attention du craving
- Active le système nerveux parasympathique
- Libère des neurotransmetteurs anti-stress
- Crée une sensation de contrôle et d'accomplissement

*Rappelez-vous : même 30 secondes d'activité peuvent changer votre état mental !*`,
    difficulty: "easy",
    estimatedReadTime: 2,
    thumbnailUrl: "",
    isRecommended: true
  },

  {
    title: "L'APA comme outil de prévention de rechute",
    description: "Témoignages et explication scientifique de l'efficacité de l'activité physique.",
    type: "text",
    categoryName: "Prévention Rechute",
    tags: ["prevention", "rechute", "temoignages"],
    content: `## L'APA comme outil de prévention de rechute

L'Activité Physique Adaptée n'est pas seulement efficace pour gérer les cravings immédiats, elle constitue un pilier fondamental de la prévention des rechutes.

## Témoignages de patients

### Sarah, 34 ans - En rémission depuis 18 mois
*"Au début, courir 10 minutes me semblait insurmontable. Maintenant, c'est mon premier réflexe quand je me sens fragile. L'exercice m'a redonné confiance en ma capacité à gérer mes envies."*

### Marc, 28 ans - 2 ans sans rechute
*"Le sport m'a structuré. Mes séances de musculation le matin créent un rythme positif pour toute la journée. Quand j'ai envie de consommer, je me rappelle mes progrès physiques."*

### Lisa, 45 ans - Thérapeute et ancienne patiente
*"En tant que professionnelle, j'ai vu l'impact transformateur de l'APA. Personnellement, la danse m'a sauvée lors de mes moments les plus difficiles."*

## Base scientifique de l'efficacité

### 1. Neuroplasticité et récupération cérébrale
- **Neurogénèse** : L'exercice favorise la croissance de nouveaux neurones
- **Myélinisation** : Améliore la communication entre zones cérébrales
- **BDNF** : Augmente le facteur neurotrophique dérivé du cerveau

### 2. Régulation émotionnelle
- **Cortex préfrontal** : L'exercice renforce cette zone clé du contrôle des impulsions
- **Amygdale** : Diminue la réactivité au stress et aux déclencheurs
- **Système limbique** : Équilibre les circuits de la récompense

### 3. Facteurs psychologiques protecteurs

#### Auto-efficacité
- Chaque séance d'exercice renforce la confiance en ses capacités
- Développe un sentiment de contrôle sur sa vie
- Prouve qu'on peut surmonter des défis

#### Estime de soi
- Amélioration de l'image corporelle
- Sentiment d'accomplissement régulier
- Fierté des progrès physiques

#### Structure et routine
- Crée des habitudes positives
- Remplace progressivement les anciens rituels
- Donne un sens et un objectif quotidien

## Mécanismes de prévention des rechutes

### 1. Gestion des déclencheurs
L'APA aide à :
- **Identifier** les signaux de risque précoces
- **Interrompre** la cascade menant à la rechute
- **Rediriger** l'énergie vers des comportements sains

### 2. Alternatives aux stratégies d'évitement
Au lieu de fuir les difficultés :
- **Affronter** le stress par l'activité
- **Transformer** l'anxiété en énergie physique
- **Construire** de la résilience face aux défis

### 3. Réseau social de soutien
- Clubs de sport et groupes d'activité
- Partenaires d'entraînement bienveillants
- Communautés partageant des valeurs de santé

## Recommandations pratiques

### Fréquence optimale
- **Minimum** : 3 séances par semaine
- **Idéal** : Activité quotidienne même légère
- **Variété** : Alterner différents types d'exercices

### Types d'activités recommandées
1. **Cardio modéré** : Marche, vélo, natation
2. **Renforcement** : Musculation, exercices au poids du corps
3. **Mindfulness corporel** : Yoga, tai-chi, Pilates
4. **Sports collectifs** : Volleyball, basketball (aspect social)

### Signaux d'alerte à surveiller
- Abandon soudain de l'activité physique
- Diminution de la motivation pour l'exercice
- Retour aux anciens rythmes de vie sédentaires

*L'APA n'est pas juste un complément au traitement - elle en est un pilier fondamental.*`,
    difficulty: "intermediate",
    estimatedReadTime: 5,
    thumbnailUrl: "",
    isRecommended: true
  },

  {
    title: "Comprendre le craving",
    description: "Support théorique + exercices de respiration et activité physique.",
    type: "text",
    categoryName: "Addiction et APA",
    tags: ["craving", "theorie", "respiration"],
    content: `## Comprendre le craving

Le craving est une expérience universelle dans le processus de rétablissement. Comprendre ses mécanismes est la première étape pour mieux le gérer.

## Qu'est-ce que le craving ?

### Définition
Le craving est une **envie intense et irrésistible** de consommer une substance ou d'adopter un comportement addictif. C'est plus qu'une simple envie - c'est une expérience qui peut mobiliser tout votre être.

### Caractéristiques du craving
- **Intensité** : Peut aller de légère gêne à urgence extrême
- **Durée** : Généralement 3-15 minutes, rarement plus de 30 minutes
- **Fréquence** : Variable selon la phase de rétablissement
- **Déclencheurs** : Émotions, lieux, personnes, situations

## La courbe du craving

Le craving suit une courbe prévisible :
- Il monte rapidement (2-5 minutes)
- Il atteint un pic d'intensité 
- Il redescend naturellement
- Il disparaît complètement (généralement 10-20 minutes)

**Points clés :**
- Le craving **monte rapidement** (2-5 minutes)
- Il **atteint un pic** puis **redescend naturellement**
- Il **disparaît toujours**, même sans action

## Les déclencheurs courants

### Déclencheurs émotionnels
- **Stress** : Pression au travail, conflits relationnels
- **Tristesse** : Deuil, déception, solitude
- **Colère** : Frustration, injustice ressentie
- **Joie** : Paradoxalement, les moments heureux peuvent déclencher des envies

### Déclencheurs environnementaux
- **Lieux** : Anciens lieux de consommation
- **Personnes** : Contacts liés à l'usage
- **Objets** : Matériel, paraphernalia
- **Moments** : Heures habituelles de consommation

### Déclencheurs physiques
- **Fatigue** : Épuisement physique ou mental
- **Faim** : Chute de glycémie
- **Douleur** : Physique ou émotionnelle
- **Hormones** : Cycles menstruels, stress hormonal

## Exercices anti-craving

### 1. Respiration contrôlée (30 secondes - 2 minutes)

#### Technique 4-7-8
1. **Inspirez** par le nez pendant 4 temps
2. **Retenez** votre souffle pendant 7 temps  
3. **Expirez** par la bouche pendant 8 temps
4. **Répétez** 4-6 cycles

#### Respiration abdominale
1. **Posez** une main sur la poitrine, une sur le ventre
2. **Respirez** pour que seule la main du ventre bouge
3. **Inspirez** lentement pendant 4 secondes
4. **Expirez** lentement pendant 6 secondes

### 2. Activité physique immédiate (30 secondes - 5 minutes)

#### Séquence d'urgence
1. **10 jumping jacks** (30 secondes)
2. **Marche rapide** sur place (1 minute)
3. **5 pompes** (genoux si nécessaire)
4. **Étirements** bras et cou (30 secondes)

#### Alternative discrète
1. **Serrer/desserrer** les poings 10 fois
2. **Contracter** les muscles des jambes 5 secondes
3. **Rouler** les épaules en arrière 10 fois
4. **Respiration** profonde 5 cycles

## Stratégies cognitives

### 1. Technique de l'observateur
- **Nommez** le craving : "Je remarque que j'ai un craving"
- **Décrivez** les sensations physiques
- **Observez** sans jugement, comme un scientifique
- **Rappelez-vous** : "Ceci va passer"

### 2. La métaphore de la vague
- Le craving est comme une **vague** dans l'océan
- Vous pouvez **surfer** dessus plutôt que d'être emporté
- Chaque vague **monte et redescend** naturellement
- Vous devenez plus **habile** à surfer avec la pratique

### 3. Le jeu des 10 minutes
- **Négociez** avec votre craving : "Pas maintenant, peut-être dans 10 minutes"
- **Occupez-vous** activement pendant ces 10 minutes
- **Répétez** si nécessaire : souvent le craving aura diminué

## Exercice pratique : Mon plan anti-craving

**Identifiez vos déclencheurs principaux :**
1. _____________________
2. _____________________
3. _____________________

**Choisissez 3 techniques qui vous parlent :**
1. _____________________
2. _____________________  
3. _____________________

**Testez cette semaine et notez l'efficacité de chaque technique sur 10.**

*Rappelez-vous : Chaque craving surmonté renforce votre capacité à gérer le suivant.*`,
    difficulty: "easy",
    estimatedReadTime: 4,
    thumbnailUrl: "",
    isRecommended: false
  },

  {
    title: "Techniques de respiration avancées",
    description: "Maîtrisez différentes méthodes de respiration pour gérer l'anxiété et les cravings.",
    type: "text",
    categoryName: "Techniques Pratiques",
    tags: ["respiration", "anxiete", "techniques"],
    content: `## Techniques de respiration avancées

La respiration est votre outil le plus accessible pour gérer l'anxiété, le stress et les cravings. Ces techniques avancées vous donneront plus d'options selon les situations.

## Fondamentaux de la respiration thérapeutique

### Anatomie respiratoire
- **Diaphragme** : Principal muscle respiratoire
- **Système nerveux** : La respiration influence directement l'état de stress/détente
- **Nerf vague** : Stimulé par la respiration profonde, active la relaxation

### Principes de base
- **Lenteur** : Plus c'est lent, plus c'est efficace
- **Profondeur** : Respiration abdominale vs thoracique
- **Régularité** : Rythme constant plus important que vitesse
- **Attention** : Concentration sur le processus respiratoire

## Techniques niveau débutant

### 1. Respiration carrée (Box Breathing)
**Utilisation :** Stress modéré, besoin de recentrage
**Durée :** 2-5 minutes

**Technique :**
- Inspirez pendant 4 temps
- Retenez pendant 4 temps
- Expirez pendant 4 temps
- Pause pendant 4 temps
- Répétez le cycle

**Visualisation :** Imaginez dessiner un carré avec votre respiration

### 2. Respiration 4-7-8 (Dr. Andrew Weil)
**Utilisation :** Anxiété élevée, insomnie, cravings intenses
**Durée :** 4 cycles maximum au début

**Technique :**
- Expirez complètement par la bouche
- Fermez la bouche, inspirez par le nez (4 temps)
- Retenez votre souffle (7 temps)
- Expirez par la bouche avec un son "whoosh" (8 temps)

**Attention :** Peut provoquer des étourdissements - commencez doucement

## Techniques niveau intermédiaire

### 3. Respiration alternée (Nadi Shodhana)
**Utilisation :** Équilibrage émotionnel, préparation à la méditation
**Durée :** 5-10 minutes

**Technique :**
- Utilisez le pouce droit pour fermer la narine droite
- Inspirez par la narine gauche (4 temps)
- Fermez la narine gauche avec l'annulaire
- Ouvrez la narine droite, expirez (4 temps)
- Inspirez par la narine droite (4 temps)
- Fermez la droite, ouvrez la gauche, expirez (4 temps)
- Continuez l'alternance

### 4. Respiration en vagues (Wave Breathing)
**Utilisation :** Relaxation profonde, gestion de la douleur
**Durée :** 5-15 minutes

**Technique :**
- Inspirez en visualisant une vague qui monte depuis le ventre
- La vague remonte vers la poitrine, puis vers la gorge
- Expirez en laissant la vague redescendre
- Chaque respiration est une vague complète
- Créez un rythme fluide et continu

## Techniques niveau avancé

### 5. Respiration du feu (Kapalabhati)
**Utilisation :** Énergisation, clarté mentale, combat de la fatigue
**Durée :** 1-3 minutes par série

**Technique :**
- Position assise, dos droit
- Inspirations passives, expirations actives et rapides
- Contractez abdomen à chaque expiration
- Rythme : 1-2 expirations par seconde
- Faites 20-30 cycles, puis pause

**Précautions :** Éviter si problèmes cardiaques ou pression artérielle élevée

### 6. Respiration cohérence cardiaque
**Utilisation :** Régulation émotionnelle, amélioration de la variabilité cardiaque
**Durée :** 5 minutes (300 secondes)

**Technique :**
- 5 secondes d'inspiration
- 5 secondes d'expiration
- Soit 6 respirations par minute
- Maintenir ce rythme exactement pendant 5 minutes
- Utilisez une application ou un métronome

## Applications spécifiques aux cravings

### Pour craving soudain et intense
**Technique recommandée :** 4-7-8
**Pourquoi :** Effet rapide sur le système nerveux, détournement immédiat de l'attention

### Pour anxiété chronique
**Technique recommandée :** Cohérence cardiaque
**Pourquoi :** Régulation durable du système nerveux autonome

### Pour agitation physique
**Technique recommandée :** Respiration du feu suivie de respiration carrée
**Pourquoi :** Évacue l'énergie nerveuse puis apaise

### Pour ruminations mentales
**Technique recommandée :** Respiration alternée
**Pourquoi :** Équilibre les hémisphères cérébraux, calme le mental

## Programme d'entraînement progressif

### Semaine 1-2 : Bases
- Respiration abdominale : 5 min/jour
- Respiration carrée : 2-3 fois/jour

### Semaine 3-4 : Développement
- Ajout de la technique 4-7-8
- Cohérence cardiaque : 1 fois/jour

### Semaine 5+ : Approfondissement
- Respiration alternée
- Respiration en vagues
- Adaptation selon les besoins

## Conseils de pratique

### Environnement optimal
- **Lieu calme** sans distractions
- **Position confortable** (assis ou allongé)
- **Vêtements amples** au niveau de l'abdomen
- **Température** agréable

### Signaux d'efficacité
- Ralentissement du rythme cardiaque
- Sensation de détente musculaire
- Diminution des pensées anxieuses
- Amélioration de la concentration

### Erreurs à éviter
- **Forcer** la respiration (doit rester confortable)
- **Respirer trop vite** au début
- **Abandonner** après quelques secondes
- **Pratiquer** seulement en cas de crise (l'entraînement régulier améliore l'efficacité)

*La respiration est votre pharmacie intérieure - plus vous pratiquez, plus elle devient efficace.*`,
    difficulty: "intermediate",
    estimatedReadTime: 6,
    thumbnailUrl: "",
    isRecommended: false
  },

  {
    title: "Séances types HIIT poids du corps",
    description: "Séances d'entraînement structurées pour différents niveaux : débutant, urgence, avancé.",
    type: "text",
    categoryName: "Techniques Pratiques",
    tags: ["hiit", "entrainement", "seances"],
    content: `## Séances types HIIT poids du corps

Le HIIT (High Intensity Interval Training) au poids du corps est parfaitement adapté à la gestion des cravings. Ces séances offrent un maximum de bénéfices en un minimum de temps.

## Pourquoi le HIIT pour l'addiction ?

### Bénéfices spécifiques
- **Libération d'endorphines maximale** en peu de temps
- **Amélioration rapide** de la condition physique
- **Boost de confiance** grâce aux progrès visibles
- **Gestion du stress** par évacuation de l'énergie négative
- **Flexibilité** : peut se faire partout, sans matériel

### Principes du HIIT
- **Alternance** : Effort intense / Récupération active
- **Intensité** : 80-90% de l'effort maximum pendant les phases actives
- **Brevité** : Séances courtes mais efficaces
- **Progression** : Adaptable selon le niveau

## SÉANCE DÉBUTANT - 20 minutes

*Parfaite pour commencer ou reprendre une activité*

### Échauffement (5 minutes)
1. **Marche sur place** (1 min) - bras en mouvement
2. **Rotations articulaires** (2 min)
   - Épaules : 10 rotations avant/arrière
   - Bras : 10 rotations grandes amplitudes
   - Hanches : 10 rotations chaque sens
   - Genoux : 10 flexions
3. **Montées de genoux** (1 min) - rythme modéré
4. **Étirements dynamiques** (1 min)

### Circuit principal (12 minutes)
**Format :** 30 secondes d'effort / 30 secondes de récupération
**Répéter 3 fois avec 1 minute de repos entre les tours**

#### Tour 1, 2 et 3 :
1. **Air squat** (30 sec)
   - Pieds écartés largeur d'épaules
   - Descendre comme pour s'asseoir
   - Garder le dos droit
   - *Récupération :* Marche sur place (30 sec)

2. **Pompes sur les genoux** (30 sec)
   - Genoux au sol, mains sous les épaules
   - Descendre la poitrine vers le sol
   - *Alternative :* Pompes contre le mur si trop difficile
   - *Récupération :* Étirements bras (30 sec)

3. **Crunchs** (30 sec)
   - Allongé, mains derrière la tête
   - Relever légèrement les épaules
   - Contracter les abdominaux
   - *Récupération :* Genoux vers poitrine (30 sec)

4. **Jumping jacks modifiés** (30 sec)
   - Step-touch si jumping trop intense
   - Bras qui montent et descendent
   - *Récupération :* Respiration profonde (30 sec)

### Retour au calme (3 minutes)
1. **Marche lente** (1 min)
2. **Étirements statiques** (2 min)
   - Quadriceps : 20 sec chaque jambe
   - Ischio-jambiers : 20 sec chaque jambe
   - Épaules et bras : 20 sec chaque bras

---

## SÉANCE URGENCE CRAVING - 10 minutes

*Pour les moments de craving intense*

### Principe
**Format :** Enchaînement rapide sans pause - l'objectif est de détourner l'attention du craving

### Circuit (répéter 2 tours)

#### Tour 1 :
1. **20 burpees adaptés** (2 min)
   - Version complète ou step-back selon capacité
   - Rythme soutenu mais contrôlé

2. **20 mountain climbers** (1 min)
   - Position planche, genoux alternés vers poitrine
   - Rythme rapide

3. **20 sit-ups** (1 min)  
   - Abdominaux complets
   - Mains derrière tête

4. **Gainage frontal** (1 min)
   - Maintenir position planche
   - Adapter sur genoux si nécessaire

*Repos actif 30 secondes (marche sur place)*

#### Tour 2 : Même séquence
- **Intensité** : Donner le maximum d'énergie
- **Focus** : Concentration totale sur l'exercice
- **Respiration** : Contrôlée même dans l'effort

### Retour au calme intensif (30 secondes)
- **Respiration 4-7-8** : 4 cycles
- **Auto-évaluation** : Noter l'évolution du craving sur 10

---

## SÉANCE AVANCÉE - 30 minutes

*Pour utilisateurs expérimentés cherchant un défi*

### Échauffement dynamique (5 minutes)
1. **Jogging sur place** (1 min)
2. **Burpees lents** (1 min) - 6 répétitions contrôlées
3. **Pompes dynamiques** (1 min) - avec claquement si possible
4. **Squats jump** (1 min) - 10 répétitions
5. **Mobilité complète** (1 min) - toutes articulations

### Circuit principal (22 minutes)
**Format :** 45 secondes d'effort / 15 secondes de transition
**4 tours avec 1 minute de repos entre chaque tour**

#### Tour 1-4 :
1. **Squats pistols alternés** (45 sec)
   - Squat sur une jambe
   - *Alternative :* Squat surélevé avec assistance

2. **Pompes claquées** (45 sec)
   - Pompe explosive avec claquement des mains
   - *Alternative :* Pompes rapides normales

3. **Dips sur banc** (45 sec)
   - Utiliser chaise ou rebord
   - Descendre coudes à 90°

4. **Jumping jacks explosifs** (45 sec)
   - Amplitude et vitesse maximales
   - Coordination bras-jambes

5. **Gainage araignée** (45 sec)
   - Position planche, genoux alternés vers coudes
   - *Alternative :* Planche simple avec levées de jambes

*Repos entre tours : 1 minute (hydratation + respiration)*

### Finisher (2 minutes)
**Intensité maximale** - Vider les réservoirs
- **Burpees** (30 sec) - Maximum de répétitions
- **Mountain climbers** (30 sec) - Rythme explosif  
- **Squat jumps** (30 sec) - Puissance maximale
- **Planche** (30 sec) - Tenir jusqu'au bout

### Récupération active (3 minutes)
1. **Marche** (1 min) - récupération cardio
2. **Étirements complets** (2 min)
   - Chaque groupe musculaire : 15-20 sec
   - Focus sur respiration profonde

---

## Adaptations et progressions

### Comment progresser ?
1. **Semaine 1-2** : Maîtriser les mouvements
2. **Semaine 3-4** : Augmenter l'intensité  
3. **Semaine 5+** : Ajouter des variantes

### Signaux de bonne intensité
- **Essoufflement** important mais contrôlé
- **Transpiration** abondante
- **Muscle fatigue** sans douleur
- **Sensation** d'avoir "tout donné"

### Adaptations selon les capacités

#### Si trop facile :
- Augmenter les temps d'effort
- Diminuer les temps de repos
- Ajouter des variantes plus difficiles

#### Si trop difficile :
- Réduire l'intensité des mouvements
- Augmenter les temps de repos
- Choisir des variantes plus simples

### Erreurs à éviter
- **Négliger l'échauffement** : risque de blessure
- **Technique incorrecte** : privilégier la forme sur la vitesse
- **Progression trop rapide** : écouter son corps
- **Oublier la récupération** : partie intégrante de l'entraînement

## Planning hebdomadaire suggéré

### Débutant
- **Lundi/Mercredi/Vendredi** : Séance débutant
- **Mardi/Jeudi** : Marche ou activité douce
- **Week-end** : Une séance au choix

### Intermédiaire
- **Lundi/Mercredi/Vendredi** : Séance avancée
- **Mardi/Jeudi** : Séance débutant ou activité cardio
- **Samedi** : Séance urgence (entraînement)
- **Dimanche** : Repos actif

### Urgence (craving)
- **Immédiat** : Séance urgence 10 minutes
- **Complément** : Techniques de respiration
- **Suivi** : Évaluation de l'efficacité

*Rappelez-vous : L'important n'est pas la perfection, mais la régularité et l'engagement.*`,
    difficulty: "intermediate",
    estimatedReadTime: 8,
    thumbnailUrl: "",
    isRecommended: true
  }
];

async function createCategories() {
  console.log("🏗️ Création des catégories de contenu...");
  
  for (const category of categories) {
    try {
      await db.insert(contentCategories).values(category).onConflictDoNothing();
      console.log(`✅ Catégorie créée : ${category.name}`);
    } catch (error) {
      console.log(`ℹ️ Catégorie existe déjà : ${category.name}`);
    }
  }
}

async function createEducationalContent() {
  console.log("\n📚 Création du contenu éducatif...");

  // Récupérer les catégories existantes
  const existingCategories = await db.select().from(contentCategories);
  const categoryMap = {};
  existingCategories.forEach(cat => {
    categoryMap[cat.name] = cat.id;
  });

  for (const content of educationalContent) {
    try {
      const contentData = {
        title: content.title,
        description: content.description,
        type: content.type,
        categoryId: categoryMap[content.categoryName] || null,
        tags: content.tags,
        content: content.content,
        difficulty: content.difficulty,
        estimatedReadTime: content.estimatedReadTime,
        thumbnailUrl: content.thumbnailUrl || null,
        mediaUrl: null,
        mediaType: null,
        status: 'published',
        isRecommended: content.isRecommended,
        viewCount: 0,
        likeCount: 0,
        authorId: null,
        publishedAt: new Date(),
        isActive: true
      };

      await db.insert(educationalContents).values(contentData).onConflictDoNothing();
      console.log(`✅ Contenu créé : ${content.title}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la création de "${content.title}":`, error);
    }
  }
}

async function main() {
  try {
    console.log("🚀 Démarrage de la création du contenu éducatif enrichi...\n");
    
    await client.connect();
    console.log("✅ Connexion à la base de données établie");

    await createCategories();
    await createEducationalContent();

    console.log("\n🎉 Création du contenu éducatif terminée avec succès !");
    console.log("\n📊 Résumé :");
    console.log(`- ${categories.length} catégories créées/mises à jour`);
    console.log(`- ${educationalContent.length} articles éducatifs créés`);
    console.log("\n💡 Les utilisateurs peuvent maintenant accéder à ce contenu via l'onglet Éducation de l'application.");

  } catch (error) {
    console.error("❌ Erreur lors de la création du contenu :", error);
  } finally {
    await client.end();
    console.log("🔌 Connexion fermée");
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };