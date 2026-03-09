

## Plan : Corriger le lien "Entretien & Révision" dans HifzSuccess

### Problème

Le bouton "Entretien & Révision" dans `HifzSuccess.tsx` navigue vers `/revision`, mais cette route n'existe pas. La page Muraja'a est sur `/muraja` → erreur 404.

### Correction

**`src/components/hifz/HifzSuccess.tsx`** (ligne 80) : Remplacer `navigate('/revision')` par `navigate('/muraja')`.

