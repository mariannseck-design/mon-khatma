

## Plan : Progression contextuelle, texte Ar-Rabt, et historique mensuel

### 1. Progression contextuelle sur le Hub Muraja'a

**Fichier : `src/pages/MurajaHubPage.tsx`**

Le bloc "PROGRESSION GLOBALE" (lignes 148-176) sera modifié :

- Identifier les sourates distinctes mémorisées via `allVerses`. Si toutes les portions appartiennent à une seule sourate, afficher la progression relative à cette sourate (versets mémorisés / versesCount de la sourate depuis `SURAHS`).
- Si plusieurs sourates : regrouper et afficher la sourate principale (celle avec le plus de versets mémorisés) ou garder un label "Progression actuelle".
- **Supprimer** la ligne `{totalJuz} / 30 juz`.
- **Renommer** le label de "PROGRESSION GLOBALE" → nom de la sourate (ex: "AL-BAQARA") si une seule sourate, ou "PROGRESSION ACTUELLE" si plusieurs.
- Garder le style (dégradé émeraude→doré, même card).

### 2. Texte descriptif sur la page Ar-Rabt

**Fichier : `src/pages/MurajaRabtPage.tsx`**

Sous le titre "Liaison quotidienne · Récite 1 fois" (ligne 169-171), ajouter un petit paragraphe :

```
"Vous pouvez réciter ces pages lors de vos prières quotidiennes."
```

Style : `text-[10px]`, couleur `var(--p-text-40)`, italic, avec un peu de margin-top.

### 3. Historique de révision mensuel (nouvelle page)

**Nouveau fichier : `src/pages/MurajaHistoryPage.tsx`**

- Page dédiée accessible via un lien discret sur le Hub Muraja'a.
- Label du lien : "Consulter votre historique de révision" (texte 11px, discret, sous les cartes Ar-Rabt/Consolidation).
- Contenu :
  - Sélecteur de mois (flèches gauche/droite + label "Mars 2026").
  - Liste groupée par jour des `muraja_sessions` (tous types confondus).
  - Chaque entrée affiche : date, sourate/versets révisés, difficulté (si consolidation).
  - Requête sans limite de 50 : filtrée par mois sélectionné.
  - Design minimaliste, même style que les cards existantes.

**Fichier : `src/App.tsx`**

- Ajouter route `/muraja/historique` → `MurajaHistoryPage`.

**Fichier : `src/pages/MurajaHubPage.tsx`**

- Ajouter le lien discret "Consulter votre historique de révision" après le bouton "Continuer la mémorisation".

### Résumé des fichiers modifiés

| Fichier | Action |
|---|---|
| `src/pages/MurajaHubPage.tsx` | Progression contextuelle + lien historique |
| `src/pages/MurajaRabtPage.tsx` | Ajout texte descriptif |
| `src/pages/MurajaHistoryPage.tsx` | Nouvelle page historique mensuel |
| `src/App.tsx` | Nouvelle route |

