

## Suppression de (عز وجل) dans tous les textes dhikr (arabe + français)

### Portée

33 fichiers contiennent `(عز وجل)` — 1101 occurrences au total. Les fichiers principaux concernés par le dhikr :

**Fichiers de données :**
- `src/lib/adhkarData.ts` — adhkâr matin/soir/prière
- `src/lib/sourcesLumiereData.ts` — invocations coraniques, sunna, salawât
- `src/lib/douasData.ts` — douas par catégorie
- `src/lib/dailyQuotes.ts` — citations quotidiennes
- `src/lib/dailyMessages.ts` — messages quotidiens

**Composants :**
- `src/components/dhikr/DhikrSession.tsx` — message fin de session
- `src/components/sources-lumiere/SourcesSession.tsx` — message fin de session
- Tous les autres composants/pages contenant `(عز وجل)` dans du texte affiché

### Approche

Remplacement global dans chaque fichier :
- `Allah (عز وجل)` → `Allah`
- `<span className="honorific">(عز وجل)</span>` → supprimé
- ` (عز وجل)` → `` (suppression avec l'espace avant)

Cela ne touche pas aux autres honorifiques (`ﷺ`, `عليه السلام`, `عليهم السلام`) qui restent en place.

### Fichiers modifiés

Les 33 fichiers identifiés seront nettoyés par remplacement textuel simple.

