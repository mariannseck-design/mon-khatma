

## Plan : Choix du mode d'affichage dans le Tikrar (Image Mushaf vs Texte Tajwid)

### Objectif
Ajouter un sélecteur en haut du Step 3 (Tikrar) permettant à l'utilisatrice de choisir entre :
- **Mode Mushaf** : Image Tajwid du Mushaf (comme dans Step 2 — CDN hafs-tajweed)
- **Mode Texte** : Texte local Tanzil avec couleurs Tajwid (implémentation actuelle)

Le choix est persisté en localStorage et s'applique dynamiquement pendant toute la session Tikrar.

### Changements

#### `src/components/hifz/HifzStep3Memorisation.tsx`

1. **Nouvel état `displayMode`** : `'text' | 'mushaf'`, persisté dans localStorage (`hifz_display_mode`)

2. **Sélecteur visuel** : Deux boutons style toggle placés juste sous le titre "L'ancrage d'acier", avant le guide :
   - 📖 **Texte Tajwid** (icône `BookOpen`)
   - 🖼️ **Mushaf Image** (icône `Image`)
   - Style cohérent avec le thème émeraude/or existant

3. **Mode Mushaf** : Quand sélectionné, afficher l'image du Mushaf (même source CDN que Step 2) dans un conteneur scrollable zoomable, à la place du texte Tanzil. Les 3 phases du Tikrar s'appliquent de la même façon :
   - Phase 1-10 : Image visible + audio
   - Phase 11-15 : Image visible, audio discret
   - Phase 16+ : Image masquée, bouton "Vérifier" pour aperçu temporaire

4. **Calcul de la page Mushaf** : Utiliser `SURAHS[surahNumber].startPage` (même logique que Step 2)

5. **Import** : Ajouter `Image` de lucide-react et `SURAHS` de surahData

Aucun autre fichier à modifier — tout est contenu dans Step 3.

