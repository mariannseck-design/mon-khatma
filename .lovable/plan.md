

# Étape 4 Validation : 5 essais + "SANS REGARDER LE MUSHAF" en exergue

## Changements dans `src/components/hifz/HifzStep4Validation.tsx`

### 1. Passer de 3 à 5 récitations consécutives
- Remplacer toutes les références à `3` par `5` (seuil de validation, badges, textes)
- Les badges passent de 3 cercles à 5 cercles
- `handleSuccess` : `next >= 5` au lieu de `next >= 3`

### 2. Mettre "SANS REGARDER LE MUSHAF" en exergue
- Dans l'instruction principale (ligne 313), reformuler : "Enregistre-toi **5 fois de suite**" puis `<span>` rouge vif (`#ef5350`, `fontWeight: 700`, majuscules) pour "SANS REGARDER LE MUSHAF"
- Remplacer "sans regarder le Coran" par "SANS REGARDER LE MUSHAF"

### 3. Autoriser l'utilisateur à continuer au-delà de 5
- Le bouton "Continuer à réciter" existe déjà (bonus mode) — il suffit de mettre à jour les compteurs pour refléter 5 au lieu de 3

