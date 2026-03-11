

## Améliorations UX du Calendrier Muraja'a

### 1. Sous-titres pédagogiques sur les sections

Dans `renderSection`, enrichir le label avec un sous-titre grisé :
- **Ar-Rabt** → ajouter `· Liaison quotidienne 💡` en `text-[10px]` grisé à côté du titre
- **Consolidation** → ajouter `· Révision espacée` avec icône `Lightbulb` de lucide-react

Modifier l'appel à `renderSection` pour passer un `subtitle` en paramètre, puis l'afficher inline après le label principal.

### 2. Calendrier dynamique — déjà fonctionnel

Le code actuel utilise `selectedDay` et `getItemsForDay(selectedDay)` — le filtrage est déjà en place. Le problème est que **pour les jours futurs, Ar-Rabt affiche toujours les mêmes items** car `rabtVerses` est retourné tel quel sans tenir compte du jour. C'est correct (la liaison est quotidienne, même programme chaque jour). Les items de consolidation sont bien filtrés par `next_review_date === dayKey` pour les jours futurs.

Aucun changement de logique nécessaire — le calendrier est déjà dynamique. Si l'utilisateur ne voit pas de changement entre les jours, c'est parce que le programme Ar-Rabt est identique chaque jour et qu'aucun item de consolidation n'est planifié pour ces dates.

### 3. Bannière de succès — correctif

Actuellement la bannière n'apparaît que si `isToday` (ligne 279). La condition `allDayChecked` inclut déjà `!isFutureDay`. Modifier pour que la bannière s'affiche aussi pour les jours passés si tout est coché, mais **pas** pour les jours futurs ni les jours vides :

```typescript
// Remplacer: allDayChecked && isToday
// Par: allDayChecked (qui inclut déjà !isFutureDay et totalItems > 0)
```

### Changements dans `src/pages/MurjaCalendarPage.tsx`

1. **Importer** `Lightbulb` depuis lucide-react
2. **Modifier `renderSection`** : ajouter paramètre `subtitle: string` et l'afficher en `text-[10px]` grisé avec icône Lightbulb à côté du titre
3. **Bannière** : retirer `&& isToday` de la condition (ligne 279)
4. **Appels** : passer les sous-titres `'Liaison quotidienne'` et `'Révision espacée'` aux deux appels de `renderSection`

