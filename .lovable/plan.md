

## Ajouter une option "Réinitialiser mon parcours Hifz" dans la page Paramètres

### Ce que ça fait
Un bouton dans la page Paramètres (ou Profil) permet de remettre à zéro tout le parcours Hifz : diagnostic, objectifs, sessions, versets mémorisés et streaks. Avec une confirmation en deux étapes pour éviter les erreurs.

### Modifications

**`src/pages/ParametresPage.tsx`** — Ajouter une section "Zone dangereuse" en bas :
- Carte avec icône ⚠️ et bouton "Réinitialiser mon parcours Hifz"
- Au clic : AlertDialog de confirmation avec texte explicite ("Cette action supprimera toutes tes données de mémorisation")
- Deuxième confirmation : saisir "RÉINITIALISER" pour valider
- Au confirm : supprimer les données des tables suivantes pour l'utilisateur connecté :
  - `hifz_sessions` (toutes les sessions)
  - `hifz_memorized_verses` (versets mémorisés)
  - `hifz_streaks` (séries)
  - `hifz_goals` (objectifs)
  - Remettre `profiles.onboarding_completed` à `false`
  - Nettoyer le localStorage (`hifz_active_session`)
- Toast de succès + redirection vers `/hifz` (qui relancera le diagnostic)

### Tables impactées
Aucune migration nécessaire — on utilise les DELETE RLS existants (tous autorisent `auth.uid() = user_id`). Le UPDATE sur `profiles` est aussi autorisé.

### UX
- Section visuellement distincte (bordure rouge/orange)
- Double confirmation pour éviter les suppressions accidentelles
- Accessible uniquement aux utilisateurs connectés

