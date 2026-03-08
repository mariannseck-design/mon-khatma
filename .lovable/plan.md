

## Plan : Moderniser la barre de navigation + remplacer Rappels par Profil

### 1. Navigation visuelle modernisée

**`src/components/layout/Navigation.tsx`** :
- **État actif** : Remplacer le carré arrondi vert par un **cercle** avec dégradé émeraude (`bg-gradient-to-br from-[#065F46] to-[#044E3B]`) + ombre interne (`shadow-inner`) + ombre externe douce
- **Icônes inactives** : Trait plus fin via `strokeWidth={1.5}`, couleur gris anthracite doux (`text-[var(--p-text-55)]`)
- **Icône active** : Blanc (`text-white`)
- **Labels** : Taille réduite (`text-[10px]`), espacement lettres (`tracking-wider`)
- **Backdrop blur** : Déjà en place (`backdrop-blur-xl`), renforcer avec `bg-card/80` pour plus de transparence
- **Forme du motion indicator** : `rounded-full` au lieu de `rounded-2xl`

### 2. Remplacer Rappels par Profil

**`src/components/layout/Navigation.tsx`** :
- Remplacer l'item `{ path: '/rappels', icon: Bell, label: 'Rappels' }` par `{ path: '/profil', icon: User, label: 'Profil' }`
- Importer `User` de lucide-react, retirer `Bell`

**`src/hooks/useSwipeNavigation.ts`** :
- Mettre à jour `SWIPE_PAGES` : remplacer `/rappels` par `/profil`

### 3. Ajouter accès Rappels depuis Profil

**`src/pages/ProfilPage.tsx`** :
- Ajouter une carte/bouton "Mes Rappels" avec icône `Bell` qui navigue vers `/rappels`
- Placé juste après la carte Informations

### Fichiers modifiés
- `src/components/layout/Navigation.tsx` — refonte visuelle + Profil remplace Rappels
- `src/hooks/useSwipeNavigation.ts` — mise à jour swipe pages
- `src/pages/ProfilPage.tsx` — ajout bouton Rappels
- `src/components/icons/ChapeletIcon.tsx` — ajuster `strokeWidth` pour cohérence avec les autres icônes

