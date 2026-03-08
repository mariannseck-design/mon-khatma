

## Plan : Section multi-catégories Douas avec 4 cartes maîtresses

### Architecture

Nouvelle page `/douas` avec 3 niveaux de navigation :
1. **Grille des 4 cartes maîtresses** (Aube & Crépuscule, Mes Passages, Actes du Quotidien, Réconfort & Lumière)
2. **Liste des sous-thèmes** au clic sur une carte
3. **Module de lecture standard** (réutilisation de `DhikrSession` + `DhikrCounter`)

### Fichiers à créer

**`src/lib/douasData.ts`** (~400 lignes)
- 4 collections thématiques, chaque invocation avec `arabic`, `phonetic`, `french`, `target`, `title`, `source`
- Honorifiques systématiques : (عز وجل) après Allah, (عليه السلام) après chaque Prophète, (ﷺ) après Muhammad
- **Aube & Crépuscule** : Réveil, Insomnie, Cauchemar, Avant de dormir, Prière de nuit
- **Mes Passages** : Adhan, Entrée/sortie mosquée, Voyage (départ/arrivée), Marché, Monter en véhicule
- **Actes du Quotidien** : Avant/après repas, Pluie, Tonnerre, Mariage (félicitations), Nouveau-né, Vêtement neuf, Miroir
- **Réconfort & Lumière** : Dettes, Affliction/tristesse, Décès/condoléances, Visite du malade, Peur, Difficulté

**`src/pages/DouasPage.tsx`** (~200 lignes)
- État à 3 niveaux : `menu` → `subthemes` → `session`
- Grille 2×2 des 4 cartes avec icônes dorées (#D4AF37), coins arrondis 2rem, design premium
- Liste sous-thèmes : items simples avec chevron, animation slide-in
- Session : réutilise `DhikrSession` existant
- Transitions `AnimatePresence` entre chaque niveau

### Fichiers à modifier

**`src/App.tsx`** (~3 lignes)
- Import `DouasPage` + route protégée `/douas`

**`src/pages/AccueilPage.tsx`** (~20 lignes)
- Carte "Mes Douas" dans l'onglet Principal, après "Les Sources de Lumière"
- Design : bordure dorée 2px, fond beige/émeraude, icône BookOpen dorée
- Sous-titre : "Aube · Passages · Quotidien · Réconfort"

### Design des 4 cartes

| Carte | Icône | Fond | Texte |
|---|---|---|---|
| Aube & Crépuscule | `Moon` | `#1a1a2e` | `#D4AF37` |
| Mes Passages | `MapPin` | `#faf8f5` | `#2d6a4f` |
| Actes du Quotidien | `Heart` | `#c8d5c0` | `#1b4332` |
| Réconfort & Lumière | `Sparkles` | `#065F46` | `#D4AF37` |

Toutes les icônes en or (#D4AF37), bordures `1.5px solid #D4AF3740`, aspect-ratio 4/3, espacement harmonieux `gap-4` pour mobile.

### Flux utilisateur

```text
Dashboard → Carte "Mes Douas"
  → Grille 2×2 (4 cartes)
    → Clic "Mes Passages"
      → Liste : Adhan, Mosquée, Voyage, Marché, Véhicule
        → Clic "Voyage"
          → DhikrSession standard (arabe émeraude, phonétique italique, traduction FR)
```

