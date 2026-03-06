

## Suppression du fond gris et des ombres dans le mode texte

### Probleme

Dans `QuranTextView.tsx` ligne 180, le bandeau du nom de sourate utilise un fond crème `#f7f3eb` avec une bordure semi-transparente, ce qui crée un bloc grisâtre visible derrière le texte.

### Modification : `src/components/quran/QuranTextView.tsx`

**Ligne 180** — Supprimer le fond et la bordure du bandeau sourate :

```typescript
// Avant
style={{ background: darkMode ? 'rgba(122,139,111,0.2)' : '#f7f3eb', border: '1px solid rgba(122,139,111,0.15)' }}

// Après
style={{ background: darkMode ? 'rgba(122,139,111,0.2)' : 'transparent', border: 'none' }}
```

Le fond du conteneur principal est déjà blanc pur (`#ffffff`). Seul ce bandeau de titre de sourate ajoute un bloc coloré parasite. En le rendant transparent, tout le texte apparaîtra sur fond blanc uniforme sans aucune ombre ni zone grisée.

