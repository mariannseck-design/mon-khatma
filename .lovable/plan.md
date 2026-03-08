

## Diagnostic : bouton Skip et badge invisibles malgré le mode testeur activé

### Cause identifiée

Le hook `useDevMode` initialise `isDevMode` à `false`, puis met à jour via un `useEffect` déclenché uniquement quand `isAdmin` change. Si `isAdmin` est déjà `true` au montage (cas fréquent en navigation interne), le `useEffect` lit bien localStorage — mais il y a un problème de **double instanciation** : `HifzPage` et `DevSkipButton` appellent chacun `useDevMode()` indépendamment, créant deux états séparés qui peuvent diverger.

De plus, l'initialisation synchrone de `isDevMode` à `false` (au lieu de lire localStorage immédiatement) cause un premier rendu avec `isDevMode = false` qui peut persister si le `useEffect` ne se re-déclenche pas.

### Corrections

**1. `src/hooks/useDevMode.ts`** : Initialiser `isDevMode` **synchronement** depuis localStorage au lieu d'attendre un `useEffect` :

```typescript
const [isDevMode, setIsDevMode] = useState(() => {
  return localStorage.getItem('dev_mode') === 'true';
});
```

Conserver le `useEffect` pour reset quand `isAdmin` passe à `false`, mais ne plus dépendre de lui pour la lecture initiale.

**2. `src/components/hifz/DevSkipButton.tsx`** : Recevoir `isDevMode` en **prop** depuis HifzPage au lieu d'appeler le hook indépendamment (source unique de vérité).

**3. `src/pages/HifzPage.tsx`** : Passer `isDevMode` en prop à `DevSkipButton`.

### Fichiers modifiés
- `src/hooks/useDevMode.ts` (initialisation synchrone)
- `src/components/hifz/DevSkipButton.tsx` (prop au lieu du hook)
- `src/pages/HifzPage.tsx` (passage de la prop)

