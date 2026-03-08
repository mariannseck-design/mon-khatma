

## Plan : Ajouter la traduction Hamidullah au mode Texte du Coran

### Objectif
Permettre d'afficher la traduction française de Hamidullah sous chaque verset en mode Texte, activable/désactivable via un toggle dans les paramètres.

### Changements

#### 1. `src/components/quran/QuranTextView.tsx`
- Ajouter une prop `showTranslation?: boolean`
- Quand activée, charger la traduction Hamidullah depuis l'API `https://api.alquran.cloud/v1/page/{page}/fr.hamidullah` (même API utilisée dans HifzStep0Intention)
- Modifier le rendu : après chaque verset (après le cercle numéro), afficher la traduction en français dans un bloc distinct, style discret (police system-ui, taille réduite, couleur atténuée)
- Changer le layout : passer d'un flux continu à un rendu verset par verset quand la traduction est active (chaque verset = bloc arabe + traduction en dessous), pour une meilleure lisibilité
- Cache en mémoire par page pour éviter les appels réseau redondants

#### 2. `src/components/quran/ReaderSettingsPanel.tsx`
- Ajouter les props `translationEnabled?: boolean` et `onTranslationChange?: (enabled: boolean) => void`
- Ajouter un toggle "Traduction (Hamidullah)" dans la section mode texte, après le toggle Tajwid, avec icône `Languages` de lucide-react

#### 3. `src/pages/QuranReaderPage.tsx`
- Ajouter l'état `translationEnabled` persisté dans localStorage (`quran_translation`)
- Passer la prop à `QuranTextView` et `ReaderSettingsPanel`

### Fichiers modifiés
| Fichier | Action |
|---|---|
| `src/components/quran/QuranTextView.tsx` | Charger + afficher traduction Hamidullah |
| `src/components/quran/ReaderSettingsPanel.tsx` | Toggle traduction |
| `src/pages/QuranReaderPage.tsx` | État + câblage |

