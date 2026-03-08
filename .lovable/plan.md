

## Problème : la page du lecteur revient au début après actualisation

### Diagnostic
Le code sauvegarde bien la page dans `localStorage` (ligne 28-29, 203), mais si `parseInt` renvoie `NaN` (valeur corrompue), `Math.min(Math.max(NaN, 1), 604)` donne `NaN` et non `1`. De plus, la page n'est pas reflétée dans l'URL — un refresh du navigateur repose uniquement sur `localStorage`.

### Correction

**Fichier : `src/pages/QuranReaderPage.tsx`**

1. **Sécuriser la lecture localStorage** : ajouter un fallback si `parseInt` retourne `NaN`
2. **Synchroniser la page dans l'URL** via `useSearchParams` pour que la page survive aux rafraîchissements et aux navigations :
   - Lire `?page=X` au montage (priorité sur localStorage)
   - Mettre à jour l'URL sans rechargement quand la page change (`replace`)
   - Continuer à sauvegarder dans localStorage comme fallback

```text
Montage:
  URL ?page=X  →  utiliser X
  sinon localStorage  →  utiliser valeur sauvée
  sinon  →  page 1

Changement de page:
  → localStorage.setItem(...)
  → setSearchParams({ page: N }, { replace: true })
```

### Impact
- 1 fichier modifié : `src/pages/QuranReaderPage.tsx`
- Ajout de `useSearchParams` de `react-router-dom`
- La page sera visible dans l'URL : `/quran-reader?page=123`

