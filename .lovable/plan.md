

## Rendre les textes plus gras et plus foncés — Muraja'a + Suivi Hifz

Remplacement des couleurs de texte trop claires (opacités `rgba` à 0.35–0.5) par des valeurs plus foncées, et passage des `font-medium`/`font-semibold` en `font-bold`/`font-extrabold`.

### Changements sur les 3 fichiers

**`src/pages/MurjaPage.tsx`**
- Sous-titre header : `rgba(28,36,33,0.6)` → `rgba(28,36,33,0.75)`, `text-xs` → `text-xs font-medium`
- Progress label "Progression du jour" : `font-medium` → `font-bold`
- Section titles (Ar-Rabt, Le Tour) : `font-semibold` → `font-bold`, `text-base` → `text-base`
- Sous-descriptions sections : `rgba(28,36,33,0.5)` → `rgba(28,36,33,0.65)`, ajouter `font-medium`
- Mon trésor title : `font-semibold` → `font-bold`
- Trésor surah names : `font-medium` → `font-bold`
- Trésor details (count, date) : `rgba(28,36,33,0.5)` → `rgba(28,36,33,0.65)`, `font-medium`
- Badge counts : `font-medium` ajouté
- Empty state texts : opacités 0.85→0.9, 0.5→0.7

**`src/components/muraja/MurajaChecklist.tsx`**
- Surah name unchecked : `fontWeight: 600` → `700`
- Surah name checked : `fontWeight: 700` → `800`
- Verse range text : `rgba(28,36,33,0.45)` → `rgba(28,36,33,0.6)`, `font-medium`
- Empty state text : `rgba(28,36,33,0.5)` → `rgba(28,36,33,0.65)`, `font-medium`
- Rating buttons : `font-medium` → `font-bold`

**`src/pages/HifzSuiviPage.tsx`**
- Motivation subtitle : `rgba(28,36,33,0.5)` → `rgba(28,36,33,0.65)`, `font-medium`
- Goal period label "/ X page..." : `rgba(28,36,33,0.45)` → `rgba(28,36,33,0.6)`, `font-medium`
- "Programme du jour" subtitle : `rgba(28,36,33,0.4)` → `rgba(28,36,33,0.6)`
- Revision items surah names : ajouter `font-semibold`
- Revision verse ranges : `rgba(28,36,33,0.4)` → `rgba(28,36,33,0.6)`
- KPI labels ("Jours consécutifs", etc.) : `rgba(28,36,33,0.5)` → `rgba(28,36,33,0.65)`, `font-medium`
- KPI record text : `rgba(28,36,33,0.35)` → `rgba(28,36,33,0.55)`
- Chart title : `font-semibold` → `font-bold`
- Chart axis ticks : `rgba(28,36,33,0.5)` → `rgba(28,36,33,0.65)`
- CircularGauge label : `rgba(28,36,33,0.5)` → `rgba(28,36,33,0.65)`, `font-medium`
- CircularGauge "/ max" text : `rgba(6,95,70,0.5)` → `rgba(6,95,70,0.7)`
- No goal text : `rgba(28,36,33,0.6)` → `rgba(28,36,33,0.75)`, `font-medium`
- Empty state : `rgba(253,251,247,0.85)` → `rgba(253,251,247,0.95)`, `font-medium`

