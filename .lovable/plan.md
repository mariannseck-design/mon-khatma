

## Plan : Corriger le compteur J/30 et l'apparition des versets dans Ar-Rabt

### Problèmes identifiés

1. **J0/30 au lieu de J1/30** : `getLiaisonDaysPassed` calcule `floor((now - start) / 86400000)` → le jour même donne 0. Il faut ajouter +1 pour que le jour de validation compte comme J1.

2. **Les versets apparaissent sur les jours précédents** : Le filtre `rabtVerses` utilise `< today` ce qui exclut les versets mémorisés aujourd'hui. Mais le problème signalé est l'inverse — les versets mémorisés aujourd'hui ne devraient PAS apparaître avant demain dans Ar-Rabt (c'est correct). Cependant le compteur doit quand même afficher J1/30 le lendemain quand ils apparaissent.

### Changements

**`src/hooks/useMurajaData.ts`** — fonction `getLiaisonDaysPassed` :
- Changer le calcul pour compter J1 dès le lendemain de la mémorisation : `Math.min(30, Math.max(1, ...))` au lieu de `Math.max(0, ...)`
- Cela garantit que le premier jour d'apparition dans Ar-Rabt affiche J1/30 (pas J0/30)

