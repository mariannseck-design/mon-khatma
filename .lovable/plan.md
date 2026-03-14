

## Probleme identifie

L'utilisatrice `marianne@agriproafrica.com` a tente de s'inscrire (visible dans les auth logs : `user_repeated_signup`) mais n'a recu aucun email. L'investigation montre :

- Le domaine email `notify.makhatma.com` est verifie et actif
- L'ancien `auth-email-hook` utilisait l'envoi direct (ancien pattern) et n'avait aucun log — il n'etait probablement pas correctement connecte
- L'infrastructure email (queues pgmq, cron job, tables) vient d'etre creee par `setup_email_infra`
- Les templates ont ete re-scaffoldes avec le nouveau pattern queue

## Ce qu'il reste a faire

### 1. Ajouter `process-email-queue` au config.toml

Ajouter l'entree pour la nouvelle Edge Function :
```toml
[functions.process-email-queue]
  verify_jwt = true
```

### 2. Appliquer le branding Ma Khatma aux 6 templates

Les templates scaffoldes sont generiques (anglais, noir/blanc). Il faut :
- Traduire en francais
- Appliquer les couleurs Ma Khatma : vert `#2d6a4f` pour les boutons, texte `#4a5568`
- Ajouter le logo depuis le bucket `email-assets`
- Adapter le ton bienveillant de l'app
- Mettre a jour le `SITE_NAME` a "Ma Khatma" et les sujets d'emails en francais dans `auth-email-hook/index.ts`

### 3. Deployer les 2 Edge Functions

- `auth-email-hook` (mis a jour avec le pattern queue)
- `process-email-queue` (nouveau, traite la queue d'emails)

### 4. Demander a l'utilisatrice de retenter son inscription

Apres le deploiement, l'email devrait etre envoye correctement via la queue.

## Fichiers modifies

- `supabase/config.toml` — ajout de `process-email-queue`
- `supabase/functions/_shared/email-templates/signup.tsx` — branding Ma Khatma (deja fait avant, a re-appliquer)
- `supabase/functions/_shared/email-templates/recovery.tsx` — branding
- `supabase/functions/_shared/email-templates/magic-link.tsx` — branding
- `supabase/functions/_shared/email-templates/invite.tsx` — branding
- `supabase/functions/_shared/email-templates/email-change.tsx` — branding
- `supabase/functions/_shared/email-templates/reauthentication.tsx` — branding
- `supabase/functions/auth-email-hook/index.ts` — sujets en francais, SITE_NAME = "Ma Khatma"
- Deploiement de `auth-email-hook` et `process-email-queue`

