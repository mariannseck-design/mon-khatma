

# Refonte de l'étape Immersion + Mémorisation verset par verset

## Contexte
L'utilisateur veut transformer le flux de mémorisation dans Istiqâmah. Au lieu du cycle actuel (Imprégnation → Autonomie → Gravure par verset), il veut un flux simplifié **verset par verset** directement dans l'étape "Préparer l'oreille" :

1. **Écoute + Répétition** : écouter le verset avec le récitateur 3 fois (audio par verset — déjà possible via `getAyahAudioUrl`)
2. **Mémoire** : réciter de mémoire 3 fois et confirmer
3. **Si erreur** → afficher le Mushaf pour relire, puis réessayer
4. Passer au verset suivant

## Réponse à la question audio
Oui, les audios sont déjà découpés par verset grâce à `getAyahAudioUrl(reciter, surahNumber, verseNumber)` qui retourne l'URL d'un seul verset.

## Changements prévus

### 1. Ajouter le Mushaf toggle dans `StepImmersion.tsx`
- Importer `HifzMushafToggle`, `HifzMushafImage`, `getVersesByRange`
- Afficher les 3 modes (image, texte, mon mushaf) comme dans les autres étapes
- Afficher le texte/image du **verset en cours** (pas tout le passage)

### 2. Transformer `StepImmersion` en flux verset par verset
Le composant gère en interne un état par verset avec 2 phases :

```text
Verset 1:
  Phase A: Écouter avec récitateur (3x) → bouton Play joue uniquement ce verset
  Phase B: Réciter de mémoire (3x) → boutons "✓ Correct" / "✗ Erreur"
    Si erreur → afficher Mushaf + relire → retour Phase A
    Si 3 succès → passer au Verset 2

Verset 2: même cycle
...
Tous validés → onNext()
```

**État interne** :
- `currentVerseIndex` (0-based parmi les versets du passage)
- `phase`: `'listen'` | `'memory'`
- `listenCount` (0→3)
- `memorySuccessCount` (0→3)

### 3. Fichier modifié
**`src/components/hifz/istiqamah/StepImmersion.tsx`** — refonte complète :
- Affichage du verset en cours avec indicateur (ex: "Verset 6 — 1/11")
- Phase écoute : bouton play pour ce verset seul, compteur circulaire 0/3
- Phase mémoire : compteur 0/3, boutons Correct/Erreur
- Si erreur : affichage du Mushaf avec toggle, puis bouton "J'ai relu" pour recommencer
- Pilules de versets en haut montrant la progression (vert = fait, actif = en cours)

### 4. Impact sur le flow Istiqâmah
Pour l'instant, on ne touche **pas** au flow global (`useIstiqamahState`). Les étapes Imprégnation/Autonomie/Gravure restent, et StepImmersion devient plus riche. On pourra simplifier le flow après validation de ce nouveau comportement.

