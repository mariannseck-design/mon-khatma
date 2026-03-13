

## Diagnostic : bouton retour sur HifzConfig

### Constat

Le code est **déjà correct** : le bouton retour sur la page 1/5 (HifzConfig) appelle bien `navigate('/hifz-hub')` (ligne 482 de HifzPage.tsx), et la route `/hifz-hub` existe (App.tsx ligne 103).

Le problème est très probablement un **cache du Service Worker** qui sert une ancienne version du fichier. Le fichier `public/version.json` a été mis à jour récemment mais le SW peut encore servir l'ancien bundle.

### Plan

1. **Forcer un bump de version** dans `public/version.json` pour déclencher une mise à jour du Service Worker
2. **Aucun changement de logique nécessaire** — le code `navigate('/hifz-hub')` est déjà en place

Si après le bump de version et un rechargement forcé (Ctrl+Shift+R) le problème persiste, il faudra investiguer le Service Worker (`public/sw-push.js`) pour vérifier s'il intercepte la navigation.

