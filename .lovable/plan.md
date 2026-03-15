
Objectif: corriger définitivement la coupure audio quand tu cliques sur Mushaf (cas confirmé: Android Chrome + ouverture en nouvel onglet).

1) Diagnostic ciblé (cause la plus probable)
- Aujourd’hui, le bouton Mushaf ouvre un nouvel onglet.
- Sur Android Chrome, l’onglet Hifz passe en arrière-plan et peut être mis en pause automatiquement par le navigateur.
- Le code actuel resynchronise surtout au retour d’onglet, mais ne garantit pas la continuité pendant que Mushaf est au premier plan.

2) Correctif principal (fiable sur mobile): Mushaf intégré sans quitter l’étape
- Modifier `HifzStepWrapper.tsx` pour que le bouton Mushaf ouvre un panneau plein écran (Dialog/Sheet) dans la même page Hifz.
- Charger le Mushaf dans ce panneau (iframe interne vers `/quran-reader?page=...` ou rendu intégré selon compatibilité).
- Garder un bouton secondaire “Ouvrir dans un nouvel onglet” dans ce panneau pour les utilisateurs qui préfèrent.
- Résultat: l’onglet Hifz ne passe plus en arrière-plan, donc l’audio ne se coupe plus.

3) Renforcement audio (anti-pause involontaire)
- Dans `HifzStepImpregnationTajweed.tsx`, ajouter une garde “pause non manuelle”:
  - distinguer pause utilisateur (Pause/Stop) vs pause navigateur.
  - si pause navigateur détectée alors que `isPlayingRef` est actif, tenter une reprise contrôlée (`audio.play()` avec retries courts).
- Conserver la logique actuelle (triple garde génération + bouton Stop rouge + cleanup strict).

4) Harmonisation (éviter que le bug revienne ailleurs)
- Appliquer le même pattern anti-coupure aux autres étapes audio qui utilisent des boucles similaires:
  - `StepImpregnation`, `StepImmersion`, `StepGravure`, `MouradPhase2`.

5) Validation finale (checklist unique pour éviter de reconsommer des crédits)
- Android Chrome réel:
  - lancer audio en Imprégnation Tajweed.
  - ouvrir Mushaf via panneau intégré → audio doit continuer sans coupure.
  - fermer panneau Mushaf → audio toujours en cours, UI synchronisée.
  - tester Pause, Play, Stop rouge.
  - tester aussi “Ouvrir dans nouvel onglet” (fallback), puis retour.
- Si un cas échoue, instrumenter 3 logs ciblés (`pause reason`, `visibility`, `play retry`) pour corriger en un seul passage supplémentaire.

Détails techniques (concis)
- Fichiers principaux:
  - `src/components/hifz/HifzStepWrapper.tsx` (nouveau mode Mushaf intégré)
  - `src/components/hifz/HifzStepImpregnationTajweed.tsx` (anti-pause involontaire)
- Contraintes respectées:
  - compatibilité mobile ancienne (es2015 / comportements prudents),
  - conservation du bouton Stop rouge,
  - pas de régression sur la reprise manuelle.
