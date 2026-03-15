

## Refonte de la carte "Ma Khatma" — fond blanc, texte vert et accents dorés

La carte utilise actuellement un fond en dégradé émeraude foncé avec du texte blanc. L'utilisatrice souhaite un style plus clair : fond blanc, texte en vert émeraude, accents dorés — cohérent avec le reste du tableau de bord.

### Changements dans `TotalProgressBar.tsx`

| Élément | Avant | Après |
|---|---|---|
| Fond carte | Dégradé émeraude foncé | `white` |
| Ombre | `rgba(6,95,70,0.12)` | `0 2px 16px rgba(6,95,70,0.08)` subtile |
| Titre "Ma Khatma" | Blanc (`--p-on-dark`) | Émeraude (`var(--p-primary-deep)`) |
| Date "Depuis le..." | Blanc muted | Émeraude clair (`var(--p-primary)` opacité 0.7) |
| Icône livre | Or sur fond or translucide | Inchangé (or sur fond or pâle) |
| Badge pourcentage | Or sur fond or translucide | Or sur fond `rgba(212,175,55,0.1)` |
| Bloc sourate | Fond blanc translucide 10% | Fond émeraude très pâle `rgba(6,95,70,0.06)` |
| Texte sourate | Blanc | Émeraude foncé (`var(--p-primary-deep)`) |
| Texte page X/604 | Blanc muted | Émeraude clair |
| Citation en bas | Blanc muted | Émeraude clair italique |
| Barre de progression fond | Blanc translucide 12% | `rgba(6,95,70,0.08)` |
| Barre de progression remplie | Or (`--p-accent`) | Inchangé |

Le graphique `WeeklyMiniChart` n'est **pas touché** — ses couleurs restent telles quelles.

### Fichier modifié
- `src/components/planificateur/TotalProgressBar.tsx`

