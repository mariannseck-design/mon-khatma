

## Chiffres français pour les numéros de versets

Changement simple sur une seule ligne dans `QuranTextView.tsx` (ligne 229) :

Remplacer `ayah.numberInSurah.toLocaleString('ar-EG')` par `ayah.numberInSurah` pour afficher les chiffres en format occidental (1, 2, 3...) au lieu de (١، ٢، ٣...).

Les ornements coraniques ﴿ ﴾ sont conservés autour du numéro.

