

## Diagnostic

La page d'accueil est maintenant `AuthPage` (page de connexion), qui **n'utilise pas `AppLayout`**. Or, le composant `InstallBanner` (la bannière d'installation PWA) est uniquement inclus dans `AppLayout`. Résultat : les utilisateurs non connectés ne voient plus la bannière d'installation.

## Correction

**`src/pages/AuthPage.tsx`** : Ajouter `<InstallBanner />` en haut du rendu de la page, avant le contenu principal. Ainsi, la bannière d'installation (avec détection Android/iOS, bouton "Installer" sur Android, guide Safari sur iPhone) s'affiche aussi sur la page de connexion.

C'est un ajout de 2 lignes (import + composant).

