

## Embellir le Countdown et la Checklist Rabt

### 1. Countdown (MurajaCountdown.tsx)
- Agrandir légèrement le cercle (w-40 h-40) et épaissir le trait SVG (strokeWidth 4→5)
- Ajouter un **glow subtil** autour du cercle intérieur (`box-shadow: 0 0 20px rgba(6,95,70,0.12)`)
- Texte du compteur plus grand (text-2xl) avec un léger letter-spacing
- Ajouter un dégradé SVG (émeraude → vert clair) sur l'arc de progression au lieu d'une couleur plate
- Fond intérieur avec un très léger dégradé radial (blanc vers vert d'eau)

### 2. Checklist items (MurajaChecklist.tsx)
- **Checkbox dorée** pour les items cochés (background `#D4AF37` au lieu de `var(--p-accent)`) — cohérence avec la charte Or
- Barre de progression Rabt un peu plus épaisse (h-2 au lieu de h-1.5) avec coins mieux arrondis
- Ajouter une **bordure dorée subtile** sur les items Rabt (`border-left: 3px solid #D4AF37`)
- Items cochés : animation check plus satisfaisante (scale spring)
- Boutons de rating Tour : coins plus arrondis (rounded-xl) et padding légèrement augmenté

Deux fichiers modifiés, purement cosmétique.

