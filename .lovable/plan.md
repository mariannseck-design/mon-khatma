

## Plan : Ajouter une phase « Écoute + Répétition » dans StepFusion

### Problème
Actuellement les phases de liaison (fusion) sont : Écoute → Lecture → Récitation. Il manque une étape intermédiaire où l'utilisateur écoute ET répète en regardant le Mushaf, avant de passer à la récitation de mémoire.

### Solution
Ajouter une 4e phase `repeat` entre `listen` et `read`, avec audio + Mushaf affichés simultanément.

### Fichier : `src/components/hifz/istiqamah/StepFusion.tsx`

1. **Modifier le type** : `FusionPhase = 'listen' | 'repeat' | 'read' | 'recite'`

2. **Ajouter le label** :
   - `repeat` : « Écoutez et répétez en suivant sur le Mushaf »

3. **Afficher le Mushaf + audio** pour la phase `repeat` :
   - `showMushaf` inclut `repeat`
   - Le bouton audio est visible pour `listen` ET `repeat`

4. **Mettre à jour les onglets** : 4 phases au lieu de 3 (Écoute → Répétition → Lecture → Récitation)

5. **Mettre à jour `advancePhase`** : `listen → repeat → read → recite → onNext`

Aucun autre fichier ne change.

