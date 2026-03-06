
Objectif validé : corriger le lecteur Mushaf qui reste bloqué sur “téléchargement” (mobile + preview), sans revenir au texte numérique.

1) Diagnostic confirmé (cause racine)
- Le composant actuel charge une seule source : `https://cdn.qurancdn.com/...`.
- Les requêtes image échouent (erreur réseau observée : `ERR_TUNNEL_CONNECTION_FAILED`).
- Comme `onError` remet juste `imageLoaded=false` sans source alternative, le spinner reste infini.

2) Correctif à implémenter dans `src/pages/QuranReaderPage.tsx`
- Remplacer la source unique par une stratégie multi-CDN (images Tajweed, pages 1→604), ex. :
  - `https://cdn.jsdelivr.net/gh/QuranHub/quran-pages-images@main/easyquran.com/hafs-tajweed/{page}.jpg`
  - `https://raw.githubusercontent.com/QuranHub/quran-pages-images/main/easyquran.com/hafs-tajweed/{page}.jpg`
  - `https://cdn.statically.io/gh/QuranHub/quran-pages-images/main/easyquran.com/hafs-tajweed/{page}.jpg`
- Garder 100% image-only (aucun fallback texte), conformément à ta consigne.

3) Logique anti-blocage (spinner infini)
- Ajouter un index de source actif + une source préférée (la dernière qui a fonctionné).
- Au changement de page :
  - démarrer sur la source préférée,
  - afficher spinner.
- Si `onLoad` :
  - cacher spinner,
  - mémoriser la source gagnante pour les pages suivantes.
- Si `onError` :
  - basculer automatiquement vers la source suivante.
- Ajouter un timeout de chargement (ex. 8–10s) :
  - si pas de `onLoad`, passer à la source suivante (cas réseau “pendu” sans erreur explicite).
- Si toutes les sources échouent :
  - relancer silencieusement un cycle de tentative (spinner uniquement, aucun message d’erreur affiché).

4) Ajustements techniques utiles
- Forcer remount de l’image avec une clé `page+sourceIndex` pour garantir le retrigger des événements.
- Ajouter `referrerPolicy="no-referrer"` sur `<img>` pour réduire les blocages anti-hotlink.
- Conserver preload des pages adjacentes mais via la source préférée actuelle.

5) Ce qui ne change pas
- Design “Olive du Levant” (crème/sauge/blanc pur) inchangé.
- Interface épurée inchangée.
- Navigation swipe, slider, tiroir sourates, marque-page inchangés.
- Aucun changement backend requis.

6) Vérification prévue après implémentation
- Test direct sur `/quran-reader` :
  - page 1 s’affiche (plus de spinner infini),
  - navigation page 2/3 fonctionne.
- Vérification réseau :
  - au moins une source image répond 200.
- Test mobile (viewport iPhone) :
  - rendu image-only stable, sans texte numérique ni message d’erreur.
