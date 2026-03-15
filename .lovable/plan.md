

## Plan : Corriger 3 problèmes du MiniPlayer

### Problèmes identifiés

1. **Le compteur ne tourne plus en quittant la page** — Dans `HifzStep3Memorisation`, `playNextAyah` utilise `setAncrage(prev => { ... setTimeout(...) ... })`. Quand le composant est démonté, React ignore le `setState` : l'updater function n'est jamais exécutée, donc le `setTimeout` qui relance la boucle ne se déclenche jamais. L'audio finit le groupe de versets puis s'arrête.

2. **Le MiniPlayer disparaît sur le Mushaf** — Conséquence directe du problème 1 : l'audio s'arrête → après 2s le `AudioContext` passe en `idle` → le MiniPlayer se cache.

3. **L'utilisateur ne sait pas qu'il peut sortir** — Aucune indication visuelle que l'audio persistera en arrière-plan.

### Corrections

#### 1. `src/components/hifz/HifzStep3Memorisation.tsx` — Refactorer `playNextAyah` avec un ref

Le problème central : la logique de chaînage (setTimeout pour relancer la boucle) est à l'intérieur du `setAncrage` updater, qui ne s'exécute pas après unmount.

**Fix :**
- Ajouter un `ancrageRef` qui suit la valeur en parallèle du state
- Sortir le `setTimeout` en dehors du `setAncrage` updater
- Écrire directement dans `localStorage` depuis `playNextAyah` (au lieu de dépendre du `useEffect`)
- Le `setAncrage` reste pour mettre à jour l'UI quand le composant est monté (no-op sinon, sans conséquence)

```ts
const ancrageRef = useRef(ancrage);

// Sync ref with state
useEffect(() => { ancrageRef.current = ancrage; }, [ancrage]);

const playNextAyah = useCallback((idx: number) => {
  if (!isPlayingRef.current && idx > 0) return;
  if (idx >= ayahAudiosRef.current.length) {
    const current = ancrageRef.current;
    const next = Math.min(current + 1, tikrarTarget);
    ancrageRef.current = next;
    setAncrage(next);  // no-op if unmounted, fine
    localStorage.setItem(storageKey, String(next));
    try { navigator?.vibrate?.(40); } catch {}
    if (next >= tikrarTarget) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      return;
    }
    setTimeout(() => { if (isPlayingRef.current) playNextAyah(0); }, 600);
    return;
  }
  // ... rest unchanged (create Audio, register, play)
}, [tikrarTarget, storageKey]);
```

#### 2. `src/components/layout/MiniPlayer.tsx` — Afficher aussi sur `/quran-reader`

Le MiniPlayer se cache quand `isOnReturnPage` est true. Il faut **aussi** l'afficher quand la route est `/quran-reader` (l'utilisateur est venu depuis le bouton Mushaf). Modifier la condition de visibilité :

```ts
const isOnReturnPage = trackInfo 
  && location.pathname === trackInfo.returnPath
  && location.pathname !== '/quran-reader'; // toujours montrer sur le Mushaf
```

Le positionnement du MiniPlayer en `bottom-[5.5rem]` est prévu pour la barre de navigation. Sur QuranReaderPage (pas de nav bar), il faut ajuster à `bottom-4` quand il n'y a pas de nav. Alternative simple : ne rien changer, le MiniPlayer sera légèrement décalé mais visible et fonctionnel.

#### 3. Indice visuel "Audio en arrière-plan" — Toast + texte MiniPlayer

- **Dans `HifzStep3Memorisation`** : quand l'audio démarre, afficher un petit bandeau/toast discret : « 🎧 Tu peux naviguer — l'audio continue en arrière-plan »
- **Dans le MiniPlayer** : changer le sous-texte de "Appuyer pour revenir" à "🎧 Écoute en cours · Appuyer pour revenir" pour rendre l'état plus explicite

### Fichiers modifiés

| Fichier | Modification |
|---|---|
| `HifzStep3Memorisation.tsx` | Ajouter `ancrageRef`, refactorer `playNextAyah`, ajouter toast au 1er play |
| `MiniPlayer.tsx` | Garder visible sur `/quran-reader`, sous-texte plus explicite |

