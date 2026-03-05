

# Page de celebration de fin de Khatma avec Doua en 4 etapes

## Objectif

Quand l'utilisatrice atteint 604 pages, au lieu du simple message "Khatma terminee", afficher une page speciale de celebration avec la Doua complete en 4 etapes (stepper), fond parchemin, et un bouton dore final pour recommencer.

## Fichiers a creer

### 1. `src/components/planificateur/KhatmaCelebration.tsx`

Composant principal avec un stepper en 4 etapes :

- **State** : `currentStep` (0-3), transitions animees avec `framer-motion`
- **Design** : Fond parchemin (bg gradient chaud beige/or), texte bien espace, police elegante
- **Navigation** : Boutons "Suivant" / "Precedent" entre les etapes, indicateur de progression (4 cercles)

**Etape 1 — "Benediction des lettres"** : La partie de la Doua sur les 28 lettres arabes (Alif a Ya), chaque lettre et sa benediction

**Etape 2 — "Demande de pardon"** : La partie sur l'indulgence pour les erreurs de prononciation, lecture, hesitations, etc.

**Etape 3 — "Lumiere et Protection"** : La partie sur la lumiere du coeur, la protection contre l'enfer, l'entree au Paradis

**Etape 4 — "Conclusion et Salutations"** : La conclusion avec les salutations sur le Prophete (saw) + bouton dore final "Qu'Allah exauce nos prieres - Recommencer une Khatma"

- **Props** : `onResetKhatma: () => void` (appele au clic du bouton final)

### 2. Modifications dans `src/pages/PlanificateurPage.tsx`

- Importer `KhatmaCelebration`
- Ajouter un state `showKhatmaCelebration` (boolean)
- Dans `logReading()` : apres l'upsert, si `totalPagesRead + pages >= 604`, activer `showKhatmaCelebration`
- Quand `showKhatmaCelebration` est true, afficher `KhatmaCelebration` a la place du contenu normal
- Le bouton final de `KhatmaCelebration` appelle `resetKhatma()` puis ferme la celebration

### 3. Modifications dans `src/components/planificateur/ReadingSlider.tsx`

- Supprimer le bloc `isKhatmaComplete` qui retourne un simple message "Khatma terminee" — la celebration prend le relais

### 4. Modifications dans `src/components/planificateur/TotalProgressBar.tsx`

- Quand `isComplete`, le bouton "Commencer une nouvelle Khatma" declenchera la celebration au lieu du reset direct

## Details du design

- **Fond** : Gradient chaud `from-amber-50 via-orange-50/30 to-yellow-50` avec texture subtile
- **Typographie** : `font-display` pour les titres, texte arabe en taille plus grande avec espacement genereux
- **Stepper** : 4 cercles en haut, le cercle actif est dore, les passes sont verts, les futurs sont gris
- **Bouton final** : `bg-gradient-to-r from-amber-500 to-yellow-500 text-white` avec effet brillant
- **Transitions** : `AnimatePresence` de framer-motion pour des transitions douces entre etapes

