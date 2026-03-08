

## Désactiver toutes les cartes dhikr pour les abonnés, actives pour l'admin

### Changement

**`src/pages/DhikrPage.tsx`** — Une seule modification :

Mettre **toutes les cartes** à `enabled: false` dans le tableau `dhikrCards`. La logique existante (ligne ~112) fait déjà `if (card.enabled || isAdmin) setActiveCategory(card.id)` — donc l'admin pourra toujours ouvrir toutes les cartes, et les abonnés verront "Bientôt disponible" sur chacune.

Concrètement : changer les 5 premières cartes (morning, evening, prayer, chifa, louanges) de `enabled: true` à `enabled: false`.

