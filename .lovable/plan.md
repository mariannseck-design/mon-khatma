

## Diagnostic : 2 problèmes identifiés

### Problème 1 : Création de profil échoue (RLS 401)

Après l'inscription avec vérification email activée, l'utilisateur **n'a pas de session** (pas encore confirmé). Le code dans `signUp()` tente immédiatement d'insérer dans `profiles` avec le token anon → RLS bloque (401). Les logs réseau le confirment clairement.

**Correction** : Supprimer l'insert de profil dans `signUp()`. Déplacer la logique dans `ensureProfile()` (qui s'exécute quand l'utilisateur confirme son email et obtient une session), en y ajoutant le `display_name` depuis `user.user_metadata`.

### Problème 2 : Emails de confirmation non reçus

Les logs auth montrent que le hook email a bien été exécuté (`Hook ran successfully`). Le système Lovable a bien envoyé les emails. Causes possibles :
- Les emails arrivent d'un expéditeur par défaut qui peut être filtré par Gmail
- `test@gmail.com` n'est probablement pas ta vraie boîte

Pour améliorer la délivrabilité, on peut configurer un domaine d'envoi personnalisé. Mais d'abord, corrigeons le bug de profil.

### Changements

**`src/contexts/AuthContext.tsx`** :
1. Dans `signUp()` : supprimer le bloc qui insère dans `profiles` après inscription (lignes 106-112)
2. Dans `ensureProfile()` : récupérer `display_name` depuis `user.user_metadata` et l'inclure dans l'insert

**Migration SQL** : Créer un trigger `on auth.users insert` pour auto-créer le profil. Non — on ne peut pas toucher au schema `auth`. On garde `ensureProfile` côté client qui se déclenche au login post-confirmation.

**Nettoyage** : Supprimer les comptes test créés (`test@gmail.com`, `testoooooo@gmail.com`) via une edge function temporaire.

### Fichiers modifiés
- `src/contexts/AuthContext.tsx`
- Edge function temporaire pour nettoyage des comptes test

