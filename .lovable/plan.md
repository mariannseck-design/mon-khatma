

## Refonte de l'Étape 4 — Dictaphone de Validation (Version Finale)

### Objectif
Réécrire entièrement `HifzStep4Validation.tsx` avec la charte Émeraude & Or, une logique de peek-penalty, une waveform animée, et un bouton final solennel.

### Changements — 1 fichier modifié

**`src/components/hifz/HifzStep4Validation.tsx`** — Réécriture complète :

1. **Charte visuelle Émeraude & Or**
   - Fond Blanc Parchemin (`#FDFBF7`) pour la carte principale
   - Textes en Vert d'Encre (`#1C2421`)
   - Accents Or (`#D4AF37`) pour les badges et boutons
   - Émeraude (`#065F46`) pour la waveform et éléments actifs

2. **Badges 1-2-3 élégants**
   - Trois cercles avec animation `scale` Framer Motion quand ils s'illuminent en Or
   - Icône ✓ dorée pour les essais réussis, numéro grisé pour les restants
   - Badge actif avec bordure dorée pulsante

3. **Page Coran cachée avec Peek Penalty**
   - Utilise `HifzMushafImage` (avec zoom/pinch) au lieu de l'image brute
   - Bouton "👁️ Jeter un œil rapide" explicite (pas hold-to-reveal)
   - **Règle** : si peek utilisé → `attempt` reset à 0 + toast d'avertissement discret
   - Compteur de peeks affiché discrètement

4. **Dictaphone amélioré**
   - Bouton micro rond Émeraude avec pulse pendant l'enregistrement
   - **Waveform animée** : 5 barres verticales avec animation CSS sinusoïdale en `#065F46`
   - Timer `mm:ss` en police mono
   - Après arrêt : bouton "Réécouter" + deux boutons validation/erreur

5. **Logique de progression**
   - 3 succès consécutifs requis (reset à 0 si erreur OU peek)
   - Au 3ème succès : écran de célébration inline avec message « Votre mémorisation est scellée par la grâce d'Allah (عز وجل). »
   - Bouton "Valider mon Hifz ✨" n'apparaît qu'au 3ème badge allumé → appelle `onNext()`

6. **Popup d'encouragement** : adapté à la charte (fond `#FDFBF7`, texte `#1C2421`, bouton émeraude `#065F46`)

7. **Nettoyage** : suppression du fetch API alquran.cloud inutile, suppression des styles dark-mode hérités

