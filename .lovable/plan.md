

## Plan : Remettre le diviseur à 15

Tu as raison — si dans ton Mushaf une page contient environ 15 versets (ce qui est courant dans le Mushaf standard Medine), le diviseur 10.3 sous-estime le nombre de pages.

### Changement

**`src/pages/HifzSuiviPage.tsx`** — Ligne ~141 : remplacer `/10.3` par `/15`

```ts
// Avant
setPeriodProgress(Math.round((versesCompleted / 10.3) * 10) / 10);

// Après
setPeriodProgress(Math.round((versesCompleted / 15) * 10) / 10);
```

Avec 3 versets mémorisés, cela affichera **0.2** page au lieu de 0.3.

