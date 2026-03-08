

## Plan : Modifier le message de fin de session Dhikr

### Changement unique dans `src/components/dhikr/DhikrSession.tsx`

Ligne 82 : remplacer `Bârak Allâhu fîk` par :

```
Qu'Allah <span class="honorific">(عز وجل)</span> accepte, Amine
```

Le texte utilisera la classe `honorific` existante pour styliser la mention en arabe conformément aux conventions du projet.

### Fichier modifié
- `src/components/dhikr/DhikrSession.tsx` (1 ligne)

