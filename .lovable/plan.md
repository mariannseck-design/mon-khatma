

## Plan : Ajouter le prénom aux salutations + unifier la citation du jour

### 1. Ajouter le prénom dans HifzSuiviPage

**`src/pages/HifzSuiviPage.tsx`**
- Importer `useAuth` (déjà fait) + récupérer le `displayName` depuis le profil ou `localStorage` (même logique que AccueilPage)
- Ligne 221 : remplacer `{greeting} 🌙` par `{greeting}, {displayName} 🌙` (si displayName existe)

### 2. Utiliser la même citation du jour partout

**`src/pages/HifzSuiviPage.tsx`**
- Supprimer le tableau `MOTIVATIONS` et le `useMemo` random
- Importer `getTodayQuote` depuis `@/lib/dailyQuotes`
- Ligne 223 : afficher `getTodayQuote().text` à la place de `{motivation}`
- Ainsi la citation affichée sera identique à celle de l'Accueil

### 3. Récupérer le profil dans HifzSuiviPage

- Charger le `display_name` depuis la table `profiles` (comme dans AccueilPage) ou simplement lire `localStorage.getItem('guest_first_name')` pour rester simple
- Ajouter une requête `profiles` dans `loadData` ou un state dédié

### Résumé des fichiers modifiés
- `src/pages/HifzSuiviPage.tsx` : ajout du prénom aux salutations + remplacement des motivations aléatoires par la citation du jour unique

