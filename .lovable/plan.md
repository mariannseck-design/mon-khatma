
Objectif: corriger définitivement le bug audio sur l’étape Imprégnation (play visuel actif sans son, fermeture externe incohérente, compteur qui s’emballe).

Constat (code actuel)
- Le composant utilisé dans ton flow Hifz est `src/components/hifz/HifzStepImpregnationTajweed.tsx` (pas `HifzStepIntentionImpregnation.tsx`).
- Dans ce composant, `playNextAyah` boucle récursivement sans garde de session (pas de `generationRef`) et sans vérifier l’état “lecture active”.
- En cas d’erreurs audio (ou URLs non valides), la chaîne avance trop vite et peut incrémenter `listenCount` en boucle.
- Le stop externe (MiniPlayer) n’invalide pas explicitement la chaîne locale de ce composant, d’où l’état UI qui reste “play”.

Plan d’implémentation
1) Sécuriser la boucle audio dans `HifzStepImpregnationTajweed.tsx`
- Ajouter `generationRef`, `isPlayingRef`, `pausedRef`.
- Refactorer `playNextAyah(idx, gen)` avec gardes:
  - sortie immédiate si génération obsolète
  - sortie immédiate si plus d’audios
  - callbacks `onended`/`onerror` qui continuent seulement si `gen` actif
- Remplacer le redémarrage immédiat de cycle par un redémarrage contrôlé (court délai) pour éviter l’emballement CPU/compteur.

2) Empêcher l’incrément fantôme du compteur
- N’incrémenter `listenCount` qu’à la fin d’un cycle valide de lecture.
- Si aucune lecture réelle n’a démarré (erreurs audio), stopper proprement au lieu de relancer la boucle.

3) Synchroniser stop externe ↔ état local
- Utiliser `stop` global (`useGlobalAudio`) au démarrage d’une nouvelle session locale pour tuer les anciennes chaînes.
- Ajouter une synchronisation quand l’audio global passe à `idle` afin de remettre l’état local (`isPlaying`, refs, index visuel) à zéro.
- Sur actions “pause/reset/next/reciter change”, invalider la génération active avant toute reprise.

4) Ajuster l’affichage MiniPlayer sur la même page
- Dans `src/components/layout/MiniPlayer.tsx`, corriger la logique `isOnReturnPage` pour comparer correctement route avec query (`pathname + search`) afin d’éviter l’affichage “externe” incohérent sur la page d’origine.

Validation (E2E)
- Cas 1: lancer audio Imprégnation, laisser finir un cycle → compteur +1 normal, pas d’emballement.
- Cas 2: arrêter via MiniPlayer (X) → plus de son, icône locale repasse à l’état arrêté.
- Cas 3: relancer depuis le bouton de la page → reprise normale, compteur stable.
- Cas 4: tester avec un récitateur différent pour vérifier qu’aucune boucle rapide n’apparaît en cas d’erreur audio.
