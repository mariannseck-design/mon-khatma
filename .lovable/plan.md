

## Séparer les boutons PDF et Partager

Actuellement, un seul bouton affiche soit "PDF" soit "Partager" selon le support. Il faut afficher les deux côte à côte.

### Changements dans `src/components/planificateur/ReadingHistory.tsx`

1. **Séparer `generatePDF` en deux modes** : ajouter un paramètre `mode: 'download' | 'share'`
   - `download` → `doc.save()` toujours
   - `share` → `navigator.share()` avec fallback `doc.save()`

2. **Deux boutons côte à côte** dans le header :
   - Bouton **PDF** (icône `Download`) → appelle `generatePDF(...)` en mode download
   - Bouton **Partager** (icône `Share2`) → affiché uniquement si `canNativeShare`, appelle en mode share

### Fichier modifié
- `src/components/planificateur/ReadingHistory.tsx`

