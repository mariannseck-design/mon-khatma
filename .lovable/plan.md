

## Plan : Compteur de Dhikr interactif avec cercle de progression

### Nouveau composant : `src/components/dhikr/DhikrCounter.tsx`

Composant principal affichant un dhikr avec compteur interactif :

- **Données** : Interface `DhikrItem` avec `arabic`, `phonetic`, `french`, `target` (nombre de répétitions)
- **State** : `count` (0 → target), `completed` (boolean)
- **Cercle de progression SVG** : Anneau qui se remplit progressivement (style Or #D4AF37 sur fond blanc cassé), même pattern que `MurajaCountdown.tsx`
- **Zone cliquable** : Le cercle entier est un bouton — chaque tap incrémente le compteur
- **Haptic feedback** : `navigator.vibrate?.(15)` à chaque tap + effet de rebond via `motion` (scale 0.95 → 1)
- **Validation** : Quand `count === target`, checkmark animé (✓ vert émeraude), vibration longue, transition automatique après 1.5s vers le dhikr suivant

**Layout de la carte** :
```text
┌─────────────────────────────┐
│   بِسْمِ اللَّهِ الَّذِي...    │  ← Arabe, émeraude foncé, serif, grand
│  Bismi l-lâhi l-ladhî...    │  ← Phonétique, italique, gris
│  Au nom d'Allah, celui...    │  ← Traduction, sans-serif légère
│                             │
│        ┌──────┐             │
│        │ 1/3  │             │  ← Cercle SVG, bordure Or
│        └──────┘             │
│      Appuie pour compter    │
└─────────────────────────────┘
```

### Nouveau composant : `src/components/dhikr/DhikrSession.tsx`

Gère la séquence de dhikrs :
- State : `currentIndex` dans la liste
- Transition animée (fade out → fade in) entre chaque dhikr
- Barre de progression globale en haut (X/N dhikrs complétés)
- Bouton retour pour revenir à la grille

### Mise à jour : `src/pages/DhikrPage.tsx`

- Ajouter un state `activeCategory` (null = grille, string = session ouverte)
- Quand on clique sur "Zikr du matin", ouvre `DhikrSession` avec les données de test
- Retirer le badge "Bientôt disponible" de la carte "Zikr du matin" uniquement
- **Données de test** pour valider le système :

```typescript
const TEST_DHIKRS = [
  {
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    phonetic: 'Bismi l-lâhi l-ladhî lâ yadurru ma'a smihi shay'un fî-l-ardi wa lâ fî s-samâ'i wa huwa s-samî'u l-'alîm',
    french: "Au nom d'Allah, celui dont le nom protège de tout mal sur terre et dans les cieux. Il est l'Audient, l'Omniscient.",
    target: 3,
    title: 'La Protection'
  }
];
```

### Design
- Fond : `#FDFBF7` (blanc cassé parchemin)
- Cercle progression : trait Or `#D4AF37`, fond transparent
- Texte arabe : émeraude foncé `#065F46`, taille large, `font-bold`
- Phonétique : gris `#6B7280`, italique, taille petite
- Traduction : `#374151`, taille moyenne
- Checkmark final : émeraude `#065F46` avec animation scale

### Fichiers créés/modifiés
- **Créer** `src/components/dhikr/DhikrCounter.tsx`
- **Créer** `src/components/dhikr/DhikrSession.tsx`
- **Modifier** `src/pages/DhikrPage.tsx` — intégrer la session + données de test

