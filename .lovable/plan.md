
Objectif validé: faire apparaître le bouton Mushaf partout dans le MiniPlayer ET corriger la lecture qui ne continue pas en boucle après sortie de la page.

1) Étendre les métadonnées audio dans les 4 composants demandés
- Fichiers:
  - `src/components/hifz/istiqamah/StepImmersion.tsx`
  - `src/components/hifz/istiqamah/StepImpregnation.tsx`
  - `src/components/hifz/istiqamah/StepFusion.tsx`
  - `src/components/mourad/MouradPhase2.tsx`
- Action:
  - Ajouter `surahNumber` et `startVerse` dans chaque `registerRef.current(audio, {...})`.
  - Utiliser la valeur la plus précise:
    - StepImmersion (single verse): `startVerse: verse`
    - StepImmersion (sequence): `startVerse: verse` (dans la boucle)
    - StepImpregnation: `startVerse: verseStart + idx`
    - StepFusion: `startVerse: globalStart + idx`
    - MouradPhase2: `startVerse: startVerse + idx`
- Résultat: le bouton 📖 du MiniPlayer s’affiche dans tous ces flux et ouvre la bonne page du Mushaf.

2) Corriger la persistance de boucle quand on quitte la page
- Cause trouvée: certains cleanups “unmount” remettent `isPlayingRef.current = false`; du coup, au `onended`, la chaîne s’arrête après le verset en cours.
- Fichiers à corriger:
  - `StepImmersion.tsx` (cleanup actuel coupe la chaîne)
  - `StepImpregnation.tsx` (cleanup actuel coupe la boucle)
  - `StepFusion.tsx` (cleanup actuel coupe la lecture en cours)
- Action:
  - Remplacer ces cleanups par un no-op (commentaire “audio persists globally”), sans reset de refs de lecture.

3) Vérification fonctionnelle (mobile 390px)
- Lancer audio dans chaque composant.
- Quitter vers Accueil ou Mushaf pendant lecture.
- Vérifier:
  - le MiniPlayer reste visible,
  - le bouton Mushaf est présent,
  - la lecture enchaîne encore au verset suivant après la sortie de page (pas d’arrêt au 1er verset).
