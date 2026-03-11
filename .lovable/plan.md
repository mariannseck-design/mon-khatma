

## Ajouter un compteur de progression dans le header

**Fichier** : `src/pages/MurjaCalendarPage.tsx`

**Modification** (ligne 250) : Remplacer le sous-titre statique par un compteur dynamique qui reflète `totalDone / totalItems` pour le jour sélectionné.

```tsx
<p className="text-[11px] font-medium" style={{ color: 'var(--p-text-40)' }}>
  {totalItems > 0 
    ? `${totalDone}/${totalItems} terminés`
    : 'Consolide ta mémorisation'}
</p>
```

Le compteur utilise `totalDone` et `totalItems` déjà calculés dans le composant (lignes ~100-103), qui se mettent à jour instantanément via `checkedIds`. Quand il n'y a aucune tâche, le texte original est conservé.

