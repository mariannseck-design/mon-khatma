

## Plan : Ajouter les références précises sous chaque invocation Chifâ & Sérénité

### 1. Ajouter un champ `source` au type `DhikrItem`

Dans `src/components/dhikr/DhikrCounter.tsx`, ajouter un champ optionnel `source?: string` à l'interface `DhikrItem`.

### 2. Afficher la source dans le compteur

Dans le même composant, afficher `item.source` sous la traduction française — petit texte discret en italique, couleur atténuée.

### 3. Ajouter les références dans `src/lib/adhkarData.ts`

Ajouter le champ `source` à chaque élément de `CHIFA_SERENITE` avec les références précises :

| Invocation | Source |
|---|---|
| Al-Fâtiha | Coran 1:1-7 — Al-Bukhârî n°5007 |
| Âyat al-Kursî | Coran 2:255 — Al-Bukhârî n°5010 |
| Al-Baqarah v.285 | Coran 2:285 — Muslim n°810 |
| Al-Baqarah v.286 | Coran 2:286 — Muslim n°810 |
| Al-Ikhlâs | Coran 112:1-4 — Al-Bukhârî n°5017 |
| Al-Falaq | Coran 113:1-5 — Al-Bukhârî n°5017 |
| An-Nâs | Coran 114:1-6 — Al-Bukhârî n°5017 |
| Du'â d'Ayyûb | Coran 21:83 — At-Tirmidhî n°3505 |
| Sérénité du cœur | Coran 13:28 |
| Du'â de Yûnus | Coran 21:87 — At-Tirmidhî n°3505 |
| Contre l'angoisse | Al-Bukhârî n°6369 |
| En cas de détresse | Abû Dâwûd n°5090 — Sahîh |
| Confiance en Allah | Coran 3:173 — Al-Bukhârî n°4563 |
| Ruqyah du malade | Al-Bukhârî n°5675, Muslim n°2191 |
| Poser la main | Muslim n°2202 |
| Demande de guérison 7x | Abû Dâwûd n°3106, At-Tirmidhî n°2083 |
| Mu'awwidhat | Al-Bukhârî n°5016 |
| Contre le mauvais œil | Al-Bukhârî n°3371 |
| Guérison par le Coran | Coran 17:82 |
| Visite du malade | Al-Bukhârî n°3616 |
| Ash-Shu'arâ' v.80 | Coran 26:80 |

### Fichiers modifiés
- `src/components/dhikr/DhikrCounter.tsx` — ajouter `source?` au type + affichage
- `src/lib/adhkarData.ts` — ajouter `source` à chaque item de `CHIFA_SERENITE`

