

## Différencier clairement l'icône des cartes verrouillées

Le problème : le cercle gris avec le petit cadenas (h-2.5) ressemble trop au cercle de validation. L'icône est quasi invisible.

**Fichier** : `src/pages/MurjaCalendarPage.tsx`, lignes 159-171

Remplacer le cercle rond par une icône cadenas plus grande, sans cercle de fond, pour que ce soit immédiatement reconnaissable :

```tsx
{/* Checkbox / Lock */}
<div className="absolute top-2.5 right-2.5 flex items-center justify-center">
  {isChecked ? (
    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: checkColor }}>
      <Check className="h-3 w-3 text-white" />
    </div>
  ) : locked ? (
    <Lock className="h-4 w-4" style={{ color: 'var(--p-text-30)' }} />
  ) : (
    <div className="w-5 h-5 rounded-full" style={{ border: `2px solid ${checkColor}` }} />
  )}
</div>
```

- **Validé** : cercle coloré + coche blanche (inchangé)
- **Verrouillé** : icône cadenas seule, plus grande (h-4), sans cercle — visuellement distinct
- **À faire** : cercle vide avec bordure colorée (inchangé)

