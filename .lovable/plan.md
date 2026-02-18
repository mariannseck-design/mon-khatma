
# Correction : le "1" qui apparait quand on supprime le "5"

## Probleme

Le `onChange` du champ contient `parseInt(e.target.value) || 1`. Quand on efface le "5", le champ est vide, donc `parseInt("")` donne `NaN`, et `|| 1` remet immediatement un "1". Ce "1" est impossible a supprimer pour la meme raison.

## Solution

Autoriser le champ a etre temporairement vide pendant la saisie, et ne forcer la valeur minimale de 1 qu'a la soumission ou au blur (quand on quitte le champ).

## Fichiers concernes

### `src/components/ramadan/RamadanReadingSetup.tsx`

- Changer le state `dailyPages` pour accepter `number | string` (ou gerer via une string intermediaire)
- Modifier le `onChange` pour permettre un champ vide :
  ```
  onChange={(e) => setDailyPages(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
  ```
- Ajouter un `onBlur` qui remet la valeur a 1 si le champ est vide quand l'utilisateur quitte :
  ```
  onBlur={(e) => { if (!e.target.value || parseInt(e.target.value) < 1) setDailyPages(1); }}
  ```
- Garder le `onFocus={(e) => e.target.select()}` deja en place

### `src/pages/PlanificateurPage.tsx`

- Meme correction sur l'input `setupPages` dans le setup initial (meme probleme avec `parseInt(e.target.value) || 1`)
- Permettre un champ vide pendant la saisie
- Remettre la valeur par defaut au `onBlur`

## Resultat attendu

- L'utilisateur peut supprimer le "5" sans qu'un "1" apparaisse
- Le champ reste vide tant que l'utilisateur tape
- Si l'utilisateur quitte le champ sans rien ecrire, la valeur revient a 1 automatiquement
- Le bouton de soumission reste desactive si le champ est vide (securite existante)
