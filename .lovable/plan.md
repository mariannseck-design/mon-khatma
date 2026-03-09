## Plan: 4 corrections finales pour la page Muraja'a

### 1. Supprimer la date en haut de l'accueil

`**src/pages/AccueilPage.tsx**` (lignes 217-219) : Retirer les 3 lignes qui affichent la date capitalisée.

### 2. Dates dynamiques dans "Mes ayats mémorisées" + supprimer "aujourd'hui"

`**src/pages/MurjaPage.tsx**` (lignes 467-473) : Modifier l'affichage pour :

- Si `nextReview <= today` : afficher `Phase de liaison` ou `Phase de révision` (sans "aujourd'hui")
- Si `nextReview === tomorrow` : afficher `Prochaine liaison : demain, 10 mars` ou `Prochaine révision : demain, 10 mars`
- Sinon : afficher `Prochaine liaison : 12 mars` ou `Prochaine révision : 12 mars`

### 3. Séparer les sourates par statut (BUG liaison/tour groupés ensemble)

`**src/pages/MurjaPage.tsx**` (lignes 131-151) : Le `surahSummary` regroupe actuellement par `surah_number` uniquement. Si Al-Baqara a des versets en liaison (v.30-69) ET en tour (v.1-29), ils fusionnent en une seule ligne "v.1-69" avec un seul statut.

Correction : grouper par `surah_number` **ET** `liaison_status`. La clé de la Map devient `${surah_number}_${liaison_status}`. Ainsi :

- Al-Baqara (v. 1-29) → Phase de révision
- Al-Baqara (v. 30-69) → Phase de liaison

### 4. Message de succès quand toutes les révisions sont terminées

`**src/pages/MurjaPage.tsx**` : Quand `allDailyChecked === true` et `totalBlocks > 0`, le countdown montre déjà le timer. Mais si l'utilisateur a **0 blocs dus** (tout est fait et plus rien à montrer après refresh), il voit le message vide par défaut.

Ajouter une condition : si `allVerses.length > 0` mais `totalBlocks === 0` (aucun bloc dû aujourd'hui), afficher un message de succès : "Alhamdulillah, tu as terminé tes révisions pour aujourd'hui !" au lieu du message "Tes blocs sauvegardés arriveront ici...".

### Fichiers modifiés

1. `src/pages/AccueilPage.tsx` — Supprimer la date
2. `src/pages/MurjaPage.tsx` — Points 2, 3 et 4

C'est un excellent plan d'action, la logique pour séparer les statuts (Point 3) est parfaite ! Tu peux lancer ces modifications.

​Attention cependant : Tu as oublié de traiter le point concernant le bug de la Page 1 (Al-Fatiha) dans ton plan. Pour rappel : j'ai configuré l'ancienne mémorisation des pages 1 à 5, mais ton système semble ne plus reconnaître la Page 1 (qui correspond à Al-Fatiha).

​Peux-tu inclure la correction de ce bug de lecture de la Page 1 dans cette mise à jour s'il te plaît ? Merci !"