

# Refonte de la page Tikrar Final avec modale d'instructions

## Changements

### 1. Refonte de `src/components/hifz/HifzStep5Tikrar.tsx`

**Remplacer le bouton "J'ai récité"** par un champ de saisie numérique (comme dans `StepTikrarFinal`), permettant a l'utilisateur d'entrer directement son nombre de repetitions. Le solde restant et le cercle de progression se mettent a jour en temps reel.

**Ajouter un lien d'instructions** sous le compteur : "Cliquez ici pour lire les instructions avant de commencer" qui ouvre une modale.

**Conserver** : le countdown 24h, la detection d'expiration avec reset, le bouton "Valider" qui n'apparait qu'a 40/40, la persistance via `onUpdateStatus`.

### 2. Modale d'instructions (dans le meme fichier)

Utiliser `framer-motion` (`AnimatePresence` + `motion.div`) pour un overlay modal elegant avec scroll interne sur mobile.

Contenu structure en 3 sections :
- **Section A** - Choisissez votre rythme (options 2/3/4 jours)
- **Section B** - La regle de l'excellence (recitation de memoire, reprendre depuis le debut en cas d'erreur)
- **Section C** - Gerez votre energie (fractionner les sessions, ecouter son corps)

Style coherent : fond semi-transparent vert emeraude, accents dores, texte clair.

### 3. Mise a jour de `StepTikrarFinal.tsx` (Istiqamah)

Ajouter le meme lien d'instructions et la meme modale pour assurer la coherence entre les deux parcours.

