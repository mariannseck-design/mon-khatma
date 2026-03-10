

## Plan : Rediriger "/" vers la page de connexion

### Changement

**`src/App.tsx`** :
- Remplacer la route `"/"` qui affiche `LandingPage` par une redirection vers `AuthPage`
- Supprimer l'import de `LandingPage`
- La route `/auth` reste en place, et `"/"` redirige simplement vers `/auth` (ou affiche directement `AuthPage`)

Concrètement :
```
Route "/" → <PublicRoute><AuthPage /></PublicRoute>
```

Le fichier `src/pages/LandingPage.tsx` reste dans le projet mais n'est plus utilisé.

