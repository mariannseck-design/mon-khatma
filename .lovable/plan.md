

## Plan : Désactiver temporairement le bouton audio Play (Imprégnation Tajweed)

### Contexte
Le bouton Play de l'étape Imprégnation Tajweed a un bug persistant (répétition de syllabe). On le désactive visuellement pour le moment. Tout le code audio existant est conservé intact pour pouvoir le réactiver facilement.

### Changement unique — `src/components/hifz/HifzStepImpregnationTajweed.tsx`

**Désactiver le bouton Play** (lignes ~450-463) :
- Ajouter `disabled` + `opacity-50 cursor-not-allowed` au bouton
- Remplacer `onClick={togglePlay}` par `onClick={undefined}`
- Ajouter un petit texte sous le bouton : "Temporairement indisponible"
- Conserver 100% du code audio (`togglePlay`, `playNextAyah`, refs, etc.) — rien n'est supprimé

Le compteur d'écoute (1-2-3) reste visible mais inactif. Le bouton "Suivant" reste accessible pour passer l'étape manuellement.

