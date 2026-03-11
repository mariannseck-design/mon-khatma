

## Plan : Redirection automatique au lieu du 404

**Problème** : Quand un utilisateur tombe sur une URL invalide, il voit une page 404 blanche inutile.

**Solution** : Remplacer la page 404 par une redirection automatique intelligente :
- Si l'utilisateur est connecté → redirige vers `/accueil`
- Si l'utilisateur n'est pas connecté → redirige vers `/auth`

### Changement

**`src/pages/NotFound.tsx`** : Remplacer le contenu statique par un composant qui utilise `useAuth()` pour déterminer la destination, puis fait un `<Navigate>` immédiat vers `/accueil` ou `/auth`. Aucune page 404 ne sera jamais affichée.

