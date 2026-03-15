

## Ajouter le partage natif du PDF

Utiliser l'API `navigator.share()` (Web Share API) pour permettre le partage du PDF sur mobile. Sur desktop ou si l'API n'est pas disponible, on garde le téléchargement classique.

### Changements dans `src/components/planificateur/ReadingHistory.tsx`

1. **Modifier `generatePDF`** : au lieu de `doc.save()`, générer un `Blob` via `doc.output('blob')`, puis :
   - Si `navigator.canShare` supporte le fichier → appeler `navigator.share({ files: [file] })` avec le PDF en tant que `File`
   - Sinon → fallback `doc.save()` classique

2. **Bouton** : changer le label de "PDF" à "Partager" avec icône `Share2` quand le partage natif est disponible, garder "PDF" avec `Download` sinon.

### Fichier modifié
- `src/components/planificateur/ReadingHistory.tsx`

