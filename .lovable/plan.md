

## Plan : Réafficher les défis en mode inactif avec message "Lancement après le Ramadan"

### Approche

Remplacer le bloc placeholder actuel (lignes 465-490 de AccueilPage.tsx) par les composants `DefiAlMulk` et `DefiAlBaqara` originaux, mais en leur passant une prop `disabled={true}`. Chaque composant affichera son interface complète (jours cliquables pour Mulk, grille d'objectifs pour Baqara) mais en mode inactif (clics désactivés, opacité réduite).

### Modifications

**1. `src/components/defis/DefiAlMulk.tsx`**
- Ajouter une prop `disabled?: boolean`
- Quand `disabled=true` : ne pas charger depuis la DB, afficher les 7 jours tous décochés, désactiver les clics (pointer-events-none + opacity réduite)
- Pas de compteur en haut à droite ou afficher "0/7" grisé

**2. `src/components/defis/DefiAlBaqara.tsx`**
- Ajouter une prop `disabled?: boolean`
- Quand `disabled=true` : afficher la vue de configuration (grille des objectifs) mais tout en mode inactif
- Remplacer le bouton "Lancer le défi 🚀" par un bouton désactivé "Lancement après le Ramadan in shâ Allah 🌸"
- Désactiver les clics sur les options d'objectifs

**3. `src/pages/AccueilPage.tsx`**
- Lignes 465-490 : remplacer le bloc placeholder par les deux composants avec `disabled` :
  ```
  <DefiAlMulk disabled />
  <DefiAlBaqara disabled />
  ```
- Titre "Nos Défis" suivi de "Lancement après le Ramadan 🌸" en sous-titre

