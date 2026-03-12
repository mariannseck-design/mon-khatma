

# Réinitialisation du Tikrar après expiration des 24h

## Changement unique : `src/components/hifz/HifzStep5Tikrar.tsx`

### Détection de l'expiration
- Ajouter un état `expired` calculé dans le `useEffect` du countdown : si `Date.now() > startedAt + 24h` et `count < 40`, passer `expired = true`

### UI d'expiration
- Quand `expired === true` et `count < 40`, masquer le bouton "J'ai récité" et afficher à la place :
  - Un message d'avertissement : "⏰ Les 24h sont écoulées. Tu avais atteint **{count}/40** récitations. Recommence pour sceller ta mémorisation."
  - Un bouton "Recommencer le Tikrar" (icône `RotateCw`) qui remet `count` à 0 et `startedAt` à `Date.now()`, et persiste ces valeurs via `onUpdateStatus`

### Bouton "J'ai récité" désactivé après expiration
- Le `handleRecite` vérifie aussi `expired` avant d'incrémenter

