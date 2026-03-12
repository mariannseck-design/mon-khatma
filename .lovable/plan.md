

# Refonte du flux Istiqamah — Passage au verset-par-verset

## Changement fondamental

Le flux actuel découpe par **pages Mushaf** et répète les 5 étapes pour chaque page-bloc. Le nouveau flux demandé est **verset par verset** avec les étapes globales en amont.

```text
ACTUEL:
  Part(page) 1 → [Compréhension, Immersion, Imprégnation, Autonomie, Gravure] → Fusion
  Part(page) 2 → [Compréhension, Immersion, Imprégnation, Autonomie, Gravure] → Fusion
  → Tikrar

NOUVEAU:
  Immersion Sonore (tout le passage, 1 fois)
  Compréhension (tout le passage, 1 fois)
  Verset 1 → [Imprégnation, Autonomie, Gravure]
  Verset 2 → [Imprégnation, Autonomie, Gravure] → Fusion(v1+v2)
  Verset 3 → [Imprégnation, Autonomie, Gravure] → Fusion(v1+v2+v3)
  ...
  → Tikrar Final (40 reps)
```

## Fichiers modifiés

### 1. `partSplitter.ts` — Découpage verset par verset
- Chaque verset = 1 Part (au lieu de pages Mushaf)
- `splitIntoParts` retourne un Part par verset individuel

### 2. `useIstiqamahState.ts` — Nouveau `buildFlow`
- Noeud 1 : `immersion` (partIndex = -1, couvre tout le passage)
- Noeud 2 : `comprehension` (partIndex = -1, couvre tout le passage)
- Pour chaque verset i : 3 noeuds `impregnation`, `autonomie`, `gravure` (partIndex = i)
- Après verset 2+ : noeud `fusion` avec fusionRange = [0..i]
- Dernier noeud : `tikrar`

### 3. `IstiqamahEngine.tsx` — Adapter le rendu
- Pour `immersion` et `comprehension` globaux : passer `startVerse`/`endVerse` du passage entier (pas du part)
- Mettre à jour les labels des étapes
- Afficher l'indicateur "Verset X" au lieu de "Partie X"

### 4. `StepComprehension.tsx` — Mise à jour textes
- Titre : "Étape 2 : Comprendre le message"
- Ajouter note : "Vous pouvez effectuer cette étape la veille…"

### 5. `StepImmersion.tsx` — Mise à jour textes
- Titre : "Étape 1 : Préparer l'oreille"
- Description mise à jour

### 6. `StepImpregnation.tsx` — Afficher numéro de verset
- Titre dynamique : "Imprégnation (Verset X)"
- Cible : 10 répétitions (au lieu de 7)
- Description : "Écoutez et répétez 5 à 10 fois en suivant sur le Mushaf"

### 7. `StepAutonomie.tsx` — Titre dynamique
- "Récitation assistée (Verset X)"

### 8. `StepGravure.tsx` — Titre dynamique  
- "Premier essai de mémoire (Verset X)"
- Message de félicitations : "Votre verset est ancré !"

### 9. `StepFusion.tsx` — Fusion entre versets
- Titre : "Créer le lien — Versets 1 à N"
- Phase écoute : 5 écoutes enchaînées (au lieu de 1)
- Descriptions adaptées au contexte verset

### 10. `StepTikrarFinal.tsx` — Textes enrichis
- Ajouter : "Divisez vos 40 répétitions en 10 sessions de 4 par heure"
- Ajouter : règle d'or sur le Mushaf en cas de doute uniquement

### 11. `IstiqamahPartIndicator.tsx` — Label "Verset" au lieu de "Partie"

## Détails techniques

- Aucune migration DB
- Aucune nouvelle dépendance
- Les composants existants (audio, mushaf) sont réutilisés tels quels
- Le flux dans `HifzPage.tsx` reste identique (IstiqamahEngine reçoit les mêmes props)
- Les steps Imprégnation/Autonomie/Gravure reçoivent un nouveau prop `verseLabel` pour afficher le numéro de verset dans le titre

