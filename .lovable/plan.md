

## Mise à jour de l'en-tête "Le Tour" → "Muraja'a (Consolidation)"

### Fichier : `src/pages/MurjaPage.tsx`

**Titre de section (ligne ~375-380)** : Remplacer `Le Tour — Révision intelligente` par un titre en deux parties :
- "Muraja'a" en gras/plus grand
- "(Consolidation)" en taille normale

**Sous-titre (ligne ~386-388)** : Remplacer `Anciens acquis — auto-évaluation` par `Entretien de tes anciens acquis pour un ancrage éternel inshaa Allah.`

**Icône Lamp / Tooltip** : Remplacer le `MurajaMethodModal` par un Tooltip Radix (déjà disponible) sur l'icône Lamp avec le texte demandé : *« La Muraja'a est la clé de la préservation. Ce programme intelligent organise ta consolidation pour que chaque verset reste vivant dans ton cœur par la grâce d'Allah (عز وجل). »*

On garde aussi le `MurajaMethodModal` accessible mais on ajoute le tooltip au survol/tap sur l'icône Lamp.

### Approche pour le tooltip mobile-friendly
Utiliser `TooltipProvider` + `Tooltip` de Radix avec `delayDuration={0}` pour que le tap fonctionne sur mobile. L'icône Lamp ouvrira le tooltip au tap, et un second tap ou tap ailleurs le fermera. Le `MurajaMethodModal` restera accessible via un lien dans le tooltip ou sera conservé séparément.

**Alternative plus simple** : Transformer l'icône Lamp en tooltip uniquement (pas de modal) pour cette section, puisque le modal SM2 est déjà accessible depuis la section Tour. On wrap l'icône Lamp dans un `Tooltip` Radix affichant le texte demandé.

### Résumé des changements

| Fichier | Modification |
|---|---|
| `src/pages/MurjaPage.tsx` | Titre "Muraja'a (Consolidation)", sous-titre mis à jour, ajout Tooltip sur icône Lamp |

Un seul fichier, modifications cosmétiques et textuelles.

