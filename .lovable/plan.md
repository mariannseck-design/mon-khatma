

## Plan : Ajouter un lien discret "Accueil" sur l'écran "Session en cours"

### Modification

**`src/pages/HifzPage.tsx`** — Dans le bloc `showResumePrompt` (lignes ~563-564), ajouter un lien discret sous les boutons existants :

```
← Retourner à l'accueil
```

Style identique au lien discret déjà utilisé dans `HifzStepWrapper` : texte 10px, opacité 0.25, aligné à droite, avec navigation vers `/accueil`.

### Détail technique

- Ajouter un `useNavigate()` (déjà importé dans le fichier)
- Insérer un `<button>` après le `div.flex.flex-col.gap-3` (ligne ~563), avec `onClick={() => navigate('/accueil')}`
- Style : `text-[10px]`, `color: rgba(255,255,255,0.25)`, aligné en bas à droite, avec `motion` delay 1.5s pour apparition progressive

