

## Diagnostic Onboarding — Double entrée "Acquis Solides" vs "Récents" + Liaison

### Objectif
Scinder le diagnostic en deux sections temporelles pour que le moteur de révision sache si un bloc doit passer par la Liaison (30 jours de récitation quotidienne) avant d'entrer dans le Tour (SM-2/Anki).

### 1. Migration base de données

Ajouter deux colonnes à `hifz_memorized_verses` :

```sql
ALTER TABLE hifz_memorized_verses
  ADD COLUMN liaison_status text NOT NULL DEFAULT 'tour',
  ADD COLUMN liaison_start_date date;
```

- `liaison_status` : `'liaison'` (récitation quotidienne obligatoire) ou `'tour'` (SM-2 standard)
- `liaison_start_date` : date de début de la liaison (pour calculer le reliquat `30 - jours_ecoulés`)

### 2. Refonte du composant `HifzDiagnostic.tsx`

**Nouvelle architecture en 2 étapes :**

- **Étape 1 — Choix de la catégorie** : Deux grandes cartes au lieu d'un seul formulaire :
  - 🏛️ **"Mes Acquis Solides"** — *Appris il y a plus d'un mois*. Description : "Ces sourates sont bien ancrées. Elles seront révisées par l'algorithme de répétition espacée."
  - 🌱 **"Mes Mémorisations Récentes"** — *Appris durant les 30 derniers jours*. Description : "Ces acquis récents nécessitent encore une récitation quotidienne (Liaison) avant d'être autonomes."

- **Étape 2 — Saisie des blocs** : En cliquant sur une catégorie, l'utilisatrice accède au même système de tabs (Pages / Juz / Sourates) existant, mais contextualisé pour la catégorie.

- **Pour "Récentes" uniquement** : Chaque bloc saisi affiche un champ supplémentaire : *"Depuis combien de jours récitez-vous ce bloc ?"* (slider ou input numérique 1-29). L'app calcule et affiche le reliquat : `30 - X = Y jours restants de Liaison`.

- L'utilisatrice peut naviguer entre les deux sections et ajouter des blocs dans chacune.

- **Écran de confirmation** : Affiche les blocs regroupés par catégorie avec le détail du traitement (Tour direct vs Liaison + durée restante).

### 3. Mise à jour de `injectMemorizedVerses` dans `hifzUtils.ts`

Ajouter un paramètre `category: 'solid' | 'recent'` et `daysAlreadyDone?: number` :

- **Acquis Solides** → `liaison_status = 'tour'`, `liaison_start_date = null`, stagger SM-2 sur 14 jours (comportement existant)
- **Récents** → `liaison_status = 'liaison'`, `liaison_start_date = today - daysAlreadyDone`, `sm2_interval = 1`, `next_review_date = today` (ils doivent apparaître chaque jour dans la Liaison)

### 4. Mise à jour du moteur de révision (`MurjaPage.tsx`)

- **Rabt (Liaison)** : Filtrer sur `liaison_status = 'liaison'` au lieu de `memorized_at >= 30 jours`. Quand `today - liaison_start_date >= 30`, basculer automatiquement le bloc vers `liaison_status = 'tour'` avec des paramètres SM-2 initiaux.
- **Le Tour** : Filtrer sur `liaison_status = 'tour'` ET `next_review_date <= today`.

### 5. Fichiers modifiés

| Fichier | Action |
|---|---|
| Migration SQL | Ajouter `liaison_status` + `liaison_start_date` |
| `src/lib/hifzUtils.ts` | Paramétrer `injectMemorizedVerses` pour les deux catégories |
| `src/components/hifz/HifzDiagnostic.tsx` | Refonte complète avec double entrée + champ "jours déjà faits" |
| `src/pages/MurjaPage.tsx` | Filtrage Rabt/Tour basé sur `liaison_status` + graduation automatique |

### 6. Charte visuelle

L'interface du diagnostic utilisera la charte premium existante (fond émeraude `#065F46`, or `#D4AF37`, cartes blanches) et s'adaptera au mode sombre via les variables CSS `--p-*` déjà en place.

