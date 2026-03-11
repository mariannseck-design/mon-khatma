

## Plan : Remplacer le heatmap par un résumé d'activité plus lisible

Le heatmap GitHub-style est peu parlant pour le contexte de mémorisation du Coran. Je propose de le remplacer par une **carte de statistiques récentes** compacte et immédiatement compréhensible.

### Remplacement proposé

Supprimer `HifzActivityHeatmap` et le remplacer par une carte "Activité récente" avec :

1. **3 mini-stats en ligne** (style pilules) :
   - 🔥 Série actuelle (jours consécutifs d'activité)
   - 📖 Sessions cette semaine
   - ✅ Versets ajoutés ce mois

2. **Barre de régularité hebdomadaire** : 7 cercles (L-D), remplis en émeraude si actif ce jour-là, vide sinon — simple et immédiatement lisible.

### Fichiers modifiés

- **`src/components/hifz/HifzActivityHeatmap.tsx`** → Renommé/réécrit en `HifzActivitySummary.tsx` avec le nouveau design
- **`src/pages/HifzSuiviPage.tsx`** → Mise à jour de l'import

### Design visuel

```text
┌─────────────────────────────────────────┐
│  🔥 5 jours   📖 9 sessions   ✅ 12 v. │
│                                         │
│  L  M  M  J  V  S  D                   │
│  ●  ●  ○  ●  ●  ●  ○    ← cette sem.  │
└─────────────────────────────────────────┘
```

Les données proviennent des mêmes tables (`hifz_sessions`, `muraja_sessions`, `hifz_memorized_verses`). Le calcul de la série (streak) se fait côté client en itérant les jours passés.

