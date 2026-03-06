

## Image interactive : zones de versets cliquables sur le Mushaf

### Approche technique

L'API Quran.com v4 fournit pour chaque mot son `line_number` (1-15) sur la page du Mushaf. On peut ainsi mapper chaque verset aux lignes qu'il occupe, puis superposer 15 bandes horizontales invisibles sur l'image.

```text
┌─────────────────────────┐
│  Image Mushaf (existant)│
│  ┌───────────────────┐  │
│  │ Ligne 1 (tap zone)│  │  ← bande invisible, mappée aux ayahs
│  │ Ligne 2           │  │
│  │ ...               │  │
│  │ Ligne 15          │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ Panneau traduction│  │  ← slide-up au tap
│  └───────────────────┘  │
└─────────────────────────┘
```

### Sources de donnees

- **Positions des mots** : `GET https://api.quran.com/api/v4/verses/by_page/{page}?words=true&per_page=50&word_fields=line_number,text_uthmani`
- **Traduction francaise** : `GET https://api.quran.com/api/v4/verses/by_key/{verse_key}?translations=136` (136 = traduction francaise)

### Modifications

#### 1. Nouveau composant `src/components/quran/ImageVerseOverlay.tsx`

- Fetch les versets de la page avec `words=true` pour obtenir le `line_number` de chaque mot
- Construire un mapping `ligne → ayah(s)` : pour chaque ligne (1-15), quels versets y sont presents
- Rendre 15 `<div>` absolus, chacun couvrant 1/15e de la hauteur de l'image
- Au tap sur une bande : surbrillance verte semi-transparente + fetch de la traduction + affichage du panneau

#### 2. Panneau de traduction (bottom sheet)

- Slide-up depuis le bas (Drawer de vaul deja installe)
- Affiche : numero du verset, texte arabe, traduction francaise
- Boutons suivant/precedent pour naviguer entre les versets de la page
- Se ferme au swipe vers le bas

#### 3. Integration dans `QuranReaderPage.tsx`

- En mode `image`, superposer `<ImageVerseOverlay>` par-dessus l'image existante
- Le overlay ne bloque pas le pinch-to-zoom ni le swipe de page (propagation des events tactiles multi-touch)
- Le tap simple sur une ligne declenche la selection ; le swipe horizontal continue a changer de page

### Gestion des interactions

- **1 doigt tap** → selection du verset sur cette ligne
- **1 doigt swipe horizontal** → changement de page (inchange)
- **2 doigts pinch** → zoom (inchange)
- **Double tap** → zoom toggle (inchange)
- Le panneau de traduction n'empeche pas la navigation

