

## Plan : Auto-suggestion du verset suivant alignée sur la page Mushaf

### Contexte
La fonction `findNextStartingPoint` dans `hifzUtils.ts` suggère déjà le prochain verset non mémorisé. Cependant, `endVerse` est fixé à `startVerse + 5` (6 versets arbitraires), sans tenir compte des limites de page du Mushaf. Il faut aligner `endVerse` sur le dernier verset de la page courante.

### Modification : `src/lib/hifzUtils.ts` — `findNextStartingPoint()`

Utiliser `getExactVersePage()` et `getPageAyahs()` de `quranData.ts` pour :
1. Trouver la page Mushaf du `startVerse` suggéré
2. Récupérer tous les versets de cette page
3. Filtrer ceux de la même sourate
4. Définir `endVerse` = dernier verset de cette sourate sur cette page (au lieu de `startVerse + 5`)

Cela garantit que si l'utilisatrice a mémorisé les versets 1-3 d'une page, le système propose automatiquement les versets 4 → fin de page.

```text
Avant :  startVerse = maxEnd + 1, endVerse = startVerse + 5
Après :  startVerse = maxEnd + 1, endVerse = dernier verset de la page Mushaf
```

### Fichier modifié
- `src/lib/hifzUtils.ts` — import de `getExactVersePage` et `getPageAyahs`, mise à jour des deux `return` dans `findNextStartingPoint` (ligne 233 et 243)

