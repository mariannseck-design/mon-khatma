

## Plan : Ajouter le lien Mushaf sur toutes les étapes de mémorisation

### Problème
Le bouton "📖 Mushaf" dans `HifzStepWrapper` s'affiche uniquement quand les props `surahNumber`, `startVerse`, `endVerse` sont transmises. Quatre composants ont ces props mais ne les passent pas au wrapper.

### Fichiers à modifier

| Fichier | Changement |
|---------|-----------|
| `HifzStep0Intention.tsx` (ligne 55) | Ajouter `surahNumber={surahNumber} startVerse={startVerse} endVerse={endVerse}` |
| `HifzStep2Impregnation.tsx` (ligne 316) | Idem |
| `HifzStepIntentionImpregnation.tsx` (ligne 335) | Idem |
| `HifzStep4Validation.tsx` | Trouver l'appel à `HifzStepWrapper` et ajouter les mêmes props |

### Non modifié
- `HifzStep1Revision.tsx` : cette étape montre les versets de la veille (dynamiques, pas les versets en cours), donc pas de Mushaf fixe pertinent.
- Tous les composants qui passent déjà les props correctement.

### Résultat
Le badge doré "📖 Sourate · v.X–Y · p.Z" et le bouton vert "Mushaf" apparaîtront sur **toutes** les étapes de mémorisation (sauf Révision de la veille).

