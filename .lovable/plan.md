

## Réorganisation de la grille Dhikr

### Nouveau layout souhaité

```text
┌─────────────────────────────┐
│     Après la prière          │  ← pleine largeur, seul en haut
└─────────────────────────────┘
┌──────────┐  ┌──────────────┐
│ Zikr du  │  │ Zikr du      │  ← alignés côte à côte
│ matin    │  │ soir         │
└──────────┘  └──────────────┘
┌─────────────────────────────┐
│ Les Sources de Lumière       │  ← taille réduite, superposées
├─────────────────────────────┤
│ Mes Douas                    │
└─────────────────────────────┘
┌──────────┐  ┌──────────────┐
│ Chifâ &  │  │ Louanges &   │  ← reste de la grille 2 colonnes
│ Sérénité │  │ Istighfar    │
└──────────┘  └──────────────┘
│ ... autres cartes ...        │
```

### Fichier modifié : `src/pages/EmotionsPage.tsx`

1. **Supprimer** le bloc `Sources de Lumière` + `Mes Douas` actuel (lignes 195-259) qui est au-dessus de la grille.

2. **Remplacer** la grille unifiée (lignes 261-309) par un layout structuré :
   - **"Après la prière"** rendu seul, pleine largeur (`col-span-2`), extrait du tableau `dhikrCards`
   - **"Zikr du matin"** et **"Zikr du soir"** rendus côte à côte dans la grille 2 colonnes
   - **Sources de Lumière** et **Mes Douas** insérés en tant que cartes empilées avec padding/taille réduits (`p-4` au lieu de `p-6`, icône `w-10 h-10`, texte `text-base`)
   - **Reste des cartes** (`chifa`, `louanges`, etc.) continuent en grille 2 colonnes

3. Réordonner le tableau `dhikrCards` pour que `prayer` soit en premier, suivi de `morning`, `evening`, puis le reste (en excluant `prayer`/`morning`/`evening` du map général).

Changement purement visuel, aucun impact fonctionnel.

