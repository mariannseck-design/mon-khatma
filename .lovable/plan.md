

## Ajouter la barre calendrier flottante sur Mon Suivi Hifz

Le composant `WeeklyCalendarBar` existe déjà avec le variant `floating`. On l'intègre en bas de la page existante.

### Modifications

**`src/pages/HifzSuiviPage.tsx`** :
1. Importer `WeeklyCalendarBar` et ajouter un state `selectedDate`
2. Placer `<WeeklyCalendarBar variant="floating" />` juste avant la fermeture de `</AppLayout>`
3. La barre sera fixée en `bottom-20`, juste au-dessus de la navigation, comme sur l'image de référence

Un seul fichier modifié, ajout minimal.

