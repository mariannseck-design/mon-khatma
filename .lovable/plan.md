## Plan : Audio qui continue lors de l'interaction avec le Mushaf

### Probleme identifie

**2 causes distinctes :**

1. **Step 3 (Tikrar)** : Le toggle "Voir le passage" utilise `AnimatePresence` qui monte/demonte le DOM. Sur certains navigateurs mobiles, ce re-render interrompt l'objet `Audio` en cours.
2. **Step 2 (Impregnation) + Step 3** : Le bouton "Ouvrir dans le Mushaf" fait un `navigate('/quran-reader')` qui demonte le composant entier, declenchant le cleanup `audioRef.current?.pause()`.

### Corrections

**Fichier : `src/components/hifz/HifzStep3Memorisation.tsx**`

- Remplacer le bloc `AnimatePresence` du Mushaf (lignes 355-384) par un `div` permanent avec `style={{ display: showMushaf ? 'block' : 'none' }}`. L'image reste dans le DOM, aucun demontage ne se produit.
- Supprimer le bouton "Ouvrir dans le Mushaf" (qui navigue et tue l'audio). Le Mushaf est deja visible en ligne.

**Fichier : `src/components/hifz/HifzStep2Impregnation.tsx**`

- Supprimer le bouton "Ouvrir dans le Mushaf" et la fonction `openInMushaf` (lignes 94-97, 127-134). Le Mushaf est deja affiche en image juste au-dessus.

### Fichiers modifies

- `src/components/hifz/HifzStep3Memorisation.tsx`
- `src/components/hifz/HifzStep2Impregnation.tsx`

Dans ce cas ou il faut calculer la page exact du Mushaf en fonction du numéro de verset (startVerse) plutôt que d'utiliser toute la page si pas besoin , et autoriser le mode de pouvoir agrandir le mushaf en double cliquant ou avec ses mains ou proposer grand moyen tres grand a cote du mushaf