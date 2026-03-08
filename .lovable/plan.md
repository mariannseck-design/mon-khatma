

## Plan : Restructurer la page en "Mon Dhikr Quotidien"

### Concept
La page `/emotions` devient la page **"Mon Dhikr Quotidien"**. Elle affiche une grille de cartes (style DhikrPage actuel) incluant les 8 cartes dhikr existantes + "Mes Émotions" + "Mes Favoris". Le contenu émotions/favoris reste en dessous, accessible par scroll.

### Modifications

#### 1. `src/components/layout/Navigation.tsx`
- Label : `'Émotions'` → `'Dhikr'`
- Icône : `Smile` → `Moon` (ou garder cohérent)

#### 2. `src/pages/EmotionsPage.tsx`
- `AppLayout title` → `"Mon Dhikr Quotidien"`
- Header h1 → "Mon Dhikr Quotidien" (style émeraude, uppercase, comme DhikrPage)
- Remplacer la grille de 3 cartes par une grille `grid-cols-2` contenant :
  - **Carte "Mes Émotions"** (Flower2 icon, scrolle vers section émotions) — style carte dhikr (fond `#f0ebe3`, texte `#1b4332`)
  - **Carte "Mes Favoris"** (Heart icon, scrolle vers section favoris) — style carte dhikr
  - **Les 8 cartes dhikr** (Zikr du matin, soir, etc. avec badge "Bientôt disponible") — copier le tableau `dhikrCards` depuis DhikrPage
- Sections émotions + favoris + réflexion restent en dessous de la grille

#### 3. `src/pages/DhikrPage.tsx`
- Peut être conservé comme route `/dhikr` ou supprimé (les cartes sont maintenant dans EmotionsPage)
- Option : rediriger `/dhikr` vers `/emotions`

### Layout résultat

```text
┌──────────────────────────┐
│   MON DHIKR QUOTIDIEN    │
├────────────┬─────────────┤
│ Mes        │ Mes         │
│ Émotions   │ Favoris     │
├────────────┼─────────────┤
│ Zikr du    │ Zikr du     │
│ matin      │ soir        │
├────────────┼─────────────┤
│ Après la   │ Toute       │
│ prière     │ occasion    │
│ ...        │ ...         │
├────────────┴─────────────┤
│ [Section Émotions]       │
│ [Section Favoris]        │
│ [Réflexion du mois]      │
└──────────────────────────┘
```

### Fichiers modifiés
- `src/components/layout/Navigation.tsx` — label + icône
- `src/pages/EmotionsPage.tsx` — header + grille fusionnée avec cartes dhikr

