

## Relier les défis Al-Mulk, Al-Kahf et Al-Baqara au lecteur Coran

### Concept

Ajouter un bouton "Lire la sourate" sur chaque carte de défi qui ouvre le lecteur Coran directement à la bonne page. La validation du défi reste manuelle (coche) — la lecture dans l'app est une option, pas une obligation.

Pour Al-Baqara spécifiquement, on peut sauvegarder automatiquement la dernière page lue pour reprendre là où on s'est arrêté.

### Pages Mushaf (depuis surahData.ts)
- Al-Baqara : page 2 (286 versets, ~48 pages)
- Al-Kahf : page 293
- Al-Mulk : page 562

### Changements

**1. `src/components/defis/DefiAlMulk.tsx`**
- Ajouter un bouton discret "Lire Al-Mulk 📖" sous les 7 jours
- Au clic : `navigate('/quran-reader?page=562')`

**2. `src/components/defis/DefiAlKahf.tsx`**
- Ajouter un bouton "Lire Al-Kahf 📖" sous le bouton de validation
- Au clic : `navigate('/quran-reader?page=293')`

**3. `src/components/defis/DefiAlBaqara.tsx`**
- Ajouter un bouton "Continuer ma lecture 📖" qui ouvre le Coran à la bonne page
- Calculer la page en fonction de la progression : `page 2 + Math.floor(checkedDays.length * (48 / targetDays))`
- Stocker la dernière page lue dans localStorage (`baqara_last_page`) pour une reprise précise

**4. `src/pages/QuranReaderPage.tsx`**
- Déjà compatible : le paramètre `?page=X` est lu au chargement (ligne 30-31). Aucun changement nécessaire.

### Style des boutons
Bouton semi-transparent intégré dans la carte, style cohérent avec le design existant : fond `rgba(255,255,255,0.1)`, texte blanc/doré, petit et discret avec une icône Book.

### Complexité
Faible — 3 fichiers à modifier, ~10-15 lignes par fichier. Un seul message suffira.

