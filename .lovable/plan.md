

## Plan : Supprimer le MiniPlayer, garder l'audio persistant + lien Mushaf

### Principe

L'AudioContext garde déjà l'audio en vie quand on change de page. On supprime le MiniPlayer (source de tous les bugs) et on ajoute juste un **lien discret vers le Mushaf** sur les pages de mémorisation. L'audio du bouton écouter (à côté du compteur) continue de tourner même si l'utilisateur navigue ailleurs.

### Fichiers à modifier

**1. `src/App.tsx`** — Retirer l'import et le rendu de `<MiniPlayer />`

**2. `src/components/layout/MiniPlayer.tsx`** — Supprimer le fichier

**3. `src/contexts/AudioContext.tsx`** — Simplifier : retirer `stopSignal` (plus de stop externe). Garder `registerAudio`, `pause`, `resume`, `stop` pour la gestion interne des composants.

**4. Les 5 composants audio** — Retirer le `useEffect` sur `stopSignal` et l'import de `stopSignal` :
- `HifzStep2Impregnation.tsx`
- `HifzStepIntentionImpregnation.tsx`
- `HifzStepImpregnationTajweed.tsx`
- `StepImpregnation.tsx`
- `StepImmersion.tsx`

**5. Pages de mémorisation** — Ajouter un lien "📖 Lire sur le Mushaf" qui ouvre `/quran-reader?page=X` (la bonne page du verset en cours). Ce lien existe déjà dans certains steps, on s'assure qu'il est présent dans les wrappers principaux :
- `HifzStepWrapper.tsx` (déjà utilisé par tous les steps)

### Ce qui se passe

- L'utilisateur lance l'écoute avec le bouton Volume2 à côté du compteur
- Il clique sur "📖 Lire sur le Mushaf" → navigue vers le Quran Reader
- L'audio continue de tourner (AudioContext le garde en vie)
- Quand l'audio finit ou que l'utilisateur revient, tout est propre
- Plus de MiniPlayer = plus de bugs de stop/onerror/ghost audio

