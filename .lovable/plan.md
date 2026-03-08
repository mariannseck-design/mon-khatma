

## Scroll automatique en haut lors du changement de page en mode texte

### Probleme
En mode texte, quand on tourne la page (swipe), le scroll reste en bas. L'utilisateur doit remonter manuellement.

### Solution
Dans `QuranTextView.tsx`, ajouter un `scrollTo(0, 0)` sur le `containerRef` quand la prop `page` change. C'est un changement d'une seule ligne dans le `useEffect` existant (ligne 265).

### Fichier touche
**`src/components/quran/QuranTextView.tsx`** — modifier le useEffect page pour scroller le container en haut :
```ts
useEffect(() => {
  setSelectedAyah(null);
  containerRef.current?.scrollTo(0, 0);
}, [page]);
```

