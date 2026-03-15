

## Plan : Désactiver tous les boutons audio Play des pages de mémorisation

Même traitement que pour `HifzStepImpregnationTajweed` — on grise les boutons et on affiche "Temporairement indisponible", sans supprimer le code audio sous-jacent.

### Fichiers à modifier

1. **`src/components/hifz/HifzStep2Impregnation.tsx`** (lignes ~416-429)
   - Bouton Play principal : `disabled`, `opacity-50 cursor-not-allowed`, `onClick={undefined}`
   - Ajouter label "⏸ Temporairement indisponible" sous le bouton

2. **`src/components/hifz/HifzStepIntentionImpregnation.tsx`** (lignes ~400-413)
   - Même traitement que ci-dessus

3. **`src/components/hifz/istiqamah/StepImpregnation.tsx`** (lignes ~239-248)
   - Petit bouton audio Volume2 : `disabled`, `opacity-50 cursor-not-allowed`, `onClick={undefined}`
   - Ajouter label sous le bouton

4. **`src/components/hifz/istiqamah/StepImmersion.tsx`**
   - Boutons Play/Pause et Hint : désactiver de la même manière
   - Cela couvre aussi `HifzStepMemorisation.tsx` qui utilise `StepImmersion`

### Ce qui ne change PAS
- Tout le code audio (`togglePlay`, `playLoop`, `playNextAyah`, refs, etc.) reste intact
- Le `MiniRecorder` (enregistrement vocal) reste fonctionnel
- Le bouton "Suivant" reste accessible pour passer chaque étape manuellement

