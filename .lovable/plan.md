

## Intégration des explications Ar-Rabt et SM-2 sur la page Muraja'a

### Changements prévus

**Fichier modifié : `src/pages/MurjaPage.tsx`**

1. **Texte explicatif sous "Ar-Rabt — Liaison du jour"** (après ligne 352)
   - Encadré discret avec bordure fine `var(--p-border)`, fond `var(--p-card)`
   - Texte : « Ar-Rabt (La Liaison) : Récitation quotidienne obligatoire pendant 30 jours pour transformer ta mémoire immédiate en un ancrage solide par la grâce d'**Allah** (عز وجل). »
   - Police Amiri en gras 1.1em pour les termes arabes
   - Couleur texte atténuée `var(--p-text-65)`, taille `text-[11px]`

2. **Texte explicatif sous "Le Tour — Révision SM-2"** (après ligne 376)
   - Même style d'encadré
   - Texte : « SM-2 (SuperMemo-2) : Algorithme de révision espacée qui calcule ton taux d'oubli pour te proposer de réviser au moment parfait. C'est la clé pour préserver le dépôt des Prophètes (عليهم السلام) toute ta vie. »

3. **Bouton info (icône ℹ️)** à côté de chaque titre de section
   - Ouvre un Dialog modal avec explication détaillée + graphique de la courbe de l'oubli

**Nouveau composant : `src/components/muraja/MurajaMethodModal.tsx`**

- Modal avec deux onglets/sections : "Ar-Rabt" et "SM-2 (SuperMemo-2)"
- **Section Ar-Rabt** : Explication complète (empreinte dans le sable, 30 jours consécutifs)
- **Section SM-2** : Explication de la répétition espacée
- **Graphique courbe de l'oubli** : Composant Recharts (AreaChart) montrant :
  - Courbe descendante "Sans révision" (rouge/grise)
  - Courbe avec pics de révision "Avec SM-2" (émeraude) qui stabilise la rétention
  - Axes : Jours (X) vs Rétention % (Y)
- Formules de respect : **(عز وجل)** après Allah, **(عليهم السلام)** pour les Prophètes au pluriel, en police Amiri bold 1.1em
- Style : fond `#FDFBF7`, texte `#1C2421`, accents émeraude/or

