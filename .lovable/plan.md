

## Remplacer le texte inline par un tooltip sur l'icône lampe

**Fichier** : `src/pages/MurjaCalendarPage.tsx`

1. **Import** : ajouter `Tooltip, TooltipContent, TooltipProvider, TooltipTrigger` depuis `@/components/ui/tooltip`

2. **`renderSection`** (lignes 193-196) : remplacer le bloc texte + lampe par une lampe cliquable avec tooltip :

```tsx
<div className="flex items-center gap-2">
  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: labelColor }}>{label}</p>
  <span className="text-[10px] font-medium" style={{ color: 'var(--p-text-40)' }}>· {subtitle}</span>
  <TooltipProvider delayDuration={0}>
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="ml-auto p-1 rounded-full" style={{ color: labelColor }}>
          <Lightbulb className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[220px] text-xs">
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</div>
```

Cela fusionne la ligne titre + lampe en une seule ligne, supprime le paragraphe descriptif, et affiche le texte au survol/tap de la lampe. Gain d'espace vertical immédiat.

