

## Désactiver Sources de Lumière et Mes Duas pour les abonnés

Envelopper les deux routes avec `ComingSoonGate` dans `src/App.tsx`, comme c'est déjà fait pour Hifz, Muraja'a, etc.

### Changement unique — `src/App.tsx`

**Ligne 97** : Envelopper `SourcesDeLumierePage` avec `ComingSoonGate` (icon: `Sparkles`, titre: "Sources de Lumière")

**Ligne 98** : Envelopper `DouasPage` avec `ComingSoonGate` (icon: `BookOpen`, titre: "Mes Duas")

Les admins verront le contenu normal grâce à la logique existante de `ComingSoonGate` (`if (isAdmin) return children`). Les autres utilisateurs verront l'écran "Bientôt disponible".

