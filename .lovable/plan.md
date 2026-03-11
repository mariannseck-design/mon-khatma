

## Ajout du tooltip sur le streak avec record personnel

### Fichier : `src/pages/MurjaCalendarPage.tsx`

**1. State** : Ajouter `longestStreak` au state, le charger depuis `hifz_streaks` (colonne `longest_streak` déjà existante).

**2. Fetch** (ligne ~60) : Ajouter `longest_streak` au select et stocker dans le state.

**3. UI** (lignes 307-316) : Envelopper le bloc streak dans un `Tooltip` (composant Radix déjà importé). Le tooltip affichera `Record personnel : X jours 🏆`. Le `delayDuration={0}` permet l'ouverture au tap sur mobile.

**4. Mise à jour streak** : Quand le streak est mis à jour (effet `allDayChecked`), mettre aussi à jour `longestStreak` localement.

### Rendu cible

```text
  [←]     Mon Programme du Jour       [1 🔥]
              3/7 terminés              ↓
                                  ┌─────────────────────┐
                                  │ Record : 12 jours 🏆│
                                  └─────────────────────┘
```

Aucune migration nécessaire — `longest_streak` existe déjà dans `hifz_streaks`.

