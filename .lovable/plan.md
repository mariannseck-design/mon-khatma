

## Plan : Afficher l'image du Mushaf au lieu du texte arabe dans l'étape Imprégnation

### Changement

Remplacer l'affichage texte arabe des versets (lignes 98-118) par l'image de la page du Mushaf correspondante, dans un conteneur scrollable.

**`src/components/hifz/HifzStep2Impregnation.tsx`** :

1. Calculer la page du Mushaf via `SURAHS.find(s => s.number === surahNumber).startPage`
2. Remplacer la `ScrollArea` contenant les `<p>` de texte arabe par une `ScrollArea` affichant l'image Mushaf (même URL CDN que le lecteur Quran : `https://cdn.jsdelivr.net/gh/QuranHub/quran-pages-images@main/easyquran.com/hafs-tajweed/{page}.jpg`)
3. L'image est dans un conteneur scrollable (`max-h-64 overflow-auto`) avec coins arrondis et bordure dorée
4. Conserver le bouton "Ouvrir dans le Mushaf" en dessous
5. Supprimer le fetch du texte arabe (`ayahs.text`) — garder uniquement le fetch audio (toujours nécessaire pour la lecture)
6. Simplifier le state : retirer `ayahs` state et le champ `text` de `ayahsRef`

