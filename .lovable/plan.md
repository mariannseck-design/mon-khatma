

## Diagnostic

L'utilisateur est bloqué sur la page `/quran-reader` qui masque la barre de navigation (`hideNav`). Il existe un bouton retour (flèche ←) en haut à gauche qui appelle `navigate(-1)`.

Aucune modification de code n'est nécessaire ici — c'est un problème de navigation utilisateur, pas un bug.

### Instructions pour l'utilisateur
1. Taper la flèche ← en haut à gauche du lecteur Coran
2. Aller dans Profil → activer "Mode Testeur (Dev)"
3. Aller dans Hifz → le bouton ⏩ Skip apparaît

### Si le bouton retour n'est pas visible
Il faudrait vérifier le header du QuranReaderPage pour s'assurer que le bouton retour est bien rendu. Mais d'après le code, il utilise `ArrowLeft` avec `navigate(-1)` donc il devrait fonctionner.

### Pas de changement de code requis
Ce n'est pas un bug — l'utilisateur a juste besoin de naviguer via le bouton retour existant.

