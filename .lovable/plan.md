

## Statistiques Hifz sur la page Profil

### Contexte
Le projet dispose deja de `HifzActivitySummary` (barre hebdomadaire), de `HifzSuiviPage` (suivi par Juz), et de `recharts` installé. La page Profil est simple (infos + rappels + déconnexion). L'objectif est d'y ajouter une section statistiques Hifz complète.

### Ce qui sera construit

Un nouveau composant `HifzProfileStats` intégré dans `ProfilPage.tsx`, affichant :

1. **4 KPI en grille 2x2** :
   - Versets mémorisés (total depuis `hifz_memorized_verses`)
   - Sessions complétées (total depuis `hifz_sessions` + `muraja_sessions`)
   - Streak actuel (jours consécutifs, calcul existant dans `HifzActivitySummary`)
   - Temps moyen par session (estimé via `started_at` / `completed_at` de `hifz_sessions`)

2. **Graphique de progression (recharts AreaChart)** :
   - 30 derniers jours
   - Axe Y = versets cumulés mémorisés
   - Données issues de `hifz_memorized_verses.memorized_at` agrégées par jour
   - Style cohérent avec le thème (couleur primary/emerald)

3. **Barre de régularité hebdomadaire** : réutilisation du composant `HifzActivitySummary` existant

### Fichiers modifiés

| Fichier | Action |
|---|---|
| `src/components/profil/HifzProfileStats.tsx` | **Créer** — composant autonome avec les 4 KPI, le graphique recharts, et l'import de `HifzActivitySummary` |
| `src/pages/ProfilPage.tsx` | **Modifier** — importer et afficher `HifzProfileStats` entre la carte Informations et la carte Rappels |

### Détails techniques

- **Requêtes Supabase** (toutes protégées par RLS existant) :
  - `hifz_memorized_verses` → count total versets + agrégation par `memorized_at` pour le graphique
  - `hifz_sessions` (completed) → count sessions + calcul durée moyenne via `started_at`/`completed_at`
  - `muraja_sessions` (completed) → count sessions pour le total
  - Streak : même logique que `HifzActivitySummary` (60 jours glissants)

- **Graphique** : `recharts` AreaChart avec `ResponsiveContainer`, gradient fill emerald, pas d'axe Y visible, labels jours sur axe X

- **Aucune migration DB nécessaire** — toutes les données existent déjà dans les tables actuelles

