

## Plan : Page "Mon Dhikr Quotidien"

### Changements

**1. Nouveau fichier : `src/pages/DhikrPage.tsx`**
- Page avec `AppLayout` titre "Mon Dhikr Quotidien"
- Grille 2 colonnes (`grid grid-cols-2 gap-4`) de 8 cartes rectangulaires
- Chaque carte : coins arrondis, ombre légère, icône line-art, titre, badge translucide "Bientôt disponible" en haut à droite
- Cartes et couleurs selon la spec :
  1. Zikr du matin — fond or/sable `#e8d5a3`, texte vert foncé, icône `Sunrise`
  2. Zikr du soir — fond bleu nuit `#1a1a2e`, texte blanc, icône `Moon`
  3. Après la prière — fond sauge clair `#c8d5c0`, texte émeraude, icône `BookOpen`
  4. Toute occasion — fond beige perle `#f0ebe3`, texte vert foncé, icône `Heart`
  5. Sujud Tilawah — fond terracotta `#c67a5c`, texte blanc, icône `ChevronDown`
  6. Duas Omra — fond blanc cassé + bordure or, texte vert foncé, icône `MapPin`
  7. Duas Hajj — fond émeraude profond `#2d6a4f`, texte or, icône `Landmark`
  8. Istikharah — fond bleu azur pâle `#dce8f0`, texte vert foncé, icône `Sparkles`

**2. Route dans `src/App.tsx`**
- Ajouter route `/dhikr` → `ProtectedRoute` → `DhikrPage`

**3. Modifier `src/pages/AccueilPage.tsx`**
- Rendre la carte Dhikr cliquable : remplacer le `<div className="block opacity-65 cursor-default">` par un `<Link to="/dhikr">` et retirer `opacity-65 cursor-default`

