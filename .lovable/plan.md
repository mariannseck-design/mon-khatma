

## Plan : Déplacer Dhikr dans Émotions et regrouper en blocs

### Objectif
Retirer "Mon Dhikr Quotidien" de la page d'accueil, l'intégrer dans la page Émotions, et transformer la section Émotions (humeur + gratitude) en un bloc carte similaire au style des cartes Dhikr.

### Modifications

#### 1. `src/pages/EmotionsPage.tsx`
- Renommer la page en "Mon Espace Bien-Être" ou garder "Émotions"
- Ajouter une grille de blocs-cartes en haut de page, style identique aux cartes Dhikr :
  - **Bloc "Mes Émotions"** — lien interne qui scrolle vers la section humeur/gratitude existante, ou qui reste sur place (pas de navigation)
  - **Bloc "Mon Dhikr Quotidien"** — lien vers `/dhikr`
- Les cartes Dhikr (Zikr du matin, Zikr du soir, etc.) restent sur `/dhikr` — on garde le lien
- La section humeur/gratitude/historique reste en dessous des cartes

#### 2. `src/pages/AccueilPage.tsx`
- Retirer le bloc "Mon Dhikr Quotidien" de la grille secondaire (lignes 501-524)
- La grille devient une seule carte "Mon Suivi Hifz" en pleine largeur, ou on garde la grille avec un autre élément

#### 3. `src/App.tsx`
- La route `/dhikr` reste (la page DhikrPage existe toujours)

### Design des cartes sur EmotionsPage

```text
┌─────────────┐  ┌─────────────┐
│   🌸        │  │   📿        │
│ Mes Émotions│  │ Mon Dhikr   │
│             │  │ Quotidien   │
└─────────────┘  └─────────────┘

[Section humeur + gratitude + historique en dessous]
```

- Carte "Mes Émotions" : scrolle vers la section en dessous (même page)
- Carte "Mon Dhikr Quotidien" : `<Link to="/dhikr">`
- Style : mêmes couleurs émeraude/or, `rounded-2xl`, `aspect-[4/3]`

### Fichiers modifiés
- `src/pages/EmotionsPage.tsx` — ajouter grille de 2 cartes en haut
- `src/pages/AccueilPage.tsx` — retirer le bloc Dhikr de la grille, adapter la grille restante

