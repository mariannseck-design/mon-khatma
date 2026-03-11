

## Ajouter les icônes lampe aux textes descriptifs des sections

**Fichier** : `src/pages/MurjaCalendarPage.tsx`

1. **Import** (ligne 4) : ajouter `Lightbulb` depuis `lucide-react`

2. **`renderSection`** (ligne 193) : transformer la ligne de texte descriptif en ajoutant une icône lampe devant :
```tsx
<div className="flex items-start gap-1.5">
  <Lightbulb className="h-3 w-3 mt-0.5 flex-shrink-0" style={{ color: labelColor }} />
  <p className="text-[10px] leading-tight" style={{ color: 'var(--p-text-30)' }}>{tooltipText}</p>
</div>
```

3. **Texte Consolidation** (ligne 310) : remplacer `'Révisez vos versets anciens selon un algorithme de répétition espacée (SM-2).'` par `'Révisez vos portions plus anciennes au moment idéal pour ne jamais les oublier.'`

