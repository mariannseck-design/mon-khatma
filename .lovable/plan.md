

## Déplacer la liste des emails autorisés en base de données

### Pourquoi ?

Aujourd'hui, la liste `ALLOWED_EMAILS` est codée en dur dans `AuthContext.tsx`. Pour ajouter ou retirer un email, il faut modifier le code et redéployer. En la déplaçant dans la base de données, tu pourras gérer les accès VIP directement depuis le dashboard admin de l'app, sans toucher au code.

### Comment ça marche

1. **Nouvelle table `allowed_emails`** dans la base de données :
   - `id` (uuid, auto)
   - `email` (text, unique, obligatoire)
   - `label` (text, optionnel — pour noter "qui c'est")
   - `created_at` (timestamp)
   - RLS : seuls les admins peuvent lire/écrire. Mais on crée aussi une fonction `SECURITY DEFINER` pour vérifier si un email est autorisé (comme on fait déjà pour `has_role`).

2. **Fonction `is_allowed_email(email text)`** — fonction `SECURITY DEFINER` qui retourne `true/false`. Utilisée côté client sans exposer la liste complète.

3. **`AuthContext.tsx`** — au lieu de lire une constante, on appelle la base après le login pour vérifier si l'email de l'utilisatrice est dans la table. Le résultat alimente `hasFullAccess`.

4. **Page Admin** — ajouter une section simple pour voir/ajouter/supprimer des emails autorisés (accessible uniquement aux admins).

### Changements techniques

**Migration SQL :**
```sql
CREATE TABLE public.allowed_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  label text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;

-- Admins only
CREATE POLICY "Admins can manage allowed_emails"
  ON public.allowed_emails FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Security definer function for checking
CREATE OR REPLACE FUNCTION public.is_allowed_email(_email text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.allowed_emails WHERE email = _email
  )
$$;
```

**`src/contexts/AuthContext.tsx`** :
- Supprimer la constante `ALLOWED_EMAILS`
- Ajouter un appel `supabase.rpc('is_allowed_email', { _email: user.email })` après le login
- Stocker le résultat dans un state `isAllowedEmail`
- `hasFullAccess = isAdmin || isAllowedEmail`

**`src/pages/AdminPage.tsx`** :
- Ajouter une section "Emails autorisés" avec un tableau listant les emails et un formulaire pour en ajouter/supprimer

### Comment tu géreras les accès ensuite

1. Va sur ta page **Admin**
2. Dans la section "Emails autorisés", tape l'email de l'abonnée → clique "Ajouter"
3. L'abonnée se reconnecte → elle a accès à toutes les fonctionnalités
4. Pour retirer l'accès → clique "Supprimer" à côté de l'email

Aucune modification de code nécessaire.

