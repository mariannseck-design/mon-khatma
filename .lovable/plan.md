

# Remplacer le logo dans les 2 pages (connexion + landing)

## Ce qui sera fait

Copier la nouvelle image uploadee vers les deux fichiers logo existants :

1. `src/assets/logo.png` -- utilise par **AuthPage** (page de connexion) et **LandingPage**
2. `src/assets/ma-khatma-logo.png` -- utilise par le **Header**

## Etapes

1. Copier `user-uploads://image-23.png` vers `src/assets/logo.png`
2. Copier `user-uploads://image-23.png` vers `src/assets/ma-khatma-logo.png`

Aucune modification de code necessaire, les imports pointent deja vers ces fichiers.

