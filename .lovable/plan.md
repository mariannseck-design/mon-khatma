

# Retirer le sélecteur "Niveau d'ancrage" de HifzConfig

## Changement unique

**Fichier : `src/components/hifz/HifzConfig.tsx`**
- Supprimer la constante `REPETITION_LEVELS` et tout le bloc UI associé (grille de 6 boutons + description animée)
- Supprimer le state `repetitionLevel`
- Passer `repetitionLevel: 40` en dur dans les appels à `onStart()`
- La colonne `repetition_level` en base de données reste intacte (valeur par défaut)

Aucun autre fichier à modifier — HifzPage, IstiqamahEngine, etc. continuent de recevoir la valeur sans changement.

