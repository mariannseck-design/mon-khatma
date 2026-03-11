

## Séparer le message de succès en deux lignes

**Fichier** : `src/pages/MurjaCalendarPage.tsx`, lignes 309-311

Remplacer le `<p>` unique par deux lignes distinctes :

```tsx
<div className="flex flex-col">
  <p className="text-xs font-bold" style={{ color: '#10B981' }}>Alhamdulillah !</p>
  <p className="text-[11px] font-medium" style={{ color: '#10B981' }}>Programme du jour terminé.</p>
</div>
```

"Alhamdulillah !" en gras sur la première ligne, "Programme du jour terminé." en dessous, plus léger.

