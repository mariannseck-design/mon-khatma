

# Refonte du lecteur Mushaf : images HD uniquement

## Probleme
Le lecteur affiche actuellement du texte numerique avec une police systeme, ce qui deforme le rendu sur iPhone. L'interface est surchargee d'icones inutiles (lune, Aa, bascule texte/image, etc.).

## Solution

### 1. Supprimer le mode texte — Images HD uniquement
- Retirer `textMode`, `textSize`, `QuranTextView`, le composant `Popover` de taille de texte, et le bouton bascule texte/image
- Utiliser uniquement des images du Mushaf. Source d'images : `https://cdn.qurancdn.com/images/pages/page{page_number_padded}.png` (Mushaf de Medine, haute resolution). Le CDN actuel (`cdn.islamic.network`) sera remplace car ses images sont de basse qualite.
- Si l'image ne charge pas : afficher uniquement un spinner, jamais de message d'erreur ni de fallback texte

### 2. Interface epuree — Suppression des icones superflues
Supprimer de la barre du haut :
- Bouton lune/soleil (dark mode)
- Bouton "Aa" (taille du texte)
- Bouton bascule texte/image

Supprimer de la barre du bas :
- Bouton "Repeat" (autoplay)
- Bouton "Mic" (recitateur)
- Bouton Play/Pause (audio)
- Selecteur de recitateur

Conserver uniquement :
- **Haut** : bouton retour, titre sourate + page/juz
- **Bas** : bouton liste sourates, bouton marque-page, slider de navigation, compteur de page

### 3. Design "Olive du Levant"
- Fond general : creme chaud `#f7f3eb`
- Barres : overlay vert foret semi-transparent `rgba(42, 58, 37, 0.6)`
- Boutons : vert sauge `rgba(122, 139, 111, 0.35)`
- Icones/textes des barres : ivoire `#e8e2d0`
- Zone d'affichage de la page : fond blanc pur `#ffffff` pour simuler un livre ouvert
- Supprimer le mode sombre (plus de toggle)

### 4. Fichiers impactes
- `src/pages/QuranReaderPage.tsx` : refonte majeure (suppression texte, simplification UI)
- `src/components/quran/QuranTextView.tsx` : plus utilise, peut etre ignore (pas supprime pour eviter des erreurs dans d'autres imports eventuels)

### Details techniques
- URL des images : `https://cdn.qurancdn.com/images/pages/page${String(page).padStart(3, '0')}.png`
- Preload des pages adjacentes conserve
- Swipe tactile conserve
- Marque-page conserve
- Navigation par slider conservee
- Tout le code audio et ses hooks retires du composant

