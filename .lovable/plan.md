

# Correction de l'icone iPhone avec le nouveau logo

## Contexte

Tu as partagé l'image haute résolution du Coran doré. Elle va servir à générer les icônes Apple Touch aux tailles requises pour résoudre le problème intermittent du "fond vert avec la lettre M" sur iPhone.

## Plan d'implémentation

### Etape 1 : Copier l'image source dans le projet

Copier l'image uploadée dans `public/` comme base pour les icônes.

### Etape 2 : Mettre à jour les icônes PWA et Apple Touch

- Copier cette image comme nouveau `apple-touch-icon.png` (elle sera utilisée par iOS)
- Mettre à jour les icônes PWA (`pwa-192x192.png`, `pwa-512x512.png`) avec cette nouvelle image
- Le favicon restera inchangé (sauf si tu le souhaites aussi)

### Etape 3 : Ajouter les balises Apple Touch Icon avec tailles multiples

Dans `index.html`, ajouter des déclarations explicites avec l'attribut `sizes` :

```html
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=3" />
<link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon.png?v=3" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3" />
```

### Etape 4 : Incrémenter la version du cache

Passer de `?v=2` à `?v=3` sur toutes les références d'icônes dans :
- `index.html` (favicon + apple-touch-icon)
- `vite.config.ts` (manifest PWA)

Cela forcera tous les appareils à recharger les nouvelles icônes.

## Limitation importante

L'image fournie est rectangulaire (pas carrée). Sur iOS, les icônes doivent être **carrées** (idéalement 512x512 ou 1024x1024). L'image sera recadrée ou redimensionnée pour s'adapter au format carré -- le Coran sera centré dans l'icône.

## Estimation

1 credit pour l'implémentation complète.

