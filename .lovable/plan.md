

## Remplacer le Tooltip par un texte toujours visible

Le `Tooltip` sur mobile ne s'affiche qu'au hover (inexistant sur tactile). Solution : remplacer le `Tooltip` + icône `Lightbulb` par le texte explicatif affiché directement sous le label de section, en petit et discret.

**Fichier** : `src/pages/MurjaCalendarPage.tsx`, lignes 193-207

Remplacer le bloc `<div className="flex items-center gap-1">` contenant le subtitle + TooltipProvider par :

```tsx
<span className="text-[10px] font-medium" style={{ color: 'var(--p-text-40)' }}>· {subtitle}</span>
```

Et ajouter une ligne en dessous du header flex avec le texte d'aide :

```tsx
<p className="text-[10px] leading-tight" style={{ color: 'var(--p-text-30)' }}>{tooltipText}</p>
```

Cela supprime l'icône lampe et le Tooltip (inutilisable sur mobile) et affiche le texte d'aide directement sous le titre de section, de manière discrète.

