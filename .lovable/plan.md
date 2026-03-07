

## Plan : Mise à jour de la page Tikrar — texte introductif enrichi, verrouillage strict, audio à la demande uniquement

### Changements dans `src/components/hifz/HifzStep3Memorisation.tsx`

**1. Remplacer le guide dépliable actuel** (lignes 169-204) par un texte introductif complet et toujours visible (ou dépliable mais ouvert par défaut). Ce texte inclura :
- Le paragraphe d'introduction : « Pour graver ce passage dans votre cœur par la grâce d'Allah (عز وجل)... Bismillah ! »
- Le mode d'emploi des 3 phases (1-10, 11-15, 16+) avec les consignes détaillées demandées
- La mention du Prophète Mouhamed avec l'honorifique correct (ﷺ) en police Amiri
- La note sur l'aide ponctuelle (haut-parleur / coup d'œil au Mushaf)

**2. Verrouillage strict du bouton "Étape suivante"** (lignes 404-433) :
- Supprimer le bouton "Passer quand même" : le bouton n'apparaît QUE quand `ancrage >= 40`
- Le bouton reste masqué (pas grisé, simplement absent) tant que 40/40 n'est pas atteint

**3. Audio désactivé par défaut** :
- Supprimer le gros bouton Play automatique de la phase 1 (lignes 354-370)
- À la place, afficher le bouton +1 manuel pour TOUTES les phases
- Conserver uniquement le petit bouton haut-parleur discret (Volume2) pour aide ponctuelle dans TOUTES les phases (pas seulement 2-3)
- Le bouton haut-parleur reste identique : lecture d'un verset à la demande

**4. Conserver tel quel** : compteur circulaire, célébration à 40/40, message de bienveillance (phase 3), persistance localStorage, bouton Mushaf toggle, bouton reset.

### Fichier modifié
- `src/components/hifz/HifzStep3Memorisation.tsx`

