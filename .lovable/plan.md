

# Liaison entre versets + répétitions illimitées

## Deux améliorations dans `StepImmersion.tsx`

### 1. Phase de Liaison après chaque paire de versets
Après avoir mémorisé le verset 2 (et chaque verset suivant à partir du 2e), insérer une phase **"liaison"** qui regroupe tous les versets appris jusqu'ici :
- **Écoute liaison** : jouer les audios des versets 1+2 enchaînés, 3 fois
- **Mémoire liaison** : réciter les versets 1+2 ensemble de mémoire, 3 fois avec validation Correct/Erreur
- Si erreur → afficher le Mushaf des versets concernés + relire → recommencer

Le flux par verset devient :
```text
V1: écoute 3x → mémoire 3x ✓
V2: écoute 3x → mémoire 3x ✓
  → LIAISON V1+V2: écoute enchaînée 3x → mémoire enchaînée 3x ✓
V3: écoute 3x → mémoire 3x ✓
  → LIAISON V1+V2+V3: écoute enchaînée 3x → mémoire enchaînée 3x ✓
...
```

**Implémentation** : Ajouter un état `liaisonMode` au composant. Quand un verset (index >= 1) est validé, au lieu de passer directement au suivant, activer la liaison. La liaison joue les audios séquentiellement (V1 puis V2 etc.) et affiche tous les versets dans le Mushaf. Nouvelle phase `'liaison-listen'` et `'liaison-memory'` ajoutées au type `Phase`.

### 2. Répétitions au-delà de 3 (minimum, pas maximum)
- Le compteur circulaire affiche `count / 3` mais le bouton Play (écoute) et le bouton Correct (mémoire) restent actifs même après 3
- Après 3, un bouton "Continuer ✓" apparaît pour passer à la suite, mais l'utilisateur peut continuer à cliquer Play/Correct pour faire plus
- Le cercle dépasse visuellement le 100% (le stroke reste plein, le chiffre continue de monter)

### Fichier modifié
- `src/components/hifz/istiqamah/StepImmersion.tsx`

### Détails techniques
- Type `Phase` étendu : `'listen' | 'memory' | 'error' | 'liaison-listen' | 'liaison-memory' | 'liaison-error'`
- Nouveau state : `liaisonVerses: number[]` (liste des versets à relier)
- Fonction `playSequence(verses)` : joue les audios un par un en chaîne via `onended`
- `renderMushaf` accepte un range optionnel pour afficher plusieurs versets en liaison
- Le auto-transition `listen → memory` ne se fait plus automatiquement : après 3 écoutes, un bouton "Passer à la récitation" apparaît (mais Play reste actif pour continuer)

