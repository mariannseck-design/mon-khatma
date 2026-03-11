

## Centrer le texte sur toute la barre

Le texte est décalé à droite à cause de l'icône Sparkles à gauche et du `flex items-center gap-2.5`. Pour centrer sur la barre entière :

**Fichier** : `src/pages/MurjaCalendarPage.tsx`, lignes 305-312

Passer la `motion.div` en `flex justify-center` et centrer le contenu texte. Rendre l'icône Sparkles positionnée en absolu à gauche pour ne pas décaler le texte :

```tsx
className="relative flex items-center justify-center rounded-xl px-4 py-3 mb-2"
```

Et l'icône Sparkles en `absolute left-4` :

```tsx
<Sparkles className="absolute left-4 h-4 w-4" style={{ color: '#10B981' }} />
```

Le `div` texte reste centré avec `items-center text-center`.

