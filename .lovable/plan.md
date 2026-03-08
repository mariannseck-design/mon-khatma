

## Supprimer la carte "Tu fais partie du Cercle" après 48h

### Changement — `src/pages/CerclePage.tsx`

La carte de bienvenue (avec le check vert) ne s'affiche que si `membership.joined_at` date de moins de 48h. Après 48h, la carte disparaît complètement pour tous les membres.

**Logique :**
```
const isNewMember = membership && 
  (Date.now() - new Date(membership.joined_at).getTime()) < 48 * 60 * 60 * 1000;
```

- Si `isNewMember` → afficher la carte "Tu fais partie du Cercle!"
- Sinon → ne rien afficher à la place (les sections d'échange s'affichent directement)

Il faut aussi ajouter `joined_at` à l'interface `Membership` locale (le champ existe déjà en base).

