

## Plan : Ne plus fermer le panneau automatiquement après sélection de sourate

### Problème
Quand l'utilisateur clique "Choisir une sourate", le panneau Paramètres se ferme immédiatement (`setOpen(false)` ligne 209), ce qui ne laisse pas le temps de configurer la page ou les versets ensuite.

### Correction : `src/components/quran/ReaderSettingsPanel.tsx`

- **Ligne 209** : Retirer `setOpen(false)` du onClick du bouton "Choisir une sourate"
- Le SurahDrawer s'ouvrira par-dessus le panneau. Une fois la sourate choisie et le drawer fermé, l'utilisateur reviendra au panneau Paramètres où il pourra ajuster page, juz et versets avant de fermer manuellement.

### Fichier modifié
- `src/components/quran/ReaderSettingsPanel.tsx` — une seule ligne modifiée

