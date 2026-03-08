

## Désactiver les boutons "Lire le Coran" quand `disabled=true`

### Problème
Les boutons "Lire Al-Mulk 📖", "Lire Al-Kahf 📖" et "Continuer ma lecture 📖" dans les 3 composants de défis ne sont pas désactivés quand `disabled=true`. Ils restent cliquables et redirigent vers le lecteur de Coran.

### Correction

Dans les 3 fichiers, envelopper le bouton "Lire" dans le même bloc `disabled` que le reste, ou ajouter une condition `disabled` directement sur le bouton.

**`src/components/defis/DefiAlMulk.tsx`** (ligne ~173)
- Ajouter `pointer-events-none opacity-50` quand `disabled`, et bloquer le `onClick`

**`src/components/defis/DefiAlKahf.tsx`** (ligne ~232)
- Idem

**`src/components/defis/DefiAlBaqara.tsx`** (ligne ~287)
- Idem

Concrètement, pour chaque bouton : `onClick={() => { if (!disabled) navigate(...) }}` + classe conditionnelle `disabled ? 'opacity-50 pointer-events-none' : ''`.

