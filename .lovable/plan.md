

## Plan : Refonte du panneau Parametres

### Problemes identifies
1. Le panneau prend toute la hauteur -- pas de scroll, le bouton X est cache
2. Sourate et versets sont separes -- les regrouper dans un bloc unique
3. Trop de contenu vertical sans possibilite de defiler

### Solution

**Fichier** : `src/components/quran/ReaderSettingsPanel.tsx`

1. **Ajouter un scroll** au contenu du panneau : limiter la hauteur max a `max-h-[75vh]` et wrapper le contenu (apres le header) dans un `overflow-y-auto` avec du padding en bas. Le header avec le X reste fixe en haut.

2. **Regrouper Sourate + Versets** dans un seul bloc encadre :
   - Un bloc arrondi avec bordure subtile contenant :
     - Le bouton "Choisir une sourate" en haut
     - En dessous, les deux inputs "Du verset" / "Au verset" cote a cote
   - Supprime les `mb-4` separees, un seul `mb-4` sur le bloc parent

3. **Structure du panneau** (de haut en bas) :
   - Header (Parametres + bouton X) -- toujours visible
   - Zone scrollable contenant :
     - Bloc Sourate + Versets (regroupe)
     - Mode d'affichage
     - Tajwid toggle
     - Traduction toggle + editions
     - Taille du texte
     - Luminosite
     - Audio

### Details techniques

```text
┌─────────────────────────┐
│ Paramètres          [X] │  ← fixe
├─────────────────────────┤
│ ┌─ Sourate & Versets ─┐ │
│ │ 📖 Choisir sourate >│ │  ← scroll
│ │ [Début]    [Fin]    │ │
│ └─────────────────────┘ │
│ Mode: [Mushaf] [Texte]  │
│ Tajwid        [toggle]  │
│ Traduction    [toggle]  │
│ Taille: [P][M][G][TG][M]│
│ Luminosité    [toggle]  │
│ Audio: [▶] [récitant ▼] │
└─────────────────────────┘
```

