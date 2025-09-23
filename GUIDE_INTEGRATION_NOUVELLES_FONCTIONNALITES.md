# Guide d'Intégration des Nouvelles Fonctionnalités

Ce guide détaille l'implémentation complète des nouvelles fonctionnalités pour l'application de thérapie sportive.

## 🎯 Résumé des Fonctionnalités Implémentées

### ✅ Fonctionnalités Principales
1. **Publication & assignation des séances** - Système complet d'assignation patient-séance
2. **Gestion des statuts des séances** - Draft/Published/Archived avec filtrage
3. **Catégorisation & filtres** - Tags sur exercices et séances avec filtres avancés
4. **Suivi des séances réalisées** - Feedback détaillé avec effort et durée
5. **Variables dynamiques** - 3 variables personnalisables par exercice
6. **Médiathèque** - Support média supplémentaire pour les exercices

## 📁 Nouveaux Fichiers Créés

### Backend
- `shared/schema.ts` - ✅ **Modifié** : Nouveaux modèles PatientSession, champs étendus
- `server/routes.ts` - ✅ **Modifié** : Nouveaux endpoints API
- `server/storage.ts` - ✅ **Modifié** : Nouvelles méthodes de base de données

### Frontend - Composants
- `client/src/components/patient-session-editor.tsx` - ✅ **Nouveau** : Interface admin pour assigner séances
- `client/src/components/exercise-form.tsx` - ✅ **Nouveau** : Formulaire création/édition exercices
- `client/src/components/admin-dashboard.tsx` - ✅ **Nouveau** : Dashboard de suivi administrateur
- `client/src/components/patient-sessions.tsx` - ✅ **Nouveau** : Interface patient pour séances
- `client/src/components/enhanced-session-builder.tsx` - ✅ **Modifié** : Ajout bouton "Publier"
- `client/src/components/exercise-card.tsx` - ✅ **Modifié** : Support tags et variables

### Base de Données
- `migrations/add_session_features.sql` - ✅ **Nouveau** : Script de migration

## 🔧 Installation et Configuration

### 1. Migration Base de Données

```bash
# Exécuter le script de migration
psql -d votre_database -f migrations/add_session_features.sql
```

### 2. Vérification des Nouveaux Types

Assurez-vous que les types TypeScript sont correctement importés dans vos pages :

```typescript
import type { 
  CustomSession, 
  PatientSession, 
  InsertPatientSession 
} from '../shared/schema';
```

### 3. Installation des Composants UI Manquants

Si nécessaire, installez les composants UI utilisés :

```bash
npm install @radix-ui/react-dialog @radix-ui/react-tooltip @radix-ui/react-slider
```

## 🚀 Utilisation des Nouveaux Composants

### 1. Interface Administrateur

#### Dashboard Admin
```typescript
import { AdminDashboard } from '@/components/admin-dashboard';

function AdminPage() {
  const [stats, setStats] = useState({});
  const [patients, setPatients] = useState([]);

  const fetchData = async () => {
    const statsResponse = await fetch('/api/admin/dashboard');
    const patientsResponse = await fetch('/api/admin/patients');
    setStats(await statsResponse.json());
    setPatients(await patientsResponse.json());
  };

  return (
    <AdminDashboard 
      stats={stats} 
      patients={patients} 
      onRefresh={fetchData} 
    />
  );
}
```

#### Assignation de Séances
```typescript
import { PatientSessionEditor } from '@/components/patient-session-editor';

function SessionAssignmentPage() {
  const handleAssignSession = async (sessionId: string, patientIds: string[]) => {
    await fetch(`/api/sessions/${sessionId}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientIds })
    });
  };

  return (
    <PatientSessionEditor
      patients={patients}
      sessions={sessions}
      onAssignSession={handleAssignSession}
      onRefresh={fetchData}
    />
  );
}
```

#### Créateur d'Exercices
```typescript
import { ExerciseForm } from '@/components/exercise-form';

function ExerciseCreationPage() {
  const handleSaveExercise = async (exerciseData) => {
    const response = await fetch('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exerciseData)
    });
    return response.json();
  };

  return (
    <ExerciseForm
      onSave={handleSaveExercise}
      onCancel={() => navigate('/admin/exercises')}
    />
  );
}
```

#### Session Builder avec Publication
```typescript
import { EnhancedSessionBuilder } from '@/components/enhanced-session-builder';

function SessionBuilderPage() {
  const handlePublishSession = async (sessionId: string, patientIds: string[]) => {
    await fetch(`/api/sessions/${sessionId}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientIds })
    });
  };

  return (
    <EnhancedSessionBuilder
      exercises={exercises}
      patients={patients}
      onSave={handleSaveSession}
      onPublish={handlePublishSession}
      existingSession={editingSession}
    />
  );
}
```

### 2. Interface Patient

#### Page des Séances Patient
```typescript
import { PatientSessions } from '@/components/patient-sessions';

function PatientSessionsPage() {
  const [sessions, setSessions] = useState([]);

  const handleCompleteSession = async (sessionId: string, feedback: string, effort: number, duration: number) => {
    await fetch(`/api/patient-sessions/${sessionId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback, effort, duration })
    });
    fetchSessions(); // Refresh
  };

  const handleSkipSession = async (sessionId: string) => {
    // Implémentation du skip
    await fetch(`/api/patient-sessions/${sessionId}/skip`, {
      method: 'POST'
    });
    fetchSessions();
  };

  return (
    <PatientSessions
      sessions={sessions}
      onCompleteSession={handleCompleteSession}
      onSkipSession={handleSkipSession}
      onRefresh={fetchSessions}
    />
  );
}
```

### 3. Cards d'Exercices Améliorées

```typescript
import { ExerciseCard } from '@/components/exercise-card';

