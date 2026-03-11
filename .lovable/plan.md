

## Modifications demandées

### 1. Mettre en gras et agrandir "Révision espacée" et "Liaison quotidienne"

**`src/pages/MurjaPage.tsx`** lignes 581 et 600 :
- Changer `text-[10px] font-medium` en `text-[11px] font-bold` pour les deux labels "· Liaison quotidienne" et "· Révision espacée"

### 2. Restaurer l'affichage détaillé après validation de toutes les révisions

Actuellement quand tout est validé, le message "Alhamdulillah..." dans `MurjaPage.tsx` (lignes 516-533) est un simple banner sans détail. Le composant `MurajaCountdown` (ligne 513) affiche déjà les prochaines révisions avec dates, pages et types — mais le banner duplique le message de succès.

**`src/pages/MurjaPage.tsx`** :
- Supprimer le banner "Alhamdulillah" simplifié (lignes 516-534) qui fait doublon avec `MurajaCountdown`
- Le composant `MurajaCountdown` gère déjà l'affichage complet avec les portions validées et les prochaines révisions détaillées (dates, pages, type Liaison/Révision)

De même dans **`MurajaChecklist.tsx`** (lignes 127-141), le message "Alhamdulillah, tu as terminé tes révisions pour aujourd'hui !" pour la section tour quand `hasTourBlocks` est true :
- Remplacer par l'affichage des `nextTourReviews` avec détails (sourate, versets, date) au lieu du simple message avec PartyPopper — identique à ce qui est déjà codé lignes 342-367 mais affiché même quand `items` est vide

### Fichiers modifiés
- `src/pages/MurjaPage.tsx` — labels en gras + suppression banner doublon
- `src/components/muraja/MurajaChecklist.tsx` — message tour vide → affichage prochaines révisions

