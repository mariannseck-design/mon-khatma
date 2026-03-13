

## Plan : Flèche retour sur toutes les pages Hifz + correction du bug des versets

### Problème 1 : Flèche retour manquante sur la page 1/5 (HifzConfig)

La page de configuration (étape 1/5) n'utilise pas `HifzStepWrapper` et n'a donc pas de bouton retour. Il faut ajouter un bouton rond avec une flèche (style similaire à l'image) qui ramène au Hub Hifz.

**`src/components/hifz/HifzConfig.tsx`** :
- Ajouter une prop `onBack` 
- Ajouter un bouton rond discret en haut à gauche avec `ChevronLeft` dans un cercle semi-transparent (comme sur l'image : fond `rgba(255,255,255,0.15)`, icône blanche)

**`src/pages/HifzPage.tsx`** :
- Passer `onBack={() => navigate('/hifz-hub')}` au composant `HifzConfig`

### Problème 2 : 6 versets au lieu de 3

Le bug vient de `findNextStartingPoint()` dans `src/lib/hifzUtils.ts`. Cette fonction utilise `getPageAlignedEnd()` qui retourne **tous les versets de la même page du Mushaf** (souvent 6-7 versets), sans tenir compte de l'objectif de l'utilisateur (3 versets/jour).

**`src/lib/hifzUtils.ts`** — Modifier `findNextStartingPoint` :
- Accepter un paramètre optionnel `goalVerseCount?: number`
- Si fourni, limiter `endVerse` à `startVerse + goalVerseCount - 1` au lieu d'utiliser `getPageAlignedEnd`

**`src/pages/HifzPage.tsx`** — Au chargement :
- Récupérer le `goal_value` et `goal_unit` de l'objectif actif de l'utilisateur
- Si `goal_unit === 'verses'`, passer `goal_value` comme `goalVerseCount` à `findNextStartingPoint`

**`src/components/hifz/HifzConfig.tsx`** — Accepter une prop `goalVerseCount` :
- L'utiliser pour initialiser `endVerse = startVerse + goalVerseCount - 1` au lieu du défaut de 6

### Détail technique

```text
Flux actuel :
  findNextStartingPoint() → getPageAlignedEnd() → tous les versets de la page → 6-7 versets

Flux corrigé :
  findNextStartingPoint(userId, goalVerseCount=3) → startVerse + 3 - 1 = 3 versets
```

