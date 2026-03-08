

## Plan : Dev Mode (Bouton Skip Admin)

### Principe
Un toggle "Dev Mode" visible uniquement pour les admins (`isAdmin` du AuthContext). Quand active, un bouton flottant "⏩ Skip" apparait sur chaque etape Hifz (0-6) et force le succes immediat.

### Implementation

**1. Etat global Dev Mode** -- `src/hooks/useDevMode.ts` (nouveau)
- Lit/ecrit `localStorage('dev_mode')` + verifie `isAdmin` depuis AuthContext
- Exporte `{ isDevMode, toggleDevMode }`
- Si pas admin, toujours `false`

**2. Composant bouton flottant** -- `src/components/hifz/DevSkipButton.tsx` (nouveau)
- Utilise `useDevMode()`
- Si `isDevMode` est `false`, ne rend rien
- Sinon affiche un bouton fixe en bas a droite : "⏩ Skip" avec fond semi-transparent
- Accepte un `onSkip` callback

**3. Integration dans `HifzPage.tsx`**
- Importer `useDevMode`
- Si devMode actif, passer un prop `onSkip` a chaque etape OU ajouter le bouton flottant au niveau de la page avec une logique centralisee :
  - Etapes 0-5 : appeler `updateStep(step + 1)` directement
  - Etape 6 : appeler `completeSession('easy')` directement
- Le skip enregistre les donnees normalement dans la BDD (la session progresse, les versets sont marques comme memorises a la fin)

**4. Toggle dans la page Profil** -- `src/pages/ProfilPage.tsx`
- Ajouter un bloc conditionnel (visible si `isAdmin`) avec un Switch "Mode Testeur (Dev)" qui toggle `useDevMode`

### Fichiers

| Fichier | Action |
|---|---|
| `src/hooks/useDevMode.ts` | Creer : hook localStorage + isAdmin |
| `src/components/hifz/DevSkipButton.tsx` | Creer : bouton flottant conditionnel |
| `src/pages/HifzPage.tsx` | Ajouter bouton Skip flottant par etape |
| `src/pages/ProfilPage.tsx` | Ajouter toggle Dev Mode (admin only) |

### Comportement du Skip par etape
- **Etape 0** (Intention) → passe a etape 1
- **Etape 1** (Revision) → passe a etape 2
- **Etape 2** (Impregnation) → passe a etape 3
- **Etape 3** (Tikrar) → passe a etape 4
- **Etape 4** (Validation) → passe a etape 5
- **Etape 5** (Liaison) → passe a etape 6
- **Etape 6** (Tour SM-2) → appelle `completeSession('easy')` → enregistre les versets memorises + streak en BDD

Les donnees sont enregistrees exactement comme un vrai succes : la session passe en `completed_at`, les versets entrent dans `hifz_memorized_verses` avec `next_review_date` a J+1.

