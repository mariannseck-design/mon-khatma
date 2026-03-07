

## Plan : Harmonisation du fond de l'overlay de traduction

### Changement unique

**Fichier : `src/components/quran/VerseTranslationDrawer.tsx`**

Ligne ~130, remplacer le style `background: '#faf8f2'` par un fond beige/crème plus chaud correspondant au Mushaf : `background: '#f5e6c8'` (ton parchemin doré clair).

Mettre à jour les couleurs du texte pour assurer la lisibilité :
- Texte arabe : noir `#1a1a1a` (au lieu de `#2d3a25`)
- Traduction française : noir/gris foncé `#2a2a2a` (au lieu de `#5e6e54`)
- Titre verset : noir `#1a1a1a`
- Handle et bordure : teintes dorées cohérentes

