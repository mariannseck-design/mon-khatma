

# Permettre aux admins de passer après 1 écoute

## Constat

`StepImmersion.tsx` impose `TARGET_REPS = 3` écoutes minimum (et 3 récitations de mémoire) avant de pouvoir avancer. L'admin doit pouvoir passer après 1 seule écoute/récitation.

## Plan

**Fichier : `src/components/hifz/istiqamah/StepImmersion.tsx`**

1. Importer `useAuth` depuis `@/contexts/AuthContext`
2. Récupérer `isAdmin` via `const { isAdmin } = useAuth()`
3. Calculer le seuil dynamique : `const minReps = isAdmin ? 1 : TARGET_REPS`
4. Remplacer `TARGET_REPS` par `minReps` dans le calcul de `minReached` (ligne 58-60)

Aucun autre fichier à modifier — le bouton "Passer à la récitation" apparaîtra dès 1 écoute pour les admins.

