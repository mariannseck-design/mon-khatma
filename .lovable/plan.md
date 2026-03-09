

## Plan : Améliorations du tableau de bord Muraja'a

### A. Badges d'information cliquables sur les titres de section

**`src/pages/MurjaPage.tsx`**
- À côté du titre "Ar-Rabt (Liaison du jour)" : ajouter une icône `Info` cliquable qui affiche un popover/tooltip "Nouvelle mémorisation"
- À côté du titre "Muraja'a (Consolidation)" : remplacer le tooltip existant (icône Lamp) par un badge `Info` cliquable affichant "Ancienne mémorisation"

### B. Logique conditionnelle du compte à rebours

**`src/components/muraja/MurajaCountdown.tsx`**
- Ajouter une prop `allChecked: boolean` 
- Si `allChecked = false` : afficher "En attente de votre validation du jour" à la place du timer
- Si `allChecked = true` : afficher le timer "Ta prochaine récitation dans..."

**`src/pages/MurjaPage.tsx`**
- Passer `allChecked={checkedCount >= totalBlocks && totalBlocks > 0}` au composant `MurajaCountdown`

### C. Textes de la page Muraja'a

**`src/pages/MurjaPage.tsx`**
- Sous le titre principal "Consolide ta mémorisation", ajouter le paragraphe : *"Voici les versets que tu dois réciter aujourd'hui (une fois au minimum). Tu peux parfaitement les utiliser durant tes prières. L'objectif est de préserver ton apprentissage par la grâce d'Allah (عز وجل) et de ne jamais l'oublier."*
- Remplacer le texte sous la section Muraja'a "Entretien de tes anciens acquis..." par : *"Ton programme du jour. Récite les versets ci-dessous pour maintenir ton niveau."*

**`src/components/muraja/MurajaChecklist.tsx`**
- Remplacer le comportement du bouton de validation : chaque item affiche un bouton "Bismillah, je valide ma révision" au lieu du simple checkbox tap

### D. Affichage "Mes ayats mémorisées"

**`src/pages/MurjaPage.tsx`**
- Renommer "Mes Escaliers" → "Mes ayats mémorisées :"
- Modifier `surahSummary` pour stocker `verse_start` et `verse_end` (min/max par sourate) au lieu du simple `versesCount`
- Afficher "v. 1 à 102" au lieu de "102 v."

### Fichiers modifiés
1. `src/pages/MurjaPage.tsx` — badges info, textes, titre trésor, affichage dynamique des versets
2. `src/components/muraja/MurajaCountdown.tsx` — logique conditionnelle d'affichage
3. `src/components/muraja/MurajaChecklist.tsx` — bouton "Bismillah, je valide ma révision"

