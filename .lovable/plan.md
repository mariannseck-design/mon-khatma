

## Navigation swipe + flèches et contrôle taille arabe dans DhikrSession

### Changements

**`src/components/dhikr/DhikrSession.tsx`**
1. **Flèches gauche/droite** : Ajouter des boutons `ChevronLeft` / `ChevronRight` dans le header pour naviguer manuellement entre les dhikrs (précédent/suivant), désactivés aux extrémités.
2. **Swipe horizontal** : Ajouter des handlers `onTouchStart`/`onTouchEnd` sur le conteneur principal pour détecter un swipe gauche (→ dhikr suivant) ou droite (→ dhikr précédent), avec un seuil de 50px et vérification que le swipe est bien horizontal.
3. **Contrôle taille arabe** : Ajouter un mini contrôle `AArrowUp`/`AArrowDown` (ou `ZoomIn`/`ZoomOut`) dans le header. L'état `arabicSize` (3 niveaux : petit/normal/grand) est stocké en `localStorage` et passé en prop à `DhikrCounter`.

**`src/components/dhikr/DhikrCounter.tsx`**
1. Accepter une nouvelle prop `arabicFontSize` (nombre en rem ou px).
2. Appliquer cette taille au paragraphe du texte arabe (ligne 80) via `fontSize: arabicFontSize`.

### Détails techniques

| Élément | Implémentation |
|---------|---------------|
| Swipe | `touchStartX/Y` refs, seuil 50px, horizontal dominant |
| Flèches | `ChevronLeft`/`ChevronRight` dans le header, `setCurrentIndex` |
| Taille arabe | 3 niveaux `[1.3, 1.7, 2.2]` rem, persisté `localStorage('dhikr-arabic-size')` |
| Navigation | Reset du compteur via changement de `currentIndex` (déjà géré par `key={currentIndex}`) |

