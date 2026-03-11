

## Réorganisation de la navigation et création d'un onglet Hifz dédié

### Nouvelle barre de navigation (4 onglets)

```text
Avant :  Accueil | Ramadan | Dhikr | Profil
Après :  Accueil | Hifz   | Ramadan | Dhikr
```

- **Profil** : supprimé de la nav, accessible uniquement via l'avatar dans le Header (déjà en place)
- **Hifz** : nouvel onglet en position 2 (icône `BookOpenCheck`)
- **Ramadan** : avance en position 3
- **Dhikr** : prend la position 4

### Nouvelle page Hifz Hub (`/hifz-hub`)

Une page d'accueil dédiée au Hifz qui regroupe les 4 cartes vertes actuellement sur la page d'accueil, mais avec les deux méthodes **séparées** en cartes distinctes :

1. **Méthode Tikrar-ISTIQÂMAH¹** — carte individuelle, lien vers `/hifz`
2. **Méthode Oustaz Mourad** — carte individuelle, lien vers `/methode-mourad`
3. **Muraja'a** — carte avec badge de révisions en attente, lien vers `/muraja`
4. **Mon Suivi Hifz** — carte statistiques, lien vers `/hifz-suivi`

Design : même style émeraude/or que les cartes actuelles, mais chacune en carte autonome pleine largeur.

### Fichiers modifiés

| Fichier | Changement |
|---|---|
| `src/components/layout/Navigation.tsx` | Remplacer les 4 items : Accueil, Hifz (`/hifz-hub`, `BookOpenCheck`), Ramadan, Dhikr. Retirer Profil. |
| `src/pages/HifzHubPage.tsx` | **Nouveau** — page hub avec les 4 cartes (extraites de AccueilPage) séparées |
| `src/pages/AccueilPage.tsx` | Retirer le bloc "Espace Hifz + Méthode Mourad" (lignes ~388-460), la carte Muraja'a (~464-516) et Mon Suivi (~518-547) |
| `src/App.tsx` | Ajouter route `/hifz-hub` → `HifzHubPage` (protégée) |

### Détails techniques

- La page `HifzHubPage` réutilisera les mêmes constantes `COLORS`, le même style de cartes arrondies émeraude, et les mêmes données (session active Hifz, pendingReviews) via les mêmes hooks/queries existants.
- Le lien Profil dans le Header (avatar dropdown) existe déjà et continuera de fonctionner.
- La route `/profil` reste inchangée, seul l'accès via la nav bottom est supprimé.

