

## Ajouter un tooltip sur l'icône Lightbulb

L'icône `Lightbulb` est actuellement purement décorative — elle ne fait rien au clic. La solution la plus simple et cohérente : transformer l'icône en un bouton avec un **Tooltip** qui affiche une explication pédagogique au tap/hover.

### Changements — `src/pages/MurjaCalendarPage.tsx`

1. **Importer** `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` depuis `@/components/ui/tooltip` (déjà installé via Radix)

2. **Modifier `renderSection`** : Envelopper l'icône `Lightbulb` dans un `Tooltip` avec un texte explicatif :
   - **Ar-Rabt** → "Récitez chaque jour vos versets récents (< 30 jours) pour les ancrer en mémoire."
   - **Consolidation** → "Révisez vos versets anciens selon un algorithme de répétition espacée (SM-2)."

3. **Passer le texte du tooltip** comme paramètre supplémentaire à `renderSection` (ex: `tooltipText: string`)

4. **Structure du tooltip** :
```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <button type="button" className="inline-flex">
        <Lightbulb className="h-3 w-3" />
      </button>
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-[200px] text-xs">
      {tooltipText}
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

Aucun autre fichier modifié.

