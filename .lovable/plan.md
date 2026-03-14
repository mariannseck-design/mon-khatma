

## Ajouter une étape "Lecture Mushaf" entre Écoute et Récitation

### Constat actuel
Le flux dans `StepImmersion.tsx` a 2 phases par verset :
1. **listen** — Écoute audio + Mushaf (3x min)
2. **memory** — Récitation de mémoire sans aide (3x min)

### Modification
Insérer une phase **read** entre les deux, et préciser "3 fois minimum" dans chaque étape.

### Changements dans `src/components/hifz/istiqamah/StepImmersion.tsx`

1. **Type Phase** — Ajouter `'read'` et `'liaison-read'` au type union.

2. **Nouvel état `readCount`** — Compteur pour la phase lecture, initialisé à 0, persisté dans le localStorage (ajouté à `saveImmersionState`/`loadImmersionState`).

3. **Transitions modifiées** :
   - `handleContinueListen` : passe à `read` (au lieu de `memory`)
   - Nouveau `handleContinueRead` : passe à `memory`
   - Liaison idem : `liaison-listen` → `liaison-read` → `liaison-memory`

4. **Rendu phase "read"** — Affiche le Mushaf (toggle image/texte/physique), un compteur circulaire pour `readCount`, un bouton "J'ai lu ✓" qui incrémente `readCount`, et le bouton "Continuer" après 3x.

5. **Libellés mis à jour** (les 3 phases + liaison) :
   - Écoute : "Écouter, lire & répéter **(3 fois minimum)**"
   - Lecture : "Lire en regardant le Mushaf **(3 fois minimum)**"
   - Récitation : "Réciter de mémoire **(3 fois minimum)**"

6. **Reset sur changement de verset** — `readCount` remis à 0 avec les autres compteurs.

