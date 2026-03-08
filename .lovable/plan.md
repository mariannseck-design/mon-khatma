

## Plan : 3 améliorations sur l'étape 4 Validation

### 1. Permettre plus de 3 récitations (mode libre)
Après les 3 succès obligatoires, au lieu de verrouiller directement, proposer un bouton "Continuer à réciter" qui permet d'enchaîner des récitations bonus (compteur affiché mais non bloquant). Le bouton "Valider mon Hifz" reste toujours accessible.

**Changement** : Sur l'écran `validated`, ajouter un état `bonusMode` avec un compteur `bonusCount`. L'écran affiche "3 + X récitations" et deux boutons : "Réciter encore" (relance le dictaphone) et "Valider mon Hifz".

### 2. Rendre le texte spirituel réductible/masquable
Transformer le bloc citation "Si vous éprouvez le moindre doute..." en un accordéon collapsible avec un chevron. Par défaut ouvert au premier affichage, puis l'utilisatrice peut le replier.

**Changement** (lignes 225-230) : Ajouter un state `showAdvice` (défaut `true`), un bouton chevron pour toggle, et animer le contenu avec AnimatePresence.

### 3. Mention "audios non conservés"
Ajouter une petite note discrète sous le dictaphone (icône cadenas + texte) : "🔒 Tes enregistrements restent sur ton appareil et sont supprimés automatiquement."

**Changement** : Ajouter un paragraphe discret sous le bouton micro / sous les boutons Parfait/Erreur.

### Fichier modifié
- `src/components/hifz/HifzStep4Validation.tsx` uniquement

