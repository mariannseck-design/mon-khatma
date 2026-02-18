
# Corrections des champs numeriques

## 1. Compteur Dhikr : revenir a l'ancien comportement

Le compteur de dhikr fonctionnait bien avant avec la logique qui vidait le champ quand la valeur etait "0" au focus. Il faut restaurer ce comportement :

**Fichier : `src/components/ramadan/RamadanDhikrSection.tsx`**
- Remettre `onFocus={(e) => { if (e.target.value === '0') e.target.value = ''; }}` sur les deux inputs (predefined et custom dhikr counters)
- Supprimer le `e.target.select()` qui a ete ajoute

## 2. Champ "Nombre de pages par jour" du setup : appliquer le meme concept

L'input du setup initial (sur `src/pages/PlanificateurPage.tsx`, ligne 390-398) affiche "1" par defaut et c'est difficile a remplacer. On applique le meme concept que l'ancien dhikr : vider le champ au focus pour que l'utilisateur puisse taper directement.

**Fichier : `src/pages/PlanificateurPage.tsx`**
- Ajouter `onFocus={(e) => e.target.select()}` sur l'input `setupPages` (ligne 390)
- Cela selectionnera le "1" automatiquement et il sera remplace des la premiere frappe

## Resultat

- Dhikr : retour au comportement d'avant (vide le "0" au focus)
- Setup planificateur : le "1" est selectionne au focus, on peut taper directement "20" sans devoir supprimer
