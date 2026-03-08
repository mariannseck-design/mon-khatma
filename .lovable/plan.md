

## Plan : Systeme d'Objectifs Hifz (Onboarding + Cloud + Dashboard)

### 1. Migration BDD -- Nouvelle table `hifz_goals`

Creer une table dediee (pas dans profiles) pour stocker l'objectif de memorisation :

```sql
CREATE TABLE public.hifz_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  goal_period text NOT NULL CHECK (goal_period IN ('daily', 'weekly')),
  goal_unit text NOT NULL CHECK (goal_unit IN ('verses', 'pages')),
  goal_value numeric NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, is_active) -- un seul objectif actif par utilisatrice
);

ALTER TABLE public.hifz_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own hifz_goals" ON public.hifz_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own hifz_goals" ON public.hifz_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hifz_goals" ON public.hifz_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own hifz_goals" ON public.hifz_goals FOR DELETE USING (auth.uid() = user_id);
```

Options disponibles :
- **Quotidien** : `{period: 'daily', unit: 'verses', value: 3}`, `{..., value: 5}`, `{period: 'daily', unit: 'pages', value: 1}`
- **Hebdomadaire** : `{period: 'weekly', unit: 'pages', value: 0.5}`, `{..., value: 1}`, `{..., value: 2}`

### 2. Nouveau composant : `HifzGoalOnboarding`

**Fichier** : `src/components/hifz/HifzGoalOnboarding.tsx`

Ecran elegant style bijou (mint + or) avec :
- Titre spirituel : "Choisis ton rythme d'ancrage"
- Message : rappel que ce rythme est un engagement sur la voie du Prophete (عليه السلام)
- Deux onglets : **Quotidien** / **Hebdomadaire**
- Cards selectionnables pour chaque option (3v, 5v, 1 page | 1/2p, 1p, 2p)
- Bouton "Valider mon engagement"
- Sauvegarde dans `hifz_goals` via Supabase

### 3. Integration dans le flux

**`src/pages/HifzPage.tsx`** :
- Au chargement, verifier si l'utilisatrice a un `hifz_goals` actif
- Si non → afficher `HifzGoalOnboarding` avant `HifzConfig`
- Si oui → flux normal (config → session)

**`src/pages/HifzSuiviPage.tsx`** (Dashboard) :
- Charger le `hifz_goals` actif
- Calculer la progression du jour/semaine : compter les versets des `hifz_sessions` completees (`completed_at IS NOT NULL`) dans la periode
- Formule : `SUM(end_verse - start_verse + 1)` des sessions completees aujourd'hui (ou cette semaine)
- Afficher une **barre de progression** : "3/5 versets aujourd'hui" ou "0.5/1 page cette semaine"
- Bouton discret pour modifier l'objectif (re-ouvre l'onboarding)

### 4. Fichiers a creer/modifier

| Fichier | Action |
|---|---|
| Migration SQL | Creer table `hifz_goals` + RLS |
| `src/components/hifz/HifzGoalOnboarding.tsx` | Nouveau : selecteur d'objectif |
| `src/pages/HifzPage.tsx` | Ajouter verification goal + affichage onboarding |
| `src/pages/HifzSuiviPage.tsx` | Ajouter barre de progression goal + bouton modifier |

### 5. Details techniques

```text
Flux utilisatrice :

[Premiere visite Hifz]
    │
    ▼
┌──────────────────────────┐
│  HifzGoalOnboarding      │
│  [Quotidien] [Hebdo]     │
│  ○ 3 versets  ○ 5 versets│
│  ○ 1 page               │
│  [Valider mon engagement]│
└──────────────────────────┘
    │ sauvegarde → hifz_goals
    ▼
┌──────────────────────────┐
│  HifzConfig (normal)     │
│  Choisis sourate + versets│
└──────────────────────────┘
    │
    ▼
  Session 7 etapes → completed_at
    │
    ▼
  Dashboard affiche 3/5 versets ✓
```

- La progression quotidienne = `SUM(end_verse - start_verse + 1)` des `hifz_sessions` avec `completed_at` du jour
- La progression hebdomadaire = meme calcul sur les 7 derniers jours (lundi a dimanche)
- Les versets memorises continuent a basculer dans Liaison (30j) puis Anki (SRS) sans changement

