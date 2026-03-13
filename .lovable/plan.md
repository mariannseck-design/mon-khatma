

## Personnalisation des intervalles SM-2 dans les Parametres

### Contexte
L'algorithme SM-2 utilise actuellement des valeurs codées en dur :
- Facteur de facilite initial : **2.5**
- Intervalle 1ere repetition : **1 jour**
- Intervalle 2eme repetition : **6 jours**
- Facteur minimum : **1.3**

Ces valeurs apparaissent dans 4 fichiers (`useMurajaData.ts`, `hifzUtils.ts`, `HifzPage.tsx`, `HifzStep6Tour.tsx`).

### Plan

**1. Creer un module de configuration SM-2** (`src/lib/sm2Config.ts`)
- Expose les valeurs par defaut et une fonction `getSM2Config()` qui lit depuis localStorage
- Cles : `sm2_initial_ease` (2.5), `sm2_interval_1` (1), `sm2_interval_2` (6), `sm2_min_ease` (1.3)
- Une fonction `saveSM2Config()` pour persister

**2. Refactoriser les references hardcodees**
- `useMurajaData.ts` (computeSM2) : lire config au lieu de constantes
- `hifzUtils.ts` : utiliser `getSM2Config().initialEase` au lieu de `2.5`
- `HifzPage.tsx` : idem pour les inserts
- `HifzStep6Tour.tsx` : idem pour le calcul SM-2

**3. Ajouter une section dans ParametresPage.tsx**
- Nouvelle carte "Revision espacee" avec icone `Brain` entre la carte texte arabe et la carte info
- 3 sliders :
  - Facteur de facilite initial : 1.5 - 3.5 (pas 0.1, defaut 2.5)
  - 1er intervalle : 1 - 3 jours (defaut 1)
  - 2e intervalle : 3 - 10 jours (defaut 6)
- Bouton "Reinitialiser les valeurs par defaut"
- Texte explicatif : facteur eleve = intervalles qui augmentent plus vite

### Details techniques
- Stockage localStorage (coherent avec les autres parametres existants)
- Les changements s'appliquent uniquement aux prochaines evaluations, pas retroactivement aux intervalles deja calcules
- Le facteur minimum (1.3) reste fixe pour eviter des configurations cassantes

