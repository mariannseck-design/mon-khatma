

## Plan : Tikrar avec texte Tanzil + Tajwid

### Objectif
Remplacer l'image Mushaf dans HifzStep3Memorisation par le texte local Tanzil avec couleurs Tajwid, et adapter la logique Tikrar au niveau de répétition choisi (15/20/25/30/35/40).

### Changements

#### 1. `src/lib/quranData.ts` — Ajouter lookup par sourate/versets
Ajouter une fonction `getVersesByRange(surah, startVerse, endVerse)` qui retourne les ayahs depuis le JSON local (même cache mémoire). Nécessaire car le loader actuel n'indexe que par page.

#### 2. `src/components/hifz/HifzStep3Memorisation.tsx` — Refonte majeure
- **Remplacer l'image Mushaf** par un bloc de texte arabe local avec Tajweed
- Charger les versets via `getVersesByRange()` + annotations Tajweed via `getTajweedAnnotations()`
- **Utiliser `repetitionLevel`** (prop existante mais ignorée — actuellement hardcodé à 40) comme cible du compteur
- **3 phases dynamiques basées sur le compteur** :
  - **1-10** : Texte + Tajwid visible, audio activé (bouton speaker proéminent)
  - **11-15** : Texte + Tajwid visible, audio masqué (aide discrète)
  - **16+** : Texte masqué, message d'encouragement, bouton "Vérifier" (affiche brièvement le texte)
- **Verrouillage** : bouton "Étape suivante" désactivé tant que `ancrage < repetitionLevel`
- **Persistance** : localStorage (déjà en place, conserver)
- **Célébration** : message enrichi avec la citation demandée

#### 3. Rendu du texte dans Step3
Réutiliser les fonctions existantes de `QuranTextView.tsx` :
- `renderTajweedText()` pour le coloriage
- `stripLeadingBasmala()` pour le verset 1
- Style identique (Amiri Quran, ligatures, justifié RTL)

Le texte sera affiché dans un conteneur scrollable avec fond semi-transparent adapté au thème émeraude du Hifz.

### Fichiers modifiés
| Fichier | Action |
|---|---|
| `src/lib/quranData.ts` | Ajouter `getVersesByRange()` + index par sourate |
| `src/components/hifz/HifzStep3Memorisation.tsx` | Refonte : texte Tanzil+Tajwid au lieu d'image Mushaf, `repetitionLevel` comme cible |

