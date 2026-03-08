

## Deux corrections sur la page d'accueil

### 1. Masquer la citation du jour (DailyQuote)
Les citations motivationnelles sur la mémorisation seront masquées jusqu'à ce que l'utilisateur ait commencé à mémoriser (c'est-à-dire qu'il existe au moins une session hifz ou des versets mémorisés en base).

**Approche** : Dans `AccueilPage.tsx`, conditionner l'affichage du composant `<DailyQuote />` à l'existence de données hifz (on a déjà `activeHifzSession` et `pendingReviews` — on ajoutera un booléen `hasStartedHifz` qui vérifie si l'utilisateur a au moins un verset mémorisé).

### 2. Remettre "Bonjour [Prénom]"
Le prénom (`displayName`) est calculé à la ligne 184 mais n'est plus affiché nulle part — la salutation (ligne 205) n'utilise que `greeting()` qui ne contient pas le nom.

**Approche** : Ajouter le prénom dans la section greeting, par exemple :
```
Bonjour Marianne 🤍
☀️ Sabah el-kheir !
```
On affiche `Bonjour {displayName} 🤍` au-dessus du greeting horaire, uniquement si `displayName` existe.

### Fichier modifié
- **`src/pages/AccueilPage.tsx`** :
  - Ajouter un état `hasStartedHifz` (query sur `hifz_memorized_verses` count > 0)
  - Conditionner `<DailyQuote />` à `hasStartedHifz`
  - Ajouter `Bonjour {displayName}` dans le bloc greeting

