

## Plan : Compteur communautaire Hifz

Ajouter un compteur communautaire pour le Hifz, comme ceux existants pour la Tilawah et les Défis.

### 1. Fonction RPC sécurisée (migration)

Créer `get_hifz_collective_stats` (SECURITY DEFINER) qui retourne :
- **`active_memorizers`** : nombre d'utilisatrices distinctes ayant complété une session Hifz dans les 7 derniers jours
- **`total_verses_memorized`** : somme globale des versets mémorisés par toute la communauté (via `hifz_memorized_verses`)

### 2. Composant `HifzCommunityCounter`

Créer `src/components/hifz/HifzCommunityCounter.tsx` — petit badge compact (même style que `DefisCommunityCounter`) affichant :
- Nombre de mémorisatrices actives
- Total de versets mémorisés collectivement
- Polling toutes les 30s

### 3. Intégration dans AccueilPage

Ajouter le compteur sous la carte "Espace Hifz" dans l'onglet Principal, entre le bloc Hifz et le bloc Muraja'a.

### Fichiers concernés
- **Migration SQL** : nouvelle fonction `get_hifz_collective_stats`
- **`src/components/hifz/HifzCommunityCounter.tsx`** : nouveau composant
- **`src/pages/AccueilPage.tsx`** : import et placement du compteur

