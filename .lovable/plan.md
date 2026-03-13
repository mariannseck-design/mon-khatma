

## Modifications textuelles sur 2 écrans Hifz

### 1. `src/components/hifz/HifzStepIntentionImpregnation.tsx`

**Texte sous le cœur (ligne ~216)** :
- Ancien : `Purifie ton intention pour Allah (عز وجل). Lis, écoute et comprends le sens des versets avant de mémoriser.`
- Nouveau : `Purifie ton intention pour Allah (عز وجل) et imprègne-toi de ces versets.`

**Bouton principal (ligne ~282)** :
- Ancien : `J'ai lu, écouté et compris — Bismillah`
- Nouveau : `Je suis prêt(e) — Bismillah`

### 2. `src/components/hifz/istiqamah/StepComprehension.tsx`

**Titre "Comprendre le message" (ligne 65-66)** :
- Changer la couleur de `#f0e6c8` (doré) → `#ffffff` (blanc)

**Sous le bouton jaune "J'ai compris le sens" (après ligne 126)** :
- Ajouter un texte motivationnel : `En route vers un Hifz scellé.`
- Style : petite police (`text-xs`), couleur crème (`rgba(255,255,255,0.55)`), centré, sous le bouton

**Aussi sous le bouton vert "Commencer la mémorisation" (après ligne 153)** :
- Même texte motivationnel pour cohérence

