
Objectif: corriger le cas où un compte VIP non-admin (marianne@agriproafrica.com) voit encore la carte Tikrar active.

Constat confirmé
- Le backend confirme que marianne@agriproafrica.com n’a aucun rôle admin dans `user_roles`.
- Tu as confirmé que la carte Tikrar est quand même cliquable avec ce compte.
- Donc le problème est côté état client (`isAdmin`) et non côté base de données.

Plan de correction

1) Fiabiliser le calcul de `isAdmin` dans `AuthContext`
- Fichier: `src/contexts/AuthContext.tsx`
- Créer une logique unique de synchronisation des accès par session (admin + VIP).
- Ajouter un garde anti-race (token/sequence/ref) pour ignorer les réponses async anciennes.
- Réinitialiser immédiatement `isAdmin`/`isAllowedEmail` lors de tout changement de session avant les requêtes.
- Exécuter les vérifications en parallèle puis appliquer le résultat uniquement si la session n’a pas changé.
- Éviter les doubles chemins concurrents qui peuvent réécrire `isAdmin` avec une ancienne valeur.

2) Bloquer l’UI “admin-only” tant que l’accès n’est pas résolu
- Fichiers:
  - `src/contexts/AuthContext.tsx` (exposer un `accessLoading` ou équivalent)
  - `src/pages/HifzHubPage.tsx`
  - `src/components/layout/ComingSoonGate.tsx`
- Pendant la résolution des droits, afficher une version non cliquable (ou loader), jamais un lien actif.
- N’activer Tikrar que si `isAdmin === true` ET vérification terminée.

3) Défense supplémentaire sur la route admin-only
- Fichier: `src/App.tsx` (ou composant de garde dédié)
- Ajouter un guard explicite admin-only pour `/hifz` (et autres routes admin-only si nécessaire), basé sur l’état d’accès fiabilisé.
- Si non-admin: redirection vers `/hifz-hub` ou affichage gate non bloquant.

4) Vérification fonctionnelle de fin
- Cas 1: Admin → Tikrar actif.
- Cas 2: Logout admin puis login marianne sans hard refresh → Tikrar non cliquable + “Bientôt disponible”.
- Cas 3: marianne peut toujours accéder à `/muraja` et `/hifz-suivi`.
- Cas 4: accès direct à `/hifz` avec marianne bloqué.

Détails techniques (section dédiée)
- Aucune migration base de données nécessaire.
- Le correctif cible une condition de concurrence frontend (stale async auth checks).
- L’objectif est “fail closed”: en cas d’incertitude, on bloque l’UI admin-only jusqu’à confirmation explicite des droits.
