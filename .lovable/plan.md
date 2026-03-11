

## Enrichir la configuration de la Méthode Oustaz Mourad

### Problème
Le `MouradConfig` est trop simple comparé au `HifzConfig` : pas de suggestion automatique du prochain passage, pas de sélection par page, et pas de visibilité sur ce qui est déjà mémorisé.

### Modifications sur `src/components/mourad/MouradConfig.tsx`

**1. Auto-suggestion du prochain passage**
- Importer `useAuth` et `findNextStartingPoint` depuis `hifzUtils`
- Au chargement, appeler `findNextStartingPoint(user.id)` pour pré-remplir sourate/versets
- Afficher un message "💡 Suggestion : continuer avec {surahName}" si une suggestion existe

**2. Sélection par page (Mushaf)**
- Ajouter un toggle Sourate / Page comme dans HifzConfig
- En mode Page : deux champs (page début / page fin, 1-604)
- Au lancement, convertir la plage de pages en versets via `getPageAyahs` (même logique que HifzConfig)

**3. Historique des sessions terminées**
- Requêter les `mourad_sessions` complétées de l'utilisateur
- Afficher un petit récapitulatif en bas : "✅ Déjà mémorisé : An-Nas v.1-6, Al-Falaq v.1-5..."
- Limité aux 5 dernières sessions pour ne pas surcharger

### Fichiers modifiés
- `src/components/mourad/MouradConfig.tsx` — ajout des 3 fonctionnalités

### Résultat
L'écran de configuration Mourad proposera automatiquement le prochain passage à mémoriser, permettra de choisir par page du Mushaf, et affichera les portions déjà complétées.

