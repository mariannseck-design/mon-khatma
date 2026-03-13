

## Probleme

Quand l'utilisateur met l'app en pause (pose son telephone, quitte, etc.) et revient, la reprise se fait au niveau du **step** global (0-4) dans `HifzPage`, mais **l'etat interne d'Istiqamah** (sous-etape comprehension/immersion/tikrar + verset en cours + phase listen/memory/liaison) est perdu. Le `useIstiqamahState` redemarre toujours a `currentNodeIndex: 0` et `StepImmersion` recommence au verset 0 en phase `listen`.

## Solution

Sauvegarder et restaurer l'etat interne d'Istiqamah dans le localStorage, en parallele de la session globale.

### Modifications

**1. `src/components/hifz/istiqamah/useIstiqamahState.ts`**
- Ajouter une cle localStorage `hifz_istiqamah_state` pour persister `currentNodeIndex` et `immersionCompleted`
- Au chargement, restaurer ces valeurs si elles correspondent a la meme sourate/versets
- Exposer une fonction `clearState()` pour le nettoyage en fin de tunnel

**2. `src/components/hifz/istiqamah/StepImmersion.tsx`**
- Sauvegarder dans localStorage (`hifz_immersion_state`) : `currentVerseIndex`, `phase`, `listenCount`, `memoryCount`, `liaisonUpTo`
- Au montage, restaurer ces valeurs si elles correspondent aux memes parametres (surah, verseStart, verseEnd)
- Sauvegarder a chaque changement d'etat significatif (changement de verset, changement de phase)
- Nettoyer le localStorage quand `onNext` est appele

**3. `src/components/hifz/istiqamah/IstiqamahEngine.tsx`**
- Passer la fonction `clearState()` du hook et l'appeler quand le tikrar est termine (dans `onNext`)

**4. `src/pages/HifzPage.tsx`**
- Dans `clearLocalSession()`, nettoyer aussi les cles istiqamah/immersion du localStorage
- Dans `completeSession()`, idem

### Cles localStorage

```text
hifz_istiqamah_state → { surah, vStart, vEnd, nodeIndex, immersionDone }
hifz_immersion_state → { surah, vStart, vEnd, verseIdx, phase, listenCount, memoryCount, liaisonUpTo }
```

La correspondance surah+verseStart+verseEnd sert de "fingerprint" pour ne pas restaurer un etat obsolete d'une session differente.

