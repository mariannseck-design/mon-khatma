

## Plan : Remplacer l'icône du PhaseHeader par deux petites lignes dorées en vague

### Fichier : `src/components/hifz/istiqamah/StepImmersion.tsx`

### Changement (lignes 399-408)

Dans le composant `PhaseHeader`, supprimer l'icône (`<Icon>`) et remplacer les trois éléments (ligne + icône + ligne) par **deux petites lignes dorées ondulées** très discrètes, en SVG inline :

```tsx
const PhaseHeader = ({ iconColor, title, subtitle }: { iconColor: string; title: string; subtitle: string }) => (
  <div className="text-center space-y-1">
    <div className="flex items-center justify-center gap-3 mb-0.5">
      <svg width="32" height="6" viewBox="0 0 32 6" fill="none">
        <path d="M0 3 Q8 0 16 3 Q24 6 32 3" stroke="#d4af37" strokeWidth="1" strokeOpacity="0.3" fill="none" />
      </svg>
      <svg width="32" height="6" viewBox="0 0 32 6" fill="none">
        <path d="M0 3 Q8 6 16 3 Q24 0 32 3" stroke="#d4af37" strokeWidth="1" strokeOpacity="0.3" fill="none" />
      </svg>
    </div>
    <h3>...</h3>
    <p>...</p>
  </div>
);
```

- Retirer le paramètre `icon` et `iconBg` de `PhaseHeader` et de ses appels (4 usages dans le fichier)
- Les deux SVG forment un motif symétrique de vagues dorées très subtiles (opacité 0.3)

