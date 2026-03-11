

## Suppression des pages A/B

Supprimer les fichiers de test A/B et leurs routes, on garde la page actuelle `HifzSuiviPage.tsx`.

### Fichiers à supprimer
- `src/pages/SuiviHifz_PageA.tsx`
- `src/pages/SuiviHifz_PageB.tsx`

### Fichier modifié
- `src/App.tsx` : retirer les imports `SuiviHifz_PageA` / `SuiviHifz_PageB` et les routes `/hifz-suivi-a` et `/hifz-suivi-b`

Le composant `WeeklyCalendarBar.tsx` est conservé car il pourrait servir plus tard.

