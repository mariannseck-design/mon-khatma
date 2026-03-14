

## Refonte des objectifs du défi Al-Baqara

### Problème
Les options actuelles (48, 30, 24, 15, 7, 3, 1 jours) sont arbitraires. L'utilisateur souhaite des choix plus naturels : par semaines + option personnalisée.

### Solution

Remplacer la grille `GOALS` par 3 propositions claires + un champ libre :

| Option | Durée | Rythme |
|---|---|---|
| 🌙 1 mois | 30 jours | ~1.5 pages/jour |
| ⭐ 2 semaines | 14 jours | ~3.5 pages/jour |
| 🔥 1 semaine | 7 jours | ~7 pages/jour |
| ✏️ Personnalisé | X jours | calcul dynamique |

L'option "Personnalisé" affiche un input numérique (1-365 jours) avec le rythme calculé en temps réel (`~${(48/days).toFixed(1)} pages/jour`).

### Fichier modifié

**`src/components/defis/DefiAlBaqara.tsx`** :
1. Remplacer le tableau `GOALS` par les 3 options prédéfinies
2. Ajouter un état `customDays` pour l'option personnalisée
3. Ajouter un 4e bouton "Personnalisé" qui affiche un input numérique
4. Calculer dynamiquement la description du rythme pour l'option personnalisée
5. Adapter `selectedGoal` pour fonctionner avec les nouvelles options ou la valeur custom

