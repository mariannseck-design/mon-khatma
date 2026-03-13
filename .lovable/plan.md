

## Réorganiser le flux Hifz : fusionner les écrans 0, 1, 2 en un seul écran "Intention & Imprégnation"

### Résumé

Supprimer les étapes 0 (Intention), 1 (Réveil de la veille) et 2 (Imprégnation) séparées, et les remplacer par un **unique écran** qui regroupe :
- Le message d'intention en haut
- Le texte arabe (Mushaf image/texte/physique) avec le lecteur audio
- La traduction Hamidullah en dessous
- Un bouton "J'ai lu, écouté et compris" pour passer à l'étape suivante

### Nouvelle structure du tunnel

| Step | Écran | Composant |
|------|-------|-----------|
| -1 | Configuration | `HifzConfig` (inchangé) |
| 0 | Intention + Imprégnation + Sens | **Nouveau** `HifzStepIntentionImpregnation` |
| 1 | Istiqâmah | `IstiqamahEngine` |
| 2 | Breathing pause → Validation | `HifzStep4Validation` |
| 3 | Tikrar | `HifzStep5Tikrar` |
| 4 | Succès | `HifzSuccess` |

### Changements

**1. Créer `src/components/hifz/HifzStepIntentionImpregnation.tsx`**
- Fusionner le contenu de `HifzStep0Intention` et `HifzStep2Impregnation` dans un seul composant
- En haut : message d'intention ("Purifie ton intention pour Allah (عز وجل)")
- Ensuite : toggle Mushaf (image/texte/physique) + texte arabe avec Tajweed
- Ensuite : lecteur audio (bouton play/pause, sélecteur de récitateur, compteur d'écoutes)
- Ensuite : traduction Hamidullah (dépliable)
- Bouton final : "J'ai lu, écouté et compris — Bismillah" pour avancer

**2. Modifier `src/pages/HifzPage.tsx`**
- Supprimer les imports de `HifzStep0Intention`, `HifzStep1Revision`, `HifzStep2Impregnation`
- Importer le nouveau `HifzStepIntentionImpregnation`
- Renuméroter les étapes :
  - step 0 → `HifzStepIntentionImpregnation` (onNext → step 1)
  - step 1 → `IstiqamahEngine` (onNext → breathing pause → step 2)
  - step 2 → `HifzStep4Validation` (onNext → step 3)
  - step 3 → `HifzStep5Tikrar` (onNext → completeSession)
  - step 4 → `HifzSuccess`
- Mettre à jour `STEP_NAMES`, `startSession` (current_step: 0), `handleStep3Complete`, breathing pause logic, et les conditions de rendu
- Mettre à jour le `completeSession` pour écrire current_step: 3 (au lieu de 5)

**3. Nettoyage**
- Ne pas supprimer les anciens fichiers pour l'instant (ils ne seront plus importés), on pourra les supprimer ensuite

### Section technique

- Le nouveau composant réutilise la logique audio de `HifzStep2Impregnation` (fetchAudio, playNextAyah, togglePlay)
- Le texte arabe avec Tajweed est repris tel quel (stripLeadingBasmala, renderTajweedText, getVersesByRange)
- La traduction reste dépliable comme dans l'ancien Step2
- Le compteur d'écoutes (3 pastilles) est conservé comme indicateur visuel mais n'est plus bloquant

