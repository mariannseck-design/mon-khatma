

## Ajouter le swipe horizontal entre les duas dans les sessions Sources de Lumière

### Problème
Dans les sessions (Sunna Sacrée, Salawât, Coran), on ne peut passer d'une dua à l'autre qu'en complétant le compteur. Il n'y a aucun geste de swipe pour naviguer entre les duas.

### Solution
Ajouter la détection de swipe gauche/droite dans `SourcesSession.tsx` pour permettre de glisser d'une dua à la suivante (ou revenir à la précédente).

### Fichier modifié

**`src/components/sources-lumiere/SourcesSession.tsx`** :
- Ajouter des handlers `onTouchStart` / `onTouchEnd` sur le conteneur principal
- Swipe gauche → dua suivante (si pas la dernière)
- Swipe droite → dua précédente (si pas la première)
- Seuil de 50px, uniquement si le swipe horizontal est dominant (pas vertical)
- Réinitialiser le compteur du DhikrCounter/SalawatCounter lors du changement de dua par swipe
- Le compteur existant (tap) continue de fonctionner normalement en parallèle

