

## Améliorations de la page Planificateur + Historique de lecture

### 1. Nouveau composant : Historique de lecture
Créer `src/components/planificateur/ReadingHistory.tsx` — une carte affichant les dernières entrées de lecture depuis `quran_progress`, triées par date décroissante.

Chaque entrée affiche :
- La date (format "14 mars 2026")
- Le nombre de pages lues ce jour-là
- La sourate correspondante (via `getSurahByPage`)
- Un indicateur visuel si l'objectif quotidien a été atteint (check vert)

Limité aux 10 dernières entrées, avec un style cohérent (cards arrondies, icônes).

### 2. Intégration dans PlanificateurPage
- Passer `weekProgress` (déjà chargé) ou charger un historique plus complet (dernières 15 entrées)
- Placer la section entre le ReadingSlider et le bouton de reset
- Ajouter un état `allProgress` pour stocker l'historique complet

### 3. Améliorations visuelles mineures
- Ajouter une icône d'horloge/historique pour la section
- Style épuré avec alternance de couleurs subtile pour les lignes

### Fichiers modifiés/créés

| Fichier | Action |
|---|---|
| `src/components/planificateur/ReadingHistory.tsx` | Créer — composant historique |
| `src/pages/PlanificateurPage.tsx` | Modifier — charger l'historique, intégrer le composant |

