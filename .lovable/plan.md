

# Micro-animation sur le fil d'Ariane

## Changement

**Fichier : `src/components/hifz/istiqamah/IstiqamahEngine.tsx`**

Remplacer les `<span>` statiques du breadcrumb par des `motion.span` de framer-motion pour animer l'étape courante :

- **Scale + glow** : l'étape active reçoit `scale: 1.15` avec une `textShadow` dorée pulsante (`0 0 8px rgba(212,175,55,0.6)`).
- **Transition retour** : les étapes non-actives reviennent à `scale: 1` sans glow.
- Import `motion` depuis `framer-motion` (déjà importé via `AnimatePresence`).

Le `layout` prop sur chaque `motion.span` assurera une transition fluide quand l'étape change.

