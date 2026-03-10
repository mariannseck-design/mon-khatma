

## Diagnostic : Pourquoi l'objectif affiche 0.3 au lieu de 1

### Le probleme

Ligne 146 de `HifzSuiviPage.tsx` :
```typescript
setPeriodProgress(Math.round((versesCompleted / 15) * 10) / 10);
```

Le code divise le nombre d'ayats memorisees par **15** (estimation fixe du nombre de versets par page). Or, une page du Mushaf peut contenir entre **5 et 20+ versets** selon la sourate. Si ta page ne contenait que 5 ayats, le calcul donne `5 / 15 = 0.33 → 0.3` au lieu de **1.0**.

### Solution

Remplacer la division fixe par 15 par un **comptage reel des pages Mushaf** couvertes par les sessions completees. On utilisera `getExactVersePage()` (deja disponible dans `quranData.ts`) pour determiner combien de pages distinctes ont ete travaillees dans la periode.

### Changement

**`src/pages/HifzSuiviPage.tsx`** :

1. Importer `getExactVersePage` depuis `quranData.ts`
2. Remplacer le calcul `versesCompleted / 15` par une fonction async qui :
   - Pour chaque session completee, recupere la page Mushaf de `start_verse` et `end_verse` (via le `surah_number` de la session)
   - Collecte les pages distinctes dans un `Set`
   - Le nombre de pages = taille du Set
3. Si la session couvre une seule page → progress = 1.0 (et non 0.3)

Note : il faut aussi recuperer `surah_number` dans la requete `periodSessions` (actuellement non selectionne).

