

## Plan : Corriger le message d'état vide de la section Muraja'a (Tour)

### Problème identifié

L'incohérence vient du fait que la section "Muraja'a (Consolidation)" affiche **toujours** le message "Tes blocs arriveront ici après 30 jours de liaison" quand aucun bloc n'est dû aujourd'hui. Mais ce message est faux quand l'utilisateur a déjà des blocs en tour (ex: Al-Baqara v.1-29 prévu le 16 mars). Le message ne devrait apparaître que si l'utilisateur n'a **aucun** bloc en statut "tour" du tout.

**Cas concret** : Al-Fatiha est validée → sa `next_review_date` passe dans le futur → plus rien de dû aujourd'hui → message "arriveront après 30 jours" alors que Al-Baqara v.1-29 est déjà en tour (prévu le 16 mars).

### Solution

**`src/pages/MurjaPage.tsx`** : Passer une nouvelle prop `hasTourBlocks` au composant `MurajaChecklist` de la section tour, indiquant si des blocs en statut "tour" existent dans `allVerses` (même s'ils ne sont pas dus aujourd'hui).

**`src/components/muraja/MurajaChecklist.tsx`** : Modifier l'état vide de la section "tour" :
- Si `hasTourBlocks === true` (blocs existent mais rien dû aujourd'hui) : afficher **"Alhamdulillah, tu as terminé tes révisions pour aujourd'hui !"** avec une icône de succès
- Si `hasTourBlocks === false` (aucun bloc tour du tout) : garder le message actuel "Tes blocs arriveront ici après 30 jours de liaison"

### Fichiers modifiés
1. **`src/components/muraja/MurajaChecklist.tsx`** — Ajouter prop `hasTourBlocks`, modifier l'état vide
2. **`src/pages/MurjaPage.tsx`** — Calculer et passer `hasTourBlocks`

