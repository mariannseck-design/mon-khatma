

## Plan : Garder les items validés visibles avec "Révision faite" + prochaine révision

### Problème
Quand un bloc tour (ex: Al-Fatiha) est validé, au lieu de rester visible avec un statut "fait", le message de célébration remplace tout. L'utilisatrice veut voir que c'est fait, pas un message vide.

### Changements

**`src/components/muraja/MurajaChecklist.tsx`**

1. **Changer le texte quand un item est coché** (ligne 200-202) : Pour la section `tour`, quand `isChecked`, remplacer `humanizeInterval(item.sm2_interval)` par **"Révision faite ✓"** en vert.

2. **Ajouter prop `nextTourReview`** : une liste d'objets `{ surah_number, verse_start, verse_end, next_review_date }` représentant les prochains blocs tour non dus aujourd'hui, triés par date.

3. **Après la liste des items**, si tous les items tour sont cochés et qu'il y a des prochaines révisions, afficher un petit encart : "Prochaine révision : [Sourate] v. X → Y le [date]".

**`src/pages/MurjaPage.tsx`**

4. **Calculer `nextTourReviews`** : filtrer `allVerses` pour les blocs tour dont `next_review_date > today`, trier par date, prendre le(s) premier(s).

5. **Passer la prop** `nextTourReview` au `MurajaChecklist` de la section tour.

### Fichiers modifiés
- `src/components/muraja/MurajaChecklist.tsx`
- `src/pages/MurjaPage.tsx`

