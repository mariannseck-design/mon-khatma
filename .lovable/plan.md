
Objectif: corriger définitivement le saut de la phase **Mémorisation** dans Istiqâmah (Compréhension → Mémorisation → Tikrar), d’après ton retour “toujours manquante”.

Ce que j’ai constaté avant plan:
- Les captures montrent **Mode Testeur actif** (bouton **Skip** visible).
- Les traces réseau montrent une progression très rapide des étapes (3 → 4 → 5), cohérente avec un saut/skip.
- Le correctif précédent (state `confirmed`) réduit le risque, mais ne verrouille pas 100% les transitions concurrentes (tap répété, timeout doublé, etc.).

Plan d’implémentation:

1) Verrouiller la navigation interne d’Istiqâmah comme une mini machine d’état
- Fichier: `src/components/hifz/istiqamah/useIstiqamahState.ts`
- Faire évoluer `next()` pour accepter l’étape source (ex: `'comprehension' | 'immersion'`).
- N’autoriser l’avancement que si l’étape courante correspond à la source attendue.
- Résultat: même si `onNext` est appelé deux fois depuis Compréhension, on ne peut plus sauter directement à Tikrar.

2) Rendre `StepComprehension` idempotent (anti double déclenchement robuste)
- Fichier: `src/components/hifz/istiqamah/StepComprehension.tsx`
- Ajouter un verrou via `useRef` (synchrone) + `confirmed` (UI).
- Stocker l’ID du `setTimeout` et le nettoyer à l’unmount.
- Désactiver explicitement le bouton (`disabled`) dès le 1er clic.
- Résultat: 1 seul `onNext` possible, même en double tap rapide.

3) Brancher explicitement les transitions depuis `IstiqamahEngine`
- Fichier: `src/components/hifz/istiqamah/IstiqamahEngine.tsx`
- `StepComprehension` appelle `next('comprehension')`.
- `StepImmersion` appelle `next('immersion')`.
- Résultat: sécurité supplémentaire côté orchestration.

4) Éviter les sauts accidentels en Mode Testeur
- Fichiers: `src/components/hifz/DevSkipButton.tsx` (et appel dans `HifzPage` si nécessaire)
- Ajouter une protection légère: confirmation “Passer cette étape ?” (ou appui long).
- Conserver l’outil testeur, mais empêcher les skips involontaires qui donnent l’impression que la mémorisation “n’existe plus”.

5) Vérification end-to-end (critère d’acceptation)
- Cas A (mode testeur OFF): Compréhension → Mémorisation (StepImmersion visible) → Tikrar.
- Cas B: double tap ultra-rapide sur “J’ai compris le sens” ne doit jamais sauter Mémorisation.
- Cas C (mode testeur ON): un tap accidentel sur Skip ne passe plus sans confirmation.
- Cas D: parcours complet sans régression jusqu’à succès.

Détails techniques (pour transparence):
- Le bug visé est un problème de **transition non idempotente**.
- Le correctif proposé ajoute une double protection:
  1) protection locale dans le composant déclencheur (Comprehension),
  2) protection globale dans le moteur d’état (IstiqamahState).
- Cette approche élimine les sauts même si un événement est émis plusieurs fois.
