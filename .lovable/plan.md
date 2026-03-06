

# Lecteur Mushaf avec Tajweed colore -- Affichage page par page

## Contexte

Les CDN d'images Mushaf (islamic.network, easyquran.com, GitHub LFS) sont tous inaccessibles ou bloques. Cependant, l'API `api.alquran.cloud` propose une edition **`quran-tajweed`** qui retourne le texte arabe avec des marqueurs de Tajweed (ex: `[h:1[ٱ]`, `[n[ـٰ]`, `[p[ِي]`, `[m[َا]`, `[g[نّ]`). Ces marqueurs peuvent etre convertis en spans HTML colores.

## Solution

Utiliser l'edition `quran-tajweed` de l'API pour afficher le texte Uthmani avec les **codes couleurs du Tajweed** -- chaque regle (Ghunnah, Idgham, Ikhfa, Qalqalah, etc.) est mise en evidence par une couleur specifique, exactement comme dans un Mushaf Tajweed imprime.

### Codes couleurs du Tajweed (standard)

```text
[h  = Hamzat ul Wasl     → gris #AAAAAA
[s  = Silent              → gris #AAAAAA
[l  = Lam Shamsiyyah      → gris #AAAAAA
[n  = Madd Normal         → orange #537FFF
[p  = Madd Permissible    → bleu #4050FF
[m  = Madd Obligatoire    → bleu #000EBC
[q  = Qalqalah            → vert #DD0008
[i  = Ikhfa               → rose #9400A8
[o  = Ikhfa Meem Saakin   → rose #9400A8
[g  = Ghunnah             → orange #FF7E1E
[f  = Idgham avec Ghunnah → vert #169200
[d  = Idgham sans Ghunnah → vert #169777
[b  = Iqlab               → vert #26BFFD
```

### Fichiers a modifier

#### 1. `src/components/quran/QuranTextView.tsx`
- Changer l'API de `quran-uthmani` vers **`quran-tajweed`**
- Ajouter un parseur qui convertit les marqueurs `[x[...]]` en elements `<span>` avec les couleurs correspondantes
- Supprimer le scroll continu : afficher le contenu d'une seule page a la fois (le composant recoit deja `page` en prop, donc pas de scroll -- juste le contenu fixe de la page)
- Remplacer `overflow-y-auto` par un affichage centre sans scroll pour un rendu "page de livre"
- Utiliser `dangerouslySetInnerHTML` ou un parseur React pour le rendu colore

#### 2. `src/pages/QuranReaderPage.tsx`
- Le mode texte (Tajweed colore) reste le mode par defaut (puisque les CDN images sont inaccessibles)
- Le swipe horizontal page par page est deja en place
- Aucun changement majeur necessaire

### Rendu visuel attendu
- Police Amiri (calligraphique) en taille genereuse
- Texte arabe RTL avec couleurs Tajweed integrees
- Affichage page par page (pas de defilement vertical) -- le contenu de chaque page tient dans l'ecran
- Nom de la sourate affiche en haut quand c'est le debut d'une sourate

### Impact
- Rendu fidele au Mushaf Tajweed avec codes couleurs standard
- API gratuite, fiable, sans cle
- Affichage instantane page par page avec navigation par swipe

