

## Ajout du défi Sourate Al-Kahf (lecture du vendredi)

### Concept
Carte similaire à Al-Mulk mais adaptée au rythme hebdomadaire du vendredi. L'utilisatrice peut valider sa lecture chaque semaine à partir du jeudi soir (18h). Un compteur de semaines consécutives et un historique visuel des 4 dernières semaines sont affichés.

### Base de données

**Nouvelle table `challenge_kahf`** :
```sql
CREATE TABLE public.challenge_kahf (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_key TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, week_key)
);
ALTER TABLE public.challenge_kahf ENABLE ROW LEVEL SECURITY;
-- RLS: users can CRUD their own rows
```

**Mise à jour de la fonction `get_defis_collective_stats`** pour inclure `kahf_participants`.

### Nouveau composant : `src/components/defis/DefiAlKahf.tsx`

- **Design** : Carte arrondie, thème bleu nuit / doré (pour évoquer la grotte/lumière), icône `BookOpen` ou `Scroll`.
- **Logique `week_key`** : Calculée à partir de la semaine ISO (identique à Al-Mulk).
- **Fenêtre de validation** : Actif du jeudi 18h au vendredi 23h59. En dehors, le bouton est visible mais désactivé avec un message « Disponible à partir de jeudi soir ».
- **État** : `completed` pour la semaine en cours, streak de semaines consécutives, mini historique (4 dernières semaines sous forme de 4 cercles).
- **Persistance** : DB pour les utilisateurs connectés, `localStorage` sinon.
- **Célébration** : Dialog de félicitations quand on valide + affichage du streak.

### Fichiers modifiés

1. **`src/components/defis/DefiAlKahf.tsx`** — Nouveau composant (structure calquée sur DefiAlMulk)
2. **`src/pages/AccueilPage.tsx`** — Import + ajout de `<DefiAlKahf disabled={!isAdmin} />` entre Al-Mulk et Al-Baqara
3. **`src/components/defis/DefisCommunityCounter.tsx`** — Ajout de `kahf` dans les stats affichées

### Layout final dans "Nos Défis"

```text
┌─────────────────────┐
│  Al-Mulk (7 jours)  │
├─────────────────────┤
│  Al-Kahf (vendredi) │  ← NOUVEAU
├─────────────────────┤
│  Al-Baqara (défi)   │
├─────────────────────┤
│  🔢 Compteur communautaire │
└─────────────────────┘
```

