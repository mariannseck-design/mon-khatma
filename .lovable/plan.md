

## Plan : Déplacer le badge verset au-dessus de la barre de progression

### Fichier : `src/components/hifz/HifzStepWrapper.tsx`

Déplacer le bloc `verseInfo` (lignes 89-99) **avant** le bloc de la barre de progression (ligne 61). Ainsi le badge « Al-Baqara · v.70–76 · p. 11 » apparaîtra juste au-dessus des barres rondes avec les numéros d'étape.

Concrètement, réorganiser l'ordre dans le JSX :

1. **D'abord** : le badge verset (capsule dorée avec 📖)
2. **Ensuite** : la barre de progression avec le bouton retour, le timer et le titre d'étape

Retirer le `-mt-3` du badge puisqu'il ne sera plus collé sous la barre.

