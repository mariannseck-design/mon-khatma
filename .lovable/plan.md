

## Diagnostic

Le bouton retour (chevron `<`) dans HifzConfig navigue bien vers `/hifz-hub` dans le code. Cependant, deux problèmes probables :

1. **Bouton quasi invisible** : opacité 0.25, icône 4×4px, apparition avec délai — très difficile à voir/taper sur mobile
2. **Bouton retour Android** : le geste de retour natif du téléphone utilise l'historique du navigateur → retourne à l'accueil (dernière page visitée) au lieu de `/hifz-hub`

## Changements

### 1. `src/components/hifz/HifzConfig.tsx`
Rendre le bouton retour plus visible et plus grand :
- Augmenter l'opacité (0.25 → 0.6)
- Agrandir la zone de tap et l'icône
- Supprimer le délai d'apparition
- Ajouter le texte "ÉTAPE 1/5" à côté du chevron pour former un bouton retour clair (comme dans le screenshot, le `<` et "ÉTAPE 1/5" semblent liés)

### 2. `src/pages/HifzPage.tsx`
Intercepter le bouton retour du navigateur (popstate) quand on est sur HifzConfig (step === -1) pour rediriger vers `/hifz-hub` au lieu de laisser l'historique naviguer vers l'accueil.

```text
Flux corrigé :
Accueil → Hifz Hub → /hifz (Config)
                         ← bouton retour in-app → /hifz-hub ✓
                         ← bouton retour Android → /hifz-hub ✓ (intercepté)
```

