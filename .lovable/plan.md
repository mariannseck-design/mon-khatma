

## Ajustements esthétiques finaux

### 1. Centrage du titre — lignes 236-250

Remplacer le `flex items-center gap-3` par une structure `relative` : la flèche en `absolute left-0`, le titre centré avec `text-center w-full`.

```tsx
<div className="relative flex items-center justify-center">
  <button ... className="absolute left-0 w-8 h-8 ...">
    <ArrowLeft />
  </button>
  <div className="text-center">
    <h1>Mon Programme du Jour</h1>
    <p>Consolide ta mémorisation</p>
  </div>
</div>
```

### 2. Espacement — lignes 292-313

- Ajouter `mb-2` sur le paragraphe "Aujourd'hui" (ligne 293)
- Ajouter `mb-2` sur la `motion.div` du banner de succès (ligne 305)

Concrètement : changer le `space-y-4` parent en gardant tel quel, mais ajouter des marges supplémentaires sur ces deux éléments spécifiques pour plus de respiration.

