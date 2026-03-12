

# Ar-Rabt doit commencer à J+1

## Problème

Quand le Tikrar est terminé, le verset est inséré avec `memorized_at = aujourd'hui` et `liaison_start_date = aujourd'hui`. Le filtre Ar-Rabt dans `useMurajaData` montre tous les versets mémorisés dans les 30 derniers jours, donc le verset apparaît immédiatement le jour même au lieu du lendemain.

## Solution

Modifier le filtre `rabtVerses` dans `useMurajaData.ts` pour exclure les versets dont `liaison_start_date` est aujourd'hui (c'est-à-dire ne montrer que ceux dont la date de début est strictement antérieure à aujourd'hui).

**Fichier** : `src/hooks/useMurajaData.ts`

Changer le filtre rabtVerses :
```ts
// Avant
.filter(v => v.memorized_at >= thirtyDaysCutoff)

// Après  
.filter(v => v.memorized_at >= thirtyDaysCutoff && (v.liaison_start_date || v.memorized_at.split('T')[0]) < getTodayKey())
```

Cela garantit que les versets mémorisés aujourd'hui n'apparaissent dans Ar-Rabt qu'à partir de demain, sans toucher aux dates enregistrées en base.

