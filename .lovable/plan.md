

## Plan : Simplifier le résumé "Mes ayats mémorisées"

### Changements dans `src/pages/MurjaPage.tsx`

**1. Labels simplifiés (lignes 557-564)**
Remplacer toute la logique de dates dynamiques par un simple label de phase :
- Liaison → "Phase de liaison"
- Tour → "Phase de révision : [date prochaine]" uniquement si dans le futur, sinon "Phase de révision"

**2. Couleurs de fond différenciées (ligne 570)**
- Phase de liaison : fond doré léger `rgba(212, 175, 55, 0.08)` avec bordure `rgba(212, 175, 55, 0.2)`
- Phase de révision : fond émeraude léger `rgba(16, 185, 129, 0.08)` avec bordure `rgba(16, 185, 129, 0.2)`

**3. Tri par phase (ligne 149)**
Trier d'abord par phase (liaison en premier), puis par numéro de sourate, au lieu de trier par date de prochaine révision.

### Fichier modifié
- `src/pages/MurjaPage.tsx`

