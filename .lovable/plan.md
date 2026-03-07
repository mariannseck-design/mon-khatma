
### Diagnostic confirmé
- Les logs montrent que l’inscription passe au 1er essai (code 200 + envoi de mail), puis les tentatives rapprochées renvoient `429 over_email_send_rate_limit`.
- Donc le problème vient surtout des renvois trop fréquents, pas d’un bug bloquant de formulaire.

### Plan d’implémentation
1. **Traduire et normaliser les erreurs d’auth**
   - Remplacer les messages bruts (`email rate limit exceeded`, etc.) par des messages FR clairs et actionnables.
2. **Ajouter un anti-spam côté inscription**
   - Mettre un cooldown (ex. 60s) après envoi réussi **et** après une erreur 429.
   - Désactiver temporairement le bouton d’inscription avec compte à rebours visible.
3. **Gérer le cas “email non confirmé”**
   - Si la connexion échoue avec `email_not_confirmed`, afficher un message explicite.
   - Proposer un bouton “Renvoyer l’email de confirmation” avec le même cooldown.
4. **Améliorer l’état post-inscription**
   - Après inscription réussie, afficher une vue “Vérifie ton email” pour éviter de relancer immédiatement l’inscription.
   - Ajouter une aide claire: boîte principale + spam + délai avant renvoi.
5. **Ajustement de limite côté backend (si nécessaire)**
   - Vérifier le paramètre de limite d’envoi d’emails d’auth sur Lovable Cloud et l’augmenter légèrement si trop strict pour ton usage.

### Détails techniques
- Fichiers ciblés: `src/pages/AuthPage.tsx` (gestion erreurs, cooldown, UX post-inscription), `src/contexts/AuthContext.tsx` (méthode de renvoi de confirmation si on centralise la logique).
- Pas de migration base de données.
- La vérification email reste activée (on ne la désactive pas).

### Vérification
- Inscription valide: succès + message clair de confirmation email.
- Clics répétés: blocage local + plus de spam de requêtes.
- Connexion avant validation email: message guidé + option de renvoi.
- En cas de 429: message FR compréhensible (plus de message technique brut).
