

## Rendu Tanzil « Zéro modification » — Plan

### Problème actuel
Le texte utilise la police `KFGQPC Uthmanic Script HAFS` en priorité, qui peut causer des problèmes de ligatures/détachement selon les navigateurs. De plus, le CSS du conteneur de texte manque de propriétés critiques pour stabiliser le rendu arabe (pas de `font-variant-ligatures`, pas de `font-feature-settings`). Le fichier `quran-uthmani.json` actuel provient de l'API alquran.cloud — il faut vérifier s'il correspond bien à l'édition Tanzil "Uthmani with Full Tashkeel" ou le remplacer.

### Plan

#### 1. Remplacer la source de données par Tanzil.net
- Télécharger le fichier JSON officiel Tanzil.net **"Quran Uthmani with Full Tashkeel"** (`quran-uthmani.json` ou équivalent)
- Le placer dans `public/data/` en remplacement du fichier actuel
- Adapter `src/lib/quranData.ts` si la structure JSON diffère (Tanzil utilise un format différent d'alquran.cloud)
- **Zéro normalization** : le texte est chargé tel quel, aucun `.normalize()`, aucun `.replace()` sur les caractères arabes

#### 2. Changer la police prioritaire vers Amiri / Scheherazade New
- Dans `QuranTextView.tsx`, modifier `FONT_FAMILY` :
  ```
  "'Amiri Quran', 'Amiri', 'Scheherazade New', serif"
  ```
- Retirer `KFGQPC Uthmanic Script HAFS` de la chaîne de fallback (police instable)
- Les polices Amiri et Scheherazade New sont déjà chargées via Google Fonts dans `index.html`

#### 3. Appliquer les propriétés CSS anti-bug sur le conteneur de texte
Ajouter au conteneur des versets dans `QuranTextView.tsx` :
- `fontVariantLigatures: 'common-ligatures'` — empêche les lettres de se détacher
- `fontFeatureSettings: '"liga" 1, "calt" 1, "kern" 1'` — active ligatures contextuelles et crénage
- `textRendering: 'optimizeLegibility'` — meilleur rendu typographique
- `webkitFontSmoothing: 'antialiased'`
- Conserver `lineHeight: 2.1` (déjà en place)
- Conserver `direction: rtl` (déjà en place)
- Retirer `letterSpacing: '0.01em'` (interfère avec les ligatures arabes)

#### 4. Supprimer la fonction `normalizeArabicForMatch`
- La fonction `normalizeArabicForMatch` dans `QuranTextView.tsx` applique `.normalize('NFKD')` et supprime les diacritiques — c'est exactement ce qu'il faut éviter
- Remplacer la détection de Basmala par une comparaison simple sur les 4 premiers mots arabes bruts, sans normalisation

#### 5. Fichiers modifiés
| Fichier | Changement |
|---|---|
| `public/data/quran-uthmani.json` | Remplacé par données Tanzil brutes |
| `src/lib/quranData.ts` | Adapter le parsing si structure Tanzil diffère |
| `src/components/quran/QuranTextView.tsx` | Police → Amiri, CSS anti-bug, suppression normalisation |
| `index.html` | Retirer le `@font-face` KFGQPC (optionnel, peut rester en fallback) |

### Note technique importante
La fonction `normalizeArabicForMatch` n'est utilisée que pour détecter la Basmala en début de verset 1 — elle ne modifie **pas** le texte affiché. Le texte affiché (`displayText`) passe uniquement par `stripLeadingBasmala` qui retire les 4 premiers mots. La normalisation est donc limitée à la détection, pas au rendu. On la remplacera quand même par une approche sans normalisation pour respecter la consigne "zéro modification".

