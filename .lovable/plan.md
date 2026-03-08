

## Plan : Corriger les KPI "Jours consécutifs" et "Versets ancrés"

### Problème 1 : Streak incrémenté à chaque clic

**Cause** : Ligne 298-302 de `HifzPage.tsx` — la condition `isConsecutive` vérifie si la différence entre aujourd'hui et `last_active_date` est ≤ 86400000ms (1 jour). Mais si `last_active_date` est **déjà aujourd'hui**, la condition est aussi vraie, donc le streak s'incrémente à chaque session complétée dans la même journée.

**Correction dans `src/pages/HifzPage.tsx`** (lignes 296-305) :
- Ajouter une vérification : si `lastDate === today`, ne rien faire (déjà compté aujourd'hui)
- Sinon, vérifier si c'est le jour suivant pour incrémenter ou réinitialiser à 1

```typescript
if (streak) {
  const lastDate = streak.last_active_date;
  if (lastDate !== today) {
    // Check if yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const isConsecutive = lastDate === yesterdayStr;
    await supabase.from('hifz_streaks').update({
      current_streak: isConsecutive ? streak.current_streak + 1 : 1,
      longest_streak: Math.max(streak.longest_streak, isConsecutive ? streak.current_streak + 1 : 1),
      last_active_date: today,
    }).eq('id', streak.id);
  }
  // Si lastDate === today, on ne fait rien
}
```

### Problème 2 : "5/50 versets ancrés" incorrect

**Cause** : Ligne 107 — `count: 'exact', head: true` compte le **nombre de lignes** (blocs) dans `hifz_memorized_verses`, pas le nombre réel de versets. Et le max de la jauge est `Math.max(totalVerses, 50)` — le 50 est arbitraire.

**Correction dans `src/pages/HifzSuiviPage.tsx`** :
- Remplacer le count par un `select('verse_start, verse_end')` puis sommer `(verse_end - verse_start + 1)` pour obtenir le vrai total de versets
- Utiliser un max de jauge plus significatif : 6236 (total des versets du Coran) pour montrer la progression globale, ou au minimum `Math.max(totalVerses, 100)`

```typescript
// Remplacer le count par :
const { data: versesData } = await supabase
  .from('hifz_memorized_verses')
  .select('verse_start, verse_end')
  .eq('user_id', user.id);

const realTotal = (versesData || []).reduce(
  (sum, v) => sum + (v.verse_end - v.verse_start + 1), 0
);
setTotalVerses(realTotal);
```

Et pour la jauge (ligne 417) :
```typescript
<CircularGauge value={totalVerses} max={6236} label="Versets ancrés" />
```

