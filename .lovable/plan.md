

## Probleme

Dans `MurajaChecklist.tsx` ligne 94, le clic sur le badge page (ex: "13") navigue vers `/quran?page=X` — mais cette route n'existe pas. La bonne route est `/quran-reader`.

## Correction

**`src/components/muraja/MurajaChecklist.tsx`** ligne 94 :
- Remplacer `navigate('/quran?page=${page}')` par `navigate('/quran-reader?page=${page}')`

C'est un fix d'une seule ligne.

