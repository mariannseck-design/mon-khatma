

## Remplacer "Lire / Lecture" par "Mémoriser / Mémorisé" dans l'étape de mémorisation

### Contexte
Les termes "Lire" et "Lecture" dans la phase de lecture (read phase) de l'étape Mémorisation prêtent à confusion. Il faut les remplacer par "Mémoriser" / "Mémorisé".

### Fichiers à modifier

#### 1. `src/components/hifz/istiqamah/StepImmersion.tsx`
- **Ligne 557** : `"Passer à la lecture"` → `"Passer à la mémorisation"`
- **Ligne 567** : `"Lire en regardant le Mushaf (3 fois minimum)"` → `"Mémoriser en regardant le Mushaf (3 fois minimum)"`
- **Ligne 567** : `"Liaison — Lecture Mushaf"` → `"Liaison — Mémorisation Mushaf"`
- **Ligne 570** : `"Lis le verset en regardant le Mushaf"` → `"Mémorise le verset en regardant le Mushaf"`
- **Ligne 588** : `"J'ai lu ✓"` → `"Mémorisé ✓"`
- **Ligne 599** : `"Lecture {readCount + 1} — Lis attentivement..."` → `"Mémorisation {readCount + 1} — Mémorise attentivement..."`
- **Ligne 665** : `"Relire les versets"` / `"Relire le verset"` → `"Remémoriser les versets"` / `"Remémoriser le verset"`
- **Ligne 666** : `"Relis attentivement"` → `"Remémorise attentivement"`

#### 2. `src/components/hifz/HifzStep3Memorisation.tsx`
- **Ligne 105** : `"Lecture autonome"` → `"Mémorisation autonome"`
- **Ligne 106** : `"Lisez seul(e)..."` → `"Mémorisez seul(e)..."`
- **Ligne 413** : `"Lecture"` (label onglet) → `"Mémorisation"`

