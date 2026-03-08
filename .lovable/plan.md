

## Refonte de la carte "Mes Versets Favoris"

### Problemes actuels
1. La carte affiche tous les versets inline (ScrollArea) mais un seul est visible a cause du scroll interne
2. Cliquer sur un verset redirige vers le Mushaf au lieu d'ouvrir une page dediee
3. Le bouton supprimer est expose directement — il faut un menu 3 points (partager / supprimer)

### Solution

**La carte sur l'accueil devient une carte-resume compacte** : icone coeur, titre, nombre de versets, et un petit apercu (noms des 2-3 premieres sourates). Cliquer dessus ouvre une **nouvelle page dediee** `/favoris` avec la liste complete.

**Sur la page dediee**, chaque verset a un **menu 3 points** (MoreVertical) avec les options "Ouvrir dans le Mushaf" et "Supprimer". On peut aussi partager le verset (copier texte arabe + traduction).

### Fichiers

1. **`src/components/favoris/FavoriteVersesSection.tsx`** — Simplifier en carte-resume compacte :
   - Affiche icone + titre + count + apercu des 2-3 premieres sourates
   - Clic sur la carte → `navigate('/favoris')`
   - Plus de ScrollArea ni de liste inline

2. **`src/pages/FavorisPage.tsx`** — Nouvelle page dediee :
   - Charge tous les favoris depuis la DB
   - Affiche chaque verset en carte (arabe + traduction)
   - Bouton 3 points (MoreVertical) sur chaque carte avec DropdownMenu :
     - "Ouvrir dans le Mushaf" → getExactVersePage + navigate
     - "Partager" → copie texte dans le presse-papier
     - "Supprimer" → supprime avec confirmation
   - Bouton retour en haut

3. **`src/App.tsx`** — Ajouter la route `/favoris` (protegee)

### Design du menu 3 points
```text
┌──────────────────────┐
│ Al-Ma'ida : 18   ⋮  │
│                      │
│   ﴾ texte arabe ﴿    │  ← menu ⋮ ouvre:
│                      │     📖 Ouvrir dans le Mushaf
│   traduction...      │     📋 Copier / Partager
│                      │     🗑 Supprimer
└──────────────────────┘
```

### Carte resume sur l'accueil
```text
┌──────────────────────────┐
│ ❤️  Mes Versets Favoris  │
│    3 versets sauvegardés  │
│    Al-Ma'ida, Al-Baqara…  │
│              Voir tout →  │
└──────────────────────────┘
```

