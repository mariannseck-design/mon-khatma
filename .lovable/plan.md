

## Ajouter le bouton Skip Dev Mode sur la page Méthode Mourad

### Modifications sur `src/pages/MethodeMouradPage.tsx`

1. Importer `DevSkipButton` et `useDevMode`
2. Appeler `useDevMode()` dans le composant
3. Ajouter `<DevSkipButton>` en bas du JSX, visible quand une session est active et non terminée
4. Le `onSkip` avance à la phase suivante (phase+1), ou complète la session si phase 4/5

### Logique du Skip

- Phase 1→2→3→4 : `advancePhase(phase + 1)`
- Phase 4 : passe en maintenance (phase 5 + date)
- Phase 5 (maintenance) : appelle `handleMaintenanceComplete()`
- Session terminée / config : bouton masqué

