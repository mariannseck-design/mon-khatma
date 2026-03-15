

## Plan : Intégrer l'étape Liaison (Ar-Rabt) avec Mushaf Image + Audio dans le parcours Hifz

### Problème
Le composant `HifzStep5Liaison` existe mais n'est **jamais importé ni utilisé** dans `HifzPage.tsx`. De plus, il ne contient ni affichage Mushaf Image ni lecteur audio — c'est juste une liste statique avec un bouton de confirmation.

### Solution

#### 1. Réécrire `HifzStep5Liaison.tsx` avec Mushaf + Audio
Transformer le composant pour inclure :
- **Mushaf Image** (`HifzMushafImage`) affichant les pages des versets mémorisés ces 30 derniers jours
- **Lecteur audio** avec play/pause pour écouter puis réciter de mémoire
- **Toggle Mushaf** (Image / Texte / Mon Mushaf) comme dans les autres étapes
- **3 phases** : Écouter (avec Mushaf visible) → Réciter sans regarder (Mushaf masqué) → Confirmer
- Utilisation du `registerAudio` global pour la persistance audio

#### 2. Intégrer dans le flow `HifzPage.tsx`
- Ajouter l'import de `HifzStep5Liaison`
- Insérer comme **step 5** (après Tikrâr step 4, avant Succès step 6)
- Mettre à jour `STEP_NAMES` et `PHASE_LABELS` pour 6 étapes
- Déplacer `completeSession` de step 4 → step 5
- Ajuster le DevSkipButton et les numéros de step

```text
Flow actuel :  0→1→pause→2→3→4→Succès(5)
Flow corrigé : 0→1→pause→2→3→4→5(Liaison)→Succès(6)
```

#### Fichiers modifiés
- `src/components/hifz/HifzStep5Liaison.tsx` — réécriture complète avec Mushaf Image, audio, 3 phases
- `src/pages/HifzPage.tsx` — import Liaison, ajout step 5, décalage Succès à step 6, mise à jour labels/skip

