

# Ajouter une video tutoriel "Comment telecharger l'app sur iPhone" sur la page d'accueil

## Ce qui sera fait

Une section video sera ajoutee sur la page d'accueil, juste au-dessus du bouton "Telecharger l'application". Elle contiendra :

- Un titre : **"Comment installer l'app sur iPhone"**
- Un sous-titre : *"Utilise Safari (et non Google Chrome) pour installer l'application"*
- Les deux videos que tu as partagees, affichees l'une apres l'autre dans une carte arrondie avec le meme style visuel que le reste de la page
- Les videos seront jouables directement sur la page (avec controles natifs : play, pause, plein ecran)

## Emplacement

La section sera placee juste avant le bouton "Telecharger" (CTA orange) sur la page d'accueil, pour que les utilisatrices voient d'abord le tutoriel puis puissent telecharger.

## Details techniques

### Etape 1 : Copier les videos dans le projet

Les deux fichiers video seront copies dans `public/videos/` :
- `public/videos/install-iphone-1.mp4`
- `public/videos/install-iphone-2.mp4`

On utilise le dossier `public/` car les videos sont volumineuses et ne beneficient pas du bundling Vite.

### Etape 2 : Modifier AccueilPage.tsx

Ajouter une nouvelle section animee (avec `motion.div` et `itemVariants` comme le reste de la page) contenant :

```
Titre : "Comment installer l'app sur iPhone"
Sous-titre : "Ouvre Safari (l'icone boussole bleue) et non Google Chrome"
Video 1 : lecture avec controles natifs, coins arrondis
Video 2 : lecture avec controles natifs, coins arrondis
```

La section sera conditionnellement visible uniquement pour les utilisateurs qui n'ont **pas encore installe** l'application (meme condition que le bouton Telecharger : `!isInstalled`).

### Style visuel

- Carte arrondie (`rounded-[2rem]`) avec fond doux (`bg-gradient-to-br from-sky/20 via-accent/10 to-lavender/20`)
- Videos avec coins arrondis (`rounded-2xl`) et ombre legere
- Icone Smartphone a cote du titre
- Coherent avec le design existant de la page

## Estimation

1 credit pour l'implementation.

