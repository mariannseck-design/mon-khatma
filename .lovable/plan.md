

## Plan : Ajouter la sélection des jours de mémorisation (onglet Quotidien)

### Objectif
Quand l'utilisatrice choisit le mode "Quotidien", elle pourra cocher les jours de la semaine où elle mémorise (ex: Lun, Mar seulement, ou Sam, Dim). Par défaut tous les jours sont cochés.

### Étapes

**1. Migration base de données**
Ajouter une colonne `active_days` (type `integer[]`) à la table `hifz_goals` pour stocker les jours actifs (0=Lun, 1=Mar, ..., 6=Dim). Valeur par défaut : `{0,1,2,3,4,5,6}` (tous les jours).

```sql
ALTER TABLE public.hifz_goals 
ADD COLUMN active_days integer[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}';
```

**2. Modifier `HifzGoalOnboarding.tsx`**
- Ajouter un state `activeDays` initialisé à `[0,1,2,3,4,5,6]` (ou depuis `existingGoal`).
- Quand l'onglet "Quotidien" est sélectionné, afficher une rangée de 7 boutons-jours (L, M, M, J, V, S, D) sous les options de versets/pages. Chaque bouton est un cercle cliquable : doré si actif, transparent si inactif.
- Au moins 1 jour doit rester sélectionné (empêcher de tout décocher).
- Envoyer `active_days` dans l'insert vers `hifz_goals`.
- Masquer la rangée de jours quand l'onglet "Hebdomadaire" est sélectionné.

**3. Mettre à jour le type de l'interface `existingGoal`**
Ajouter `active_days?: number[]` au type `HifzGoalOnboardingProps.existingGoal` et le charger depuis la BDD dans `HifzPage.tsx`.

### Design des boutons jours
7 cercles alignés horizontalement, style cohérent avec le thème doré/émeraude existant :
- Actif : fond `rgba(212,175,55,0.2)`, bordure dorée, texte doré
- Inactif : fond transparent, bordure `rgba(255,255,255,0.1)`, texte `white/40`

