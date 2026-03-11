

## Probleme identifie

Le fichier `version.json` est **cache par le Service Worker** lui-meme. Dans `vite.config.ts` ligne 82 :

```
globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2,json}"]
```

Le pattern `**/*.json` inclut `version.json`. Donc quand l'app verifie la version, elle lit le fichier cache (ancien) au lieu du nouveau sur le serveur — la mise a jour n'est jamais detectee.

De plus, `index.html` n'a aucun en-tete `no-cache`, donc le navigateur peut aussi le servir depuis son propre cache HTTP.

## Corrections

**1. `vite.config.ts`** — Exclure `version.json` du cache Workbox :
- Ajouter `globIgnores: ["**/version.json"]` dans la config `workbox`
- Ajouter une regle `runtimeCaching` pour `version.json` avec strategie `NetworkOnly` (jamais cache)

**2. `index.html`** — Ajouter des meta tags anti-cache :
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
```

**3. `src/hooks/useServiceWorkerUpdate.ts`** — Forcer le rechargement plus agressivement :
- Apres detection d'une nouvelle version, appeler `registration.unregister()` avant de recharger pour garantir que l'ancien SW ne re-serve pas les fichiers caches

