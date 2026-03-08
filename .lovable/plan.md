

## Désactiver les cartes Dhikr pour les utilisateurs

Revenir à `enabled: false` sur les 10 cartes dans `src/pages/DhikrPage.tsx` pour que seuls les admins puissent y accéder. Les utilisateurs normaux verront le badge "Bientôt disponible".

### Changement unique

**`src/pages/DhikrPage.tsx`** : Remettre `enabled: false` sur les 10 entrées du tableau `dhikrCards`.

