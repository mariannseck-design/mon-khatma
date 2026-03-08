## Plan : Améliorer le message de bienvenue + sauvegarde automatique de page

### 1. Refonte du message de bienvenue (`QuranReaderPage.tsx`)

Le texte actuel mentionne "tajwid" ce qui peut confondre. Nouveau contenu :

- **Titre** : "Bienvenue"
- **Corps** : "Tu peux lire le Coran en **mode Mushaf** (image) ou en **mode Texte**. Tu peux aussi marquer ta page pour la retrouver facilement."
- **Sous-texte** : "Change de mode et accède aux réglages via le bouton ⚙️ en bas de l'écran." (avec icône Settings inline)
- Retirer toute mention de tajwid et traduction dans ce message
- Garder le même style visuel (crème/doré)

### 2. Sauvegarde automatique + prompt de sortie (`QuranReaderPage.tsx`)

- Ajouter un état `lastReadPage` qui se met à jour à chaque changement de page via `localStorage` (`quran_last_read_page`)
- Quand l'utilisateur clique sur "Retour" (bouton ArrowLeft) :
  - Si pas de bookmark actif et que la page actuelle est différente de la dernière page marquée → afficher un mini dialogue "Marquer cette page ?" avec 2 boutons : "Marquer" (enregistre le bookmark) et "Quitter" (quitte sans marquer)
  - Si bookmark existe déjà → quitter directement
- La page est toujours sauvegardée automatiquement dans `quran_reader_page` (déjà le cas), donc même sans bookmark l'utilisateur retrouve sa page au retour

### 3. Fix traduction mode texte (`QuranTextView.tsx`)

Le code de traduction semble correct (fetch API + affichage). Le problème est probablement que `showTranslation` n'est pas passé ou que le toggle n'est pas visible. Vérifier que la prop `showTranslation={translationEnabled}` est bien câblée dans QuranReaderPage (c'est déjà le cas dans le code fourni). Le bug pourrait être que le toggle traduction n'apparaît que quand `viewMode === 'text'` — à vérifier dans ReaderSettingsPanel et s'assurer qu'il est bien visible.

### Fichiers modifiés


| Fichier                                        | Action                                                    |
| ---------------------------------------------- | --------------------------------------------------------- |
| `src/pages/QuranReaderPage.tsx`                | Refonte texte intro + dialogue "marquer avant de quitter" |
| `src/components/quran/ReaderSettingsPanel.tsx` | Vérifier visibilité toggle traduction en mode texte       |
