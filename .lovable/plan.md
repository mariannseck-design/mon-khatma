

## Ajout consigne de rigueur + renforcement logique (Étape 4)

### Fichier modifié : `src/components/hifz/HifzStep4Validation.tsx`

**4 changements :**

1. **Message d'exigence spirituel** (après l'instruction existante, ligne ~222-225)
   - Encadré discret avec bordure dorée fine, fond semi-transparent
   - Texte en italique : « Si vous éprouvez le moindre doute lors de la récitation... »
   - Style : `#1C2421` texte, bordure `rgba(212,175,55,0.2)`

2. **Renforcement du Peek** (ligne ~152-158, `handlePeek`)
   - Toast toujours affiché (pas seulement si `successes > 0`), avec message plus explicite : « Compteur remis à zéro — Les 3 essais doivent être réussis de mémoire pure, sans aucune aide. »
   - Reset `successes` à 0 dans tous les cas (déjà fait si > 0, rendre systématique)
   - Texte sous le bouton peek plus visible : « ⚠️ Remet vos 3 essais à zéro » au lieu de « Réinitialise le compteur »

3. **Message de soutien à l'erreur** (ligne ~140-147, encouragement popup)
   - Ajouter dans le texte du popup d'encouragement une mention explicite : « Regardez le texte si besoin et reprenez la série pour bien ancrer. »
   - Mettre à jour les `ENCOURAGEMENTS` pour inclure ce conseil dans chaque variante

4. **Aucun changement de logique structurelle** — la mécanique reset est déjà correcte, on renforce juste les messages

