

## Plan : Ajouter le mois/année au graphique hebdomadaire

### Changement dans `src/pages/HifzSuiviPage.tsx`

Ajouter dynamiquement le mois et l'année en cours (ex: "Mars 2026") à droite du titre du graphique, comme un petit badge ou texte secondaire.

**Ligne 436-438** — Modifier le header du graphique pour ajouter le mois :
- Utiliser `new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })` pour générer "mars 2026"
- Capitaliser la première lettre
- L'afficher à droite du titre avec un style discret (`text-[11px]`, couleur `var(--p-text-55)`)

