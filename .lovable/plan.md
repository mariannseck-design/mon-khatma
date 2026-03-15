

## Plan : Corriger les textes de la phase Liaison

### Changements dans `src/components/hifz/istiqamah/StepImmersion.tsx`

1. **Ligne 521-526** — Label doré sous les pastilles : remplacer "Mémorise" par "Écoute" quand c'est une liaison
   - `Mémorise les versets X à Y` → `Écoute les versets X à Y`
   - Garder `Mémorise le verset X` pour les phases non-liaison

2. **Ligne 534-535** — Supprimer le subtitle de la phase liaison (la phrase "Écoutez les versets 62–64 enchaînés" sous le titre "Liaison — Écoute + Mushaf + Répétition")
   - Passer `subtitle` à `undefined` quand `isLiaison` est true

