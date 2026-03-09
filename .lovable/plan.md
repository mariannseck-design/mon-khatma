

## Plan : Mise à jour du « Mode d'emploi du Tikrar »

### Changements dans `src/components/hifz/HifzStep3Memorisation.tsx`

**1. Texte d'introduction (ligne ~346-350)**
Remplacer par le nouveau texte demandé avec mention d'Allah (عز وجل), minimum 15 répétitions, objectif 20.

**2. Étapes de progression (lignes ~354-371)**
Remplacer les 4 blocs actuels par :
- **Étape 1 (1→4)** : fond `rgba(255,255,255,0.10)` — "📖 Regardez le Mushaf | Écoutez l'audio | Répétez en même temps."
- **Étape 2 (5→8)** : fond `rgba(255,255,255,0.20)` — "📖 Regardez le Mushaf | Écoutez l'audio si besoin | Répétez en même temps."
- **Étape 3 (9→12)** : fond `rgba(255,255,255,0.30)` — "📖 Regardez le Mushaf | Éteignez l'audio (Autonomie complète)."
- **Étape 4 (dès 13)** : bordure dorée `rgba(212,175,55,0.5)` + fond léger doré — "🧠 Texte masqué. Récitation de mémoire. Bouton « Vérifier » disponible."

Le style actuel (highlight conditionnel selon la phase active) sera conservé mais avec les nouvelles opacités comme base.

**3. Conclusion (ligne ~373-376)**
Remplacer par : « Bismillah, qu'Allah (عز وجل) facilite, amine. »

**4. Fonctionnalité : arrêt automatique de l'audio à l'étape 2**
Mettre à jour la fonction `getPhaseInfo` pour utiliser les seuils fixes (1-4, 5-8, 9-12, 13+) et ajouter un `useEffect` qui stoppe l'audio automatiquement quand la phase passe à 2.

### Fichier modifié
- `src/components/hifz/HifzStep3Memorisation.tsx`

