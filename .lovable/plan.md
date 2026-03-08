

## Plan : Corriger le calcul de progression en pages

### Probleme
La ligne 141 divise les versets completes par 10.3 (moyenne globale du Coran). C'est faux : si la soeur a un objectif de 1 page/semaine, la progression doit refleter combien de pages elle a couvertes dans ses sessions de la periode, pas un ratio sur le Coran entier.

Le vrai probleme est que `hifz_sessions` stocke `start_verse` et `end_verse` (numeros de versets dans une sourate), pas des numeros de pages. Donc on doit convertir les versets completes en pages.

### Solution
La division par 10.3 est en fait la bonne approche conceptuelle (convertir versets en pages), car on n'a pas de mapping verset-page exact dans les sessions. Le ratio 10.3 (6236 versets / 604 pages) est une approximation raisonnable.

Cependant, le vrai bug est ailleurs : les `periodSessions` sont filtrées avec `gte('completed_at', weekStartStr)` pour la semaine, mais le filtre `daily` compare avec `startsWith(todayStr)` sur `completed_at`. Le probleme potentiel est que les sessions recupérées n'ont pas les bons champs (`start_verse`/`end_verse` vs les colonnes réelles).

Regardons plus précisément : la query ligne ~112 selectionne `start_verse, end_verse, completed_at` de `hifz_sessions`. Puis ligne 137-138 calcule `s.end_verse - s.start_verse + 1`. Si la soeur a complété 19 versets cette semaine, ca donne `19 / 10.3 = 1.8 pages`. C'est correct conceptuellement.

**Le calcul est en fait juste.** 1.8 pages signifie qu'elle a memorise environ 1.8 pages de versets cette semaine. Si son objectif est 1 page/semaine, elle l'a depassé.

Mais l'utilisatrice ne comprend pas ce chiffre. Le probleme est plutot d'affichage/UX : il faudrait mieux contextualiser le nombre.

### Changement
Aucun changement de logique necessaire. Le calcul `versets / 10.3 = pages` est correct. 1.8 signifie "tu as memorise l'equivalent de 1.8 pages cette semaine", ce qui est coherent avec un objectif de "1 page par semaine" ou "2 pages par semaine".

Si tu veux, je peux ameliorer l'affichage pour que ce soit plus clair (par exemple afficher "1.8 / 2 pages cette semaine" plus lisiblement). Mais le calcul lui-meme n'a pas besoin de changer.

