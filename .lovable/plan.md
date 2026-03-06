# Modifications de la celebration Khatma

## Changements a effectuer

### 1. `src/components/planificateur/KhatmaCelebration.tsx`

**Supprimer l'etape 1** ("Benediction des lettres" — le texte Alif a Ya). Passer de 4 etapes a 3.

**Supprimer les titres** des etapes : retirer le `h2` avec `step.title` et le texte "Etape X sur Y". Garder uniquement l'icone et le contenu textuel dans la carte.

**Ajouter a la derniere etape** : apres le texte actuel des salutations, ajouter un paragraphe "Fais tes duas 🤲" suivi de "Qu'Allah accepte".

### 2. `src/pages/PlanificateurPage.tsx`

**Corriger le timing** : actuellement quand l'utilisatrice atteint 604 pages, le success modal (objectif quotidien atteint) s'affiche pendant 800ms puis est immediatement ecrase par `setShowKhatmaCelebration(true)`. Solution : tu peux afficher le success modal quand la Khatma est complete  ensuite  a la celebration, mais avec un delai de ~2-3 secondes et un toast visible avant la transition pour que l'utilisatrice ait le temps de lire le message de felicitations. "Mets à jour l’annonce de 48 heures dans le tableau de bord de groupe de **Ma Khatma** :

- **Titre :** « Félicitations à notre sœur qui vient de boucler sa Khatma ! 🎊 »
- **Verset :** « En vérité, c’est Nous qui avons fait descendre le Rappel (Al-Zikr), et c’est Nous qui en sommes les gardiens. » (Sourate Al-Hijr, verset 9)
- **Message de clôture :** « Continuez vos efforts, car le Coran est le meilleur des Zikr. **Chaque lettre lue vous rapproche de la Paix intérieure et de la satisfaction d’Allah.** »
- **Conception :** Utilise un encadré avec une bordure fine dorée et un fond très clair pour que le texte soit apaisant à lire."