

## Probleme

Le hook `auth-email-hook` n'est pas connecte au systeme d'authentification. Il boot et shutdown mais ne recoit aucune requete. Resultat : aucun email de confirmation n'est envoye. Tous les utilisateurs sont affectes.

## Solution

1. **Re-scaffolder les templates d'email** via l'outil `scaffold_auth_email_templates` pour que le systeme connecte correctement le hook
2. **Re-appliquer le branding Ma Khatma** (couleurs vertes, francais, logo) sur les templates regeneres
3. **Redeployer** `auth-email-hook` pour activer la connexion

Cela devrait prendre effet immediatement apres le deploiement. Marianne et tous les futurs utilisateurs recevront alors leurs emails de confirmation.

