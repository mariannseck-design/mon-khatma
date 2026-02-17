
# Plan : Sélecteur de date de début du Ramadan

## Contexte

Actuellement, la date de début du Ramadan est codée en dur (`new Date(2026, 1, 19)` = 19 février). Il faut permettre a l'utilisateur de choisir entre le 18 et le 19 fevrier 2026, et ajuster automatiquement tout le calendrier.

## Risque de bugs : AUCUN

- La date `RAMADAN_START` est utilisee a un seul endroit (`RamadanPage.tsx`)
- Tous les calculs (fin, jour courant, navigation) en decoulent automatiquement
- Les donnees en base sont indexees par date reelle, pas par numero de jour
- Aucune migration de donnees necessaire

## Changements

### Fichier modifie : `src/pages/RamadanPage.tsx`

1. **Remplacer la constante** `RAMADAN_START` par un state dynamique :
   - Lire le choix depuis `localStorage` (cle `ramadan-start-date`)
   - Valeur par defaut : 19 fevrier 2026

2. **Ajouter un selecteur** au-dessus de la navigation de date :
   - Deux boutons radio ou un composant `Select` : "Mercredi 18 fevrier" / "Jeudi 19 fevrier"
   - Legende en dessous : *"Choisissez la date de debut de votre mois beni selon l'observation lunaire de votre zone."*
   - Sauvegarder le choix dans `localStorage`

3. **Rendre dynamiques** `RAMADAN_END` et `getRamadanDay` pour utiliser le state au lieu de la constante

### Details techniques

- `RAMADAN_START` passe de constante globale a valeur calculee depuis le state `ramadanStartDate`
- `RAMADAN_END` et `getRamadanDay` recalcules via `useMemo` a chaque changement
- Le selecteur utilise les composants UI existants (`Select` ou boutons `Button` avec variante outline/default)
- Persistence via `localStorage` avec cle `ramadan-start-date`, valeurs `"18"` ou `"19"`
- Aucune modification des autres composants (RamadanTaskGroups, RamadanDhikrSection, etc.) car ils recoivent deja `dateStr` comme prop

### Design du selecteur

```text
+-------------------------------------------+
|  Debut du Ramadan                         |
|  [Mercredi 18 fev.]  [Jeudi 19 fev.]     |
|  (bouton actif en surbrillance)           |
|                                           |
|  Choisissez la date de debut de votre     |
|  mois beni selon l'observation lunaire    |
|  de votre zone.                           |
+-------------------------------------------+
```

Placement : juste au-dessus de la navigation de date existante, avec un style discret (Card ou simple section).
