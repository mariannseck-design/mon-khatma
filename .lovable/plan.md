

## Reprise différée, bouton Pause & sas de décompression

### Ce qui existe déjà
- La persistance localStorage + DB est **déjà implémentée** : `saveLocalSession()` sauvegarde `{session, step, sessionId}` à chaque changement d'étape et sur `visibilitychange`.
- Au retour sur `/hifz`, un écran "Reprendre / Recommencer" s'affiche si une session incomplète est détectée.
- Le `HifzStepWrapper` affiche un chronomètre par étape.

### Ce qui manque (3 ajouts)

**1. Bouton "⏸️ Mettre en pause" sur chaque étape**
- Dans `HifzStepWrapper.tsx` : ajouter un bouton discret en bas de l'écran "⏸️ Pause — revenir à l'accueil".
- Ajouter une prop `onPause?: () => void` au wrapper.
- Dans `HifzPage.tsx` : créer un handler `handlePause` qui sauvegarde l'état (localStorage + DB update) puis navigue vers `/accueil` via `useNavigate`.
- Passer `onPause` à chaque step component via le wrapper.

**2. Dashboard dynamique — "Continuer ma session"**
- Dans `AccueilPage.tsx` : au chargement, vérifier `localStorage(hifz_active_session)` et/ou requêter `hifz_sessions` pour une session non complétée.
- Si une session en cours est trouvée, remplacer le contenu de la carte "Espace Hifz" :
  - Titre : "Continuer ma session"
  - Sous-titre : "Sourate X — Étape Y en cours"
  - Lien reste `/hifz` (la page détectera et proposera la reprise)

**3. Sas de pause de 3 min après le Tikrar (étape 3 → étape 4)**
- Créer un composant `HifzBreathingPause.tsx` : écran de décompression de 3 minutes avec un timer visuel, un message apaisant et un bouton "Passer" pour celles qui ne veulent pas attendre.
- Dans `HifzPage.tsx` : insérer un état intermédiaire `step === 3.5` (ou un booléen `showPause`) entre l'étape 3 et l'étape 4. Quand l'étape 3 appelle `onNext`, on affiche la pause au lieu de passer directement à l'étape 4.

### Fichiers impactés
- `src/components/hifz/HifzStepWrapper.tsx` — ajout prop `onPause` + bouton pause
- `src/pages/HifzPage.tsx` — handler pause + navigation + sas intermédiaire entre step 3→4
- `src/components/hifz/HifzBreathingPause.tsx` — nouveau composant (pause 3 min)
- `src/pages/AccueilPage.tsx` — détection session en cours + carte dynamique

### Détail technique

```text
Flux actuel :     Step3 (Tikrar) → Step4 (Validation)
Flux modifié :    Step3 (Tikrar) → Pause 3min → Step4 (Validation)

Dashboard :
  Session en cours ? → "▶️ Continuer ma session (Étape X)"
  Pas de session ?   → "Espace Hifz — Mémoriser le Noble Coran"
```

La pause utilise un `countdown` de 180s avec un cercle SVG animé et un bouton "Passer →" en bas. Le composant appelle `onComplete` pour déclencher `updateStep(4)`.

