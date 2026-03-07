

# Ajouter une 5ème taille "Mushaf" (42px)

## Changement

**`src/components/quran/QuranTextView.tsx`** — Ajouter une entrée au tableau `FONT_SIZE_PRESETS` :
```
{ label: 'Mushaf', value: 42 }
```

**`src/components/quran/ReaderSettingsPanel.tsx`** — Passer la grille de 4 à 5 colonnes (`grid-cols-5`) pour afficher les 5 boutons de taille.

Résultat : l'utilisateur verra 5 choix — Petit, Moyen, Grand, Très Grand, Mushaf — dans le panneau de paramètres.

