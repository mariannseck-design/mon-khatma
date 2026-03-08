

## Consolidation Muraja'a + Révision : Checklist unifiée sur 24h

### Probleme actuel (doublons identifiés)

Il existe actuellement **deux pages** et **quatre composants** qui font la meme chose :

```text
/revision (RevisionPage)          /muraja (MurjaPage)
├── HifzStep5Liaison (Liaison)    ├── MurajaRabt (Liaison)
└── HifzStep6Tour (Tour)          ├── MurajaTour (Tour)
                                  ├── MurajaCountdown
                                  └── Mon trésor (summary)
```

Les deux pipelines Liaison et Tour existent en double avec des UX differentes. L'objectif est de tout fusionner en **une seule page** `/muraja` avec une **checklist interactive**.

### Architecture cible

```text
/muraja (MurjaPage refait)
├── Header + Countdown dynamique (setInterval, decompte vers minuit)
├── Jauge globale "X/Y blocs recites aujourd'hui"
├── Section "Ar-Rabt" (Pipeline A)
│   └── Checklist : tous les blocs < 30 jours, SANS plafond
│       └── Case a cocher → marque "last_reviewed_at" en DB
├── Section "Le Tour" (Pipeline B)
│   └── Checklist : blocs ou next_review_date <= today, AVEC plafond (max 10)
│       └── Case a cocher → popup d'auto-evaluation (Difficile/Moyen/Facile)
│       └── SM-2 update en DB
│   └── Message si plafond actif
├── Mon tresor (summary existant, conserve)
└── Celebration modal (conserve)
```

### Modifications fichier par fichier

**1. Supprimer les doublons**
- Supprimer `src/pages/RevisionPage.tsx`
- Supprimer `src/components/muraja/MurajaRabt.tsx`
- Supprimer `src/components/muraja/MurajaTour.tsx`
- Retirer la route `/revision` de `App.tsx`
- Dans `AccueilPage.tsx` : fusionner la carte "Entretien & Revision" avec la carte "Muraja'a" (une seule carte pointant vers `/muraja` avec le badge dore)

**2. Refaire `MurjaPage.tsx` — Page unique avec checklist**
- **Countdown dynamique** : garder `MurajaCountdown` mais le faire decompter vers minuit (pas vers next_review_date)
- **Jauge de progression** : barre en haut `"X/Y blocs recites aujourd'hui"`
- **Section Ar-Rabt** : liste de cases a cocher (blocs < 30 jours). Cocher = update `last_reviewed_at` + log `muraja_sessions`. Pas de plafond.
- **Section Le Tour** : liste de cases a cocher (blocs ou `next_review_date <= today`, max 10). Cocher → affiche un mini-dialog inline (Difficile/Moyen/Facile) → update SM-2. Message "revision plafonnee" si > 10 blocs tronques.
- **Persistance 24h** : sauvegarder les IDs coches dans `localStorage` avec cle `muraja_checked_{YYYY-MM-DD}`. Au chargement, lire cette cle. Si la date ne correspond plus → reset auto.
- **Mon tresor** : conserver le resume existant (surahSummary) tel quel en bas.

**3. Creer `src/components/muraja/MurajaChecklist.tsx`** — Nouveau composant unique
- Props : `items`, `section` ('rabt' | 'tour'), `checkedIds`, `onCheck`, `onRate` (pour le Tour)
- Affiche une liste verticale elegante avec cases a cocher, nom de sourate, plage de versets
- Pour le Tour : apres avoir coche, affiche 3 boutons d'evaluation inline sous l'item

**4. Modifier `MurajaCountdown.tsx`**
- Changer la reference : decompter vers minuit au lieu de `nextReviewDate`
- Texte : "Reset dans XX:XX:XX"

**5. `AccueilPage.tsx`**
- Supprimer la carte "Entretien & Revision" separee
- Reporter le badge dore de `pendingReviews` sur la carte Muraja'a existante
- Sous-titre dynamique : "X blocs a reviser" ou "Reviser et consolider"

**6. `App.tsx`**
- Retirer la route `/revision` et l'import de `RevisionPage`

### Section technique : Persistance 24h

```typescript
const today = new Date().toISOString().split('T')[0];
const STORAGE_KEY = `muraja_checked_${today}`;

// Load
const saved = localStorage.getItem(STORAGE_KEY);
const checkedIds = saved ? JSON.parse(saved) : [];

// Save on check
const newChecked = [...checkedIds, blockId];
localStorage.setItem(STORAGE_KEY, JSON.stringify(newChecked));

// Auto-cleanup old keys on mount
Object.keys(localStorage)
  .filter(k => k.startsWith('muraja_checked_') && k !== STORAGE_KEY)
  .forEach(k => localStorage.removeItem(k));
```

### Section technique : Plafond intelligent (Le Tour)

```typescript
const MAX_TOUR_BLOCKS_PER_DAY = 10;
const allDueBlocks = verses.filter(v => v.next_review_date <= today && isOlderThan30Days(v));
const tourBlocks = allDueBlocks.slice(0, MAX_TOUR_BLOCKS_PER_DAY);
const isCapActive = allDueBlocks.length > MAX_TOUR_BLOCKS_PER_DAY;
// Si plafond actif → message "Revision plafonnee a 10 blocs aujourd'hui"
```

### Fichiers impactes
- `src/pages/MurjaPage.tsx` — refonte complete (checklist)
- `src/components/muraja/MurajaChecklist.tsx` — nouveau composant
- `src/components/muraja/MurajaCountdown.tsx` — decompte vers minuit
- `src/pages/AccueilPage.tsx` — fusion des deux cartes
- `src/App.tsx` — retrait route `/revision`
- Suppression : `RevisionPage.tsx`, `MurajaRabt.tsx`, `MurajaTour.tsx`
- Conservation : `MurajaCelebration.tsx`, `HifzStep5Liaison.tsx`, `HifzStep6Tour.tsx` (ces deux derniers restent pour l'usage dans le tunnel Hifz s'ils y sont encore references)

