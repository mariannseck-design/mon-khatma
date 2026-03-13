

## Changements

### 1. `src/components/hifz/HifzStep5Tikrar.tsx`
- **Ligne 142** : Remplacer "Tikrar Final" par "Tikrâr" (le wrapper affiche déjà "Étape 5/5 · Tikrâr" et la ligne sourate/versets/page en dessous)
- La ligne sourate/versets/page est déjà gérée par `HifzStepWrapper` — rien à ajouter ici

### 2. `src/components/hifz/istiqamah/StepTikrarFinal.tsx`
- **Ligne 40** : Remplacer "Le Compteur Tikrar" par "Tikrâr"
- **Lignes 42-44** : Rendre l'affichage sourate/versets plus élégant avec un style badge/chip doré (fond semi-transparent doré, coins arrondis, icône décorative) au lieu du simple texte gris actuel

```text
Avant :  Al-Baqara · Versets 70-76   (texte gris simple)

Après :  ╭─────────────────────────────╮
         │  📖  Al-Baqara · v.70–76   │
         ╰─────────────────────────────╯
         (badge doré semi-transparent, centré)
```

Deux fichiers, modifications cosmétiques uniquement.

