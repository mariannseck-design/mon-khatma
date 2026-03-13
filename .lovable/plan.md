

## Proposition : Titre "Tikrâr" en calligraphie arabe stylisée

Le problème : dans les deux flux (classique via `HifzStepWrapper` et Istiqamah via `StepTikrarFinal`), le titre "Tikrâr" est un simple `<h2>`/`<h3>` en Playfair Display — correct mais peu distinctif.

### Proposition retenue : Titre bilingue avec calligraphie arabe

Remplacer le titre simple par un affichage en deux lignes centré :

```text
      تِكْرَار
      Tikrâr
```

- **Ligne arabe** : en grande taille (text-2xl), police Amiri (déjà chargée ou fallback serif), couleur dorée `#d4af37`
- **Ligne latine** : en petite taille (text-xs), lettres espacées (tracking-widest), couleur dorée atténuée, en majuscules

Le tout encadré par deux petits traits décoratifs dorés horizontaux de chaque côté :

```text
    ──  تِكْرَار  ──
        TIKRÂR
```

### Fichiers modifiés

1. **`src/components/hifz/HifzStep5Tikrar.tsx`** (lignes 138-143) — Remplacer le `<h2>Tikrâr</h2>` par le bloc bilingue avec décorations

2. **`src/components/hifz/istiqamah/StepTikrarFinal.tsx`** (lignes 36-41) — Remplacer l'icône étoile + `<h3>Tikrâr</h3>` par le même bloc bilingue (icône étoile conservée au-dessus)

Modifications purement cosmétiques, aucune logique changée.

