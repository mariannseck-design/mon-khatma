## Refonte visuelle : Carte "Lis le Noble Coran" + Barre d'outils Mushaf

### 1. Carte d'accueil "Lis le Noble Coran" (`AccueilPage.tsx`, lignes 196-229)

**Fond et bordure :**

- Remplacer le dégradé beige plat par un fond crème riche `#f5eed6` avec un dégradé subtil turquoise vers les bords (`rgba(90,180,180,0.08)`)
- Ajouter une bordure double dorée ornée via `border: 2px solid` + `box-shadow` inset doré (`rgba(180,150,60,0.3)`)
- Ajouter un motif de filigrane doré via un pseudo-élément CSS ou un dégradé radial doré semi-transparent en overlay

**Icône :**

- Remplacer la couleur de l'icône `BookOpenCheck` par un or profond `#8a6d1b` avec un fond doré texturé `rgba(180,150,60,0.25)`
- Ajouter une touche turquoise dans la base via un `box-shadow` bleu-vert subtil

**Texte :**

- Titre "LIS LE NOBLE CORAN" : couleur or-bronze poli `#6b5417` au lieu de `#8a6d1b`
- Sous-titre "604 pages..." : garder marron doux existant 
- Ici le texte dois juste etre LIS LE NOBLE CORAN

**Bouton T flottant (admin) :**

- Ajouter un petit badge/bouton vert texturé avec lueur turquoise via `box-shadow: 0 0 8px rgba(90,180,180,0.4)`

Appliquer les memes changements a la version inactive (non-admin, lignes 214-229) sans l'opacite excessive.

### 2. Barre d'outils Mushaf simplifiée (`QuranReaderPage.tsx`, lignes 315-479)

**Nouvelle structure :**

```text
┌─────────────────────────────────────────┐
│ [←]  │  Sourate · Page XX  │ [▶] [🔖] [⚙] │
└─────────────────────────────────────────┘
```

- **Gauche** : Bouton retour
- **Centre** : Nom sourate + numéro de page (cliquable pour saisir page)
- **Droite** : Play, Bookmark, Settings (engrenage)

**Supprimer de la barre** : Bouton List (sourates), sélecteur récitateur inline, toggle vue, toggle taille texte. Tout cela migre dans le panneau Paramètres.

**Style turquoise :**

- Fond de la barre : `rgba(90,180,180,0.08)` sur crème, ou `rgba(90,180,180,0.12)` sur fond nuit
- Icônes actives : couleur turquoise `#4a9a9a`
- Bordures et textes : tons dorés/marron conservés

### 3. Panneau Paramètres enrichi (`ReaderSettingsPanel.tsx`)

Ajouter dans le panneau existant :

- **Sélecteur de sourate** : Bouton ouvrant le SurahDrawer (remplace le bouton List de la barre)
- **Toggle vue** Image/Texte (deja present)
- **Taille texte** avec les 4 niveaux (Petit/Moyen/Grand/Très Grand) via des boutons au lieu de +/-
- **Récitateur** (deja present)
- **Mode nuit** (deja present)

Style du panneau : fond crème `#f7f3eb` avec bordure dorée subtile, titre en Playfair Display.

### 4. Fichiers modifiés


| Fichier                   | Changements                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `AccueilPage.tsx`         | Refonte visuelle carte Quran (admin + inactive) : fond crème texturé, bordure dorée, touches turquoise              |
| `QuranReaderPage.tsx`     | Simplifier barre : Retour / Centre info / Play+Bookmark+Settings. Supprimer contrôles inline. Fond turquoise subtil |
| `ReaderSettingsPanel.tsx` | Ajouter sélecteur sourate, taille texte 4 niveaux, passer `onShowSurahDrawer` en prop                               |
