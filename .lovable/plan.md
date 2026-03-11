

## Supprimer les pages Muraja'a alternatives et garder uniquement le Calendrier

### Pages à supprimer
- `src/pages/MurjaPage.tsx` (757 lignes — l'ancienne page principale)
- `src/pages/MurjaCardsPage.tsx` (207 lignes — vue flashcards)

### Composants Muraja devenus orphelins à supprimer
- `src/components/muraja/MurajaChecklist.tsx`
- `src/components/muraja/MurajaCelebration.tsx`
- `src/components/muraja/MurajaCountdown.tsx`
- `src/components/muraja/MurajaMethodModal.tsx`
- `src/components/muraja/MurajaWeeklyRecap.tsx`

### Fichiers à modifier

1. **`src/App.tsx`** :
   - Supprimer les imports de `MurjaPage` et `MurjaCardsPage`
   - Supprimer les routes `/muraja` et `/murajaa-cards`
   - Renommer la route `/murajaa-calendar` → `/muraja` (nouvelle route principale)
   - Supprimer l'import `RefreshCw` s'il n'est plus utilisé

2. **`src/pages/MurjaCalendarPage.tsx`** :
   - Le bouton retour navigue actuellement vers `/muraja` → changer vers `/accueil`

3. **`src/pages/AccueilPage.tsx`** :
   - Le lien `<Link to="/muraja">` reste inchangé (la route `/muraja` pointera désormais vers le calendrier)

4. **`src/components/hifz/HifzSuccess.tsx`** :
   - `navigate('/muraja')` reste inchangé (même raison)

5. **`src/pages/HifzSuiviPage.tsx`** :
   - `<Link to="/muraja">` reste inchangé

