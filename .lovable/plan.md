

## Audio en boucle automatique sur l'écran Intention & Imprégnation

### Problème
Actuellement, quand tous les versets ont été lus, l'audio s'arrête et l'utilisateur doit recliquer sur Play. L'utilisateur veut que l'audio boucle automatiquement (relance depuis le début) jusqu'à ce qu'il appuie sur Pause.

### Changement

**`src/components/hifz/HifzStepIntentionImpregnation.tsx`** — modifier `playNextAyah` (ligne 234-249) :

Quand `idx >= ayahsRef.current.length` : au lieu d'arrêter la lecture, incrémenter le compteur d'écoute et relancer depuis `idx = 0` (boucle). L'audio ne s'arrête que si l'utilisateur clique Pause.

```text
playNextAyah(idx):
  if idx >= total:
    listenCount++
    indexRef = 0
    playNextAyah(0)    ← boucle au lieu de stop
  else:
    play ayah[idx]
    onended → playNextAyah(idx+1)
```

Un seul bloc de ~5 lignes modifié, aucun autre fichier impacté.

