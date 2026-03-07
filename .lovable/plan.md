## Plan : Supprimer les faux comptes + Activer la vérification email + Exiger le vrai nom

### 1. Supprimer les 4 comptes avec faux emails

Créer une edge function admin temporaire `admin-cleanup` qui utilise le service role key pour supprimer ces utilisateurs via `supabase.auth.admin.deleteUser()` :

- `197398f4` — [aitougnaounadia@hmail.com](mailto:aitougnaounadia@hmail.com)
- `8f2dc9d5` — [testlovable2026@yopmail.com](mailto:testlovable2026@yopmail.com)
- `609a518b` — mactar.coran@gmail (sans .com)
- `2d880e35` — [rahma.benyedir2ga@gmail.clm](mailto:rahma.benyedir2ga@gmail.clm)

Appeler la fonction, puis la supprimer.

### 2. Désactiver l'auto-confirmation des emails

Modifier `supabase/config.toml` ne fonctionne pas directement. A la place, ajouter une vérification côté code :

- Dans `AuthPage.tsx`, après l'inscription réussie, afficher un message clair demandant de vérifier l'email
- La config actuelle a l'auto-confirm activé (mémoire). Il faut la désactiver via la configuration auth

Note : je n'ai pas accès au tool `configure_auth`. Je vais le signaler et proposer une alternative côté code.

### 3. Renforcer la validation du prénom à l'inscription

Dans `AuthPage.tsx` :

- Exiger un prénom d'au moins 3 caractères
- Interdire les noms avec uniquement des chiffres ou caractères spéciaux
- Ajouter un label plus explicite : "Ton vrai prénom (visible dans la communauté)"  ne pas mettre visible dans la commauté sinon certain risque de mettre de faux  prenom , lui demande juste son prenom et faire que le remplissage soit obligatoire

Dans `src/contexts/AuthContext.tsx` :

- Vérifier que `displayName` est non-vide avant l'inscription

### Fichiers modifiés

- Edge function temporaire `admin-cleanup` (créer, appeler, supprimer)
- `src/pages/AuthPage.tsx` — validation renforcée du prénom