function ExercisesList({ exercises, isAdmin = false }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exercises.map(exercise => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          showAdminFeatures={isAdmin}
          onStart={() => startExercise(exercise.id)}
        />
      ))}
    </div>
  );
}
```

## 🔄 Nouveaux Endpoints API

### Sessions
- `GET /api/sessions` - Récupérer séances avec filtres
- `POST /api/sessions` - Créer séance (admin)
- `PUT /api/sessions/:id` - Modifier séance (admin)
- `POST /api/sessions/:id/publish` - Publier séance (admin)

### Assignations Patient
- `GET /api/patient-sessions` - Séances du patient connecté
- `POST /api/patient-sessions/:id/complete` - Marquer comme terminée

### Administration
- `GET /api/admin/dashboard` - Statistiques dashboard
- `GET /api/admin/patients` - Patients avec leurs séances
- `PUT /api/exercises/:id` - Modifier exercice (admin)

## 📊 Structure de Données

### PatientSession
```typescript
interface PatientSession {
  id: string;
  patientId: string;
  sessionId: string;
  status: 'assigned' | 'done' | 'skipped';
  feedback?: string;
  effort?: number; // 1-10
  duration?: number; // minutes
  assignedAt: string;
  completedAt?: string;
}
```

### Exercise (étendu)
```typescript
interface ExtendedExercise {
  // ... champs existants
  tags: string[];
  variable1?: string;
  variable2?: string;
  variable3?: string;
  mediaUrl?: string;
}
```

### CustomSession (étendu)
```typescript
interface CustomSession {
  // ... champs existants
  status: 'draft' | 'published' | 'archived';
}
```

## 🎨 Styles et Thèmes

Les composants utilisent le système de design existant avec Tailwind CSS et Shadcn/UI. Assurez-vous que votre configuration inclut :

```css
/* Couleurs personnalisées pour les statuts */
.status-assigned { @apply bg-blue-100 text-blue-800 border-blue-200; }
.status-done { @apply bg-green-100 text-green-800 border-green-200; }
.status-skipped { @apply bg-red-100 text-red-800 border-red-200; }

/* Variables dynamiques */
.variable-display { @apply p-2 bg-blue-50 rounded-lg border border-blue-200; }
```

## 🧪 Tests et Validation

### Tests API (avec curl)

```bash
# Créer une séance
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Session","description":"Description test","category":"relaxation"}'

# Publier une séance
curl -X POST http://localhost:3000/api/sessions/{sessionId}/publish \
  -H "Content-Type: application/json" \
  -d '{"patientIds":["patient1","patient2"]}'

# Compléter une séance
curl -X POST http://localhost:3000/api/patient-sessions/{sessionId}/complete \
  -H "Content-Type: application/json" \
  -d '{"feedback":"Très bien!","effort":7,"duration":25}'
```

### Validation Frontend

1. **Interface Admin** : Vérifiez que seuls les administrateurs peuvent accéder aux fonctions de gestion
2. **Interface Patient** : Testez le système de feedback et la navigation entre statuts
3. **Filtres** : Validez que tous les filtres (tags, catégories, statuts) fonctionnent
4. **Responsive** : Assurez-vous que l'interface est adaptée mobile

## 🔒 Sécurité et Permissions

- ✅ **Authentification** : Tous les endpoints nécessitent une authentification
- ✅ **Autorisation** : Séparation claire admin/patient
- ✅ **Validation** : Validation côté serveur de toutes les données
- ✅ **Sanitisation** : Nettoyage des inputs utilisateur

## 📈 Métriques et Monitoring

Les nouveaux endpoints génèrent des métriques utiles :
- Taux de complétion des séances
- Effort moyen par patient
- Séances les plus populaires
- Feedback qualitatif des patients

## 🐛 Dépannage Courant

### 1. Erreur de migration
```bash
# Vérifier que la base de données est accessible
psql -d $DATABASE_URL -c "SELECT version();"
```

### 2. Types TypeScript manquants
```bash
# Régénérer les types
npm run build
```

### 3. Composants UI manquants
```bash
# Installer les dépendances manquantes
npm install @radix-ui/react-dialog @radix-ui/react-tooltip @radix-ui/react-slider
```

## 📞 Support

Pour toute question ou problème :
1. Vérifiez ce guide d'intégration
2. Consultez les logs serveur pour les erreurs API
3. Validez que la migration DB s'est bien passée
4. Testez les endpoints avec curl avant d'intégrer au frontend

---

**🎉 Félicitations !** Vous avez maintenant un système complet de gestion de séances avec assignation patient, feedback détaillé, et interface administrateur avancée.