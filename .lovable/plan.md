

## Mode Secours — Étape 1 "Réveil de la Veille"

### Résumé
Ajouter un bouton "📖 J'ai oublié une partie" qui bascule l'interface en mode lecture de consolidation : le texte arabe des versets d'hier s'affiche, l'utilisatrice relit 3 fois avec le texte, puis le texte se masque et le compteur principal (1-5) se réinitialise pour forcer les 5 récitations par cœur.

### Changements dans `src/components/hifz/HifzStep1Revision.tsx`

**Nouveaux états :**
- `rescueMode: boolean` — mode secours actif
- `rescueCount: number` (0→3) — compteur de relectures avec texte
- `verseTexts: LocalAyah[]` — texte arabe chargé depuis `getVersesByRange()`

**Flux :**
1. Bouton discret "📖 J'ai oublié une partie" visible sous le bouton "Récitation terminée" quand `rescueMode === false`
2. Au clic : `rescueMode = true`, charger les versets via `getVersesByRange()` pour chaque entrée de `yesterdayVerses`, afficher message d'encouragement
3. En mode secours : remplacer le compteur 1-5 par un compteur 1-3 avec label "🔄 Relisez 3 fois avec le texte" + afficher le texte arabe
4. Quand `rescueCount === 3` : masquer le texte, `rescueMode = false`, `count = 0` (réinitialiser le compteur principal)
5. Le flux normal reprend : 5 récitations par cœur requises

**Import ajouté :** `getVersesByRange` depuis `@/lib/quranData`

**UI du mode secours :**
- Bandeau d'encouragement doré : "Pas de panique ! Prenez le temps de relire 3 fois pour rafraîchir votre mémoire par la grâce d'Allah (عز وجل)."
- Bloc texte arabe (direction RTL, police grande, fond semi-transparent)
- Compteur 3 cercles au lieu de 5
- Bouton "Lecture terminée" au lieu de "Récitation terminée"

Un seul fichier modifié.

