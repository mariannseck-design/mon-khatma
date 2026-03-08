

## Ajout de confetti dans MurajaCelebration

Ajouter une animation de confetti (particules colorées qui tombent) dans le composant `MurajaCelebration` quand il s'ouvre, en utilisant Framer Motion (déjà installé).

### Changements dans `src/components/muraja/MurajaCelebration.tsx`

1. **Générer ~30 particules confetti** au montage du modal : positions X aléatoires, couleurs variées (or, émeraude, vert clair, blanc), tailles et délais aléatoires.

2. **Animer chaque particule** avec `motion.div` :
   - Départ en haut (`y: -20`), chute vers le bas (`y: window height`)
   - Rotation aléatoire
   - Léger mouvement horizontal sinusoïdal (`x` oscillant)
   - Fondu en sortie
   - Durée ~2-3s avec délais échelonnés

3. **Placer les confetti** dans le overlay (au-dessus du fond sombre, en `pointer-events-none`), visibles dès l'ouverture du modal pour les deux types (daily et cycle).

Un seul fichier modifié, purement visuel.

