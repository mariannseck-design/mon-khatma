

# Suppression de la répétition dans le Planificateur

## Le problème

La carte verte (TotalProgressBar) affiche actuellement :
- "Pages par jour : 20" et "Objectif de jours : 29"
- "Vous finirez en 29 jours"
- La citation motivationnelle

Or ces memes infos sont deja dans les 2 cartes en dessous (que tu veux garder) :
- "Objectif : 20 pages/jour -- Qu'Allah t'accorde la constance, Marianne !"
- "A ce rythme, tu finiras en 30 jours..."

## La solution

Simplifier la carte verte en retirant les elements redondants :

1. **Retirer le bloc "Pages par jour / Objectif de jours"** (les 2 cases blanches avec 20 et 29)
2. **Retirer le message "Vous finirez en 29 jours"**
3. **Retirer la citation** (deja implicite dans le ton des cartes en dessous)

La carte verte gardera uniquement :
- L'icone et le pourcentage de progression (7.1%)
- "Sourate Al-Baqara Page 43"
- "Continue ta Khatma avec l'aide d'Allah"
- La barre de progression en bas

Resultat : une carte verte epuree qui montre la progression, et les 2 cartes en dessous qui donnent les details de l'objectif sans repetition.

## Fichier modifie

`src/components/planificateur/TotalProgressBar.tsx` -- suppression des lignes 92-120 (le bloc calculateur integre et la citation).

