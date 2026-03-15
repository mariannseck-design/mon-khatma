
Objectif validé : oui, on peut ouvrir le Mushaf directement dans la page d’Imprégnation (sans iframe / sans nouvel onglet), pour éviter toute coupure audio sur Android Chrome.

Plan de mise en œuvre

1) Supprimer le chemin qui coupe l’audio dans cette étape
- Fichier : `src/components/hifz/HifzStepImpregnationTajweed.tsx`
- Retirer l’usage du Mushaf “extérieur” (bouton du wrapper) pour cette étape.
- Garder uniquement le Mushaf intégré déjà présent dans l’étape (`HifzMushafToggle` + `HifzMushafImage`/texte/physique).

2) Ouvrir le Mushaf “dans la page” de façon explicite
- Ajouter un mode “Mushaf agrandi” dans `HifzStepImpregnationTajweed.tsx` :
  - bouton “Ouvrir le Mushaf ici”
  - bascule automatique en mode `image`
  - affichage du Mushaf en grand bloc inline (ex: `maxHeight` ~ `65-75vh`) dans la même vue
  - bouton “Réduire” pour revenir à la taille normale
- Aucun `window.open`, aucun changement de route, aucun iframe.

3) Adapter le wrapper pour cette étape
- Fichier : `src/components/hifz/HifzStepWrapper.tsx`
- Ajouter une prop de contrôle (ex. `disableMushafQuickOpen` ou `mushafQuickAction="none"`).
- Dans l’étape Imprégnation Tajweed, désactiver le FAB/badge Mushaf du wrapper pour empêcher le clic qui mène au panneau iframe.
- Les autres étapes conservent leur comportement actuel (pas de régression globale).

4) Vérification ciblée (Android Chrome)
- Démarrer audio en Imprégnation.
- Cliquer “Ouvrir le Mushaf ici”.
- Vérifier :
  - audio continue sans coupure,
  - Play/Pause/Stop rouge restent fonctionnels,
  - fermeture/réouverture du Mushaf inline ne casse pas l’état de lecture.

Détails techniques
- Pourquoi ça corrige : la coupure survient sur le chemin d’ouverture externe/iframe ; en restant dans le même composant React, on évite le changement de contexte qui déclenche des pauses non désirées.
- Compatibilité : conforme au projet (ES2015 / mobile ancien), pas d’import dynamique, pas de dépendance nouvelle.
- Fichiers touchés :
  - `src/components/hifz/HifzStepImpregnationTajweed.tsx`
  - `src/components/hifz/HifzStepWrapper.tsx`
- Risque principal : impact UX si le bouton Mushaf du wrapper est attendu ailleurs ; limité en le désactivant uniquement pour cette étape.
