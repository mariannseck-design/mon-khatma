

## Plan : Renommer la phase "Écoute" en "Écoute + Lecture Mushaf" et afficher le Mushaf

### Fichier : `src/components/hifz/istiqamah/StepFusion.tsx`

Deux changements :

1. **Renommer l'onglet** : ligne 165, changer `'Écoute'` en `'Écoute + Mushaf'` (court pour tenir dans l'onglet).

2. **Afficher le Mushaf dès la phase listen** : ligne 110, ajouter `phase === 'listen'` dans la condition `showMushaf` :
   ```
   const showMushaf = phase === 'listen' || phase === 'repeat' || phase === 'read' || (phase === 'recite' && peekMode);
   ```

3. **Mettre à jour la description** (ligne 104) : changer en `"Écoutez l'enchaînement des versets en suivant sur le Mushaf (5 fois)"`.

Aucun autre fichier ne change.

