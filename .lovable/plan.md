

## Améliorations du défi Al-Baqara

### 1. Arrondir les rythmes affichés
Actuellement `(48/30).toFixed(1) = 1.6`, `(48/14).toFixed(1) = 3.4`, `(48/7).toFixed(1) = 6.9`.

Utiliser une fonction d'arrondi au demi : `Math.round(val * 2) / 2` pour obtenir :
- 1 mois → ~1.5 pages/jour
- 2 semaines → ~3.5 pages/jour  
- 1 semaine → ~7 pages/jour

### 2. Célébration élaborée avant reset
Quand `progress >= 100`, au lieu du simple texte actuel :
- Afficher une animation plein écran (dans le conteneur) avec le `SparkleEffect` existant (étoiles dorées)
- Message de félicitations plus riche : trophée animé + texte islamique + durée du défi
- Augmenter le délai de reset de 4s → 6s pour laisser le temps d'apprécier

### Fichier modifié

**`src/components/defis/DefiAlBaqara.tsx`** :
1. Créer une fonction `formatPace(pages, days)` qui arrondit au demi (`Math.round(val * 2) / 2`)
2. Remplacer `.toFixed(1)` par cette fonction partout (presets + custom)
3. Importer `SparkleEffect` depuis `@/components/planificateur/SparkleEffect`
4. Remplacer le `<motion.p>` de célébration par un bloc plus élaboré : icône trophée animée (scale spring), message "Allahumma barik", sous-texte d'encouragement, et `SparkleEffect` superposé
5. Passer le délai auto-reset à 6 secondes

