

## Plan : Audio en boucle dans l'étape Mémorisation (StepImmersion)

### Constat actuel
- **Phase Écoute** : l'audio tourne déjà en boucle automatique avec pause — OK.
- **Phase Mémorisation Mushaf (read)** : aucun audio — l'utilisateur mémorise en silence.
- **Phase Récitation (memory)** : pas d'audio en boucle, juste un bouton "Réécouter une fois".

### Changement — `src/components/hifz/istiqamah/StepImmersion.tsx`

**Ajouter un lecteur audio en boucle dans la phase "read" (Mémorisation Mushaf) et "liaison-read"** :
- Réutiliser la même logique `playSingleVerse` / `playSequence` (qui boucle déjà) avec le bouton play/pause existant.
- Ajouter un bouton **Stop** (carré) distinct du bouton Pause pour arrêter complètement l'audio et réinitialiser.
- L'audio tourne en boucle tant que l'utilisateur ne pause/stop pas.

**Phase "memory" et "liaison-memory"** : garder le comportement actuel (pas de boucle auto, juste le hint "Réécouter une fois") car l'objectif est de réciter de mémoire sans aide audio continue.

### UI dans la phase read

Ajouter sous le Mushaf, à côté du bouton "Mémorisé ✓" :

```
[▶ Écouter en boucle]  [⏹ Stop]
```

- Bouton play/pause : bascule entre lecture en boucle et pause (même logique que la phase listen).
- Bouton stop : arrête complètement, remet l'audio à zéro.
- L'audio en boucle aide à mémoriser en répétant le verset pendant que l'utilisateur lit le Mushaf.

### Fichier modifié
- `src/components/hifz/istiqamah/StepImmersion.tsx` — ajouter les contrôles audio (play/pause + stop) dans le bloc de la phase `read` / `liaison-read` (lignes 606-641).

