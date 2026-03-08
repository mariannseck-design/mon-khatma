

## Adapter les phases du Tikrar en 4 quarts dynamiques

### Problème actuel
Les seuils de phase sont codés en dur (1-10, 11-15, 16+) dans `getPhaseInfo()`, ce qui ne s'adapte pas au nombre de répétitions choisi (15, 20, 25, 30, 35 ou 40).

### Solution
Diviser le `tikrarTarget` en **4 quarts** dynamiques avec des modes progressifs :

```text
Exemple pour 20 répétitions :
Q1 (1-5)   : Texte Tajwid + Audio — Écoute, lecture et répétition simultanée
Q2 (6-10)  : Texte visible + Audio discret — Lecture autonome avec aide audio
Q3 (11-15) : Texte visible, sans audio — Autonomie visuelle
Q4 (16-20) : Texte masqué — Récitation de mémoire, bouton "Vérifier"
```

### Modifications dans `src/components/hifz/HifzStep3Memorisation.tsx`

1. **Remplacer `getPhaseInfo(ancrage)`** par une fonction `getPhaseInfo(ancrage, tikrarTarget)` qui calcule les seuils dynamiquement :
   - `q1End = Math.floor(target / 4)`
   - `q2End = Math.floor(target / 2)`
   - `q3End = Math.floor(target * 3 / 4)`
   - Phase 1 : `ancrage < q1End` → Texte + Audio actif
   - Phase 2 : `ancrage < q2End` → Texte + Audio discret
   - Phase 3 : `ancrage < q3End` → Texte seul, pas d'audio
   - Phase 4 : `ancrage >= q3End` → Texte masqué, mémoire pure

2. **Mettre à jour le guide (Mode d'emploi)** pour afficher les plages dynamiques au lieu des valeurs fixes (ex: "1 à 5" au lieu de "1 à 10").

3. **Ajouter la phase 2** (nouveau comportement intermédiaire) : texte visible + audio accessible mais pas proéminent — transition douce entre l'imprégnation et l'autonomie.

