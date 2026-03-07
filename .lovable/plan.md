

## Plan : Corriger le zoom du Mushaf (étapes 2 et 3)

### Problème

Le zoom utilise `width: 100%/150%/220%` sur l'image dans un conteneur fixe `max-h-72`. L'image s'agrandit en largeur mais le conteneur reste petit — l'utilisateur doit scroller dans les deux sens sans impression de zoom réel.

### Correction

Utiliser `transform: scale()` pour un vrai zoom visuel, combiné à un agrandissement du conteneur :

- **Petit** : conteneur `max-h-48`, image `width: 100%` (vue d'ensemble)
- **Moyen** : conteneur `max-h-72`, image `width: 150%` (par défaut)
- **Grand** : conteneur `max-h-[500px]`, image `width: 220%` (détail)

Le conteneur grandit avec le zoom pour que l'utilisateur voie réellement plus de détails sans être coincé dans une petite fenêtre.

Aussi : remplacer `transition-transform` par `transition-all` sur l'image pour animer le changement de width.

### Fichiers modifiés
- `src/components/hifz/HifzStep2Impregnation.tsx`
- `src/components/hifz/HifzStep3Memorisation.tsx`

