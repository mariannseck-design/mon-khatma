
# Ajouter les videos tutoriels et le bouton de telechargement sur la Landing Page

## Ce qui sera fait

1. **Deplacer la section video tutoriel et le bouton de telechargement** depuis `AccueilPage.tsx` vers `LandingPage.tsx` (la page visible avant inscription/connexion)
2. **Ajouter un texte** sous chaque video : "Clique sur le bouton play pour agrandir la video"
3. La section sur `AccueilPage.tsx` restera aussi pour les utilisateurs connectes qui n'ont pas encore installe l'app

## Emplacement sur la Landing Page

La section sera placee juste apres le logo et le texte d'introduction, avant les cartes de fonctionnalites :

```
Logo Ma Khatma
Texte d'introduction
---
Section video tutoriel iPhone (NOUVEAU)
  - Titre : "Comment installer l'app sur iPhone"
  - Sous-titre : "Ouvre Safari et non Google Chrome"
  - Video 1 + texte "Clique sur le bouton play pour agrandir la video"
  - Video 2 + texte "Clique sur le bouton play pour agrandir la video"
---
Bouton Telecharger (NOUVEAU)
---
Cartes de fonctionnalites
Bouton "Commencer mon parcours"
Citation
```

## Details techniques

### Etape 1 : Modifier `LandingPage.tsx`

- Importer `Smartphone`, `Download` depuis `lucide-react`
- Importer `usePWAInstall` depuis `@/hooks/usePWAInstall`
- Ajouter la section video tutoriel avec le meme style que sur `AccueilPage` (carte arrondie, gradient doux)
- Ajouter un texte indicatif sous chaque video : *"Clique sur le bouton play pour agrandir la video"*
- Ajouter le bouton de telechargement (CTA orange) conditionnel (`!isInstalled && isInstallable`)
- La section video sera visible uniquement si l'app n'est pas installee (`!isInstalled`)

### Etape 2 : Mettre a jour le texte sur `AccueilPage.tsx`

- Ajouter le meme texte indicatif sous chaque video : *"Clique sur le bouton play pour agrandir la video"*

## Estimation

1 credit.
