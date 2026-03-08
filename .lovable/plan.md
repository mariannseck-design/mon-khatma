

## Fond apaisant pour la page Muraja'a

### Constat
Le fond actuel (`bg-gradient-warm`) est quasi blanc — `hsl(20 70% 96%)` vers `hsl(0 0% 99%)`. Trop froid et clinique.

### Proposition : Fond "Parchemin Émeraude"
Un dégradé vertical très doux qui évoque la sérénité, en cohérence avec la charte premium :

- **Mode clair** : du vert d'eau très pâle (`hsl(158 30% 96%)`) vers le blanc parchemin (`#FDFBF7`)
- **Mode sombre** : du vert profond (`hsl(158 25% 8%)`) vers le fond sombre actuel (`#0C1410`)

### Changements

| Fichier | Modification |
|---|---|
| `src/index.css` | Ajouter `--gradient-muraja` en clair et en sombre |
| `src/index.css` | Ajouter classe `.bg-gradient-muraja` |
| `src/pages/MurjaPage.tsx` | Remplacer `<AppLayout>` par `<AppLayout>` + wrapper `div` avec `bg-gradient-muraja` appliqué sur le contenu, ou passer une prop className |

Puisque `AppLayout` applique `bg-gradient-warm` sur le `div` racine, la solution la plus propre est d'**ajouter une prop `className`** à `AppLayout` pour permettre de surcharger le fond, puis passer `bg-gradient-muraja` depuis `MurjaPage`.

| Fichier | Modification |
|---|---|
| `src/components/layout/AppLayout.tsx` | Ajouter prop optionnelle `bgClassName` (défaut: `bg-gradient-warm`), l'appliquer au div racine |
| `src/pages/MurjaPage.tsx` | Passer `bgClassName="bg-gradient-muraja"` |
| `src/index.css` | Ajouter les variables et la classe `bg-gradient-muraja` |

Le résultat : un fond vert d'eau très subtil, comme du papier ancien légèrement teinté — apaisant sans être distrayant.

