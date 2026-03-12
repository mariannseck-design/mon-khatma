

# Ajouter un en-tête "ISTIQÂMAH" minimaliste et raffiné

## Ce qui sera ajouté

Un en-tête centré au-dessus de la carte "Méthode Tikrar-ISTIQÂMAH", composé de :
- Un trait horizontal fin doré (séparateur décoratif)
- Le mot **ISTIQÂMAH** en lettrage espacé, doré, élégant
- Un sous-titre serein en italique ("La constance mène à l'excellence")
- Le tout avec une animation d'entrée douce

## Fichier modifié

**`src/pages/HifzHubPage.tsx`** — Insérer un bloc `motion.div` entre la carte "Le Noble Coran" (ligne 192) et la carte "Méthode Tikrar" (ligne 195). Le bloc contient :
- Un trait `<div>` fin (1px) doré centré (largeur ~60px)
- Le texte "ISTIQÂMAH" en `tracking-[0.25em]`, couleur dorée, police Inter, taille modeste
- Un sous-titre en italique, couleur sage atténuée
- Style cohérent avec la palette existante (COLORS.goldAccent, COLORS.sage)

