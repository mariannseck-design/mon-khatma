

## Plan : Texte arabe en blanc sur les pages Hifz

### Changement

**`src/components/hifz/HifzStepImpregnationTajweed.tsx`** ligne 129 :
- Changer `color: '#e8e0d0'` → `color: '#ffffff'` pour le texte arabe de base (les couleurs de tajweed resteront inchangées car elles sont appliquées en inline sur les segments annotés)

C'est le seul fichier concerné — les autres étapes Hifz utilisent déjà du texte blanc ou cream similaire. Cette modification rendra le texte non-tajweed en blanc pur, comme demandé.

