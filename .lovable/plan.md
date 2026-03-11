

## Renommer les deux zones de la carte Hifz

### Modifications (AccueilPage.tsx, lignes 400-457)

**Zone 1 — "Espace Hifz" → "Méthode Tikrar-Istiqâmah"**
- Ligne 421 : remplacer `'Espace Hifz'` par `'Méthode Tikrar-Istiqâmah'`
- Ligne 426 : retirer le sous-titre `'Mémoriser le Noble Coran'` → laisser vide ou supprimer le `<p>` quand pas de session active

**Zone 2 — "Méthode Oustaz Mourad"**
- Ligne 454-456 : remplacer le sous-titre `'Parcours guidé de mémorisation'` par `'Recommandé pour débutant'`
- Pas d'autre changement

### Résultat visuel

```text
┌──────────────────────────────────┐
│  📖 Méthode Tikrar-Istiqâmah    │  → /hifz
│     (pas de sous-titre)          │
│──────────────────────────────────│
│  💚 Méthode Oustaz Mourad        │  → /methode-mourad
│     Recommandé pour débutant     │
└──────────────────────────────────┘
```

### Fichier modifié
`src/pages/AccueilPage.tsx` — 3 lignes changées

