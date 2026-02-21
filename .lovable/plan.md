

# Reduire la taille verticale des videos tutoriels

## Ce qui sera fait

Les videos tutoriels sur la page d'accueil seront affichees dans un format plus compact verticalement, en utilisant un ratio d'aspect fixe et en limitant leur hauteur maximale. Cela evitera que les videos prennent trop de place sur l'ecran.

## Details techniques

### Modification de `src/pages/AccueilPage.tsx`

Chaque element `<video>` sera enveloppe dans un conteneur avec une hauteur maximale limitee (`max-h-[200px]`) et un `object-fit: cover` pour que la video reste bien cadree sans deformer l'image :

```
<video> avec les classes supplementaires :
- max-h-[200px] : limite la hauteur a 200px
- object-cover : garde le cadrage proportionnel
- w-full : reste en pleine largeur
```

Cela reduira significativement l'espace vertical occupe par les deux videos tout en gardant leur lisibilite.

## Estimation

1 credit.

