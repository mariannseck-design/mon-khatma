

# Diagnostic et Correction du Lecteur Mushaf

## Probleme identifie

Le CDN d'images `cdn.islamic.network` retourne une erreur **AccessDenied** sur toutes les URLs. Ce service a bloque l'acces public a ses images de Mushaf. C'est la raison pour laquelle le lecteur reste en chargement infini -- l'image ne se charge jamais.

## Solution proposee

Puisque l'API texte `api.alquran.cloud` fonctionne parfaitement (verifie et confirme), la correction consiste a :

### 1. Basculer le mode par defaut sur le mode texte
- Le mode texte (police Amiri / Uthmani) devient le mode par defaut au lieu du mode image
- Le rendu est beau et calligraphique, avec un texte arabe authentique

### 2. Ajouter un fallback intelligent pour le mode image
- Ajouter un `onError` sur l'image qui affiche un message clair ("Images indisponibles, basculez en mode texte")
- Ajouter un timeout de 10 secondes : si l'image ne charge pas, bascule automatique vers le mode texte avec un toast d'information

### 3. Preparer un CDN de secours
- Configurer une liste de CDN en fallback (pour le jour ou un CDN fonctionnel sera trouve)
- Pour l'instant, le mode texte est la solution fiable et fonctionnelle

### Fichier a modifier
- `src/pages/QuranReaderPage.tsx` : changer `textMode` par defaut a `true`, ajouter gestion d'erreur image avec fallback automatique

### Impact
- Le lecteur s'affiche immediatement avec le texte Uthmani
- L'utilisatrice peut toujours tenter de basculer en mode image (le bouton reste present)
- Si le CDN redevient accessible, le mode image fonctionnera sans changement de code

