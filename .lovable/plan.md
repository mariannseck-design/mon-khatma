

## Ajout de l'indicateur de Streak dans le header Muraja'a

### Approche

La table `hifz_streaks` existe déjà avec `current_streak`, `last_active_date`, `longest_streak`. Elle est mise à jour à chaque session Hifz terminée. Il faut :

1. **Lire le streak** depuis `hifz_streaks` dans `MurjaCalendarPage` et l'afficher en haut à droite du header.
2. **Mettre à jour le streak** quand l'utilisateur termine tout son programme Muraja'a du jour (tous les items cochés).

### Fichier : `src/pages/MurjaCalendarPage.tsx`

**Affichage** (header, position absolue à droite, symétrique au bouton retour) :
- Format : `12 🔥` en petit (`text-xs`), couleur moutarde `#D4AF37`
- Visible uniquement si `current_streak > 0`
- Animation d'entrée discrète avec framer-motion

**Logique streak** :
- Au mount, fetch `hifz_streaks` pour l'utilisateur connecté
- Quand `allDayChecked` passe à `true` → appeler une fonction qui met à jour le streak (même logique que dans `HifzPage` : vérifier `last_active_date`, incrémenter si consécutif, reset à 1 sinon)
- Mettre à jour le state local pour refléter le +1 immédiatement

### Rendu header cible

```text
  [←]     Mon Programme du Jour       [12 🔥]
              3/7 terminés
```

### Détails techniques

- Import `useAuth` pour récupérer `user.id`
- State : `streak: number` (initialisé à 0)
- `useEffect` au mount → fetch streak
- `useEffect` sur `allDayChecked` → si `true`, update streak en DB + state local
- Guard : ne pas re-update si `last_active_date === today`

