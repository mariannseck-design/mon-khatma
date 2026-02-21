

# Remplacer le logo sur la page de connexion (AuthPage)

## Probleme

La page de connexion (`AuthPage.tsx`) n'utilise pas l'image du logo. Elle affiche une icone vectorielle `BookOpen` dans un carre vert menthe. Il faut la remplacer par le nouveau logo (image du Coran dore).

La landing page utilise deja le fichier `src/assets/logo.png` qui a ete mis a jour -- le probleme est probablement du au cache du navigateur.

## Ce qui sera fait

### 1. AuthPage - Remplacer l'icone par l'image du logo

Dans `src/pages/AuthPage.tsx` :
- Ajouter l'import de l'image : `import logo from '@/assets/logo.png'`
- Remplacer le bloc avec l'icone `BookOpen` par une balise `<img>` affichant le nouveau logo
- Supprimer l'import inutile de `BookOpen` si plus utilise ailleurs

### Avant (code actuel)
```tsx
<div className="w-20 h-20 rounded-3xl bg-gradient-mint mx-auto flex items-center justify-center mb-4 shadow-lg">
  <BookOpen className="h-10 w-10 text-primary-foreground" />
</div>
```

### Apres (nouveau code)
```tsx
<img src={logo} alt="Ma Khatma" className="w-20 h-20 rounded-3xl mx-auto mb-4 shadow-lg object-contain" />
```

## Fichiers modifies

- `src/pages/AuthPage.tsx` : remplacement de l'icone par l'image du logo

