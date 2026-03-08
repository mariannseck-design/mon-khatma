

## Plan : Icônes & badges colorés pour Mon Suivi Hifz

### Changements dans `src/pages/HifzSuiviPage.tsx`

Ajouter des fonds colorés aux icônes et badges pour un rendu plus vivant :

1. **Icône "Programme du jour"** (BookOpen, ligne ~310) : fond émeraude translucide + icône blanche
   - `background: 'linear-gradient(135deg, #065F46, #10B981)'` au lieu de `var(--p-card)`
   - Icône en blanc

2. **Icône "Révision du jour"** (RefreshCw, ligne ~352) : fond doré translucide + icône blanche
   - `background: 'linear-gradient(135deg, #B8960C, #D4AF37)'`
   - Icône en blanc

3. **Icône "Objectif"** (Target, ligne ~231) : fond accent arrondi
   - Envelopper dans un petit cercle avec fond `var(--p-card-active)` et bordure accent

4. **KPI Cards** (lignes ~394-421) : Ajouter des cercles colorés derrière les icônes Flame, RotateCcw
   - Flame : petit cercle fond orange/ambre translucide
   - RotateCcw : petit cercle fond émeraude translucide

5. **Icône chart** (ligne ~430) : Petit badge coloré devant le titre "Activité des 7 derniers jours"

6. **Mode sombre** : utiliser des variantes translucides (rgba) pour que les fonds d'icônes s'adaptent

### Sections concernées
- Carte Objectif du jour
- Carte Programme du jour  
- Carte Révision du jour
- 3 KPI cards (streak, versets, cycles)
- Carte graphique hebdomadaire

