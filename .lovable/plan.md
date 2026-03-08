

## Plan: Ajouter une estimation de date d'arrivée du premier bloc en Muraja'a

### Approche

1. **`MurjaPage.tsx`** : Calculer la date estimée du premier bloc qui graduera de liaison → tour. On cherche le `rabtVerses` avec la `liaison_start_date` la plus ancienne, on ajoute 30 jours, et on passe cette date en prop au `MurajaChecklist` pour la section tour.

2. **`MurajaChecklist.tsx`** : 
   - Ajouter une prop optionnelle `firstArrivalDate?: string`
   - Dans l'état vide du tour, si cette date existe, afficher un message du type : *"Premier bloc estimé le [date formatée]"* sous le message explicatif existant, avec une icône `CalendarDays`.

### Calcul
```
earliestLiaisonDate = min(rabtVerses.map(v => v.liaison_start_date))
estimatedArrival = earliestLiaisonDate + 30 jours
```

Si aucun bloc en liaison n'existe non plus, on n'affiche pas d'estimation.

