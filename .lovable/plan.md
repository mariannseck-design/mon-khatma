

## Badge doré de révisions en attente

### Modification unique : `src/pages/AccueilPage.tsx`

**1. Ajouter un state + fetch des révisions en attente**

Dans le composant, ajouter un `useState<number>(0)` pour `pendingReviews` et un `useEffect` qui requête `hifz_memorized_verses` avec `next_review_date <= today` pour compter les blocs dus. Ce fetch ne se fait que si `user` est connecté.

**2. Afficher le badge sur l'icône Shield**

Sur la carte "Entretien & Révision", ajouter un `<span>` positionné en `absolute -top-1.5 -right-1.5` sur le conteneur de l'icône Shield. Le badge utilise un dégradé doré (`#d4af37` → `#b8962e`), texte foncé `#1a2e1a`, bordure blanche, `min-w-[22px]`, `text-[11px]`. Affiche le nombre ou "99+" si > 99. N'apparaît que si `pendingReviews > 0`.

**3. Sous-titre dynamique**

Remplacer le texte statique "Liaison & révision espacée" par un texte contextuel :
- Si révisions en attente : "X bloc(s) à réviser aujourd'hui"
- Sinon : "Liaison & révision espacée" (inchangé)

### Fichier impacté
- `src/pages/AccueilPage.tsx`

