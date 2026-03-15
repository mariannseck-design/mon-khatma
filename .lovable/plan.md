

## Problème

Quand tu cliques sur le bouton **Mushaf flottant**, `navigate('/quran-reader?page=...')` **démonte** le composant Hifz. L'audio en cours continue de jouer (grâce au contexte global), mais dès que le verset en cours se termine, le callback `onended` qui relance le verset suivant (la boucle) est lié aux refs du composant Hifz — qui n'existent plus. Résultat : **l'audio s'arrête après le verset en cours**.

## Solution

Ouvrir le Mushaf **dans un nouvel onglet** au lieu de naviguer dans l'onglet actuel. Ainsi le composant Hifz reste monté, les refs restent vivantes, et la boucle audio continue.

### Modification : `src/components/hifz/HifzStepWrapper.tsx`

Remplacer les deux `navigate(...)` par `window.open(url, '_blank')` :

```tsx
// Avant
onClick={() => navigate(`/quran-reader?page=${mushafPage}`)}

// Après
onClick={() => window.open(`/quran-reader?page=${mushafPage}`, '_blank')}
```

Cela concerne les 2 boutons Mushaf dans le fichier (le badge en haut et le FAB flottant en bas-gauche).

L'import `useNavigate` peut être conservé si `onPause` ou d'autres fonctionnalités l'utilisent, sinon on le retire.

