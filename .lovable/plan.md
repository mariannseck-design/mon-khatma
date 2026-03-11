

## Différencier les cartes verrouillées (futurs) des cartes terminées (aujourd'hui)

Le code actuel dans `renderCard` (ligne 149) applique `opacity: 0.45` aux cartes verrouillées et `opacity: 0.5` aux cartes terminées — visuellement quasi identique. L'icône Lock est déjà présente (ligne 170) mais l'apparence globale reste trop similaire.

**Fichier** : `src/pages/MurjaCalendarPage.tsx`, lignes 144-152

Modifier les styles inline du `motion.button` :

```tsx
style={{
  background: locked ? 'color-mix(in srgb, var(--p-card) 85%, rgba(128,128,128,0.15))' : 'var(--p-card)',
  border: '1px solid var(--p-border)',
  borderLeftWidth: '3px',
  borderLeftColor: color,
  opacity: locked ? 0.7 : isChecked ? 0.5 : 1,
  pointerEvents: locked || isChecked ? 'none' : 'auto',
  cursor: locked ? 'not-allowed' : isChecked ? 'default' : 'pointer',
  filter: locked ? 'grayscale(40%)' : 'none',
}}
```

Changements :
- **Cartes verrouillées** : opacity `0.7` (au lieu de `0.45`), fond légèrement grisé, grayscale renforcé à 40%. Elles restent visibles mais clairement "en attente".
- **Cartes terminées** : inchangées (`opacity: 0.5`, coche verte/dorée).
- L'icône Lock et le `pointer-events: none` / `cursor: not-allowed` sont déjà en place et restent actifs.

