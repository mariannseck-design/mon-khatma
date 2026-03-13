

## Deux changements majeurs pour Muraja'a

### 1. Nouveaux intervalles SM-2 adaptés au Hifz + bouton "Très facile"

**Problème actuel** : 3 boutons (Difficile/Moyen/Facile) avec un SM-2 générique. Après 30 jours de Takrar, les intervalles ne sont pas assez serrés pour le Coran.

**Changement** : Passer à 4 boutons avec des intervalles initiaux fixes pour la 1ère révision, puis SM-2 classique ensuite.

| Bouton | 1ère révision | 2ème+ révision | Facteur |
|--------|--------------|----------------|---------|
| Difficile | 1 jour | reset à 1j | ease - 0.15 |
| Moyen | 3 jours | interval × ease | inchangé |
| Facile | 7 jours | interval × ease × 1.3 | ease + 0.10 |
| Très facile | 14 jours | interval × ease × 1.5 | ease + 0.15 |

**Fichiers modifiés** :
- `src/lib/sm2Config.ts` : ajouter `interval3` (7j) et `interval4` (14j) aux defaults et localStorage
- `src/hooks/useMurajaData.ts` : `computeSM2` prend en charge quality=5 (facile) et quality=6 (très facile), utilise les 4 intervalles
- `src/components/hifz/HifzStep6Tour.tsx` : 4 boutons au lieu de 3, grid `grid-cols-4` (ou 2x2)
- `src/pages/MurjaCalendarPage.tsx` : `RATINGS` passe à 4 entrées avec icône Star pour "Très facile"
- `src/pages/ParametresPage.tsx` : ajouter sliders pour interval3 et interval4

### 2. Séparer Ar-Rabt et Consolidation en deux pages distinctes

**Actuellement** : une seule page `/muraja` affiche les deux sections.

**Nouveau** :
- `/muraja/rabt` — Page Ar-Rabt (Liaison quotidienne, versets < 30 jours)
- `/muraja/revision` — Page Consolidation (Révision espacée SM-2)
- `/muraja` — Page hub avec deux cartes cliquables vers chaque section, compteur global, streak

**Fichiers** :
- Créer `src/pages/MurajaHubPage.tsx` : hub avec 2 cartes (Ar-Rabt doré, Consolidation vert), compteur X/N pour chaque, streak
- Créer `src/pages/MurajaRabtPage.tsx` : contient le bandeau semaine + cartes Rabt uniquement (checkbox simple)
- Créer `src/pages/MurajaRevisionPage.tsx` : bandeau semaine + cartes Consolidation uniquement (bottom sheet 4 boutons)
- `src/App.tsx` : ajouter les 3 nouvelles routes, garder `/muraja` comme hub
- Supprimer ou rediriger l'ancien `MurjaCalendarPage.tsx`
- `src/hooks/useMurajaData.ts` : inchangé (les données sont déjà séparées en `rabtVerses` / `tourVerses`)

### Architecture des pages

```text
/muraja (Hub)
├── Carte "Ar-Rabt" → /muraja/rabt
│   └── Bandeau semaine + cartes liaison (check simple)
└── Carte "Consolidation" → /muraja/revision
    └── Bandeau semaine + cartes SM-2 (4 boutons rating)
```

### Détails techniques
- Le hook `useMurajaData` est réutilisé tel quel dans les 3 pages
- La logique streak reste sur le hub (calculée quand les deux sections sont complètes)
- Les sliders SM-2 dans Paramètres passent de 3 à 5 (ajout interval3=7j et interval4=14j)
- Le `computeSM2` distingue 4 niveaux de quality au lieu de 3

