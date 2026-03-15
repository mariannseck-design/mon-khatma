## Constat (depuis ton screenshot + le code)

- Le bouton **“← Retourner à l’accueil”** est actuellement rendu **tout en bas** de `HifzStepWrapper`. Sur mobile, sur l’étape Mémorisation (qui est très longue), il est **souvent hors écran** → on a l’impression qu’il “n’existe pas”.
- Le lien **“Mushaf”** (ouverture du lecteur Coran à une page) est rendu **en haut** du `HifzStepWrapper`, mais si tu es un peu scrollé dans l’étape, tu ne le vois plus. Ton screenshot montre que tu es au milieu de l’étape (toggle Image/Texte/Mon Mushaf visible), donc c’est cohérent que le lien ne soit pas visible à ce moment-là.

## Objectif

Rendre **toujours visibles** (sans scroller) :

1. un bouton **Mushaf** (ouvrir le lecteur à la page correcte)  
2. un bouton **Accueil** (“Retourner à l’accueil”)  
sur **toutes les étapes de mémorisation** (Étape A + Étape B).

## Plan d’implémentation

### 1) Modifier `src/components/hifz/HifzStepWrapper.tsx`

- Ajouter un petit **groupe d’actions flottantes** (FAB) **fixé à l’écran** (pas dans le flux), pour qu’il reste visible même quand on scroll.
- Placement recommandé : **bas-gauche** (`fixed bottom-24 left-4 z-50`) afin de **ne pas chevaucher** le bouton “T” (ZoomControl) qui est déjà en bas-droite.
- Contenu du groupe :
  - **Bouton Mushaf** (icône `BookOpen`) visible dès que la page Mushaf est calculable.
  - **Bouton Accueil** (texte “Accueil” ou icône + libellé) visible si `onPause` est fourni.
- Option UX (important vu que le lecteur Coran est protégé chez toi) :
  - Si l’utilisateur n’a pas l’accès (VIP/admin), soit :
    - on **masque** le bouton Mushaf, soit
    - on le montre **désactivé** avec un message (“Accès requis”) au clic.
  - Je suivrai la logique existante de l’app (accès “hasFullAccess/admin”) pour éviter un bouton qui mène à une page bloquée.

### 2) Vérifier les étapes qui passent `onPause`

- Confirmer que `HifzPage.tsx` passe bien `onPause={handlePause}` à :
  - Intention/Compréhension
  - Imprégnation (Tajweed)
  - Mémorisation
  - Validation
  - Tikrâr  
  (C’est déjà le cas dans le code actuel, donc l’action flottante “Accueil” apparaîtra partout automatiquement.)

### 3) (Optionnel mais conseillé) Garder ou retirer l’ancien lien en bas

- Soit on **garde** l’actuel “← Retourner à l’accueil” en bas (redondant mais ok),
- soit on le **supprime** pour éviter les doublons (je recommande de le supprimer une fois le bouton flottant en place).
- On garde le bouton retourner a la accueil il est bien la ou il est 

## Tests à faire (checklist)

1. Lancer une session Hifz → vérifier que le bouton **Accueil** est visible **sur chaque étape** sans scroller.
2. Vérifier que le bouton **Mushaf** est visible et ouvre bien `/quran-reader?page=...`.
3. Vérifier qu’aucun bouton ne chevauche le “T” (ZoomControl) et que ça reste utilisable sur mobile (360px de large comme ton écran).

## Questions de clarification (pour choisir le bon comportement)

1. Tu préfères que le bouton Mushaf soit :
  - A) toujours visible pour tout le monde
2. Pour “Accueil”, tu préfères :
  - Le bouton Accueil est bon comme il est ne le change pas 