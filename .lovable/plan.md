

## Problème identifié

Dans `renderCard` (ligne 160), la condition `isChecked` est évaluée **avant** `locked`. Les items Ar-Rabt validés aujourd'hui sont dans `checkedIds`, donc même sur un jour futur, ils affichent la coche au lieu du cadenas.

De plus, sur les jours futurs, les items Ar-Rabt passent en `pending` (ligne 309) mais s'ils ont été cochés aujourd'hui, `checkedIds.includes(item.id)` retourne `true` → la coche s'affiche.

## Correction

**Fichier** : `src/pages/MurjaCalendarPage.tsx`, ligne 160

Inverser la priorité : vérifier `locked` avant `isChecked` dans le rendu de l'icône :

```tsx
{locked ? (
  <Lock className="h-4 w-4" style={{ color: 'var(--p-text-30)' }} />
) : isChecked ? (
  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: checkColor }}>
    <Check className="h-3 w-3 text-white" />
  </div>
) : (
  <div className="w-5 h-5 rounded-full" style={{ border: `2px solid ${checkColor}` }} />
)}
```

Et aussi ajuster la logique d'opacité (ligne 149) pour que `locked` prenne le dessus :

```tsx
opacity: locked ? 0.7 : isChecked ? 0.5 : 1,
```

Cette ligne est déjà correcte (locked en premier), mais le rendu de l'icône ne l'était pas. Seul le bloc conditionnel de l'icône (lignes 160-168) nécessite la correction.

