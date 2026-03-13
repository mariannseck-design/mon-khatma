
Objectif: corriger définitivement le retour dans le flux Hifz pour qu’il n’envoie plus vers l’accueil par erreur.

1) Diagnostic confirmé dans le code
- Le “back guard” matériel/navigateur est actuellement limité à un seul cas: `step === -1 && !showDiagnostic && !showGoalOnboarding && !showResumePrompt` (dans `src/pages/HifzPage.tsx`).
- Donc dès qu’on est dans d’autres écrans d’entrée (diagnostic / onboarding objectif / reprise), le retour natif retombe sur l’historique (souvent `/accueil`).
- En plus, `HifzGoalOnboarding` n’a pas de vrai bouton retour explicite pour revenir à l’écran “acquis déjà mémorisés”.

2) Plan de correction
- Fichier: `src/pages/HifzPage.tsx`
  - Remplacer la logique popstate actuelle par une logique centralisée “pré-session” couvrant:
    - Diagnostic
    - Onboarding objectif
    - Prompt reprise
    - Config (étape 1/5)
  - Ajouter un résolveur de destination retour selon contexte:
    - Depuis config/pré-session standard: retour vers `/hifz-hub`
    - Depuis onboarding objectif lancé juste après diagnostic: retour vers le diagnostic (pas vers accueil)
  - Introduire un flag de contexte (ex: `canReturnToDiagnostic`) pour distinguer:
    - utilisateur en premier parcours (diagnostic → objectif)
    - utilisateur ancien sans objectif actif (objectif seul) qui doit revenir au hub.

- Fichier: `src/components/hifz/HifzGoalOnboarding.tsx`
  - Ajouter une prop `onBack?: () => void`.
  - Afficher un bouton retour visible en haut (même style que le reste du flux), branché sur `onBack`.
  - Garder la sauvegarde d’objectif inchangée.

- Fichier: `src/pages/HifzPage.tsx` (wiring UI)
  - Passer `onBack` à `HifzGoalOnboarding`:
    - si `canReturnToDiagnostic` → `setShowGoalOnboarding(false); setShowDiagnostic(true)`
    - sinon → `navigate('/hifz-hub')`
  - Conserver le bouton retour de `HifzConfig` vers `/hifz-hub` (déjà correct).

3) Résultat attendu (UX)
- Le retour natif Android/Chrome ne renvoie plus à l’accueil dans le tunnel Hifz.
- Depuis l’écran objectif, l’utilisateur peut revenir à la page “acquis déjà mémorisés” quand il vient de ce parcours.
- Le comportement reste cohérent pour les autres profils (pas de régression vers diagnostic inutile).

4) Vérifications à exécuter après implémentation
- Cas A: `Hifz Hub → Hifz Config (étape 1/5)` puis bouton retour natif → `Hifz Hub`.
- Cas B: `Diagnostic acquis → Onboarding objectif` puis retour (bouton UI + retour natif) → `Diagnostic`.
- Cas C: utilisateur déjà onboardé sans objectif: `Onboarding objectif` puis retour → `Hifz Hub`.
- Cas D: aucune redirection involontaire vers `/accueil` dans ces scénarios.

Détails techniques (résumé)
- Pas de changement backend.
- Correction purement front-end, centrée sur une machine d’état de navigation dans `HifzPage`.
- Extension d’API composant `HifzGoalOnboarding` (prop `onBack`) pour aligner retour UI et retour natif.
