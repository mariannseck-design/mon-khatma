

## Refonte de la page Muraja'a — Interface calme et aérée

### 1. Header minimaliste + Récap rétractable
**`src/pages/MurjaPage.tsx`** :
- Réduire le header : supprimer le gros bloc icône/titre, le remplacer par une ligne compacte (icône + titre + bouton Actualiser discret à droite)
- Envelopper `MurajaWeeklyRecap` dans un `Collapsible` (déjà disponible via Radix) fermé par défaut, avec un bandeau horizontal compact comme déclencheur affichant les 3 stats clés (versets, jours actifs, sessions) en ligne

**`src/components/muraja/MurajaWeeklyRecap.tsx`** :
- Refactorer pour exposer les stats dans un format compact (bandeau horizontal) quand replié
- Le graphique en barres et les détails des sourates ne s'affichent qu'une fois déplié

### 2. Titre parent unifié « Mon Programme du Jour »
**`src/pages/MurjaPage.tsx`** :
- Ajouter un titre parent `Mon Programme du Jour` avec un badge compteur total
- Les sous-sections Ar-Rabt et Consolidation deviennent des sous-titres légers (texte + pastille colorée, sans les gros badges ronds)
- Réduire le `space-y` entre les deux sections de `space-y-6` à `space-y-3`

### 3. Design unifié des cartes
**`src/components/muraja/MurajaChecklist.tsx`** :
- Uniformiser les bordures : toutes les cartes utilisent `1px solid var(--p-border)` + le même `border-radius` et `padding`
- Remplacer `v.` par une icône `BookOpen` (📖) de 12px et `p.` par une icône `FileText` (📄) de 12px
- Conserver le code couleur : bordure gauche dorée (#D4AF37) pour Ar-Rabt, émeraude (#10B981) pour Consolidation

### 4. Bouton Actualiser intégré
**`src/pages/MurjaPage.tsx`** :
- Supprimer le bloc `Actions` en bas de page avec le bouton Actualiser centré
- Intégrer un petit bouton icône `RefreshCw` dans le header compact, aligné à droite
- Le bouton flottant « T » (DevSkipButton) n'est pas présent sur cette page — pas de changement nécessaire

### 5. Bannière de célébration conditionnelle
**`src/pages/MurjaPage.tsx`** :
- Quand `allDailyChecked` est vrai, afficher une bannière animée (motion) en haut du programme avec confettis légers et le message « Alhamdulillah »
- Supprimer le bloc fixe `PartyPopper` qui s'affiche quand `totalBlocks === 0`
- Le composant `MurajaCelebration` (modal overlay) reste pour les cycles complets

### Résumé des fichiers modifiés
- `src/pages/MurjaPage.tsx` — restructuration layout, header compact, titre unifié, bouton refresh intégré, bannière succès
- `src/components/muraja/MurajaChecklist.tsx` — icônes au lieu de texte, style de carte unifié
- `src/components/muraja/MurajaWeeklyRecap.tsx` — version compacte rétractable

