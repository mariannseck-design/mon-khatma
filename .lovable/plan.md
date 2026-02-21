
# Changer le logo de l'application

## Ce qui sera fait

Remplacer le logo actuel par la nouvelle image du Coran dore dans tous les endroits ou il est utilise.

## Fichiers concernes

L'image sera copiee dans `src/assets/logo.png` (ecrasant l'ancien logo) et les fichiers suivants l'utilisent deja via import :

1. **`src/pages/LandingPage.tsx`** - Logo sur la page d'accueil avant connexion
2. **`src/components/pwa/InstallPrompt.tsx`** - Logo dans le prompt d'installation PWA
3. **`src/components/layout/Header.tsx`** - Logo dans le header (utilise `ma-khatma-logo.png`, sera aussi mis a jour)

## Etapes techniques

1. Copier l'image uploadee vers `src/assets/logo.png` (remplace l'ancien)
2. Copier la meme image vers `src/assets/ma-khatma-logo.png` (utilise par le Header)
3. Aucun changement de code necessaire car les imports pointent deja vers ces fichiers
