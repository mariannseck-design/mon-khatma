

## Plan: Réactiver les boutons audio et corriger le bug d'arrêt

### Diagnostic

Le bug "audio qui refuse de s'arrêter" vient de callbacks `onended`/`onerror` non gardés qui relancent la lecture même après pause/stop. Chaque composant a un problème différent :

1. **HifzStep2Impregnation** — `playNextAyah` n'a AUCUN garde de génération. Les callbacks enchaînent librement.
2. **HifzStepIntentionImpregnation** — Garde de génération mais pas de vérification `isPlayingRef` ni d'identité audio dans les callbacks.
3. **StepImmersion** — Le pattern auto-loop (`playOnce` → `onended` → `playOnce`) n'a pas de garde de génération. `stopAudio` ne tue pas l'élément audio.
4. **StepImpregnation** — Déjà corrigé (gardes triples).
5. **HifzStepImpregnationTajweed** — Déjà corrigé (gardes triples).

### Approche

Appliquer le même pattern robuste déjà prouvé sur `HifzStepImpregnationTajweed` à tous les composants :

**Pattern unifié :**
- `generationRef` incrémenté sur CHAQUE changement d'état (pause, stop, reciter change, next)
- Triple garde dans les callbacks : `generationRef === gen` + `isPlayingRef.current` + `audioRef.current === audio`
- Helper `hardStopAudio()` : clear handlers → pause → clear src → nullify ref
- Pause/Resume avec rebinding des callbacks sur la nouvelle génération

### Fichiers à modifier

#### 1. `src/components/hifz/HifzStep2Impregnation.tsx`
- Ajouter `generationRef`, `isPlayingRef`, `hardStopAudio`
- Refactorer `playNextAyah(idx)` → `playNextAyah(idx, gen)` avec triple garde
- Refactorer `togglePlay` avec pause/resume propre (garder audio element, rebind callbacks)
- Réactiver le bouton Play (retirer `disabled`, `opacity-50`, remettre `onClick={togglePlay}`)
- Supprimer le texte "Temporairement indisponible"

#### 2. `src/components/hifz/HifzStepIntentionImpregnation.tsx`
- Ajouter `isPlayingRef`, `hardStopAudio`
- Ajouter triple garde dans callbacks de `playNextAyah`
- Refactorer `togglePlay` avec pause/resume propre
- Réactiver le bouton Play

#### 3. `src/components/hifz/istiqamah/StepImmersion.tsx`
- Ajouter `generationRef`, `hardStopAudio`
- Refactorer `playSingleVerse` : generation guard dans `playOnce` et `onended`
- Refactorer `playSequence` : generation guard dans la boucle et `onended`
- Refactorer `playHint` : même pattern
- Refactorer `stopAudio` → hard stop complet (kill audio element, clear src)
- Pause/resume propre dans `handlePlay`
- Réactiver les boutons Play et Hint

#### 4. `src/components/hifz/istiqamah/StepImpregnation.tsx`
- Réactiver le bouton Volume2 (retirer `disabled`, remettre `onClick={toggleAudio}`)
- Le code audio est déjà correctement gardé

#### 5. `src/components/hifz/HifzStepImpregnationTajweed.tsx`
- Réactiver le bouton Play (retirer `disabled`, remettre `onClick={togglePlay}`)
- Le code audio est déjà correctement gardé

### Ce qui ne change PAS
- AudioContext global — déjà robuste
- MiniPlayer — fonctionne correctement
- MiniRecorder (enregistrement vocal) — non touché

