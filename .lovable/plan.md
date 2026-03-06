

# Lecteur Mushaf complet — 604 pages HD avec mode texte

## Objectif
Creer un lecteur de Coran immersif plein ecran avec les 604 pages du Mushaf de Medine en images HD, navigation par swipe horizontal, zoom tactile, et une option de bascule vers un mode texte (police Uthmani). Pas de modules de memorisation ni de revision dans cette phase.

## Fichiers a creer

### 1. `src/pages/QuranReaderPage.tsx` — Page principale du lecteur

- **Plein ecran** : pas de `AppLayout`, navigation propre (bouton retour, nom de sourate via `getSurahByPage()`, numero de page)
- **Mode Image (defaut)** : Affiche l'image depuis `https://cdn.islamic.network/quran/images/page/{pageNumber}.png`
- **Swipe horizontal** : `framer-motion` drag gestures avec `AnimatePresence` pour transitions fluides entre pages
- **Zoom tactile** : CSS `touch-action: pinch-zoom` sur le conteneur d'image
- **Prechargement** : preload des 2 pages adjacentes (page-1 et page+1) via `new Image()`
- **Barre inferieure** : slider rapide pour sauter a une page, bouton tiroir sourates
- **Bouton bascule** : icone pour switcher entre mode image et mode texte
- **Lecture RTL** : navigation inversee (swipe gauche = page suivante en sens arabe, page 604 → 1)

### 2. `src/components/quran/QuranTextView.tsx` — Mode texte (Uthmani)

- Utilise l'API gratuite `https://api.alquran.cloud/v1/page/{page}/quran-uthmani` pour recuperer le texte arabe Uthmani
- Affichage du texte arabe avec `font-family: 'Amiri'` ou police Uthmani (Google Fonts)
- Taille de texte genereuse, direction RTL, espacement genereux
- Permet copier-coller et selection de texte

### 3. `src/components/quran/SurahDrawer.tsx` — Tiroir de navigation par sourate

- Liste des 114 sourates (depuis `surahData.ts` existant)
- Au clic, navigue directement a la page de debut de la sourate
- Recherche/filtre rapide par nom

## Fichiers a modifier

### 4. `src/App.tsx`
- Ajouter la route `/quran-reader` protegee

### 5. `src/pages/AccueilPage.tsx`
- Ajouter un bouton/carte "Lire le Mushaf" qui navigue vers `/quran-reader`

## Source des images
- CDN : `https://cdn.islamic.network/quran/images/page/{1-604}.png`
- Mushaf de Medine, haute definition, gratuit, pas de cle API

## Source du texte (mode bascule)
- API : `https://api.alquran.cloud/v1/page/{page}/quran-uthmani` — gratuite, sans cle
- Police : Amiri (Google Fonts) pour un rendu calligraphique authentique

