

## Plan : 3 petites modifications textuelles

### Fichiers modifiés

**1. `src/components/hifz/HifzStepWrapper.tsx` (ligne 90)**
- Remplacer `Pause — revenir à l'accueil` par simplement `Pause`

**2. `src/components/hifz/HifzStep4Validation.tsx`**
- Ligne 265 : Remplacer `Conseil spirituel` par `Conseil`
- La note privacy (Lock + texte) sous le dictaphone : la masquer par défaut (`showAdvice` style), ou plus simplement la supprimer du rendu visible et la déplacer dans le bloc collapsible "Conseil". Non — l'utilisatrice demande de **cacher le texte sous l'audio**. En regardant les screenshots, le texte "Tes enregistrements restent sur ton appareil..." apparaît visible en permanence. Il faut le cacher par défaut, avec un petit bouton discret pour l'afficher (ou le mettre dans le collapsible Conseil).

→ Approche : retirer les deux instances de la note privacy (sous le micro et sous les boutons Parfait/Erreur) et les remplacer par un unique petit lien discret "🔒 Confidentialité" qui, au clic, affiche le texte en toggle.

