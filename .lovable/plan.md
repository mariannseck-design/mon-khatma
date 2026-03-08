

## Refonte des Étapes 5 & 6 + Séparation Hifz / Révision

### Contexte
Le parcours Hifz actuel enchaine 7 étapes (0-6) dans un tunnel unique. Les étapes 5 (Liaison) et 6 (Tour) manquent de contexte dynamique et alourdissent la session de mémorisation. L'utilisatrice qui vient de passer 45 minutes sur les étapes 0-4 ne devrait pas être forcée d'enchaîner la révision.

### Modifications prévues

**1. Couper le tunnel Hifz après l'étape 4**
- Dans `HifzPage.tsx` : quand l'étape 4 est validée, passer directement à l'écran de succès (step 7) au lieu de l'étape 5
- L'écran `HifzSuccess` affiche "HIFZ VALIDÉ !" avec le récapitulatif des temps (étapes 0-4 uniquement) et le bouton retour à l'accueil
- La session DB est marquée comme complétée dès la fin de l'étape 4

**2. Refonte de l'étape 5 (Liaison) - Module indépendant**
- Dans `HifzStep5Liaison.tsx` : requêter `hifz_memorized_verses` pour afficher la liste exacte des versets mémorisés ces 30 derniers jours
- Afficher un encadré dynamique : "À relier aujourd'hui : Sourate X, v. Y-Z" pour chaque bloc
- Garder le bouton de confirmation "J'ai récité" mais avec le contexte visuel

**3. Refonte de l'étape 6 (Tour) - Module indépendant**
- Dans `HifzStep6Tour.tsx` : requêter `hifz_memorized_verses` pour trouver le bloc dont `next_review_date <= today`
- Afficher la référence du bloc à réviser en haut (ex: "Al-Baqarah, v. 1-5")
- Ajouter un bouton "Voir le texte" qui révèle temporairement le texte arabe (via `getVersesByRange`)
- Renommer "Bien" en "Moyen" sur les boutons d'évaluation
- Mettre à jour les paramètres SM-2 (`sm2_interval`, `sm2_ease_factor`, `sm2_repetitions`, `next_review_date`) selon la difficulté choisie

**4. Nouveau module "Entretien & Révision" sur l'Accueil**
- Dans `AccueilPage.tsx` : ajouter une nouvelle carte "Entretien & Révision" (entre Hifz et Muraja'a ou en dessous)
- Cette carte mène vers une nouvelle page ou une section qui propose :
  - "La Liaison" (étape 5 refaite)
  - "Le Tour" (étape 6 refaite)
- Afficher un indicateur si des révisions sont en attente (badge doré)

**5. Nouvelle route `/revision`**
- Créer `src/pages/RevisionPage.tsx` : page indépendante avec deux sections (Liaison + Tour)
- Ajouter la route dans `App.tsx`
- Le flux est : Accueil → Carte "Entretien" → RevisionPage → Liaison ou Tour

### Fichiers impactés
- `src/pages/HifzPage.tsx` — couper le tunnel après étape 4
- `src/components/hifz/HifzStep5Liaison.tsx` — affichage dynamique des versets à relier
- `src/components/hifz/HifzStep6Tour.tsx` — affichage référence + "Voir le texte" + renommer "Bien" → "Moyen" + logique SM-2
- `src/pages/RevisionPage.tsx` — nouvelle page indépendante
- `src/pages/AccueilPage.tsx` — nouvelle carte "Entretien & Révision"
- `src/App.tsx` — ajout route `/revision`
- `src/components/hifz/HifzSuccess.tsx` — ajuster les labels (plus d'étapes 5-6)

### Section technique : Logique SM-2

Lors de l'évaluation dans Le Tour :
- **Difficile** : `interval = 1 jour`, `ease_factor -= 0.15` (min 1.3)
- **Moyen** : `interval *= ease_factor`, pas de changement d'ease
- **Facile** : `interval *= ease_factor * 1.3`, `ease_factor += 0.15`

La `next_review_date` est mise à jour via un UPDATE sur `hifz_memorized_verses`.

