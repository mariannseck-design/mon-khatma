

# Correction des couleurs dans QuranTextView

## Diagnostic

Le fichier `QuranReaderPage.tsx` a bien les couleurs olive (barres vertes, fond crème). Mais le composant `QuranTextView.tsx` utilise encore les anciennes couleurs dorées en mode clair :

- `surahNameColor` en mode clair = `#8a6d1b` (or/brun) → devrait être olive
- `bgColor` en mode clair = `#fefdfb` (blanc cassé) → c'est correct, mais peut-être pas assez blanc/visible

## Changements dans `src/components/quran/QuranTextView.tsx`

### Mode clair — passer à la palette olive :
- `textColor` (mode clair) : rester `undefined` (texte noir par défaut) — OK
- `bgColor` (mode clair) : `#ffffff` (blanc pur pour mieux se détacher du fond crème)
- `surahNameColor` (mode clair) : `#5e6e54` (vert olive foncé) au lieu de `#8a6d1b`
- `highlightBg` (mode clair) : `rgba(122, 139, 111, 0.12)` au lieu de `rgba(138, 109, 27, 0.12)`

### Mode sombre — inchangé :
Les couleurs dorées sur fond vert forêt restent telles quelles (c'est le design voulu pour le mode sombre).

