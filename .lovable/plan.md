

## Afficher uniquement la page du bloc (pas l'intervalle)

### Problème
Le `pageMap` regroupe tous les versets d'une même sourate+phase, donnant un intervalle large (ex: "p. 11-16"). Chaque item de révision correspond à un seul bloc (une page), donc il faut afficher la page exacte de ce bloc.

### Correction — `src/pages/MurjaPage.tsx`

Dans le `nextReviewsForCountdown` (lignes 266-280), remplacer le lookup via `pageMap` par un appel à `getExactVersePage(v.surah_number, v.verse_start)` pour obtenir la page exacte du début du bloc.

Comme `getExactVersePage` est asynchrone, transformer le `.map()` synchrone en résolution async :
- Calculer les pages en parallèle avec `Promise.all`
- Stocker le résultat dans un state dédié ou utiliser un `useEffect` au lieu du `useMemo`

**Alternative plus simple** : utiliser `getApproxVersePage` (synchrone, depuis `surahData.ts`) qui donne une bonne approximation — suffisant pour un label de page unique. Cela évite de rendre le memo asynchrone.

Chaque item affichera alors `p. 14` au lieu de `p. 11-16`.

### Fichier modifié
- `src/pages/MurjaPage.tsx` — bloc `nextReviewsForCountdown`, remplacer le pageMap lookup par la page exacte du `verse_start`

