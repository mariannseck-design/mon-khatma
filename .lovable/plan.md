

## Plan : Ajouter "Chifâ & Sérénité" (Ruqyah) et "Duas Hajj"

### 1. Données — `src/lib/adhkarData.ts`

Ajouter deux nouveaux tableaux exportés :

**`CHIFA_SERENITE`** (~22 items) organisés en sous-groupes via le champ `title` :
- **Protection générale** : Al-Fatiha, Âyat al-Kursî, Al-Baqarah v.285-286, Al-Ikhlâs, Al-Falaq, An-Nâs
- **Apaisement du cœur** : "Rabbî innî massaniya d-durr" (Al-Anbiyâ 83), "Alâ bi-dhikri-llâhi tatma'innu-l-qulûb" (Ar-Ra'd 28), Du'â de Yûnus (عليه السلام), invocation contre l'angoisse et la tristesse
- **Douleurs physiques** : Ruqyah du malade ("Adhhibi-l-ba's"), invocation en posant la main ("Bismi-llâh"), du'â pour la guérison (3x "As'alu-llâha-l-'Azîm"), protection par le souffle (Mu'awwidhat), du'â contre le mauvais œil

Chaque item : arabe complet, translittération, traduction française avec (عز وجل) après Allah et (ﷺ) après le Prophète.

**`HAJJ_DUAS`** (~12 items) : Talbiya, du'â du Tawâf, Sa'î, 'Arafât, Muzdalifah, Minâ, lapidation, sacrifice, etc.

### 2. Carte & routing — `src/pages/DhikrPage.tsx`

Ajouter deux nouvelles cartes dans `dhikrCards` :
- `{ id: 'chifa', title: 'Chifâ & Sérénité', icon: ShieldPlus, bg: '#065F46', text: '#D4AF37', enabled: true }`
- `{ id: 'hajj', title: 'Duas Hajj', icon: Landmark, bg: '#faf8f5', text: '#1b4332', border: '#b5942e', enabled: false }`

Ajouter les entrées correspondantes dans `CATEGORY_DATA`.

### 3. Synchronisation — `src/pages/EmotionsPage.tsx`

Mettre à jour le tableau `dhikrCards` de cette page pour inclure les deux nouvelles cartes avec la même logique admin.

### Fichiers modifiés
- `src/lib/adhkarData.ts` — ~250 lignes ajoutées (deux tableaux)
- `src/pages/DhikrPage.tsx` — ~8 lignes modifiées
- `src/pages/EmotionsPage.tsx` — ~8 lignes modifiées

