

## Problème : ancienne version servie malgré les mises à jour

Le hook `useServiceWorkerUpdate` actuel a plusieurs faiblesses :

1. **Les event listeners `updatefound` s'accumulent** à chaque appel de `checkForUpdate` (toutes les 5 min), car ils ne sont jamais retirés.
2. **Pas de cache-busting au démarrage** : si le SW est actif mais sert des fichiers obsolètes depuis le cache Workbox, rien ne force un nettoyage.
3. **Le `newWorker.state === 'activated'` peut ne jamais se déclencher** si le worker passe directement à `installed` → `waiting` sans activer (cas courant sur iOS Safari).

## Plan de correction

### 1. Réécrire `useServiceWorkerUpdate.ts`

- Ajouter un **version check** : au montage, fetch un fichier `/version.json?t=timestamp` (non caché) qui contient un hash de build. Si le hash diffère de celui stocké en `localStorage`, forcer un rechargement complet avec `caches.delete()` pour vider les caches Workbox.
- Simplifier la logique SW : envoyer `SKIP_WAITING` dès qu'un worker est en état `installed` (waiting), et écouter `controllerchange` pour recharger une seule fois.
- Réduire l'intervalle de vérification à **2 minutes**.
- Ne pas empiler les event listeners : les attacher une seule fois.

### 2. Générer `version.json` automatiquement dans `vite.config.ts`

- Ajouter un petit plugin Vite qui écrit `public/version.json` avec un hash unique à chaque build (`Date.now()`).

### 3. Ajouter un nettoyage de cache au démarrage dans `main.tsx`

- Avant le render, si `caches` API est disponible, supprimer les caches Workbox obsolètes quand une nouvelle version est détectée.

### Détail technique

**`public/version.json`** — fichier généré automatiquement :
```json
{ "v": "1741..." }
```

**`vite.config.ts`** — plugin pour générer ce fichier au build :
```ts
{
  name: 'version-json',
  buildStart() {
    writeFileSync('public/version.json', JSON.stringify({ v: Date.now().toString() }));
  }
}
```

**`useServiceWorkerUpdate.ts`** — logique réécrite :
- Au montage : fetch `/version.json?t=now`, comparer avec `localStorage.app_version`
- Si différent : vider tous les caches (`caches.keys()` → `caches.delete()`), mettre à jour `localStorage.app_version`, recharger
- Enregistrer les listeners SW une seule fois (pas dans l'intervalle)
- Intervalle de 2 min pour `registration.update()` uniquement

