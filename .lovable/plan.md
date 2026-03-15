

## Rendu Mushaf professionnel — méthode ligne par ligne avec polices glyphes

### Le problème actuel

Le mode texte actuel prend le texte brut Unicode et le laisse couler librement (comme un paragraphe). Le navigateur décide où couper les lignes. Résultat : le rendu ne ressemble pas du tout à un vrai Mushaf.

### Comment font les vraies apps (Ayat, Al Quran, quran.com)

Elles utilisent des **polices à glyphes par page** (QCF V2). Chaque mot du Coran est un **glyphe unique** dessiné par un calligraphe, stocké dans un fichier de police propre à chaque page (604 fichiers). Combiné avec des **données de layout ligne par ligne** (quel mot va sur quelle ligne), cela reproduit exactement les 15 lignes du Mushaf imprimé de Médine.

### Plan d'implémentation

**1. Nouveau composant `QuranMushafView.tsx`** — remplace `QuranTextView` en mode texte

- Appelle l'API publique `api.quran.com/api/v4/verses/by_page/{page}?words=true&word_fields=code_v2,text_qpc_hafs&mushaf=1` pour obtenir les mots avec leur `line_number`
- Charge dynamiquement la police QCF V2 pour la page courante depuis `verses.quran.foundation/fonts/quran/hafs/v2/woff2/p{page}.woff2`
- Groupe les mots par `line_number` (1 à 15) et rend chaque ligne en `display: flex; justify-content: center`
- Chaque mot utilise `font-family: 'p{page}-v2'` avec le code glyphe `code_v2`
- Les marqueurs de fin de verset (`char_type_name: 'end'`) utilisent la police Unicode `UthmanicHafs`
- Cache en mémoire pour éviter de re-fetcher les pages déjà visitées
- Fallback vers le texte Unicode (`text_qpc_hafs`) pendant le chargement de la police

**2. Mise à jour de `QuranReaderPage.tsx`**

- En mode texte, utiliser `QuranMushafView` au lieu de `QuranTextView`
- `QuranTextView` reste disponible comme fallback hors-ligne (il utilise les données locales)

**3. Ajout de la police UthmanicHafs dans `index.html`**

- `@font-face` pour `UthmanicHafs` depuis le CDN Quran Foundation (pour les numéros de versets)

### Fichiers modifiés/créés

- **Créer** `src/components/quran/QuranMushafView.tsx` — nouveau composant ligne par ligne
- **Modifier** `src/pages/QuranReaderPage.tsx` — brancher le nouveau composant
- **Modifier** `index.html` — ajouter la police UthmanicHafs

### Limites

- Nécessite une connexion internet (les polices par page font ~20-40 Ko chacune, chargées à la demande)
- Le mode texte hors-ligne continuera d'utiliser l'ancien `QuranTextView` comme fallback
- La traduction sous chaque verset restera disponible mais en mode verset-par-verset (pas ligne par ligne)

