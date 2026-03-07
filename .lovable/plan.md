

## Plan : Corriger les identifiants des récitateurs

### Probleme identifie

En comparant les IDs utilisés dans le code avec l'API `alquran.cloud`, deux récitateurs ont des identifiants incorrects :

| Récitateur | ID actuel (incorrect) | ID correct dans l'API |
|---|---|---|
| Ibrahim Al-Akhdar | `ar.ibrahimakhdar` | `ar.ibrahimakhbar` |
| Saad Al-Ghamidi | `ar.saadalghamidi` | **N'existe pas dans l'API** |

Saad Al-Ghamidi n'est pas disponible dans cette API. On peut le remplacer par un récitateur disponible comme **Maher Al-Muaiqly** (`ar.mahermuaiqly`) ou **Abu Bakr Ash-Shaatree** (`ar.shaatree`).

### Modification

**`src/hooks/useQuranAudio.ts`** (ligne 8 et 11) : Corriger les deux identifiants dans le tableau `RECITERS`.

- Ligne 8 : Remplacer `ar.saadalghamidi` par `ar.mahermuaiqly` (Maher Al-Muaiqly) — ou un autre récitateur disponible si vous préférez
- Ligne 11 : Remplacer `ar.ibrahimakhdar` par `ar.ibrahimakhbar`

Ce changement corrige automatiquement les deux composants Hifz (`HifzStep2Impregnation` et `HifzStep3Memorisation`) et le lecteur Quran, car ils utilisent tous la même liste `RECITERS`.

