

## Plan : Ajouter une flèche retour discrète sur les pages Hifz

### Modification

**`src/components/hifz/HifzStepWrapper.tsx`** — Ajouter un bouton flèche `ChevronLeft` (déjà importé) en haut à gauche du wrapper, très discret :
- Position absolue ou relative, aligné à gauche au-dessus du badge verset
- Icône `ChevronLeft` en 16px, opacité 0.25, qui passe à 0.4 au hover
- Appelle `onBack` au clic
- Apparaît avec un délai comme le bouton "Retourner à l'accueil"
- Style cohérent avec le design existant (couleur blanche très atténuée)

```tsx
{onBack && (
  <motion.button
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.5 }}
    onClick={onBack}
    className="absolute top-0 left-0 p-2 transition-all active:scale-90"
    style={{ color: 'rgba(255,255,255,0.25)' }}
  >
    <ChevronLeft className="h-5 w-5" />
  </motion.button>
)}
```

Le conteneur principal passera en `relative` pour positionner la flèche correctement.

