

# Ajout de l'étape Tikrar (40 répétitions en 24h) après la Validation

## Contexte
Actuellement, après l'étape 4 (Validation), la session se termine directement (step 5 = écran de succès). Il faut intercaler une nouvelle étape **Tikrar** entre la Validation et le Succès, où l'utilisateur récite 40 fois la portion mémorisée dans les 24h.

## Architecture

Le flow actuel : `Step 4 (Validation) → completeSession() → Step 5 (Success)`

Le nouveau flow : `Step 4 (Validation) → Step 5 (Tikrar 40x) → completeSession() → Step 6 (Success)`

## Changements

### 1. Nouveau composant `HifzStep5Tikrar.tsx`
- Compteur circulaire : affiche le nombre de récitations faites / 40 et le solde restant
- Bouton principal : "J'ai récité ✓" qui incrémente le compteur de 1
- Barre de progression visuelle
- Timer 24h : affiche le temps restant depuis le début de l'étape (countdown)
- Message de motivation à certains seuils (10, 20, 30, 39)
- Quand le compteur atteint 40 : bouton "Valider" apparaît
- Le compteur est persisté dans `hifz_sessions.step_status` (JSON) pour survivre aux rechargements
- Message final : « C'est validé ! Retrouvez ces versets demain dans votre « Réveil de la Veille » et pendant 30 jours dans votre « Liaison » (1 fois par jour) pour un ancrage parfait. »

### 2. Modifications dans `HifzPage.tsx`
- Ajouter `STEP_NAMES[5] = 'Tikrar'`
- Step 4 `onNext` → `updateStep(5)` au lieu de `completeSession()`
- Step 5 = `HifzStep5Tikrar` avec `onNext={completeSession}`
- Step 6 = `HifzSuccess` (au lieu de 5)
- Mettre à jour le DevSkipButton et la logique de sauvegarde pour gérer step 5
- `completeSession` : `current_step: 5` au lieu de 4

### 3. Mise à jour de `HifzSuccess.tsx`
- Ajouter `5: 'Tikrar'` dans `STEP_LABELS`
- Mettre à jour le message pour inclure « 1 fois par jour pendant 30 jours »

