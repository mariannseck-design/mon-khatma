

## Plan : Afficher le(s) verset(s) à mémoriser à côté des pastilles

### Objectif
À chaque étape (écoute, lecture, récitation, liaison, erreur), afficher clairement à côté des pastilles de progression quel(s) verset(s) sont à mémoriser. Conserver les couleurs dorées existantes.

### Changement unique — `src/components/hifz/istiqamah/StepImmersion.tsx`

Ajouter un label textuel juste en dessous de la rangée de pastilles (ligne ~519), après le `</div>` des pastilles :

```tsx
<p className="text-center text-xs font-semibold" style={{ color: '#d4af37' }}>
  {isLiaison
    ? `Mémorise les versets ${liaisonVerses[0]} à ${liaisonVerses[liaisonVerses.length - 1]}`
    : `Mémorise le verset ${currentVerse}`
  }
</p>
```

Ce label sera dynamique :
- **Phase normale** : "Mémorise le verset 12" (verset unique en cours)
- **Phase liaison** : "Mémorise les versets 10 à 12" (plage de versets liés)

Aucune modification des couleurs des pastilles. Aucun autre fichier touché.

