

## Corrections de la section détail Juz

### Problèmes identifiés
1. **"Prochaine révision : Aujourd'hui"** — Si la révision a déjà été faite aujourd'hui (`last_reviewed_at` = aujourd'hui), la prochaine révision ne peut pas être aujourd'hui. Il faut recalculer `nextReview` en excluant les items déjà révisés aujourd'hui, ou afficher la prochaine date future.
2. **Ordre d'affichage** — "Dernière révision" doit apparaître **avant** "Prochaine révision" (logique chronologique passé → futur).
3. **Pas de boutons cliquables** — Les blocs "Prochaine révision" et "Dernière révision" sont de simples `div` statiques, pas des boutons. Ils ne mènent nulle part.

### Modifications — `src/pages/HifzSuiviTestPage.tsx`

**1. Filtrer `nextReview` pour exclure les items déjà révisés aujourd'hui**
- Dans le `useMemo` (l.163), ne considérer `m.next_review_date` pour `earliestReview` que si l'item n'a **pas** été révisé aujourd'hui (`!m.last_reviewed_at || !isToday(new Date(m.last_reviewed_at))`)
- Ainsi, si tout est révisé aujourd'hui, `nextReview` sera la prochaine date future (ex: "13 mars")

**2. Inverser l'ordre dans le grid (l.354-370)**
- Afficher "Dernière révision" en premier, puis "Prochaine révision"

**3. Rendre les blocs cliquables**
- "Dernière révision" : informatif seulement → reste un `div` (pas d'action logique)
- "Prochaine révision" : transformer en `button` / lien qui navigue vers `/muraja` pour lancer la révision

### Fichier modifié
- `src/pages/HifzSuiviTestPage.tsx`

