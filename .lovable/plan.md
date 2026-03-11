

## Flèche retour plus discrète et élégante

**Fichier** : `src/pages/MurjaCalendarPage.tsx`, lignes 237-243

Remplacer le bouton carré avec fond et bordure par un simple bouton transparent sans fond ni bordure, avec une icône plus fine et grisée :

```tsx
<button
  onClick={() => navigate('/accueil')}
  className="absolute left-0 p-1.5 rounded-full flex items-center justify-center"
  style={{ color: 'var(--p-text-40)' }}
>
  <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
</button>
```

Changements : suppression du `background` et `border`, passage à `rounded-full`, couleur atténuée (`--p-text-40`), trait fin (`strokeWidth=1.5`).

