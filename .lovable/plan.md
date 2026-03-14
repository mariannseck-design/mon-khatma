

## Supprimer le bandeau de migration sur la page de connexion

Le message d'alerte dans `AuthPage.tsx` (lignes ~153-162) qui dit "Ma Khatma a été migrée vers une nouvelle infrastructure... Merci de te réinscrire avec le même email" n'est plus nécessaire puisque la connexion fonctionne avec les anciens identifiants.

### Modification
- **`src/pages/AuthPage.tsx`** : Supprimer le bloc `Alert` affiché en mode `login` et `signup`, ainsi que l'import `Alert`/`AlertDescription`/`Info` s'ils ne sont plus utilisés ailleurs.

