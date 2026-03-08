

## Plan : Corriger le comptage des versets Muraja'a dans le diagramme

### Problème
Le diagramme sous-compte les versets de Muraja'a. Les sessions sont insérées avec les clés `{ surah, start, end }` mais le parsing cherche `verse_end / end_verse` et `verse_start / start_verse`. Résultat : chaque session Muraja'a compte pour 1 verset au lieu du vrai nombre, ce qui rend le diagramme imprécis et donne l'impression de peu d'activité.

### Correction : `src/pages/HifzSuiviPage.tsx` (ligne 158)

Ajouter les clés `end` et `start` dans le fallback du reduce :

```
// Avant
r.verse_end || r.end_verse || 0
r.verse_start || r.start_verse || 0

// Après  
r.verse_end || r.end_verse || r.end || 0
r.verse_start || r.start_verse || r.start || 0
```

### Fichier modifié
- `src/pages/HifzSuiviPage.tsx` — ligne 158

