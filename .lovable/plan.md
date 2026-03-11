

## Nettoyage des titres de la page Muraja'a

Deux modifications simples dans `src/pages/MurjaCalendarPage.tsx` :

1. **Ligne 233** — `AppLayout title` : remplacer `"Muraja'a — Calendrier"` par `"Muraja'a"` (le sous-titre "Consolide ta mémorisation" sera géré visuellement dans le header interne, pas dans l'AppLayout title qui est trop contraint)

2. **Lignes 244-246** — Titre interne avec flèche retour : remplacer `"Vue Calendrier"` par `"Mon Programme du Jour"`

3. **Ajouter un sous-titre** sous le titre interne : une ligne `text-[11px]` grisée avec "Consolide ta mémorisation"

