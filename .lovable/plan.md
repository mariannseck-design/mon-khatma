

## Créer une page test "Mon Suivi Hifz v2" avec vue par Juz

### Concept
Inspirée de l'image : une grille de cartes par Juz (1-30), chacune avec un cercle de progression, le % mémorisé, les sourates couvertes, la rétention, et la prochaine révision. Le Juz actif (avec données) est expansé, les autres sont compacts.

### Fichiers à créer/modifier

1. **`src/pages/HifzSuiviTestPage.tsx`** — Nouvelle page complète :
   - Récupère `hifz_memorized_verses` de l'utilisateur
   - Calcule pour chaque Juz (1-30) : versets mémorisés vs total, sourates concernées, % progression
   - Utilise `getExactVersePage` + `SURAHS` pour mapper versets → juz (pages 1-20 = Juz 1, etc.)
   - Affiche une grille responsive de cartes Juz avec :
     - Cercle SVG animé (progression %)
     - Nombre de versets mémorisés / total
     - Liste des sourates et intervalles de versets
     - Barre de mémorisation (%)
     - Niveau de rétention (basé sur `sm2_ease_factor` moyen)
     - Date prochaine révision (plus proche `next_review_date`)
     - Dernier bloc révisé (`last_reviewed_at`)
     - Bouton "Continuer la mémorisation" / "Commencer"
   - Style : thème sombre teal (comme l'image), cartes blanches/glassmorphism
   - Juz avec données = carte large expandable, Juz vides = carte compacte

2. **`src/App.tsx`** — Ajouter route `/hifz-suivi-test` pointant vers la nouvelle page

### Données par Juz
Chaque Juz = 20 pages du Mushaf. Juz 1 = pages 1-21, Juz 2 = pages 22-41, etc. On mappe chaque `hifz_memorized_verse` à son Juz via `getExactVersePage`, puis on agrège les stats.

### Design (inspiré de l'image)
- Header teal foncé avec titre centré
- Grille scrollable horizontalement sur mobile (ou 3 colonnes sur desktop)
- Carte active : fond blanc, cercle vert large, détails complets (sourates, rétention, révision)
- Cartes inactives : plus petites, juste le % et "Commencer"
- Toggle arabe/français pour les noms de sourates

