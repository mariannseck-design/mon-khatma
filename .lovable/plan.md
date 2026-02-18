

# 4 corrections a appliquer

## 1. Permettre de lire au-dela de l'objectif quotidien

**Probleme** : Quand `todayPages >= targetPages`, le composant `ReadingSlider` affiche "Objectif atteint" et bloque toute saisie supplementaire via `isDisabled`.

**Solution** : Dans `ReadingSlider.tsx`, supprimer le blocage quand l'objectif est atteint. Garder le message de felicitation comme un bandeau informatif au-dessus du formulaire (au lieu de remplacer le formulaire). L'utilisateur pourra continuer a enregistrer ses pages. Dans `PlanificateurPage.tsx`, ne plus passer `goalMetToday` comme `isDisabled`.

---

## 2. Reordonner les dhikr dans RamadanDhikrSection

**Probleme** : L'ordre actuel des dhikr ne correspond pas a l'ordre souhaite.

**Solution** : Reorganiser le tableau `DEFAULT_DHIKRS` dans `RamadanDhikrSection.tsx` pour mettre dans cet ordre :
1. SubhanAllah (Gloire a Allah)
2. Walhamdulillah (Louange a Allah)
3. Wala ilaha illallah (Il n'y a de divinite qu'Allah)
4. Wallahu Akbar (Allah est le plus Grand)
5. Puis les autres dhikr existants

Aussi corriger l'honorifique du Prophete Mouhamed : remplacer (عليه السلام) par (ﷺ) dans le texte introductif.

---

## 3. Reduire la taille du cadre de progression quotidienne

**Probleme** : Le cadre vert "Aujourd'hui / pages lues" sur la page d'accueil est trop grand.

**Solution** : Dans `AccueilPage.tsx`, reduire le padding, la taille des textes et des elements decoratifs du cadre de progression pour un rendu plus compact.

---

## 4. Mettre "Bienvenue, [Prenom]" avant la salutation

**Probleme** : Actuellement l'ordre est : salutation (Sabah el-kheir) puis "Bienvenue, [Prenom]". L'utilisateur veut l'inverse.

**Solution** : Dans `AccueilPage.tsx`, inverser l'ordre dans le bloc "Greeting Header" : afficher d'abord "Bienvenue, [Prenom]" (avec emoji coeur ou fleur) puis en dessous la salutation contextuelle.

---

## Fichiers concernes

- `src/components/planificateur/ReadingSlider.tsx` : supprimer le blocage apres objectif atteint, afficher un bandeau felicitation au-dessus du formulaire
- `src/pages/PlanificateurPage.tsx` : ne plus passer `isDisabled={goalMetToday}`
- `src/components/ramadan/RamadanDhikrSection.tsx` : reordonner les dhikr, corriger honorifique (ﷺ)
- `src/pages/AccueilPage.tsx` : reduire taille du cadre, inverser ordre salutation/bienvenue

