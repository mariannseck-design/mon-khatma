

## Plan : Corriger 3 bugs et améliorer l'étape Imprégnation

### Bug 1 — Bouton "Réactualiser" inactif (Hifz Step 1)

L'icône RotateCcw en haut est juste décorative, pas un bouton. Ajouter un bouton pour réinitialiser le timer et le compteur de récitations.

**`src/components/hifz/HifzStep1Revision.tsx`** : Transformer l'icône en bouton cliquable qui reset `timer` à 300 et `count` à 0, et relance l'intervalle.

### Bug 2 — Mode jour/nuit inactif (Quran Reader)

**`src/pages/QuranReaderPage.tsx`** :
- Ligne 45 : Changer `const [nightMode]` en `const [nightMode, setNightMode]`
- Créer une fonction `handleNightModeChange` qui met à jour le state et persiste dans `localStorage`
- Ligne 411 : Remplacer `onNightModeChange={() => {}}` par `onNightModeChange={handleNightModeChange}`

### Amélioration 3 — Étape Imprégnation (Hifz Step 2)

**`src/components/hifz/HifzStep2Impregnation.tsx`** :
1. Afficher les versets arabes en cours de mémorisation pendant l'écoute (fetcher le texte arabe depuis l'API alquran.cloud en même temps que l'audio)
2. Ajouter un bouton "Ouvrir dans le Mushaf" qui redirige vers `/quran-reader` à la bonne page
3. Supprimer le plafond de 3 écoutes — permettre d'écouter autant de fois que souhaité, mais afficher le bouton "Suivant" dès 3 écoutes atteintes

**Détails techniques pour l'affichage des versets** :
- Stocker le texte arabe de chaque ayah dans `ayahsRef` (déjà disponible dans la réponse API)
- Afficher une `ScrollArea` avec les versets arabes, en surlignant le verset en cours de lecture
- Ajouter un lien vers le Mushaf en utilisant `useNavigate` + la fonction `getSurahByPage` pour trouver la page correspondante

