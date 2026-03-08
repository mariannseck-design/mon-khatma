

## Amélioration UX post-validation Hifz + Barre de Maturité (30 jours)

### 1. Synchronisation automatique — `src/pages/HifzPage.tsx`

**Modifier `completeSession`** (lignes 253-277) pour ajouter `liaison_status: 'liaison'` et `liaison_start_date: today` lors de l'upsert dans `hifz_memorized_verses`. Actuellement ces champs ne sont pas définis, donc les versets tombent directement en "tour". Le `next_review_date` est déjà fixé à J+1, ce qui les fait apparaître dans l'Étape 1 le lendemain.

### 2. Message post-validation — `src/components/hifz/HifzSuccess.tsx`

Remplacer le texte actuel par :
> « C'est validé ! Retrouvez ces versets demain dans votre "Réveil de la Veille" et pendant 30 jours dans votre "Liaison" pour un ancrage parfait. »

### 3. Graduation (Jour 31) — `src/lib/hifzUtils.ts` + `src/pages/MurjaPage.tsx`

Modifier `graduateLiaisonBlocks` pour retourner le nombre de blocs gradués. Dans MurjaPage, après l'appel, si `graduated > 0`, afficher une célébration avec confettis et message :
> « Félicitations ! Vos versets sont désormais ancrés dans votre cœur. Ils rejoignent votre trésor éternel pour l'entretien espacé. »

### 4. Barre de Maturité — `src/pages/MurjaPage.tsx`

Ajouter une nouvelle section **« Mes ancrages en cours (La Liaison) »** entre la section Ar-Rabt et Le Tour. Pour chaque bloc en liaison :
- Carte fond `#FFFFFF`, texte `#1C2421`
- Nom sourate + versets
- Texte « Jour X / 30 » au-dessus d'une barre de progression fine
- Track : `#E6F0ED`, fill : dégradé émeraude `#065F46`
- Calcul : `daysPassed = floor((now - liaison_start_date) / 86400000)`, clamp 0-30

### Fichiers modifiés

| Fichier | Changement |
|---|---|
| `src/pages/HifzPage.tsx` | Ajouter `liaison_status` et `liaison_start_date` dans l'upsert |
| `src/components/hifz/HifzSuccess.tsx` | Nouveau texte post-validation |
| `src/lib/hifzUtils.ts` | `graduateLiaisonBlocks` retourne les blocs gradués |
| `src/pages/MurjaPage.tsx` | Section "Mes ancrages en cours" + célébration graduation |

