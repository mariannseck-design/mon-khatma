
Objectif
- Corriger définitivement le flux retour dans Hifz pour que, depuis “Étape 1/5 · Choix des versets”, l’utilisateur puisse revenir à la page “Faisons le point sur votre parcours” (acquis), sans devoir réinitialiser.

Diagnostic confirmé (code actuel)
- `HifzConfig` appelle `onBack={() => navigate('/hifz-hub')}` : retour forcé vers le Hub, pas vers la page “acquis”.
- Le guard `popstate` dans `HifzPage` renvoie aussi vers `/hifz-hub` dans le cas config, donc le bouton retour Android ne peut pas revenir vers la page “acquis”.
- Le flag `cameFromDiagnostic` est remis à `false` après validation d’objectif, ce qui casse la logique de retour vers les écrans initiaux.
- Le `pushState` dans le handler `popstate` peut créer une pile historique instable (retours qui finissent sur `/index` puis redirection `/accueil`).

Plan de correction
1) `src/pages/HifzPage.tsx` — centraliser une vraie machine de retour pré-session
- Introduire un resolver unique `handlePreSessionBack()` (utilisé par bouton UI + retour Android).
- Règles de navigation:
  - Depuis config (`step === -1`) => ouvrir `showDiagnostic` (page acquis) au lieu d’aller Hub.
  - Depuis goal onboarding => revenir au diagnostic si le flux vient de là, sinon Hub.
  - Depuis diagnostic/resume prompt => Hub.
- Remplacer l’effet `popstate` actuel:
  - garder l’interception,
  - supprimer le `pushState` dans le callback,
  - ne pousser l’état qu’à l’entrée d’un écran pré-session (éviter empilement parasite).

2) `src/pages/HifzPage.tsx` — brancher le bouton retour config sur ce resolver
- Changer `HifzConfig onBack={() => navigate('/hifz-hub')}` vers `onBack={handlePreSessionBack}`.
- Ne plus perdre le contexte de navigation au moment `onGoalSet` (ne pas neutraliser trop tôt le flag de provenance diagnostic).

3) `src/components/hifz/HifzDiagnostic.tsx` — ajouter une sortie explicite
- Ajouter prop optionnelle `onBack`.
- Afficher un bouton “Retour” visible sur l’écran principal diagnostic (“Faisons le point…”), relié à `onBack`.
- Cela évite de bloquer l’utilisateur entre pages internes et réduit la dépendance au bouton Android.

4) `src/pages/HifzPage.tsx` — passer `onBack` à `HifzDiagnostic`
- `onBack` du diagnostic => Hub.
- On garde le flux existant de confirmation/acquis et objectif, sans toucher à la logique backend.

Vérifications à exécuter après implémentation
- Cas 1: Hub → Hifz config (Étape 1/5) → retour (UI) => page “Faisons le point…”.
- Cas 2: même cas via bouton retour Android => page “Faisons le point…”, pas Accueil.
- Cas 3: depuis “Faisons le point…”, bouton “Retour” => Hub.
- Cas 4: aucun scénario de retour ne doit rediriger involontairement vers `/accueil`.
