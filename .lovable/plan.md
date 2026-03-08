

## Probleme identifie

La page `/emotions` (EmotionsPage.tsx) contient une **copie obsolete** de la grille de cartes Dhikr (lignes 39-48). Cette copie :
- Ne verifie **jamais** `isAdmin` dans le `onClick` (ligne 213)
- A presque toutes les cartes avec `enabled: false`
- Navigue vers `/dhikr` uniquement pour "Zikr du matin"
- Contient encore "Duas Hajj" au lieu de "Louanges & Istighfar"

La page `/dhikr` (DhikrPage.tsx) est correcte et gere bien `isAdmin`, mais l'utilisateur accede aux cartes via `/emotions`.

## Plan

**Fichier : `src/pages/EmotionsPage.tsx`**

1. Mettre a jour le tableau `dhikrCards` pour correspondre a DhikrPage :
   - Remplacer "Duas Hajj" par "Louanges & Istighfar" (icone `Sparkles`, fond `#2d6a4f`, texte `#d4af37`)
   - Mettre `enabled: true` sur les cartes qui le sont dans DhikrPage (morning, evening, prayer, louanges)
   - Ajouter un `id` a chaque carte pour le routing

2. Modifier le `onClick` des cartes pour naviguer vers `/dhikr` avec le bon `id` en parametre, **ou** ouvrir directement la session via un state partage. La solution la plus simple : toutes les cartes dhikr naviguent vers `/dhikr?category=<id>` quand elles sont `enabled` ou quand l'utilisateur est admin.

3. Ajouter la verification `isAdmin` dans le click handler et masquer le badge "Bientot" pour les admins.

### Details techniques

- Ajouter `const { user, isAdmin } = useAuth();` (remplacer le destructuring actuel)
- Modifier ligne 213 : `onClick={() => (card.enabled || isAdmin) && navigate('/dhikr?category=' + card.id)}`  
  Ou plus simplement : naviguer vers `/dhikr` et laisser DhikrPage gerer l'affichage
- Cacher le badge "Bientot" pour les admins : `{!card.enabled && !isAdmin && (...)}`
- Ajouter `cursor-pointer` pour les admins sur les cartes desactivees

Optionnel : modifier DhikrPage pour lire le query param `?category=` et ouvrir directement la session correspondante.

### Fichiers modifies
- `src/pages/EmotionsPage.tsx` (~15 lignes modifiees)
- `src/pages/DhikrPage.tsx` (~5 lignes ajoutees pour lire le query param)

