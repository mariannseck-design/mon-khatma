

# Restaurer les donnees de lecture de Marianne et enregistrer la Khatma

## Constat

- `quran_progress` est vide pour Marianne (user `f3f97b3a...`) -- les donnees precedentes ont ete supprimees.
- `khatma_completions` est vide -- aucune annonce ne s'affichera dans l'Espace Communaute.
- Tous les objectifs sont inactifs.

## Actions a effectuer (donnees uniquement, pas de code)

### 1. Inserer des enregistrements de lecture dans `quran_progress`

Repartir ~584 pages sur plusieurs jours (du 6 fevrier au 4 mars) + 20 pages aujourd'hui = 604 total.

Exemple de repartition (~20-25 pages/jour sur ~25 jours) :
- Du 6 fev au 4 mars : ~584 pages reparties
- 5 mars (aujourd'hui) : 20 pages

### 2. Inserer un enregistrement dans `khatma_completions`

Pour declencher l'annonce doree dans l'Espace Communaute :
```sql
INSERT INTO khatma_completions (user_id, display_name)
VALUES ('f3f97b3a-09f7-4dab-834d-4c049ac35d23', 'NDEYE MARIANNE SECK');
```

### 3. Creer un objectif actif

Reactiver un objectif de 20 pages/jour pour que le planificateur fonctionne correctement.

