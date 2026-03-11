

## Deux variantes visuelles de la page Muraja'a

Créer deux pages expérimentales sans toucher à `MurjaPage.tsx`, accessibles via des routes temporaires.

### 1. `MurjaCardsPage.tsx` — Route `/murajaa-cards`

**Concept** : Vue en flashcards, grille 2 colonnes sur mobile.

- Réutilise la même logique de fetch (copie simplifiée de MurjaPage) : `allVerses`, `rabtVerses`, `tourVerses`, `checkedIds`, handlers.
- Affiche les items dans une grille CSS `grid-cols-2 gap-3`.
- Chaque carte : carré arrondi, bordure gauche colorée (moutarde/émeraude), contenu minimal :
  - Nom de la sourate (tronqué)
  - `📖 v.X → Y`
  - Petit indicateur de page
  - Tap pour valider (check overlay animé)
- Section Ar-Rabt et Consolidation séparées par un simple divider texte.
- Rating (tour) : bottom sheet simplifié au tap.
- Header identique au MurjaPage actuel.

### 2. `MurjaCalendarPage.tsx` — Route `/murajaa-calendar`

**Concept** : Bandeau calendrier horizontal + cartes filtrées par jour.

- Même logique de fetch que ci-dessus.
- En haut : bandeau horizontal scrollable montrant les 7 jours de la semaine courante (Lun → Dim).
  - Jour actif = fond émeraude, texte blanc.
  - Indicateurs sous chaque jour : point moutarde si rabt prévu, point émeraude si consolidation prévue.
  - Les items rabt sont quotidiens (point moutarde chaque jour des 30 jours).
  - Les items tour apparaissent le jour de leur `next_review_date`.
- Clic sur un jour → filtre les tâches affichées en dessous.
- Les tâches filtrées s'affichent en grille 2 colonnes (même style flashcard que variante 1).
- Jours futurs : lecture seule, pas de validation possible.

### 3. Routes et navigation temporaire

- Dans `App.tsx` : ajouter deux routes protégées `/murajaa-cards` et `/murajaa-calendar` (sans ComingSoonGate).
- Dans `MurjaPage.tsx` : ajouter 2 petits boutons de navigation en haut (icônes Grid et Calendar) pour accéder aux variantes, et un bouton retour sur chaque variante.

### Fichiers créés
- `src/pages/MurjaCardsPage.tsx`
- `src/pages/MurjaCalendarPage.tsx`

### Fichiers modifiés
- `src/App.tsx` — 2 routes
- `src/pages/MurjaPage.tsx` — 2 boutons nav temporaires

