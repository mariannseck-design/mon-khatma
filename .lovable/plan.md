

## Refonte de l'Accueil — Plan d'implémentation

### Résumé du changement
Restructurer entièrement `AccueilPage.tsx` avec une nouvelle disposition en onglets (Principal / Mon Univers), une palette Vert Émeraude/Sauge + Or sur fond beige, et une typographie sans-serif unifiée.

---

### Nouvelle structure de la page

```text
┌─────────────────────────────────┐
│  Header (inchangé)              │
├─────────────────────────────────┤
│  Greeting (Bienvenue, X)        │
├─────────────────────────────────┤
│  EN-TÊTE FONDATEUR              │
│  ┌─────────────────────────────┐│
│  │ Pages lues + Ma Tillawah    ││
│  │ fond beige, border émeraude ││
│  │ + icône Communauté (coin)   ││
│  └─────────────────────────────┘│
├─────────────────────────────────┤
│  [  Principal  ] [ Mon Univers ]│  ← Toggle tabs
├─────────────────────────────────┤
│                                 │
│  ONGLET PRINCIPAL :             │
│  ┌─────────────────────────────┐│
│  │ LE NOBLE CORAN              ││  Bannière — fond beige/blanc
│  │ border émeraude, texte or   ││  cassé, contour vert
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │ ESPACE HIFZ                 ││  Bannière — fond vert émeraude
│  │ texte + icônes or           ││  profond (#2d6a4f → #40916c)
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │ MURAJA'A                    ││  Bannière — fond vert sauge
│  │ texte + icônes or           ││  (#52796f → #74a892)
│  └─────────────────────────────┘│
│  ┌────────────┬────────────────┐│
│  │ MON SUIVI  │ ESPACE DHIKR  ││  Grille 2 col — carrés
│  │            │                ││  vert clair + or
│  └────────────┴────────────────┘│
│                                 │
│  ONGLET MON UNIVERS :           │
│  - Ma Tillawah (planificateur)  │
│  - Espace Communauté            │
│  - Weekly Report                │
│  - Citation spirituelle         │
│  - Partager / Installer         │
│                                 │
├─────────────────────────────────┤
│  Navigation (inchangée)         │
└─────────────────────────────────┘
```

---

### Détails techniques

**Fichier modifié** : `src/pages/AccueilPage.tsx` (réécriture majeure)

**1. En-tête Fondateur**
- Fusionne le compteur de pages + Ma Tillawah en une seule carte
- Fond : `#faf8f5` (beige clair), border `2px solid rgba(45,106,79,0.3)` (émeraude)
- Texte pages : vert émeraude `#2d6a4f`, icônes : or `#b5942e`
- Bouton discret Communauté (icône Users) en coin supérieur droit → lien `/cercle`

**2. Toggle Principal / Mon Univers**
- Utiliser un state `activeTab` avec deux boutons stylisés
- Fond actif : vert émeraude, texte blanc ; inactif : transparent, texte vert

**3. Palette Vert/Or (remplacement du teal #0d7377)**
- Vert Émeraude profond : `#2d6a4f`
- Vert Sauge : `#52796f` → `#74a892`
- Or : `#b5942e` (texte/icônes), `#d4af37` (accents)
- Fond global : conserve `bg-gradient-warm` (beige/crème)
- Suppression totale du teal, du pastel pêche et lavande des cartes

**4. Cartes bannières (onglet Principal)**
- Le Noble Coran : fond `#faf8f5`, border émeraude, titre or, icône or
- Espace Hifz : fond gradient `#2d6a4f → #40916c`, texte/icônes or
- Muraja'a : fond gradient `#52796f → #74a892`, texte/icônes or

**5. Grille secondaire**
- 2 colonnes : Mon Suivi + Espace Dhikr
- Carrés avec fond vert clair `#dde5d4` ou émeraude léger, icônes or
- Dhikr reste "Bientôt disponible"

**6. Onglet Mon Univers**
- Ma Tillawah (lien planificateur)
- Espace Communauté (lien cercle)
- Weekly Report (existant)
- Citation spirituelle (existante)
- Boutons Partager + Installer (existants)

**7. Typographie**
- Tous les titres de cartes : `font-family: 'Inter', sans-serif` au lieu de Playfair Display
- `font-weight: 700`, `letter-spacing: 0.08em`, `text-transform: uppercase`

