

# Deux corrections dans StepImmersion

## 1. Texte de la phase Écoute
Le titre actuel "Écouter & répéter" et le sous-titre "Écoutez ce verset avec le récitateur" ne mentionnent pas le Mushaf.

**Changement :**
- Titre → `"Écouter, lire & répéter"`
- Sous-titre → `"Écoute le récitateur en suivant sur le Mushaf, puis répète"`

## 2. Basmala : ne jamais l'inclure comme verset à mémoriser
Actuellement, en mode texte, le verset 1 affiche la Basmala collée au texte. Il faut :

- **Afficher la Basmala en en-tête décoratif** (comme dans QuranTextView) quand `verseStart === 1` et `surahNumber ∉ {1, 9}`
- **Retirer la Basmala du texte du verset 1** via la fonction `stripLeadingBasmala` (déjà utilisée ailleurs dans le projet)
- Cela concerne uniquement le rendu texte dans `renderMushaf()` — les modes image et physique ne sont pas affectés

**Fichier modifié : `src/components/hifz/istiqamah/StepImmersion.tsx`**

