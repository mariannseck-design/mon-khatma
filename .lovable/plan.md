

## Intégration du code couleur Tajwid — Plan

### Approche

Utiliser le dataset open-source **cpfair/quran-tajweed** qui fournit des annotations Tajwid avec indices de caractères exacts pour chaque verset, basé sur le texte Tanzil Uthmani (notre source actuelle). Ce fichier JSON (~3MB) sera chargé localement pour un rendu instantané.

### Structure des données Tajwid

Le fichier `tajweed.hafs.uthmani-pause-sajdah.json` contient pour chaque verset :
```text
{ surah: 1, ayah: 1, annotations: [{ rule: "madd_2", start: 24, end: 25 }, ...] }
```
Les `start`/`end` sont des indices de caractères dans le texte brut du verset.

### Règles et couleurs (standard Mushaf Tajwid)

| Règle | Couleur | Code hex |
|---|---|---|
| Ghunnah | Vert | #169b4c |
| Ikhfa / Ikhfa Shafawi | Vert clair | #26b89a |
| Idghaam (avec/sans Ghunnah, Shafawi, etc.) | Orange | #f0932b |
| Iqlab | Turquoise | #10ac84 |
| Qalqalah | Bleu | #4a90d9 |
| Madd (2, 246, muttasil, munfasil, 6) | Rouge | #d63031 |
| Hamzat al-Wasl | Gris | #9b9b9b |
| Lam Shamsiyyah | Gris foncé | #636e72 |
| Silent | Gris clair | #b2bec3 |

### Fichiers à créer/modifier

#### 1. `public/data/tajweed-annotations.json` (nouveau)
- Télécharger le fichier du repo cpfair/quran-tajweed
- Indexé par surah+ayah pour lookup O(1)

#### 2. `src/lib/tajweedData.ts` (nouveau)
- Loader + cache mémoire (même pattern que `quranData.ts`)
- Index: `Map<string, Annotation[]>` avec clé `"surah:ayah"`
- Fonction `getTajweedAnnotations(surah, ayah)` → annotations triées par `start`
- Map des couleurs par règle

#### 3. `src/components/quran/QuranTextView.tsx` (modifier)
- Ajouter prop `tajweedEnabled: boolean`
- Fonction `renderTajweedText(text, annotations)` qui découpe le texte en segments colorés via `<span style={{color}}>`
- Si `tajweedEnabled=false`, rendu actuel inchangé (texte brut)
- Charger les annotations au même moment que les ayahs (parallèle)

#### 4. `src/components/quran/ReaderSettingsPanel.tsx` (modifier)
- Ajouter un toggle "Couleurs Tajwid" dans la section mode texte
- Nouvelle prop `tajweedEnabled` + `onTajweedChange`

#### 5. `src/pages/QuranReaderPage.tsx` (modifier)
- État `tajweedEnabled` (persisté dans localStorage)
- Passer la prop à `QuranTextView` et `ReaderSettingsPanel`

### Moteur de rendu (logique clé)

```text
Pour chaque verset :
1. Récupérer annotations triées par 'start'
2. Découper le texte en segments : [avant, annoté, avant, annoté, ...]
3. Chaque segment annoté → <span style={{color: TAJWEED_COLORS[rule]}}>
4. Segments non annotés → texte normal
```

Attention : quand la Basmala est retirée du verset 1 (stripLeadingBasmala), décaler les indices d'annotation en conséquence.

### Performance
- Le JSON Tajwid est chargé une seule fois et indexé en mémoire
- Le découpage en spans est fait dans un `useMemo` — zéro recalcul entre les re-renders
- Compatible avec le Tikrar (40 répétitions) sans latence

