

## Modifications

### 1. MurajaChecklist — Compacter le message "Alhamdulillah" (lignes 127-159)
- Réduire le padding, mettre le PartyPopper et le texte sur une seule ligne
- Raccourcir le texte : remplacer "Alhamdulillah, tu as terminé tes révisions pour aujourd'hui !" par une version plus courte comme "Alhamdulillah, révisions terminées !"
- Garder les prochaines révisions en dessous mais compact

### 2. MurajaCountdown — Ajouter la date du jour + compacter (lignes 34-38)
- Remplacer "Révisions du jour terminées ✓" par "Révisions du mercredi 11 mars terminées ✓" (date dynamique avec `toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })`)
- Réduire le padding global (`p-5` → `p-3`) et l'espacement (`space-y-3` → `space-y-2`)

### 3. MurjaPage — Mettre "Consolidation · Révision espacée" sur une ligne (lignes 576-585)
- Fusionner le label "Consolidation", "· Révision espacée", le badge count et le bouton info sur une seule ligne compacte (déjà le cas via flex, mais vérifier qu'il n'y a pas de `space-y` qui force un retour)

### Fichiers modifiés
- `src/components/muraja/MurajaChecklist.tsx`
- `src/components/muraja/MurajaCountdown.tsx`

