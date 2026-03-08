

## Plan : Bouton "Tout effacer" sur l'écran du diagnostic

### Objectif
Ajouter un bouton de réinitialisation sur l'écran principal du diagnostic (étape `choose-category`) pour que l'utilisatrice puisse effacer toutes ses saisies (acquis solides + récents) si elle s'est trompée, sans devoir passer par les Paramètres.

### Changement dans `src/components/hifz/HifzDiagnostic.tsx`

Dans le bloc "Acquis enregistrés" (lignes 591-609), ajouter un bouton "Tout effacer" (icône `RotateCcw`) en haut à droite du résumé. Au clic :
- Vider `solidBlocks`, `recentBlocks`, `solidLabels`, `recentLabels`, `recentDaysMap`
- Appeler `resetEntryForm()`
- Afficher un petit toast de confirmation

Le bouton sera discret (texte rouge/destructif, petite taille) pour ne pas gêner le flux normal mais rester accessible.

```text
┌─────────────────────────────────────┐
│  Acquis enregistrés        [↺ Tout  │
│                             effacer]│
│  🏛️ Acquis Solides    p.1-10       │
│  🌱 Récents           Juz 30       │
└─────────────────────────────────────┘
```

### Détails
- Import `RotateCcw` (déjà disponible dans lucide-react)
- Bouton stylé : `text-[10px] text-red-400/70 hover:text-red-400` avec icône 3x3
- `window.confirm()` avant d'effacer pour éviter les clics accidentels

