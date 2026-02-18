
# Correction : l'objectif revient "non enregistre" apres validation

## Probleme identifie

La base de donnees contient **10 objectifs actifs en double** pour le meme utilisateur. Le code utilise `.maybeSingle()` pour recuperer l'objectif actif, ce qui retourne `null` quand il y a plusieurs resultats. Du coup, apres l'enregistrement et le message de felicitation, `fetchGoal()` ne trouve pas l'objectif (car il y en a plusieurs) et reaffiche le formulaire de setup.

De plus, `handleSpiritualSetup` utilise `.insert()` au lieu de `.upsert()`, ce qui cree un doublon a chaque tentative.

## Solution

### Etape 1 : Nettoyer les doublons en base

Migration SQL pour :
- Supprimer tous les doublons de `quran_goals` en ne gardant que le plus recent par utilisateur
- Ajouter une contrainte unique sur `(user_id, is_active)` pour empecher les futurs doublons (ou utiliser `upsert`)

### Etape 2 : Corriger `handleSpiritualSetup` dans `PlanificateurPage.tsx`

- **Avant l'insert** : desactiver les anciens objectifs (`is_active = false`) pour eviter les doublons
- Ou mieux : utiliser `upsert` au lieu de `insert` pour `quran_goals`
- S'assurer que `fetchGoal()` retrouvera bien un seul objectif actif

### Etape 3 : Securiser `fetchGoal`

- Ajouter `.order('created_at', { ascending: false }).limit(1)` au lieu de `.maybeSingle()` pour toujours recuperer le plus recent meme en cas de doublons residuels

## Fichiers concernes

- **Migration SQL** : nettoyage des doublons + contrainte
- **`src/pages/PlanificateurPage.tsx`** :
  - `handleSpiritualSetup` : desactiver les anciens objectifs avant d'inserer le nouveau
  - `fetchGoal` : utiliser `.order('created_at', { ascending: false }).limit(1).maybeSingle()` pour robustesse

## Resultat attendu

- L'objectif s'enregistre une seule fois
- Apres le message de felicitation, l'utilisateur voit bien son objectif actif (pas le formulaire de setup)
- Plus de doublons en base
