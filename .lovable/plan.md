

## Plan : Remplacer "Duas Hajj" par "Louanges à Allah & Istighfar"

### Changements

**1. `src/lib/adhkarData.ts`** — Ajouter un nouveau tableau `LOUANGES_ISTIGHFAR`
- Formules de louange : Alhamdulillah, Subhanallah, La ilaha illallah, Allahu Akbar, etc.
- Formules d'Istighfar : Astaghfirullah, Sayyid al-Istighfar, etc.
- ~8-10 items avec texte arabe, translittération, traduction et nombre de répétitions

**2. `src/pages/DhikrPage.tsx`**
- Remplacer la carte `hajj` par une nouvelle carte `louanges` :
  - Titre : "Louanges & Istighfar"
  - Icône : remplacer `Landmark` par une icône adaptée (ex: `Sparkles` ou `Star`)
  - Garder un style visuel similaire (fond vert foncé)
- Importer `LOUANGES_ISTIGHFAR` et l'ajouter dans `CATEGORY_DATA`
- Supprimer la référence à `hajj`

### Fichiers modifiés
- `src/lib/adhkarData.ts` (~50 lignes ajoutées)
- `src/pages/DhikrPage.tsx` (~5 lignes modifiées)

